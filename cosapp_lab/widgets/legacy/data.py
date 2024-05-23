from enum import Enum
from typing import Any, Dict, Iterable, List, Optional, Union

import numpy as np
import pandas as pd

try:
    import plotly.graph_objs as go
except:
    go = None
from ipywidgets import Button, Dropdown, HBox, HTML, IntSlider, Layout, Output, VBox
from traitlets import List, Unicode, observe

from cosapp.drivers import RunOnce
from cosapp.drivers.abstractsolver import AbstractSolver
from cosapp.recorders import DataFrameRecorder
from cosapp.utils.helpers import is_number

from .sidecar import Sidecar


class DataFrameRecorderViewer(VBox):
    cases = List(trait=Unicode())
    variables = List(trait=Unicode())

    def __init__(self, rec: DataFrameRecorder, **kwargs) -> None:
        super(DataFrameRecorderViewer, self).__init__(**kwargs)
        self.recorder = rec
        self._extra_data = []

        vars_options = [
            var
            for var in self.recorder.field_names()
            if var in self.recorder._watch_object
            and is_number(self.recorder._watch_object[var])
        ]
        self.variables.append("index")
        self.variables.extend(vars_options)

        self.cases.append("all")
        if isinstance(self.recorder._owner, AbstractSolver):
            self.cases.extend(
                [
                    name
                    for name, d in filter(
                        lambda n_d: isinstance(n_d[1], RunOnce),
                        self.recorder._owner.children.items(),
                    )
                ]
            )

        # Connect with recorder
        # Must be a method as local function will be clean by weakref in Slot
        rec.state_recorded.connect(self._soft_update)
        rec.cleared.connect(self.update)

    def _soft_update(self, change: Dict[str, Any] = {"new": True}, **kwargs):
        """Call `update` with `force=False`."""
        self.update(force=False)

    def update(
        self, change: Dict[str, Any] = {"new": True}, force: bool = True, **kwargs
    ) -> None:
        """Handler to update the figure."""
        if self.recorder.paused:
            return

        # Append new extra data if there are some
        if self.recorder.extra_data != self._extra_data:
            self._extra_data = self.recorder.extra_data
            self.variables.extend(
                [f for f in self._extra_data if f not in self.variables]
            )


class Scatter(DataFrameRecorderViewer):
    """Notebook widget to handle a scatter plot with data obtained from a DataFrameRecorder

    Parameters
    ----------
    rec : cosapp.recorder.DataFrameRecorder
        Recorder containing the data to view
    """

    def __init__(self, rec: DataFrameRecorder, **kwargs) -> None:
        if go is None:
            raise ImportError(" this widget requires plotly")

        super(Scatter, self).__init__(rec, **kwargs)

        self.widgets = w = {
            "restorer": {
                "button": Button(
                    icon="undo",
                    layout=Layout(width="auto", flex="0 0 auto", align_items="center"),
                    width="auto",
                    disabled=True,
                ),
                "slider": IntSlider(
                    min=0, max=0, layout=Layout(flex="1 1 auto"), continuous_update=True
                ),
            },
            "plot": self._init_plot(self.recorder._owner.name),
            "axes": {
                "case": Dropdown(
                    options=self.cases,
                    description="case",
                    disabled=len(self.cases) <= 1,
                ),
                "x": Dropdown(options=self.variables, description="x", disabled=False),
                "y": Dropdown(options=self.variables, description="y", disabled=False),
            },
            "debug": Output(),
        }

        # Connect internal widgets
        w["restorer"]["slider"].observe(self.index_handler, "value")
        w["restorer"]["button"].on_click(self.button_action)
        w["axes"]["case"].observe(self.case_handler, "value")
        w["axes"]["x"].observe(self.x_handler, "value")
        w["axes"]["y"].observe(self.y_handler, "value")

        self.layout = Layout(
            height="100%", margin="5px", padding="0 0 10px 0", overflow_y="hidden"
        )
        self.children = [
            HBox(
                [
                    w["restorer"]["button"],
                    w["restorer"]["slider"],
                    HTML(
                        "<style>.cosapp-sidecar .js-plotly-plot { height: 100%; }</style>"
                    ),
                ],
                layout=Layout(
                    flex="0 0 auto",
                    justify_content="flex-end",
                    align_items="center",
                    min_height="30px",
                    overflow_y="hidden",
                ),
            ),
            w["plot"],
            HBox(
                [w["axes"]["case"], w["axes"]["x"], w["axes"]["y"]],
                layout=Layout(
                    justify_content="center",
                    width="auto",
                    min_height="30px",
                    overflow_y="hidden",
                    flex="1 1 auto",
                ),
            ),
            VBox([w["debug"]], layout=Layout(overflow_y="auto")),
        ]

        # Force plot update
        self.update()

    def _init_plot(self, name: str) -> "plotly.graph_objs.FigureWidget":
        """Build and display the Plotly plot in the Jupyterlab front-end.

        Parameters
        ----------
        name : str
            Figure title
        """

        scatter = go.Scatter(
            x=[], y=[], mode="markers", marker=dict(size=8, color="grey")
        )
        layout = go.Layout(
            title=name,
            hovermode="closest",
            margin=go.layout.Margin(l=70, r=50, b=40, t=50, pad=1),
            xaxis=dict(
                showgrid=True,
                zeroline=True,
                showline=True,
                nticks=10,
                hoverformat=".3f",
                title="",
            ),
            yaxis=dict(
                showgrid=True,
                zeroline=True,
                showline=True,
                nticks=5,
                hoverformat=".3f",
                title="",
            ),
        )
        return go.FigureWidget(data=[scatter], layout=layout)

    @observe("variables")
    def on_variables(self, change):
        """Handle changes in variable list."""
        for axis in ("x", "y"):
            dropdown = self.widgets["axes"][axis]
            v = dropdown.value
            dropdown.options = change["new"]
            dropdown.value = v

    def case_handler(self, change: Dict[str, Any]) -> None:
        """Handle *case* combobox change."""
        new = change["new"]
        if new:
            self.update({"case": new})

    def x_handler(self, change: Dict[str, Any]) -> None:
        """Handle *x* combobox change."""
        new = change["new"]
        if new:
            self.update({"x": new})

    def y_handler(self, change: Dict[str, Any]) -> None:
        """Handle *y* combobox change."""
        new = change["new"]
        if new:
            self.update({"y": new})

    def index_handler(self, change: Dict[str, Any]) -> None:
        """Handle *index* slider change."""
        new = change["new"]
        if new:
            self.update({"index": new})

    def button_action(self, action) -> None:
        """Handle click event on restore button."""
        self.recorder.paused = True
        self.recorder._watch_object.run_drivers()
        self.recorder.paused = False

    def update(
        self, change: Dict[str, Any] = {"new": True}, force: bool = True, **kwargs
    ) -> None:
        """Handler to update the figure."""
        if self.recorder.paused:
            return

        with self.widgets["debug"]:

            super(Scatter, self).update(change, force, **kwargs)

            if change:
                case_axis = self.widgets["axes"]["case"].value
                n_cases = max(1, len(self.cases) - 1) if case_axis == "all" else 1
                x_axis = self.widgets["axes"]["x"].value
                y_axis = self.widgets["axes"]["y"].value
                data = self.recorder.data

                if case_axis != "all" and data.shape[0] > 0:
                    if case_axis in data["Reference"].unique():
                        data = data.loc[data["Reference"] == case_axis]
                    else:
                        data = pd.DataFrame(columns=data.columns)
                count = int(data.shape[0] / n_cases)

                if "index" not in change:
                    current_idx = max(count - 1, 0)
                    self.widgets["restorer"]["slider"].max = current_idx
                    self.widgets["restorer"]["slider"].unobserve(
                        self.index_handler, names="value"
                    )
                    self.widgets["restorer"]["slider"].value = current_idx
                    self.widgets["restorer"]["slider"].observe(
                        self.index_handler, names="value"
                    )
                    self.widgets["restorer"]["button"].disabled = count <= 1
                else:
                    current_idx = self.widgets["restorer"]["slider"].value
                    self.recorder.restore(current_idx)

                colors = ["grey"] * count * n_cases
                opacities = [0.3] * count * n_cases
                if count > 0:
                    for data_idx in range(
                        current_idx * n_cases, (current_idx + 1) * n_cases
                    ):
                        colors[data_idx] = "orange"
                        opacities[data_idx] = 1.0

                src = {
                    "x": data[x_axis].values if x_axis != "index" else np.arange(count),
                    "y": data[y_axis].values if y_axis != "index" else np.arange(count),
                    "text": list(range(count)),
                    "marker": {"color": colors, "opacity": opacities},
                }

                if "new" not in change:
                    if "case" not in change:
                        if "x" not in change:
                            src.pop("x")
                        if "y" not in change:
                            src.pop("y")
                    if "index" not in change:
                        src.pop("marker")

                self.widgets["plot"].update(
                    data=[src],
                    layout={"xaxis": {"title": x_axis}, "yaxis": {"title": y_axis}},
                )
