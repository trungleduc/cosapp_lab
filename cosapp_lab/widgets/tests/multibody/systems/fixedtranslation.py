import numpy
from cosapp.systems import System
from multibody.ports import FramePort, ForcePort


class FixedTranslation(System):
    """Fixed translation of frame_b with respect to frame_a"""

    def setup(self):
        self.add_input(FramePort, "frame_a")
        self.add_input(ForcePort, "force_b")

        self.add_inward(
            "r",
            numpy.zeros(3),
            unit="m",
            desc="Vector from frame_a to frame_b resolved in frame_a",
        )

        self.add_output(FramePort, "frame_b")
        self.add_output(ForcePort, "force_a")

    def compute(self):
        # Neither connector frame_a nor frame_b of FixedTranslation object is connected

        Rmat_a = self.frame_a.R.reshape(3, 3)
        self.frame_b.r_0 = self.frame_a.r_0 + Rmat_a @ self.r
        self.frame_b.R = self.frame_a.R.copy()

        # Force and torque balance
        self.force_a.f = self.force_b.f
        self.force_a.trq = self.force_b.trq + numpy.cross(self.r, self.force_b.f)
