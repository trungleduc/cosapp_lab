from typing import Any, Dict

from ipywidgets import Layout, VBox

from cosapp.systems import System

from .controller import Controller
from .validation import Validation


class SideBar(VBox):
    def __init__(self, system: System, definition: Dict[str, Dict[str, Any]]):
        controls = Controller(system, definition)
        validation = Validation(system)
        super(SideBar, self).__init__(
            children=[controls, validation],
            layout=Layout(align_items="center", width="100%", min_width="282px"),
        )
