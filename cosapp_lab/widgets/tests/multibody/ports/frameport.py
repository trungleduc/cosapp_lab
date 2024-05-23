import numpy
from cosapp.ports import Port


class FramePort(Port):
    """Coordinate system fixed to the component."""

    def setup(self):
        self.add_variable(
            "r_0",
            numpy.zeros(3),
            unit="m",
            desc="Position vector from world frame to the connector frame origin, resolved in world frame.",
        )
        self.add_variable(
            "R",
            numpy.eye(3).ravel(),
            unit="",
            desc="Orientation object to rotate the world frame into the connector frame.",
        )
