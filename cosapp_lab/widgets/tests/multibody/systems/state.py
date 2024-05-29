from cosapp.systems import System
from multibody.ports import FramePort, ForcePort


class State(System):
    """Output a state position and transformation to fit force and torque balances.

    The transformation matrix having 9 variables, this component has 6 constraints to
    be verified.
    """

    def setup(self):
        self.add_input(FramePort, "state")

        self.add_input(ForcePort, "force_a")
        self.add_output(FramePort, "frame_a")

        self.add_input(ForcePort, "force_b")
        self.add_output(FramePort, "frame_b")

        # Force and torque balances
        self.add_equation("frame_a.f == frame_b.f")
        self.add_equation("frame_a.trq == frame_b.trq")

        # Transformation matrix constraints
        self.add_equation("inner(frame_a.R[:, 0], frame_a.R[:, 0]) - 1.", reference=1.0)
        self.add_equation("inner(frame_a.R[:, 1], frame_a.R[:, 1]) - 1.", reference=1.0)
        self.add_equation("inner(frame_a.R[:, 2], frame_a.R[:, 2]) - 1.", reference=1.0)
        self.add_equation("inner(frame_a.R[:, 0], frame_a.R[:, 1])", reference=1.0)
        self.add_equation("inner(frame_a.R[:, 0], frame_a.R[:, 2])", reference=1.0)
        self.add_equation("inner(frame_a.R[:, 1], frame_a.R[:, 2])", reference=1.0)
