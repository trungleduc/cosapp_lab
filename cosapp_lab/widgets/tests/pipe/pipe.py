from cosapp.systems import System
from cosapp.ports import Port
import numpy as np

try:
    from pyoccad.create.container.list import CreateOCCList
    from pyoccad.create.primitive.solid import CreateBox
except:
    CreateBox = CreateOCCList = None

TOLERANCE = 1e-6


class FramePort(Port):
    """Coordinate system fixed to the component."""

    def setup(self):
        self.add_variable(
            "r_0",
            np.zeros(3),
            unit="m",
            desc="Position vector from world frame to the connector frame origin, resolved in world frame.",
        )
        self.add_variable(
            "R",
            np.eye(3),
            unit="",
            desc="Orientation object to rotate the world frame into the connector frame.",
        )


class Keypoint(Port):
    """Describe the variables contained in this port type."""

    def setup(self):
        """Defines variables contained in the port."""
        self.add_variable("coord", np.array([1.0, 1.0, 1.0]), desc="3D Coordinates")
        self.add_variable(
            "tgt", np.array([1.0, 0.0, 0.0]), desc="3D Tangent - norm is the tension"
        )


class GeometryPort(Port):
    """
    Parameters
    ----------
    entity :
       Shape
    topology : Dict[str, Shape]
       Group geometrical entities by topological label
    """

    def setup(self):
        self.add_variable("visible", True, desc="Should this geometry be shown?")
        self.add_variable("shape", None, desc="Geometrical object")
        self.add_variable(
            "topology", {}, desc="Topological description of the geometry"
        )


from OCC.Core.BRepBuilderAPI import BRepBuilderAPI_Transform
from OCC.Core.Geom2d import Geom2d_Geometry
from OCC.Core.Geom import Geom_Geometry
from OCC.Core.TopoDS import TopoDS_Shape
from OCC.Core.TopLoc import TopLoc_Location
from OCC.Core.gp import gp_Quaternion, gp_Mat, gp_Trsf
from OCC.Core.BRepOffsetAPI import BRepOffsetAPI_MakeThickSolid

try:
    from pyoccad.create import CreateAxis, CreateCoordSystem, vector
    from pyoccad.create.curve import arc, circle, line
    from pyoccad.transform import sweep
except:
    CreateAxis = CreateCoordSystem = vector = None
    arc = circle = line = None
    sweep = None


class StraightPipe(System):
    def setup(self):
        # ports ======================================================================
        self.add_input(FramePort, "frame_a")
        self.add_output(FramePort, "frame_b")

        self.add_output(GeometryPort, "out")

        # inwards =====================================================================
        self.add_inward("radius", 0.1, unit="m", desc="Start mid radius")
        self.add_inward(
            "length",
            0.5,
            unit="m",
            desc="Distance between mid start radius and mid end radius.",
        )
        self.add_inward("thickness", 0.01, unit="m", desc="Wall thickness")

    def compute(self):
        # Generate the geometry
        profile = circle.CreateCircle.from_radius_and_center(self.radius, [0, 0])
        line1 = line.CreateLine.between_2_points([0, 0, 0], [self.length, 0, 0])

        sweep1 = sweep.Sweep.profile_along_path(profile, [line1])
        Maker = BRepOffsetAPI_MakeThickSolid()
        Maker.MakeThickSolidBySimple(sweep1, self.thickness)
        pipe = Maker.Shape()

        # Transform the geometry
        trsf = gp_Trsf()
        v_a = vector.CreateVector.from_point(self.frame_a.r_0)
        q_a = R_to_Q(self.frame_a.R)
        trsf.SetTransformation(q_a, v_a)

        theTrsf = BRepBuilderAPI_Transform(trsf)
        theTrsf.Perform(pipe)
        pipe = theTrsf.Shape()

        # Set the output
        self.frame_b.r_0 = self.frame_a.r_0 + self.frame_a.R @ np.array(
            [self.length, 0, 0]
        )
        self.frame_b.R = 1.0 * self.frame_a.R

        self.out.shape = CreateOCCList.of_shapes([pipe])
        self.out.topology = {"shell": pipe}


def translate(shape, translation_vector):
    trsf = gp_Trsf()
    trsf.setTranslation(vector.CreateVector.from_point(translation_vector))
    if isinstance(sh, (Geom2d_Geometry, Geom_Geometry)):
        sh.Transform(trsf)
    elif isinstance(sh, TopoDS_Shape):
        sh.Move(TopLoc_Location(trsf))
    else:
        raise TypeError


def R_to_Q(R):
    """Convert a rotation matrix in quaternion."""
    m = gp_Mat(*R.ravel().tolist())
    Q = gp_Quaternion()
    Q.SetMatrix(m)
    return Q


def Q_to_R(Q):
    return np.array(
        [
            [
                2 * (Q.X() * Q.X() + Q.W() * Q.W()) - 1,
                2 * (Q.X() * Q.Y() + Q.Z() * Q.W()),
                2 * (Q.X() * Q.Z() - Q.Y() * Q.W()),
            ],
            [
                2 * (Q.Y() * Q.X() - Q.Z() * Q.W()),
                2 * (Q.Y() * Q.Y() + Q.W() * Q.W()) - 1,
                2 * (Q.Y() * Q.Z() + Q.X() * Q.W()),
            ],
            [
                2 * (Q.Z() * Q.X() + Q.Y() * Q.W()),
                2 * (Q.Z() * Q.Y() - Q.X() * Q.W()),
                2 * (Q.Z() * Q.Z() + Q.W() * Q.W()) - 1,
            ],
        ]
    )


class ArcPipe(System):
    def setup(self):
        # ports ======================================================================
        self.add_input(FramePort, "frame_a")
        self.add_output(FramePort, "frame_b")

        self.add_output(GeometryPort, "out")

        # inwards =====================================================================
        self.add_inward("pipe_radius", 0.1, unit="m", desc="Pipe radius")
        self.add_inward("arc_radius", 0.5, unit="m", desc="Pipe radius")
        self.add_inward("thickness", 0.01, unit="m", desc="Wall thickness.")
        self.add_inward("angle", 0.5 * np.pi, unit="rad", desc="Arc angle")
        self.add_inward("clockwise", False, desc="Pipe turns clockwise")

    def compute(self):
        # Generate the geometry
        profile = circle.CreateCircle.from_radius_and_center(self.pipe_radius, [0, 0])
        if self.clockwise:
            origin = [0, -1.0 * self.arc_radius, 0]
            revolution_axis = np.array([0, 0, 1])

        else:
            origin = [0, self.arc_radius, 0]
            revolution_axis = [0, 0, -1]
        ax2 = CreateCoordSystem.from_location_and_directions(
            origin, [1, 0, 0], revolution_axis
        )
        arc1 = arc.CreateArc.from_angles(
            ax2, self.arc_radius, 0.5 * np.pi - self.angle, 0.5 * np.pi
        )

        sweep1 = sweep.Sweep.profile_along_path(profile, [arc1])
        Maker = BRepOffsetAPI_MakeThickSolid()
        Maker.MakeThickSolidBySimple(sweep1, self.thickness)
        pipe = Maker.Shape()

        # Transform the geometry
        trsf = gp_Trsf()
        v_a = vector.CreateVector.from_point(self.frame_a.r_0)
        q_a = R_to_Q(self.frame_a.R)
        trsf.SetTransformation(q_a, v_a)

        theTrsf = BRepBuilderAPI_Transform(trsf)
        theTrsf.Perform(pipe)
        pipe = theTrsf.Shape()

        ## Transformation from a to b
        local_trsf = gp_Trsf()
        local_trsf.SetRotation(
            CreateAxis.from_location_and_direction(origin, revolution_axis), self.angle
        )

        # Set the output
        if self.clockwise:
            self.frame_b.r_0 = self.frame_a.r_0 + self.frame_a.R @ (
                origin
                + self.arc_radius
                * np.array([np.sin(self.angle), np.cos(self.angle), 0.0])
            )
        else:
            self.frame_b.r_0 = self.frame_a.r_0 + self.frame_a.R @ (
                origin
                + self.arc_radius
                * np.array([np.sin(self.angle), -1.0 * np.cos(self.angle), 0.0])
            )
        q_b = local_trsf.GetRotation().Multiplied(q_a)
        self.frame_b.R = Q_to_R(q_b)

        self.out.shape = CreateOCCList.of_shapes([pipe])
        self.out.topology = {"shell": pipe}


class TPipe(System):
    def setup(self):

        self.add_inward(
            "pipe_distance",
            0.25,
            unit="m",
            desc="Distance between the main pipe center and the secondary one.",
        )
        self.add_inward(
            "secondary_radius", 0.05, unit="m", desc="Secondary pipe radius"
        )

        self.add_output(FramePort, "frame_b_secondary")

        self.add_child(
            StraightPipe("primary"),
            pulling=["radius", "length", "frame_a", "frame_b"],
        )
        self.add_child(StraightPipe("secondary"))
        self.add_child(ArcPipe("arc"))

        self.arc.clockwise = True

        self.connect(
            self.inwards, self.arc.inwards, {"secondary_radius": "pipe_radius"}
        )
        self.connect(
            self.inwards, self.secondary.inwards, {"secondary_radius": "radius"}
        )
        self.connect(self.arc.frame_a, self.secondary.frame_b)

    def compute_before(self):
        self.arc.arc_radius = 0.5 * self.length
        self.secondary.length = (
            max(TOLERANCE, self.pipe_distance - self.arc.arc_radius) + self.radius
        )

        self.secondary.frame_a.r_0 = (
            self.primary.frame_a.r_0
            + self.primary.frame_a.R @ np.array([0.5 * self.length, 0.0, 0.0])
        )
        self.secondary.frame_a.R = self.primary.frame_a.R @ np.array(
            [[0.0, -1.0, 0.0], [1.0, 0.0, 0.0], [0.0, 0.0, 1.0]]
        )

    def compute(self):
        self.frame_b_secondary.r_0 = self.arc.frame_b.r_0
        # Fix orientation
        #  - something to do with rotation matrix having non unique quaternion transformation?
        self.frame_b_secondary.R = -1.0 * self.arc.frame_b.R


class Box(System):
    def setup(self):
        # ports ======================================================================
        self.add_input(FramePort, "frame_a")

        self.add_output(GeometryPort, "out")

        # inwards =====================================================================
        self.add_inward("width", 0.1, unit="m", desc="Box width (X-axis)")
        self.add_inward("length", 0.1, unit="m", desc="Box length (Y-axis)")
        self.add_inward("height", 0.1, unit="m", desc="Box height (Z-axis)")

    #         self.add_inward('thickness', 0.01, unit='m', desc="Box thickness")

    def compute(self):
        # Generate the geometry
        box = CreateBox.from_dimensions((self.width, self.length, self.height))

        # Transform the geometry
        trsf = gp_Trsf()
        v_a = vector.CreateVector.from_point(self.frame_a.r_0)
        q_a = R_to_Q(self.frame_a.R)
        trsf.SetTransformation(q_a, v_a)

        theTrsf = BRepBuilderAPI_Transform(trsf)
        theTrsf.Perform(box)
        box = theTrsf.Shape()

        # Set the output
        self.out.shape = CreateOCCList.of_shapes([box])
        self.out.topology = {"shell": box}
