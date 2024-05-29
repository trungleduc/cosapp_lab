from cosapp.systems import System
from cosapp.ports import Port
import json
from cosapp_lab.widgets.utils import CosappJsonParser


class Voltage(Port):
    def setup(self):
        self.add_variable("V", unit="V")


class Intensity(Port):
    def setup(self):
        self.add_variable("I", unit="A", limits=(0, None), desc="hello")
        self.add_variable("Iv", unit="m", limits=(0, 10))


class Resistor(System):
    def setup(self, R=1.0):
        self.add_input(Voltage, "V_in")
        self.add_input(Voltage, "V_out")
        self.add_output(Intensity, "I")

        self.add_inward("R", R, unit="ohm", desc="Resistance in Ohms", limits=(0, None))
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
            self.add_input(Intensity, "I_in{}".format(str(i)))
        for i in range(n_out):
            self.add_input(Intensity, "I_out{}".format(str(i)))

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
        n1 = self.add_child(Node("n1", n_in=1, n_out=2), pulling={"I_in0": "I_in"})
        n2 = self.add_child(Node("n2"))

        R1 = self.add_child(Resistor("R1", R=1000.0), pulling={"V_out": "Vg"})
        R2 = self.add_child(Resistor("R2", R=500.0))
        R3 = self.add_child(Resistor("R3", R=250.0), pulling={"V_out": "Vg"})

        self.connect(R1.V_in, n1.inwards, "V")
        self.connect(R2.V_in, n1.inwards, "V")
        self.connect(R1.I, n1.I_out0)
        self.connect(R2.I, n1.I_out1)

        self.connect(R2.V_out, n2.inwards, "V")
        self.connect(R3.V_in, n2.inwards, "V")
        self.connect(R2.I, n2.I_in0)
        self.connect(R3.I, n2.I_out0)


class Model(System):
    def setup(self):

        self.add_child(Source("source", I=0.1))
        self.add_child(Ground("engine", V=0.0))
        self.add_child(Circuit("circuit"))

        self.connect(self.source.I_out, self.circuit.I_in)
        self.connect(self.engine.V_out, self.circuit.Vg)


p = Model("model")

data = json.loads(json.dumps(p.export_structure()))

# cosapp_system_creator(data)
c = CosappJsonParser(data)
c.create_project()
