import numpy
from cosapp.systems import System
from multibody.ports import FramePort, ForcePort

from multibody.tools.utils import normalize, planar_rotation, absolute_rotation


class Revolute(System):
    """Revolution joint with one degree of freedom: rotation around 'axis'.

    The torque along 'axis' can be constrained through 'contrained_tau'. It is equal
    to zero for unconstrained joint.
    """

    def setup(self):
        self.add_input(FramePort, "frame_a")
        self.add_output(ForcePort, "force_a")

        self.add_output(FramePort, "frame_b")
        self.add_input(ForcePort, "force_b")

        self.add_inward(
            "axis",
            numpy.array([0, 0, 1.0]),
            unit="",
            desc="Axis of rotation resolved in frame_a (= same as in frame_b)",
        )
        self.add_inward(
            "phi",
            0.0,
            unit="rad",
            desc="Relative rotation angle from frame_a to frame_b",
        )
        self.add_inward(
            "constrained_tau", 0.0, unit="N*m", desc="Joint torque constrain."
        )

        self.add_outward(
            "Rrel",
            numpy.eye(3),
            unit="",
            desc="Relative orientation object from frame_a to frame_b or from frame_b to frame_a",
        )

        self.add_outward(
            "tau",
            0.0,
            unit="N*m",
            desc="Driving torque in direction of axis of rotation",
        )

        # tau should be null if not force apply
        self.add_unknown("phi").add_equation("tau == constrained_tau", reference=1.0)

    def compute(self):
        self.frame_b.r_0 = self.frame_a.r_0

        e = normalize(self.axis)
        self.Rrel = planar_rotation(-e, self.phi)
        self.frame_b.R = absolute_rotation(self.frame_a.R, self.Rrel)

        self.tau = numpy.inner(self.force_b.trq, e)

        self.force_a.f = self.Rrel.T @ self.force_b.f
        self.force_a.trq = self.Rrel.T @ self.force_b.trq
