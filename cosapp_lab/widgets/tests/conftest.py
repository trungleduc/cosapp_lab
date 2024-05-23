import pytest
import numpy as np

from cosapp.ports import Port
from cosapp.systems import System
from cosapp.drivers import RungeKutta, NonLinearSolver, RunSingleCase
from cosapp.recorders import DataFrameRecorder
from multibody.systems import PointMass, Revolute, World
from multibody.systems import Beam, FixedTranslation, Dynamics
from multibody.ports import FramePort, ForcePort
from pipe.pipe import StraightPipe, TPipe
import importlib
import random


require_pyoccad = pytest.mark.skipif(
    importlib.util.find_spec("pyoccad") is None,
    reason="requires pyoccad",
)


class SimplePort(Port):
    def setup(self) -> None:
        self.add_variable("number", 1)
        self.add_variable("vector", np.array([1.0, 2.0, 3.0]))
        self.add_variable("matrix", np.array([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]]))


class Simple(System):
    def setup(self):
        self.add_inward("inw", -1)
        self.add_outward("outw", 1)
        self.add_input(SimplePort, "simple_in")
        self.add_output(SimplePort, "simple_out")

    def compute(self) -> None:
        self.outw = 2 * self.inw
        self.simple_out.number = 2 * self.simple_in.number
        self.simple_out.vector = 2 * self.simple_in.vector
        self.simple_out.matrix = 2 * self.simple_in.matrix


@pytest.fixture(scope="function")
def SystemFactory():
    def factory(name):

        if name == "tube":

            class FluidPort(Port):
                """Fluid interface properties"""

                def setup(self):
                    self.add_variable("P", 101325.0, unit="Pa", desc="Pressure")
                    self.add_variable("W", 10.0, unit="kg/s", desc="Mass flow")

            class TubeAero(System):
                """Fluid mechanics model of a pipe."""

                def setup(self):
                    # port
                    self.add_input(FluidPort, "fl_in")
                    self.add_output(FluidPort, "fl_out")

                    # inwards
                    self.add_inward(
                        "rho", 1.225, unit="kg / m**3", desc="fluid density"
                    )
                    self.add_inward(
                        "mu", 18.5e-6, unit="Pa * s", desc="fluid dynamic viscosity"
                    )

                    self.add_inward("length", 1.0, unit="m")
                    self.add_inward("radius", 0.25, unit="m")

                    # outwards
                    self.add_outward("dP", unit="Pa", desc="Pressure drop")
                    self.add_outward("K", desc="Pressure loss coefficient")

                def compute(self):
                    L = self.length
                    D = 2.0 * self.radius
                    area = np.pi * self.radius ** 2

                    V = self.fl_in.W / (self.rho * area)
                    Re = self.rho * V * D / self.mu

                    fD = 0.314 * Re ** (-0.25)

                    self.dP = 0.5 * fD * L / D * self.rho * V ** 2
                    self.K = self.dP / self.fl_in.W ** 2

                    self.fl_out.P = self.fl_in.P - self.dP
                    self.fl_out.W = self.fl_in.W

            class TubeMecha(System):
                """Mechanical simulation of the tube."""

                def setup(self):
                    self.add_inward("radius", 0.5, unit="m")

            class Tube(System):
                """Tube module modeling the geometry and the fluid mechanics"""

                def setup(self):
                    # sub modules
                    self.add_child(
                        StraightPipe("geom"),
                        pulling={
                            "frame_a": "frame_a",
                            "frame_b": "frame_b",
                            "radius": "radius",
                            "length": "length",
                        },
                    )
                    self.add_child(
                        TubeAero("aero"),
                        pulling={
                            "fl_in": "fl_in",
                            "fl_out": "fl_out",
                            "radius": "radius",
                            "length": "length",
                        },
                    )
                    self.add_child(TubeMecha("mecha"), pulling=["radius"])

                    # inwards
                    self.add_inward("dP_design", 10000, unit="Pa")

                    # solver
                    self.exec_order = ["geom", "aero", "mecha"]

                    # design methods
                    self.add_design_method("design").add_unknown(
                        "radius", lower_bound=0.01
                    ).add_equation("aero.dP == dP_design")

            class SplitterAero(System):
                """Split a mass flow rate between two ports."""

                def setup(self):
                    # ports
                    self.add_input(FluidPort, "fl_in")
                    self.add_output(FluidPort, "fl1_out")
                    self.add_output(FluidPort, "fl2_out")

                    # inwards
                    self.add_inward("split_ratio", 0.5)

                    # solver
                    self.add_unknown("split_ratio")

                def compute(self):
                    self.fl1_out.P = self.fl_in.P
                    self.fl2_out.P = self.fl_in.P

                    self.fl1_out.W = self.fl_in.W * self.split_ratio
                    self.fl2_out.W = self.fl_in.W * (1 - self.split_ratio)

            class Splitter(System):
                def setup(self):
                    self.add_child(
                        SplitterAero("aero"), pulling=["fl_in", "fl1_out", "fl2_out"]
                    )
                    self.add_child(
                        TPipe("geom"),
                        pulling=["frame_a", "frame_b", "frame_b_secondary"],
                    )

            class MergerAero(System):
                """Merge two mass flow into one."""

                def setup(self):
                    # ports
                    self.add_input(FluidPort, "fl1_in")
                    self.add_input(FluidPort, "fl2_in")
                    self.add_output(FluidPort, "fl_out")

                    # solver
                    self.add_equation(
                        "fl1_in.P == fl2_in.P", name="pressure", reference=1e5
                    )

                def compute(self):
                    self.fl_out.W = self.fl1_in.W + self.fl2_in.W
                    self.fl_out.P = self.fl2_in.P

            class Merger(System):
                def setup(self):
                    self.add_child(
                        MergerAero("aero"), pulling=["fl1_in", "fl2_in", "fl_out"]
                    )
                    self.add_child(
                        TPipe("geom"),
                        pulling=["frame_a", "frame_b", "frame_b_secondary"],
                    )

                    self.geom.arc.clockwise = False

            class ParallelTubes(System):
                """Two tubes in parallel."""

                def setup(self):
                    # sub modules
                    self.add_child(Splitter("splitter"), pulling=["fl_in"])
                    self.add_child(Tube("tube1"))
                    self.add_child(Tube("tube2"))
                    self.add_child(Merger("merger"), pulling=["fl_out"])

                    # connections
                    ## Fluid
                    self.connect(self.splitter.fl1_out, self.tube1.fl_in)
                    self.connect(self.splitter.fl2_out, self.tube2.fl_in)
                    self.connect(self.tube1.fl_out, self.merger.fl1_in)
                    self.connect(self.tube2.fl_out, self.merger.fl2_in)

                    ## Geometry
                    self.connect(self.splitter.frame_b, self.tube1.frame_a)
                    self.connect(self.splitter.frame_b_secondary, self.tube2.frame_a)
                    self.connect(self.tube1.frame_b, self.merger.frame_a)

                    # Design
                    self.add_design_method("geometry").add_unknown(
                        "splitter.geom.radius"
                    ).add_equation(
                        "splitter.geom.radius == tube1.geom.radius"
                    ).add_unknown(
                        "splitter.geom.secondary_radius"
                    ).add_equation(
                        "splitter.geom.secondary_radius == tube2.geom.radius"
                    ).add_unknown(
                        "merger.geom.radius"
                    ).add_equation(
                        "merger.geom.radius == tube1.geom.radius"
                    ).add_unknown(
                        "merger.geom.secondary_radius"
                    ).add_equation(
                        "merger.geom.secondary_radius == tube2.geom.radius"
                    ).add_unknown(
                        "merger.geom.pipe_distance"
                    ).add_equation(
                        "merger.geom.pipe_distance == splitter.geom.pipe_distance"
                    )

            s = ParallelTubes("tube")
            s.run_once()

            solve = s.add_driver(NonLinearSolver("solve"))

            run1 = solve.add_child(RunSingleCase("run1"))
            run1.set_values({"fl_in.W": 10.0, "fl_in.P": 101325.0})
            run1.design.extend(s.tube1.design("design")).extend(s.design("geometry"))

            run2 = solve.add_child(RunSingleCase("run2"))
            run2.set_values({"fl_in.W": 50.0, "fl_in.P": 100325.0})
            run2.design.add_unknown("tube2.radius", lower_bound=0.01).add_equation(
                "splitter.aero.split_ratio == 0.9"
            )
            s.tube1.dP_design = 100

            return s

        elif name == "pendulum":

            class Arm(System):
                def setup(self):
                    self.add_input(FramePort, "frame_a")
                    self.add_output(ForcePort, "force_a")

                    self.add_child(Beam("geom"))
                    self.add_child(Dynamics("dyn"), pulling=["frame_a", "g_0"])
                    self.add_child(
                        FixedTranslation("arm"),
                        pulling=["frame_a", "frame_b", "force_b"],
                    )

                    # This is not allowed
                    #         self.connect(self.geom.inwards, self.arm.inwards, {'length': 'r[0]'})
                    self.connect(
                        self.geom.outwards, self.dyn.inwards, ["r_CM", "m", "I"]
                    )
                    self.connect(self.geom.geom, self.dyn.geom_ref)

                def compute_before(self):
                    self.arm.r = np.array([self.geom.length, 0.0, 0.0])

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

            p = DoublePendulum("p")
            p.arm.geom.length = 0.3
            p.arm.geom.width = p.arm.geom.height = 0.05
            p.mass.geom.radius = 0.05
            p.mass.geom.center = np.array([0.5, 0.0, 0.0])
            p.rev1.phi = -np.deg2rad(45)
            p.rev2.phi = np.deg2rad(30)
            p.run_once()
            # Boundary conditions
            p.rev1.phi = -np.deg2rad(45)
            p.rev2.phi = np.deg2rad(30)
            # Init acceleration
            p.drivers.clear()
            solve = p.add_driver(NonLinearSolver("solve", max_iter=50, factor=0.1))
            solve.runner.offdesign.add_unknown("arm.dyn.z_a[2]").add_equation(
                "rev1.tau == 0."
            ).add_unknown("mass.dyn.z_a[2]").add_equation("rev2.tau == 0.")
            p.run_drivers()

            # Init transient
            p.arm.dyn.phi_0 = np.array([0.0, 0.0, np.arccos(p.arm.dyn.frame_a.R[0])])
            p.arm.dyn.w_a = np.array([0.0, 0.0, 0.0])

            p.mass.dyn.phi_0 = np.array([0.0, 0.0, np.arccos(p.mass.dyn.frame_a.R[0])])
            p.mass.dyn.w_a = np.array([0.0, 0.0, 0.0])
            p.run_once()

            p.drivers.clear()
            solver = p.add_driver(RungeKutta( order=2))
            solver.dt = 0.01
            # rec = solver.add_recorder(DataFrameRecorder(includes=['*global*', '*dyn.geom.shape*']),period= 0.01)
            solve = solver.add_child(NonLinearSolver("solve", max_iter=50, factor=0.1))

            solve.runner.offdesign.add_unknown("arm.dyn.z_a[2]").add_equation(
                "arm.dyn.Rot_equality[2] == 0.", reference=1.0
            ).add_unknown("mass.dyn.z_a[2]").add_equation(
                "mass.dyn.Rot_equality[2] == 0.", reference=1.0
            )

            solver.time_interval = (0, 0.1)
            solver.dt = 0.01
            return p

        elif name == "circuit":

            class Voltage(Port):
                def setup(self):
                    self.add_variable("V", unit="V")

            class Intensity(Port):
                def setup(self):
                    self.add_variable("I", unit="A")

            class Resistor(System):
                def setup(self, R=1.0):
                    self.add_input(Voltage, "V_in")
                    self.add_input(Voltage, "V_out")
                    self.add_output(Intensity, "I")

                    self.add_inward("R", R, unit="ohm", desc="Resistance in Ohms")
                    self.add_outward(
                        "deltaV", unit="V"
                    )  # Not mandatory; could be local to compute method

                def compute(self):
                    self.deltaV = self.V_in.V - self.V_out.V
                    self.I.I = self.deltaV / self.R

            class Node(System):
                def setup(self, n_in=1, n_out=1):
                    self.add_inward("n_in", n_in)
                    self.add_inward("n_out", n_out)

                    for i in range(n_in):
                        self.add_input(Intensity, f"I_in{i}")
                    for i in range(n_out):
                        self.add_input(Intensity, f"I_out{i}")

                    self.add_inward("V", unit="V")
                    self.add_unknown("V")  # Iterative variable

                    self.add_outward("sum_I_in", 0.0, desc="Sum of all input currents")
                    self.add_outward("sum_I_out", 0.0, desc="Sum of all output currents")

                    self.add_equation("sum_I_in == sum_I_out", name="V", reference=0.01)

                def compute(self):
                    self.sum_I_in = 0.0
                    self.sum_I_out = 0.0

                    for i in range(self.n_in):
                        self.sum_I_in += self["I_in{}.I".format(str(i))]
                    for i in range(self.n_out):
                        self.sum_I_out += self["I_out{}.I".format(str(i))]

            class Source(System):
                def setup(self, I=0.1):
                    self.add_inward("I", I)
                    self.add_output(Intensity, "I_out", {"I": I})

                def compute(self):
                    self.I_out.I = self.I

            class Ground(System):
                def setup(self, V=0.0):
                    self.add_inward("V", V)
                    self.add_output(Voltage, "V_out", {"V": V})

                def compute(self):
                    self.V_out.V = self.V

            class Circuit(System):
                def setup(self):
                    n1 = self.add_child(
                        Node("n1", n_in=1, n_out=2), pulling={"I_in0": "I_in"}
                    )
                    n2 = self.add_child(Node("n2"))

                    R1 = self.add_child(
                        Resistor("R1", R=1000.0), pulling={"V_out": "Vg"}
                    )
                    R2 = self.add_child(Resistor("R2", R=500.0))
                    R3 = self.add_child(
                        Resistor("R3", R=250.0), pulling={"V_out": "Vg"}
                    )

                    self.connect(R1.V_in, n1.inwards, "V")
                    self.connect(R2.V_in, n1.inwards, "V")
                    self.connect(R1.I, n1.I_out0)
                    self.connect(R2.I, n1.I_out1)

                    self.connect(R2.V_out, n2.inwards, "V")
                    self.connect(R3.V_in, n2.inwards, "V")
                    self.connect(R2.I, n2.I_in0)
                    self.connect(R3.I, n2.I_out0)

            p = System(name)
            s = Source("source", I=0.1)
            p.add_child(s)
            g = Ground("ground", V=0.0)
            p.add_child(g)
            c = Circuit("circuit")
            p.add_child(c)

            p.connect(p.source.I_out, p.circuit.I_in)
            p.connect(p.ground.V_out, p.circuit.Vg)
            p.add_driver(NonLinearSolver("solve", verbose=True))
            p.run_drivers()
            p.drivers.clear()  # Clear all previously defined drivers
            design = p.add_driver(NonLinearSolver("design"))  # Add numerical solver
            design.add_recorder(
                DataFrameRecorder(includes=["*n?.V", "*R"], excludes="*R3*")
            )

            # Add driver to set boundary conditions on point 1
            point1 = design.add_child(RunSingleCase("pt1"))
            # Same as previous for a second point
            point2 = design.add_child(RunSingleCase("pt2"))

            point1.set_values({"source.I": 0.08, "ground.V": 0})
            point1.design.add_unknown("circuit.R2.R").add_equation("circuit.n2.V == 8")

            point2.set_values({"source.I": 0.15, "ground.V": 0.0})
            point2.design.add_unknown("circuit.R1.R").add_equation("circuit.n1.V == 50")

            return p

        elif name == "dynamics":

            class FloatPort(Port):
                def setup(self):
                    self.add_variable("value", 0.0)

            class Tank(System):
                def setup(self, rho=1e3):
                    self.add_inward("area", 1.0, desc="Cross-section area")
                    self.add_inward("rho", abs(rho), desc="Fluid density")

                    self.add_input(FloatPort, "flowrate")
                    self.add_output(FloatPort, "p_bottom")

                    self.add_transient("height", der="flowrate.value / area")

                def compute(self):
                    g = 9.81
                    self.p_bottom.value = self.rho * g * self.height

            class Pipe(System):
                """Poiseuille flow in a cylindrical pipe"""

                def setup(self):
                    self.add_inward("D", 0.1, desc="Diameter")
                    self.add_inward("L", 2.0, desc="Length")
                    self.add_inward("mu", 1e-3, desc="Fluid dynamic viscosity")

                    self.add_input(FloatPort, "p1")
                    self.add_input(FloatPort, "p2")

                    self.add_output(FloatPort, "Q1")
                    self.add_output(FloatPort, "Q2")

                    self.add_outward("k", desc="Pressure loss coefficient")

                def compute(self):
                    """Computes the volumetric flowrate from the pressure drop"""
                    self.k = np.pi * self.D ** 4 / (256 * self.mu * self.L)
                    self.Q1.value = self.k * (self.p2.value - self.p1.value)
                    self.Q2.value = -self.Q1.value

            class CoupledTanks(System):
                """System describing two tanks connected by a pipe (viscous limit)"""

                def setup(self, rho=1e3):
                    self.add_child(Tank("tank1", rho=rho))
                    self.add_child(Tank("tank2", rho=rho))
                    self.add_child(Pipe("pipe"))

                    self.connect(self.tank1.p_bottom, self.pipe.p1)
                    self.connect(self.tank2.p_bottom, self.pipe.p2)
                    self.connect(self.tank1.flowrate, self.pipe.Q1)
                    self.connect(self.tank2.flowrate, self.pipe.Q2)

            system = CoupledTanks(name, rho=1000)
            driver = system.add_driver(
                RungeKutta(dt=0.1, time_interval=[0, 5], order=3)
            )
            solver = driver.add_child(NonLinearSolver("solver", factor=1.0))
            run = solver.add_child(RunSingleCase("run"))
            init = (3, 1)
            run.set_init(
                {"tank1.height": init[0], "tank2.height": init[1]}  # initial conditions
            )
            run.set_values(
                {
                    "pipe.D": 0.07,  # fixed values
                    "pipe.L": 2.5,
                    "tank1.area": 2,
                    "tank2.area": 0.8,
                }
            )
            driver.add_recorder(DataFrameRecorder(includes="tank?.height"), period=0.1)

            return system

        elif name == "simple":
            return Simple(f"{name}_{random.randint(0,100)}")

        else:
            return None

    return factory
