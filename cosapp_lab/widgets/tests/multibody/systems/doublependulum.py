from cosapp.systems import System

# logging.basicConfig(format='%(message)s', level=logging.INFO)
from multibody.systems import PointMass, Revolute, World
import numpy
from multibody.ports import FramePort, ForcePort
from multibody.systems import Beam, FixedTranslation, Dynamics
from cosapp.drivers import RungeKutta, NonLinearSolver
from cosapp.recorders import DataFrameRecorder


class Arm(System):
    def setup(self):
        self.add_input(FramePort, "frame_a")
        self.add_output(ForcePort, "force_a")

        self.add_child(Beam("geom"))
        self.add_child(Dynamics("dyn"), pulling=["frame_a", "g_0"])
        self.add_child(
            FixedTranslation("arm"), pulling=["frame_a", "frame_b", "force_b"]
        )

        # This is not allowed
        #         self.connect(self.geom.inwards, self.arm.inwards, {'length': 'r[0]'})
        self.connect(self.geom.outwards, self.dyn.inwards, ["r_CM", "m", "I"])
        self.connect(self.geom.geom, self.dyn.geom_ref)

    def compute_before(self):
        self.arm.r = numpy.array([self.geom.length, 0.0, 0.0])

    def compute(self):
        self.force_a.f = self.dyn.force_a.f + self.arm.force_a.f
        self.force_a.trq = self.dyn.force_a.trq + self.arm.force_a.trq


class DoublePendulum(System):
    def setup(self):
        self.add_child(World("ref0"), pulling={"g": "g_0"})
        self.add_child(Revolute("rev1"))
        self.add_child(Arm("arm"), pulling="g_0")
        self.add_child(Revolute("rev2"))
        self.add_child(PointMass("mass"), pulling="g_0")

        self.connect(self.ref0.frame_b, self.rev1.frame_a)
        self.connect(self.ref0.force_b, self.rev1.force_a)
        self.connect(self.rev1.frame_b, self.arm.frame_a)
        self.connect(self.rev1.force_b, self.arm.force_a)
        self.connect(self.arm.frame_b, self.rev2.frame_a)
        self.connect(self.arm.force_b, self.rev2.force_a)
        self.connect(self.rev2.frame_b, self.mass.frame_a)
        self.connect(self.rev2.force_b, self.mass.force_a)

        self.arm.geom.length = 0.3
        self.arm.geom.width = self.arm.geom.height = 0.05
        self.mass.geom.radius = 0.05
        self.mass.geom.center = numpy.array([0.5, 0.0, 0.0])
        self.rev1.phi = -numpy.deg2rad(45)
        self.rev2.phi = numpy.deg2rad(30)

        self.arm.dyn.phi_0 = numpy.array(
            [0.0, 0.0, numpy.arccos(self.arm.dyn.frame_a.R[0])]
        )
        self.arm.dyn.w_a = numpy.array([0.0, 0.0, 0.0])

        self.mass.dyn.phi_0 = numpy.array(
            [0.0, 0.0, numpy.arccos(self.mass.dyn.frame_a.R[0])]
        )
        self.mass.dyn.w_a = numpy.array([0.0, 0.0, 0.0])

        dt = 0.01
        solver = self.add_driver(RungeKutta("solver"))
        rec = solver.add_recorder(
            DataFrameRecorder(includes=["*global*", "*dyn.geom.shape*"]), period=dt
        )
        solve = solver.add_child(NonLinearSolver("solve", max_iter=20, history=True))
        solve.runner.offdesign.add_unknown("arm.dyn.z_a[2]").add_equation(
            "arm.dyn.Rot_equality[2] == 0.", reference=1.0
        ).add_unknown("mass.dyn.z_a[2]").add_equation(
            "mass.dyn.Rot_equality[2] == 0.", reference=1.0
        )

        solver.dt = dt
        solver.time_interval = (0, 0.1)
