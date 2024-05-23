import os
import sys
from pathlib import Path
import logging


def get_abs_dir(dir_path: str, path: str) -> str:
    if os.path.isabs(path):
        return path
    else:
        return os.path.join(dir_path, path)


class DummyFile(object):
    def write(self, x):
        pass


class Suppressor(object):
    def __enter__(self):

        self.stdout = sys.stdout
        sys.stdout = self

    def __exit__(self, type, value, traceback):
        sys.stdout = self.stdout
        if type is not None:
            raise type

    def write(self, x):
        pass


def get_readme_from_path(path: Path) -> str:
    """Helper to get the content of readme in
    a CoSApp module

    Args:
        path (Path): Path to search for readme file

    Returns:
        str: Content of readme file
    """
    names = ["README", "readme"]
    exts = ["", "MD", "RST", "md", "rst", "TXT", "txt"]
    read_me = None
    for name in names:
        for ext in exts:
            if ext != "":
                file_path = path / f"{name}.{ext}"
            else:
                file_path = path / name
            if file_path.is_file():
                with open(file_path, "r") as f:
                    read_me = f.read()
                return read_me

    return read_me
