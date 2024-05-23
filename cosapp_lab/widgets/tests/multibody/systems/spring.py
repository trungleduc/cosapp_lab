import numpy

from multibody.systems import PartialTwoFrames
from multibody.tools.utils import length


class Spring(PartialTwoFrames):
    def setup(self):
        super().setup()
        self.add_inward("k", 0.0, unit="N/m", desc="Spring constant.")
        self.add_inward(
            "s_unstretched", 0.0, unit="m", desc="Unstretched spring length."
        )

        self.add_outward("s", 0.0, unit="m", desc="Stretched spring length.")
        self.add_outward("f", 0.0, unit="N", desc="Spring linear force.")

    def compute(self):
        a_to_b = self.frame_a.r_0 - self.frame_b.r_0
        self.s = length(a_to_b)
        self.f = self.k * (self.s - self.s_unstretched)

        direction = a_to_b / self.s
        self.force_a.f = -self.f * direction
        self.force_a.trq = numpy.zeros(3)
        self.force_b.f = self.f * direction
        self.force_b.trq = numpy.zeros(3)
