import numpy
from cosapp.ports import Port


class ForcePort(Port):
    "Cut-force and cut-torque at a frame."

    def setup(self):
        self.add_variable(
            "f", numpy.zeros(3), unit="N", desc="Cut-force resolved in connector frame."
        )
        self.add_variable(
            "trq",
            numpy.zeros(3),
            unit="N*m",
            desc="Cut-torque resolved in connector frame.",
        )
