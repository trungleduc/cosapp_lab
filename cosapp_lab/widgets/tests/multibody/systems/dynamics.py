import numpy
from cosapp.systems import System
from multibody.ports import FramePort, ForcePort, GeometryPort
from multibody.tools.utils import R_residues

from multibody.tools.utils import R_to_Q

from OCC.Core.BRepBuilderAPI import BRepBuilderAPI_Transform
from OCC.Core.GProp import GProp_GProps
from OCC.Core import BRepGProp
from OCC.Core.gp import gp_Trsf

try:
    from pyoccad.create import point, vector
except:
    point = vector = None


class Dynamics(System):
    def setup(self):
        self.add_input(FramePort, "frame_a")
        self.add_output(ForcePort, "force_a")

        self.add_input(GeometryPort, "geom_ref")  # Reference geometry
        self.add_output(GeometryPort, "geom")  # Geometry moved in the right position

        # Mass and inertia
        self.add_inward(
            "r_CM",
            numpy.zeros(3),
            unit="m",
            desc="Vector from frame_a to center of mass, resolved in frame_a",
        )
        self.add_inward("m", 1.0, unit="kg", desc="Mass of rigid body")
        self.add_inward(
            "I", 0.001 * numpy.eye(3), unit="kg*m**2", desc="Inertia tensor"
        )

        # Motion variables
        self.add_inward(
            "g_0", numpy.zeros(3), unit="m/s**2", desc="Gravity acceleration"
        )

        self.add_inward(
            "v_0",
            numpy.zeros(3),
            unit="m/s",
            desc="Absolute velocity of frame_a, resolved in world frame (= der(r_0))",
        )
        self.add_inward(
            "a_0",
            numpy.zeros(3),
            unit="m/s**2",
            desc="Absolute acceleration of frame_a resolved in world frame (= der(v_0))",
        )

        self.add_inward(
            "w_a",
            numpy.zeros(3),
            unit="rad/s",
            desc="Absolute angular velocity of frame_a resolved in frame_a",
        )
        self.add_inward(
            "z_a",
            numpy.zeros(3),
            unit="rad/s**2",
            desc="Absolute angular acceleration of frame_a resolved in frame_a",
        )

        self.add_inward("r_0", numpy.zeros(3), unit="m")
        self.add_transient("v_0", der="a_0")
        self.add_transient("r_0", der="v_0")

        # Input position should match time-integrated position
        # Cannot be set in a generic way -- depend on the degree of freedom
        #         self.add_equation('r_0 == frame_a.r_0')

        self.add_inward("phi_0", numpy.zeros(3), unit="rad")
        self.add_transient("w_a", der="z_a")
        self.add_transient("phi_0", der="w_a")
        self.add_outward("global_pos", numpy.zeros(3))
        self.add_outward("Rot_equality", numpy.zeros(3), unit="")
        # Cannot be set in a generic way -- depend on the degree of freedom

    #         self.add_equation('Rot_equality == array([0., 0., 0.])')

    def compute(self):

        # Compute the shape position
        if self.geom_ref.shape is not None:
            trsf = gp_Trsf()
            v_a = vector.CreateVector.from_point(self.frame_a.r_0)

            q_a = R_to_Q(self.frame_a.R)
            trsf.SetTransformation(q_a, v_a)

            theTrsf = BRepBuilderAPI_Transform(trsf)
            theTrsf.Perform(self.geom_ref.shape)
            shape = theTrsf.Shape()
            self.geom.shape = shape
            props = GProp_GProps()
            BRepGProp.brepgprop_VolumeProperties(self.geom.shape, props)
            cog = props.CentreOfMass()
            cog_x, cog_y, cog_z = cog.Coord()
            self.global_pos = numpy.array([cog_x, cog_y, cog_z])

        self.geom.topology = self.geom_ref.topology

        # Dynamic fitting
        Rmat = self.frame_a.R.reshape(3, 3)
        self.Rot_equality = R_residues(self.phi_0, Rmat)

        # Newton/Euler equations with respect to center of mass
        # a_CM = a_a + cross(z_a, r_CM) + cross(w_a, cross(w_a, r_CM));
        # f_CM = m*(a_CM - g_a);
        # t_CM = I*z_a + cross(w_a, I*w_a);
        # frame_a.f = f_CM
        # frame_a.t = t_CM + cross(r_CM, f_CM);
        # Inserting the first three equations in the last two results in:

        # In Modelica force_b connected to force_a are opposite (matches the
        # cut definition); i.e. f_b = -1. * f_a and t_b = -1. * t_a
        self.force_a.f = (
            -1.0
            * self.m
            * (
                Rmat @ (self.a_0 + self.g_0)
                + numpy.cross(self.z_a, self.r_CM)
                + numpy.cross(self.w_a, numpy.cross(self.w_a, self.r_CM))
            )
        )
        self.force_a.trq = -1.0 * (
            numpy.inner(self.I, self.z_a)
            + numpy.cross(self.w_a, numpy.inner(self.I, self.w_a))
            + numpy.cross(self.r_CM, self.force_a.f)
        )
