import numpy


class PointMassSolution:
    """Analytical solution of dynamic system PointMass"""

    def __init__(self, system, v0, x0=numpy.zeros(3)):
        if system.mass <= 0:
            raise ValueError("Mass must be strictly positive")
        x0 = numpy.asarray(x0)
        v0 = numpy.asarray(v0)
        g = numpy.asarray(system.g)
        if system.k > 0:
            omega = system.k / system.mass
            tau = 1 / omega
            A = g * tau
        else:
            omega, tau = 0, numpy.inf
            A = numpy.full_like(g, numpy.inf)
        B = v0 - A

        def x_impl(t):
            wt = omega * t
            if wt < 1e-7:  # asymptotic expansion, to avoid exp overflow
                x = (
                    x0
                    + v0 * t
                    + (0.5 * t) * (g * t - wt * v0) * (1 - wt / 3 * (1 - 0.25 * wt))
                )
            else:
                x = x0 + A * t + B * tau * (1 - numpy.exp(-wt))
            return x

        def v_impl(t):
            wt = omega * t
            if wt < 1e-7:  # asymptotic expansion, to avoid exp overflow
                v = v0 + (g * t - v0 * wt) * (1 - wt * (0.5 - wt / 6))
            else:
                v = A + B * numpy.exp(-wt)
            return v

        self.__x = x_impl
        self.__v = v_impl
        self.__a = lambda t: g - self.__v(t) * omega
        self.__omega = omega

    @property
    def omega(self):
        return self.__omega

    def a(self, t):
        return self.__a(t)

    def v(self, t):
        return self.__v(t)

    def x(self, t):
        return self.__x(t)


class CoupledTanksSolution:
    """Analytical solution of dynamic system CoupledTanks"""

    def __init__(self, system, init):
        K = 9.81 * system.tank1.rho * system.pipe.k
        a = system.tank1.area / system.tank2.area
        self.__area_ratio = a
        self.__tau = system.tank1.area / ((1 + a) * K)
        self.initial_heights = init

    @property
    def characteristic_time(self):
        return self.__tau

    def __call__(self, t):
        tau = self.__tau
        a = self.__area_ratio
        h1_0, h2_0 = self.initial_heights
        dh = (h1_0 - h2_0) * numpy.exp(-t / tau)
        h1 = (a * h1_0 + h2_0 + dh) / (1 + a)
        h2 = h1 - dh
        return (h1, h2)


class HarmonicOscillatorSolution:
    def __init__(self, system, init=(0, 0)):
        K = system.K
        c = system.c
        m = system.mass
        L = system.length
        w0 = numpy.sqrt(K / m)
        self.__damping = dc = 0.5 * c / numpy.sqrt(m * K)
        a = w0 * dc
        x0, v0 = init
        x0 -= L
        if self.over_damped:
            wd = w0 * numpy.sqrt(dc ** 2 - 1)
            A, B = 0.5 * (v0 + (a + wd) * x0) / wd, 0.5 * (v0 + (a - wd) * x0) / wd
            self.__x = lambda t: L + (
                A * numpy.exp(-(a - wd) * t) - B * numpy.exp(-(a + wd) * t)
            )
        else:
            wd = w0 * numpy.sqrt(1 - dc ** 2)
            A, B = (v0 + a * x0) / wd, x0
            self.__x = lambda t: L + numpy.exp(-a * t) * (
                A * numpy.sin(wd * t) + B * numpy.cos(wd * t)
            )

    def x(self, t):
        return self.__x(t)

    @property
    def damping(self):
        """Damping coefficient"""
        return self.__damping

    @property
    def over_damped(self):
        return self.__damping > 1
