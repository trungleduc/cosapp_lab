from cosapp.systems import System
from multibody.ports import FramePort, ForcePort


class PartialTwoFrames(System):
    def setup(self):
        self.add_input(FramePort, "frame_a")
        self.add_input(FramePort, "frame_b")

        self.add_output(ForcePort, "force_a")
        self.add_output(ForcePort, "force_b")
