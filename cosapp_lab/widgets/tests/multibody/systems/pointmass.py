from cosapp.systems import System
from multibody.systems import Dynamics, Sphere


TOLERANCE = 1e-6


class PointMass(System):
    def setup(self):
        self.add_child(Sphere("geom"))
        self.add_child(Dynamics("dyn"), pulling=["frame_a", "force_a", "g_0"])

        self.connect(self.geom.outwards, self.dyn.inwards, ["r_CM", "m", "I"])
        self.connect(self.geom.geom, self.dyn.geom_ref)
