"""Factory Controllers"""

from cosapp.ports import Port
from cosapp.systems import System

import numpy


class AnalogSignalPort(Port):
    """This port contains electrical signal information."""

    def setup(self):
        """Defines variables contained in the port."""
        self.add_variable("U", numpy.zeros(3), unit="V", desc="Signal Tension")
        self.add_variable("I", 5e-3, unit="A", desc="Signal Intensity")


class GenericController(System):
    def setup(self, ext_loop=True):
        self.add_input(AnalogSignalPort, "U_reference")
        self.add_input(AnalogSignalPort, "U_sensor")
        self.add_output(AnalogSignalPort, "U_control")

        self.add_inward("reference", numpy.array([0.0, 0.0, 1.0]), unit="m")

        self.add_inward("external_loop", ext_loop, dtype=bool)
        # controller parameters
        self.add_inward("K", 0.09316)

        self.add_inward("sensor_gain", 1.0, unit="V/m", desc="Sensor gain")
        self.add_outward(
            "U_eps",
            numpy.zeros(3),
            dtype=(numpy.ndarray, float),
            unit="V",
            desc="Image tension of the physical quantity deviation",
        )

        self.add_outward(
            "U_comm",
            numpy.zeros(3),
            dtype=(numpy.ndarray, float),
            unit="V",
            desc="command signal",
        )

        self.add_transient("U_eps_int", der="U_eps", desc="U_eps time integral")
        self.add_rate("U_eps_der", source="U_eps", desc="U_eps time derivative")

    def compute(self):
        if self.external_loop:
            U_ref = self.reference * self.sensor_gain
        else:
            U_ref = self.U_reference.U.copy()

        self.U_eps = U_ref - self.U_sensor.U

        self.U_comm = self._U_command()
        self.U_control.U = self.U_comm.copy()

    def _U_command(self):
        raise NotImplementedError("GenericController cannot be directly used")


class ProportionalController(GenericController):
    def setup(self, ext_loop=True):
        super().setup(ext_loop)

    def _U_command(self):
        """Specific implementation of proportional controller"""
        return self.K * self.U_eps
        # return Kc * epsilon


class PdController(GenericController):
    def setup(self, ext_loop=True):
        super().setup(ext_loop)
        self.add_inward("Td", unit="s")

    def _U_command(self):
        """Specific implementation of PD controller"""
        return self.K * self.U_eps + self.K * self.Td * self.U_eps_der


class PiController(GenericController):
    def setup(self, ext_loop=True):
        super().setup(ext_loop)
        self.add_inward("Ti", unit="s")

    def _U_command(self):
        """Specific implementation of PI controller"""
        return self.K * self.U_eps + self.K / self.Ti * self.U_eps_int


class PidController(GenericController):
    def setup(self, ext_loop=True):
        super().setup(ext_loop)
        self.add_inward("dt", 1e-3, unit="s")
        self.add_inward("Ti", unit="s")
        self.add_inward("Td", unit="s")
        self.add_inward("tau_filter", unit="s")

    def _U_command(self):
        """Specific implementation of PID controller"""
        dt, tau_f, Kc, Ti, Td = self.dt, self.tau_filter, self.K, self.Ti, self.Td
        return (
            1
            / (1 + tau_f / dt)
            * (
                Kc * (1 + tau_f / Ti) * self.U_eps
                + Kc / Ti * self.U_eps_int
                + Kc * (tau_f + Td) * self.U_eps_der
                + tau_f / dt * self.U_comm
            )
        )


class TheoreticalPidController(GenericController):
    def setup(self, ext_loop=True):
        super().setup(ext_loop)

    def _U_command(self):
        """Specific implementation of theoretical PID controller"""
        Kc, Ti, Td = self.K, self.Ti, self.Td
        return Kc * (self.U_eps + self.U_eps_int / Ti + Td * self.U_eps_der)


def Controller(name, ctype="PID", ext_loop=True, **kwargs):
    # strategy = { name : name + "_U_command" for name in ["proportional", "PD", "PI", "PID", "PID_theoretical"] }
    if not isinstance(ctype, str):
        raise TypeError("'option' must be a string")
    if ctype.upper() == "PID":
        controller = PidController(name, ext_loop=ext_loop)
        options = ["K", "Ti", "Td", "tau_filter"]
    elif ctype.upper() == "PI":
        controller = PiController(name, ext_loop=ext_loop)
        options = ["K", "Ti"]
    elif ctype.upper() == "PD":
        controller = PdController(name, ext_loop=ext_loop)
        options = ["K", "Td"]
    elif ctype.lower() == "proportional":
        controller = ProportionalController(name, ext_loop=ext_loop)
        options = ["K"]
    elif ctype.lower() in ["pid theoretical", "theoretical pid"]:
        controller = TheoreticalPidController(name, ext_loop=ext_loop)
        options = ["K", "Ti", "Td"]
    else:
        raise NotImplementedError("Unknown controller type {}".format(ctype))

    for option in options:
        try:
            controller[option] = kwargs.pop(option)
        except KeyError:
            continue

    return controller
