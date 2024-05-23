from math import log10


def default_step(n: float) -> float:
    """Compute the default step for float number.

    The default step cannot be smaller than 5e-5.

    Parameters
    ----------
    n : float
        Base number to evaluate the step
    """
    if abs(n) < 1e-8:  # Close to zero
        return 0.5
    else:
        return 0.5 * 10 ** (max(int(log10(abs(n))) - 1, -4))
