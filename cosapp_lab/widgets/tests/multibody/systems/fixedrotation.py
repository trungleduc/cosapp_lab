import numpy
from cosapp.systems import System

from multibody.ports import FramePort, ForcePort
from multibody.tools.utils import axesRotations


class FixedRotation(System):
    """Fixed translation followed by a fixed rotation of frame_b with respect to frame_a"""

    def setup(self):
        self.add_input(FramePort, "frame_a")
        self.add_input(ForcePort, "force_b")

        self.add_output(FramePort, "frame_b")
        self.add_output(ForcePort, "force_a")

        self.add_inward(
            "r",
            numpy.zeros(3),
            unit="m",
            desc="Vector from frame_a to frame_b resolved in frame_a",
        )
        self.add_inward("angles", numpy.zeros(3), unit="rad")

        self.add_outward(
            "Rrel",
            numpy.eye(3),
            unit="",
            desc="Fixed rotation object from frame_a to frame_b",
        )

    def compute(self):
        # Neither connector frame_a nor frame_b of FixedTranslation object is connected
        Rrel = axesRotations(self.angles)

        Rmat_a = self.frame_a.R.reshape(3, 3)
        self.frame_b.r_0 = self.frame_a.r_0 + Rmat_a @ self.r
        self.frame_b.R = (Rrel @ Rmat_a).ravel()

        # Force and torque balance
        self.force_a.f = Rrel @ self.force_b.f
        self.force_a.trq = Rrel @ self.force_b.trq + numpy.cross(self.r, self.force_b.f)
