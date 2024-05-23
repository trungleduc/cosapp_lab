from copy import deepcopy
from enum import Enum
import logging
from math import inf
from typing import Any, Optional, Tuple
from weakref import ref

from cosapp.ports import Validity
from cosapp.systems import System
from ipywidgets import (
    BoundedFloatText,
    VBox,
    Button,
    Dropdown,
    FloatText,
    HBox,
    HTML,
    Label,
    Layout,
    Text,
    Widget,
)

from cosapp_lab.widgets.legacy.widgetlogger import WidgetLogger
from cosapp_lab.widgets.legacy.utils import default_step

logger = logging.getLogger(__name__)


class SystemWidget(VBox):
    """Abstract base class for Jupyter Widget used with CoSApp System.

    Class Attributes
    ----------------
    auto_run : bool
        Should the CoSApp `System` be executed at each value change.
    default_layout : Dict[str, str]
        Default box layout

    Parameters
    ----------
    system : System
        System in which belong the variable
    name : str
        Full variable name of the variable in the CoSApp System
    alias : str, optional
        Alias for the variable name to be shown in the UI; default None (i.e. alias = name)
    children : Tuple[Widget], optional
        Tuple of children widget to add to this box; default empty tuple
    kwargs
        Additional keyword arguments are passed to the Box layout
    """

    auto_run = True
    default_layout = {"flex_flow": "column nowrap"}

    def __init__(
        self,
        system: System,
        name: str,
        alias: Optional[str] = None,
        children: Tuple[Widget] = (),
        **kwargs
    ):
        self._name = name
        self._system = ref(system)
        self._init_value = deepcopy(system[name])
        if alias is None:
            alias = name
        layout = kwargs
        layout.update(SystemWidget.default_layout)
        self._icon = HTML("", layout=Layout(flex="0 0 auto"))
        label = Label(alias, layout=Layout(flex="1 1 auto"))
        reset_but = Button(
            icon="undo",
            tooltip="Reset to initial value",
            layout=Layout(flex="0 0 auto", width="auto"),
        )
        reset_but.on_click(self.reset)
        super(SystemWidget, self).__init__(
            children=(HBox([self._icon, label, reset_but]), *children),
            layout=Layout(**layout),
        )

        # Connect events
        system.setup_ran.connect(self.update)

    @staticmethod
    def get_from_name(
        system: System, name: str, alias: Optional[str] = None, **kwargs
    ) -> "SystemWidget":
        """Create a handler widget for a variable specified by its name.

        Parameters
        ----------
        system : System
            System in which belong the variable
        name : str
            Full variable name of the variable in the CoSApp System
        alias : str, optional
            Alias for the variable name to be shown in the UI; default None (i.e. alias = name)
        kwargs
            Additional keyword arguments are passed to the widget

        Returns
        -------
        SystemWidget
            The widget to handle the variable.
        """

        if name not in system:
            raise ValueError(
                "Variable '{}' does not exist in System '{}'.".format(name, system.name)
            )

        value = system[name]

        if isinstance(value, Enum):
            return EnumData(system, name, alias=alias, **kwargs)
        elif isinstance(value, (str, bytes)):
            return StringData(system, name, alias=alias, **kwargs)

        try:
            float(value)
        except (ValueError, TypeError):
            pass
        else:
            return NumberData(system, name, alias=alias, **kwargs)

        try:
            float(list(value)[0])
        except (ValueError, TypeError):
            pass
        else:
            return ArrayData(system, name, alias=alias, **kwargs)

        raise NotImplementedError(
            "Variable '{}' has not a supported type for displaying in a widget.".format(
                name
            )
        )

    def on_value_changed(self, value: Any):
        """Callback following a widget value change."""
        s = self._system()
        if s is None:
            return

        s[self._name] = value
        # Valid the new value
        valid = s.check(self._name)
        if valid == Validity.OK:
            self._icon.value = ""
        elif valid == Validity.WARNING:
            self._icon.value = (
                "<i class='fa fa-bell' style='color:var(--jp-warn-color1);'></i>"
            )
        elif valid == Validity.ERROR:
            self._icon.value = "<i class='fa fa-exclamation-triangle' style='color:var(--jp-error-color1);'></i>"

        if SystemWidget.auto_run:
            try:
                s.run_drivers()
            except Exception as e:
                logger.exception(e)

    def reset(self, event=None):
        """Reset the current widget value with the initial value."""
        raise NotImplementedError(
            "`SystemWidget.reset` is an abstract method that must be implemented in subclasses."
        )

    def update(self, event=None):
        """Update the current widget value from the CoSApp System."""
        raise NotImplementedError(
            "`SystemWidget.update` is an abstract method that must be implemented in subclasses."
        )


class UniqueData(SystemWidget):
    """Widget to update a unique value.

    Parameters
    ----------
    system : System
        System in which belong the variable
    name : str
        Full variable name of the variable in the CoSApp System
    child : Widget
        The widget modifying the value
    alias : str, optional
        Alias for the variable name to be shown in the UI; default None (i.e. alias = name)
    """

    def __init__(
        self,
        system: System,
        name: str,
        child: Widget,
        alias: Optional[str] = None,
        **kwargs
    ):
        self.widget = child
        super(UniqueData, self).__init__(
            system, name, alias=alias, children=(child,), **kwargs
        )
        self.widget.observe(self.on_value, names="value")

    def on_value(self, change):
        """Callback method when widget value changes."""
        self.on_value_changed(change["new"])

    def _set_value(self, value):
        run_status = SystemWidget.auto_run
        SystemWidget.auto_run = False
        self.widget.value = value
        SystemWidget.auto_run = run_status

    def reset(self, event=None):
        self._set_value(self._init_value)

    def update(self, event=None):
        s = self._system()
        if s is not None:
            self._set_value(s[self._name])


class NumberData(UniqueData):
    """Widget to update a number.

    Parameters
    ----------
    system : System
        System in which belong the variable
    name : str
        Full variable name of the variable in the CoSApp System
    alias : str, optional
        Alias for the variable name to be shown in the UI; default None (i.e. alias = name)
    min : number, optional
        Minimum value for the variable; default None
    max : number, optional
        Maximum value for the variable; default None
    step : number, optional
        Increment of variable; default None
    """

    def __init__(
        self, system: System, name: str, alias: Optional[str] = None, **kwargs
    ):
        value = float(system[name])
        # TODO use validation range to potentially set min and max
        min = kwargs.pop("min", None)
        max = kwargs.pop("max", None)
        step = kwargs.pop("step", None)  # TODO estimate step from value

        if min is None and max is None:
            widget = FloatText(
                value=value,
                step=step or default_step(value),
                layout=Layout(width="auto"),
            )
        else:
            if not (min is None or max is None) and step is None:
                step = 0.05 * (max - min)  # Take step = 5% range
            min = min if min is not None else -1.0 * inf
            max = max if max is not None else inf
            widget = BoundedFloatText(
                value=value,
                max=max,
                min=min,
                step=step or default_step(value),
                layout=Layout(width="auto"),
            )

        super(NumberData, self).__init__(system, name, widget, alias=alias, **kwargs)


class EnumData(UniqueData):
    """Widget to update a enum.

    Parameters
    ----------
    system : System
        System in which belong the variable
    name : str
        Full variable name of the variable in the CoSApp System
    alias : str, optional
        Alias for the variable name to be shown in the UI; default None (i.e. alias = name)
    """

    def __init__(
        self, system: System, name: str, alias: Optional[str] = None, **kwargs
    ):
        value = system[name]
        widget = Dropdown(
            value=value,
            options=type(value)._value2member_map_,
            layout=Layout(width="auto"),
        )

        super(EnumData, self).__init__(system, name, widget, alias=alias, **kwargs)


class StringData(UniqueData):
    """Widget to update a string.

    Parameters
    ----------
    system : System
        System in which belong the variable
    name : str
        Full variable name of the variable in the CoSApp System
    alias : str, optional
        Alias for the variable name to be shown in the UI; default None (i.e. alias = name)
    options : str, optional
        List of valid strings; default None (i.e. user is free to type the data)
    """

    def __init__(
        self, system: System, name: str, alias: Optional[str] = None, **kwargs
    ):
        value = system[name]
        options = kwargs.pop("options", None)
        if options is None:
            widget = Text(value=value, layout=Layout(width="auto"))
        else:
            options = set(options)
            if value not in options:
                options.add(value)
            widget = Dropdown(value=value, options=options, layout=Layout(width="auto"))

        super(StringData, self).__init__(system, name, widget, alias=alias, **kwargs)

    def reset(self, event=None):
        if (
            isinstance(self.widget, Dropdown)
            and self._init_value not in self.widget.options
        ):
            options = set(self.widget.options)
            self.widget.options = options.add(self._init_value)

        super(StringData, self).reset(event)

    def update(self, event=None):
        s = self._system()
        if s is not None:
            v = s[self._name]
            if isinstance(self.widget, Dropdown) and v not in self.widget.options:
                options = set(self.widget.options)
                self.widget.options = options.add(v)

        super(StringData, self).update(event)


class IndexFloatText(FloatText):
    """FloatText widget extended to keep track of the index of the float in the associated array.

    Parameters
    ----------
    index : int
        Index of the number in the container array
    """

    def __init__(self, index: int, **kwargs):
        super(IndexFloatText, self).__init__(**kwargs)
        self.index = index


class ArrayData(SystemWidget):
    """Widget to update an iterable of number.

    Parameters
    ----------
    system : System
        System in which belong the variable
    name : str
        Full variable name of the variable in the CoSApp System
    alias : str, optional
        Alias for the variable name to be shown in the UI; default None (i.e. alias = name)
    """

    def __init__(
        self, system: System, name: str, alias: Optional[str] = None, **kwargs
    ):
        self.value = deepcopy(system[name])
        self.vector = list()

        for i, vi in enumerate(self.value):
            f = IndexFloatText(i, value=vi, layout=Layout(flex="1 1 80px"))
            f.observe(self.on_value, names="value")
            self.vector.append(f)

        super(ArrayData, self).__init__(
            system, name, alias=alias, children=(HBox(children=self.vector),), **kwargs
        )

    def on_value(self, changes):
        widget = changes["owner"]
        self.value[widget.index] = changes["new"]
        self.on_value_changed(self.value)

    def _set_value(self, value):
        self.value = deepcopy(value)
        run_status = SystemWidget.auto_run
        SystemWidget.auto_run = False

        for i, widget in enumerate(self.vector):
            widget.value = self.value[i]
        SystemWidget.auto_run = run_status

    def reset(self, event=None):
        """Reset the current widget value with the initial value."""
        self._set_value(self._init_value)

    def update(self, event=None):
        """Update the current widget value from the CoSApp System."""
        s = self._system()
        if s is not None:
            self._set_value(s[self._name])
