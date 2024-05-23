from .cosapp_server import setup_cosapp_server_handlers

from notebook.notebookapp import NotebookWebApplication
from .cosapp_server import COSAPP_CONFIG_DIR


def _jupyter_server_extension_paths():
    """
    Function to declare Jupyter Server Extension Paths.
    """
    return [{"module": "cosapp_lab.server"}]


def load_jupyter_server_extension(nbapp: NotebookWebApplication):
    """
    Function to load Jupyter Server Extension.

    Parameters
    ----------
    nbapp : NotebookWebApplication
        Handle to the Notebook webserver instance.
    """
    setup_cosapp_server_handlers(nbapp.web_app)
