import os
from pathlib import Path
from distutils.dir_util import copy_tree
from pathlib import Path
from shutil import rmtree


def copy_jupyter_extension(root: str = None) -> str:
    if root is None:
        root = os.environ["CONDA_PREFIX"]
    ext_path = Path(root) / "share/jupyter/labextensions/cosapp_lab"
    if not ext_path.exists():
        ext_path.mkdir(exist_ok=True)
    else:
        for path in ext_path.glob("**/*"):
            if path.is_file():
                path.unlink()
            elif path.is_dir():
                rmtree(path)
    src_path = Path(__file__).parent.parent / "lab_static"
    copy_tree(str(src_path), str(ext_path))


if __name__ == "__main__":
    copy_jupyter_extension()
