"""CoSApp project CoSApp Multibody Library

CoSApp Multibody Library.
"""
from ._version import __version__


def find_resources(filename: str = "") -> str:
    """Returns the fullpath of a file in resources folder.

    Parameters
    ----------
    filename: str, optional
        File or directory looked for; default resources folder

    Returns
    -------
    str
        Full path to resources
    """
    import os

    fullpath = os.path.realpath(os.path.join(__path__[0], "resources", filename))
    if not os.path.exists(fullpath):
        raise FileNotFoundError(fullpath)
    return fullpath


from . import tools, ports, systems, drivers

__all__ = ["drivers", "ports", "systems", "tools"]
