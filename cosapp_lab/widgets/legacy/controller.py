import logging
from typing import Any, Dict, Iterable, Tuple, Union
from weakref import ref

from cosapp.systems import System
from ipywidgets import Accordion, Button, HBox, Layout, ToggleButton, VBox, Widget

from .base import SystemWidget

logger = logging.getLogger(__name__)


class Controller(VBox):
    """Widget allowing modification of parameters.

    This widget is composed of a header with buttons and accordions containing data handlers.

    The definition of the handlers is a dictionary of handlers list; the dictionary keys being
    the accordion group title.
    And handler can be defined by either:

    - A string: the name of the variable to handle
    - Two strings: the name of the variable to hanlde and the alias name to show
    - A dictionary: the mandatory argument is "name" but other can be added depending on the
        variable type
    - A `SystemWidget`: a widget to insert

    Parameters
    ----------
    system : cosapp.systems.System
        System to be controlled
    definition : Dict[str, Iterable[Union[str, Dict[str, Any], Tuple[str, str], SystemWidget]]]
        Definition of controllers
    """

    def __init__(
        self,
        system: System,
        definition: Dict[
            str, Iterable[Union[str, Dict[str, Any], Tuple[str, str], SystemWidget]]
        ],
    ):
        self._system = ref(system)
        self._controls = None
        super(Controller, self).__init__(
            children=self._build_widgets(system, definition),
            layout=Layout(align_self="flex-start", width="100%"),
        )

    def _build_widgets(
        self,
        system: System,
        definition: Dict[
            str, Iterable[Union[str, Dict[str, Any], Tuple[str, str], SystemWidget]]
        ],
    ) -> Iterable[Widget]:
        """Build the controller content.

        Parameters
        ----------
        system : cosapp.systems.System
            System to be controlled
        definition : Dict[str, Iterable[Union[str, Dict[str, Any], Tuple[str, str], SystemWidget]]]
            Definition of controllers
        """
        play_but = Button(
            icon="play",
            tooltip="Execute {}".format(system.name),
            layout=Layout(width="auto"),
        )
        pause_but = ToggleButton(
            value=not SystemWidget.auto_run,
            icon="pause",
            tooltip="Toogle system auto-execution.",
            layout=Layout(width="auto"),
        )
        undo_but = Button(
            icon="undo", tooltip="Reset to initial value", layout=Layout(width="auto")
        )
        header = HBox([play_but, pause_but, undo_but])

        groups = dict()
        for grp_name, group in definition.items():
            groups[grp_name] = list()
            for element in group:
                if isinstance(element, SystemWidget):
                    groups[grp_name].append(element)
                else:
                    alias = None
                    kwargs = dict()
                    if isinstance(element, str):
                        name = element
                    elif isinstance(element, dict):
                        name = element.pop("name")
                        alias = element.pop("alias", None)
                        kwargs = element
                    elif len(element) == 2:
                        name, alias = element
                    else:
                        raise ValueError(
                            "Definition '{}' is not valid.".format(element)
                        )
                    if alias is None and name.startswith(grp_name + "."):
                        alias = name[len(grp_name) + 1 :]
                    groups[grp_name].append(
                        SystemWidget.get_from_name(system, name, alias=alias, **kwargs)
                    )
        self._controls = Accordion(
            children=[VBox(groups[grp_name]) for grp_name in groups]
        )
        for i, grp_name in enumerate(groups):
            self._controls.set_title(i, grp_name)

        children = [header, self._controls]

        # Connect to events
        play_but.on_click(self.execute)

        def toogle_pause(change):
            SystemWidget.auto_run = not change["new"]

        pause_but.observe(toogle_pause, names="value")
        undo_but.on_click(self.reset)

        return children

    def execute(self, event=None):
        """Callback function for play button."""
        s = self._system()
        if s is not None:
            try:
                s.run_drivers()
            except Exception as e:
                logger.exception(e)

    def reset(self, event=None):
        """Callback function for reset button."""
        for group in self._controls.children:
            for widget in group.children:
                widget.reset(event)
