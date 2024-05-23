import numpy
from cosapp.systems import System
from multibody.ports import FramePort, ForcePort


class World(System):
    def setup(self):
        self.add_inward(
            "g",
            numpy.r_[0, -9.81, 0],
            unit="m/s**2",
            desc="Constant gravity acceleration.",
        )
        self.add_input(ForcePort, "force_b")
        self.add_output(FramePort, "frame_b")
