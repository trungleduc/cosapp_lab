import numpy

from cosapp.systems import System
from OCC.Core import BRepGProp
from OCC.Core.BRepPrimAPI import BRepPrimAPI_MakeSphere
from OCC.Core.GProp import GProp_GProps
from multibody.ports import GeometryPort

try:
    from pyoccad.create.point import CreatePoint
except:
    CreatePoint = None
TOLERANCE = 1e-6


class Sphere(System):
    def setup(self):
        self.add_output(GeometryPort, "geom")

        self.add_inward(
            "center",
            numpy.array([0.0, 0.0, 0.0]),
            unit="m",
            desc="Vector from frame_a to center of the sphere, resolved in frame_a",
        )
        # Note: the default radius is such that the default sphere volume = 1.
        self.add_inward("radius", 0.6203504908994001, unit="m", desc="Mass radius")

        # Mass and inertia computation
        self.add_inward("density", 7750, unit="kg/m**3", desc="Solid body density")

        self.add_outward(
            "r_CM",
            numpy.zeros(3),
            unit="m",
            desc="Vector from frame_a to center of mass, resolved in frame_a",
        )
        self.add_outward("m", 1.0, unit="kg", desc="Mass of rigid body")
        self.add_outward(
            "I", 0.001 * numpy.eye(3), unit="kg*m**2", desc="Inertia tensor"
        )

    def compute(self):
        # Generate the geometry
        sphere = BRepPrimAPI_MakeSphere(
            CreatePoint.as_point(self.center), self.radius
        ).Solid()
        # We are not adding a fake cylinder as it will disturb mass and inertia

        # Compute mass, inertia and gravity center from geometry
        properties = GProp_GProps()  # Global props
        sphere_props = GProp_GProps()  # Local props
        BRepGProp.brepgprop_VolumeProperties(sphere, sphere_props)
        properties.Add(sphere_props, self.density)
        self.m = properties.Mass()
        I = properties.MatrixOfInertia()
        for i in range(3):
            for j in range(3):
                self.I[j, i] = I.Value(i + 1, j + 1)
        CM = properties.CentreOfMass()
        self.r_CM = numpy.array([CM.X(), CM.Y(), CM.Z()])

        # Set the output
        self.geom.visible = False
        self.geom.shape = sphere
        self.geom.topology = {"sphere": sphere}
