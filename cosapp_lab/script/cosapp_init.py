import os
import pathlib

try:
    from cookiecutter.main import cookiecutter
except ImportError:
    cookiecutter = None


def cosapp_init():
    if cookiecutter is None:
        print("Please install cookiecutter before using cosapp init")
        return

    template_path = os.path.join(
        pathlib.Path(__file__).parent.absolute().parent,
        "utils",
        "templates",
        "cookiecutter-cosapp-workspace",
    )
    cookiecutter(template_path)
