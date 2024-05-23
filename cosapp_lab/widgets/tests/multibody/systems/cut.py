import numpy
from cosapp.systems import System
from multibody.ports import FramePort, ForcePort


class Cut(System):
    def setup(self, n=2):
        self.add_input(FramePort, "frame_a")
        self.add_output(ForcePort, "force_a")

        assert n > 0
        for i in range(n):
            self.add_input(ForcePort, f"force_{i + 1}")
            self.add_output(FramePort, f"frame_{i + 1}")

        self.add_outward("n", n, unit="", desc="Number of fluxes gathered.")

    def compute(self):
        self.force_a.f = numpy.zeros(3)
        self.force_a.t = numpy.zeros(3)

        for i in range(self.n):
            self.force_a.f += self.inputs[f"force{i+1}"].f
            self.force_a.trq += self.inputs[f"force{i+1}"].trq
            frame = self.outputs[f"frame{i+1}"]
            frame.r_0 = self.frame_a.r_0
            frame.R = self.frame_a.R
