import numpy

from cosapp.systems import System
from OCC.Core import BRepGProp
from OCC.Core.GProp import GProp_GProps

try:
    from pyoccad.create.primitive.solid import CreateBox
except:
    CreateBox = None
from multibody.ports import GeometryPort

TOLERANCE = 1e-6


class Beam(System):
    def setup(self):
        self.add_output(GeometryPort, "geom")

        self.add_inward(
            "length",
            0.1,
            unit="m",
            desc="Beam length - along the x direction in the local frame",
        )
        self.add_inward(
            "width",
            0.01,
            unit="m",
            desc="Beam width - along the y direction in the local frame",
        )
        self.add_inward(
            "height",
            0.01,
            unit="m",
            desc="Beam height - along the z direction in the local frame",
        )

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
        beam = CreateBox.from_dimensions_and_center(
            (self.length, self.width, self.height), [0.5 * self.length, 0.0, 0.0]
        )

        # Compute mass, inertia and gravity center from geometry
        properties = GProp_GProps()  # Global props
        beam_props = GProp_GProps()  # Local props
        BRepGProp.brepgprop_VolumeProperties(beam, beam_props)
        properties.Add(beam_props, self.density)
        self.m = properties.Mass()
        I = properties.MatrixOfInertia()
        for i in range(3):
            for j in range(3):
                self.I[j, i] = I.Value(i + 1, j + 1)
        CM = properties.CentreOfMass()
        self.r_CM = numpy.array([CM.X(), CM.Y(), CM.Z()])

        # Set the output
        self.geom.visible = False
        self.geom.shape = beam
        self.geom.topology = {"beam": beam}
