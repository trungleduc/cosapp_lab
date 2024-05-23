from typing import Any, Dict

import numpy as np
import pandas as pd

try:
    import plotly.graph_objs as go
except:
    go = None
from ipywidgets import HTML, Dropdown, HBox, Layout, Output, ToggleButtons, VBox
from traitlets import observe

from cosapp.systems import System
from cosapp.recorders import DataFrameRecorder
from .data import DataFrameRecorderViewer


class Statistics(DataFrameRecorderViewer):
    """Notebook widget to visualize DataFrameRecorder in statistical sense.

    Parameters
    ----------
    rec : cosapp.recorder.DataFrameRecorder
        Recorder containing the data to view
    live_update : int
        Point frequency at which the visualization is updated (0 == refresh at the end only)
    """

    def __init__(self, rec: DataFrameRecorder, live_update: int = 100, **kwargs):
        if go is None:
            raise ImportError(" this widget requires plotly")
        super(Statistics, self).__init__(rec, **kwargs)

        self._counter = 0  # Records counter
        self.live_update = max(0, live_update)
        parameters = self._compute_histogram(self.variables[0])
        self.widgets = w = {
            "graphics": ToggleButtons(
                value="Histogram",
                options={"": "Histogram", " ": "Scatter"},
                icons=["bar-chart", "line-chart"],
                layout=Layout(flex="0 0 auto", width="auto"),
            ),
            "plot": go.FigureWidget(
                data=[go.Histogram(**grp) for grp in parameters["data"]],
                layout=go.Layout(**parameters["layout"]),
            ),
            "axes": {
                "x": Dropdown(
                    options=self.variables,
                    description="x",
                    layout=Layout(flex="1 1 auto"),
                ),
                "y": Dropdown(
                    options=self.variables,
                    description="y",
                    layout=Layout(flex="1 1 auto", display="none"),
                ),
            },
            "debug": Output(),
        }

        # Connect internal widgets
        w["graphics"].observe(self.graphics_handler, "value")
        w["axes"]["x"].observe(self.x_handler, "value")
        w["axes"]["y"].observe(self.y_handler, "value")

        if self.live_update == 0:
            rec.state_recorded.disconnect(self._soft_update)

        # Connect to driver
        rec._owner.computed.connect(self.update)

        self.layout = Layout(
            height="100%", margin="5px", padding="0 0 10px 0", overflow_y="hidden"
        )
        self.children = [
            HBox(
                (
                    # w["graphics"],
                    HTML(
                        "<style>.cosapp-sidecar .js-plotly-plot { height: 100%; }</style>"
                    ),
                ),
                layout=Layout(flex="0 0 auto", overflow_y="hidden"),
            ),
            w["plot"],
            HBox(
                (w["axes"]["x"], w["axes"]["y"]),
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

    def _compute_histogram(self, field: str) -> Dict[str, Any]:

        # List of percentiles to show with their corresponding colors
        percentiles = ["15%", "50%", "85%"]
        colors = ["grey", "black", "grey"]

        # Initialize the figure
        #   Compute the statiscal information for the first field
        if self.recorder.data.index.size == 0 or field == "index":
            return dict(
                data=list(),
                layout=dict(
                    title="Probability - " + field,
                    xaxis={"title": field},
                    yaxis={"title": "percent"},
                ),
            )
        else:
            n_section = 0
            shapes = list()
            data = list()
            for section, subdata in self.recorder.data[field].groupby("Section"):
                if len(subdata) == 0:
                    continue

                stats = subdata.describe(
                    percentiles=[0.15, 0.85]
                )  # see pandas.DataFrame.describe

                #   Create the vertical line for the percentiles

                for color, p in zip(colors, percentiles):
                    shapes.append(
                        go.layout.Shape(
                            type="line",
                            x0=stats[p],
                            x1=stats[p],
                            y0=0,
                            y1=1,
                            name=p,
                            yref="paper",  # Trick to get infinite length line
                            line={"color": color},
                        )
                    )

                data.append(
                    dict(
                        name=section,
                        x=subdata if field != "index" else [],
                        histnorm="percent",
                        opacity=0.8,
                        # marker={"color": "#f4950f"},
                    )
                )
                n_section += 1

            layout = dict(
                title="Probability - " + field,
                xaxis={"title": field},
                yaxis={"title": "percent"},
                shapes=shapes,
                margin=go.layout.Margin(l=70, r=50, b=40, t=50, pad=1),
            )
            if n_section > 1:
                layout["barmode"] = "overlay"

            # Create the figure object
            return dict(data=data, layout=layout)

    def _compute_scatter(self, x_label, y_label) -> Dict[str, Any]:
        percentiles = ["15%", "50%", "85%"]

        if self.recorder.data.index.size == 0:
            x_stats = pd.Series(np.zeros(len(percentiles)), index=percentiles)
            y_stats = x_stats
        else:
            x_stats = (
                (
                    self.recorder.data[x_label]
                    .groupby("Section")
                    .describe(percentiles=[0.15, 0.85])
                )
                if x_label != "index"
                else pd.Series(np.zeros(len(percentiles)), index=percentiles)
            )
            y_stats = (
                (
                    self.recorder.data[y_label]
                    .groupby("Section")
                    .describe(percentiles=[0.15, 0.85])
                )
                if y_label != "index"
                else pd.Series(np.zeros(len(percentiles)), index=percentiles)
            )

        return dict(
            data=dict(
                x=x_stats["50%"],
                y=y_stats["50%"],
                mode="markers",
                marker={"size": 8},
                error_x=dict(
                    type="data",
                    symmetric=False,
                    array=x_stats["85%"],
                    arrayminus=x_stats["15%"],
                ),
                error_y=dict(
                    type="data",
                    symmetric=False,
                    array=y_stats["85%"],
                    arrayminus=y_stats["15%"],
                ),
            ),
            layout=dict(
                title="",
                hovermode="closest",
                margin=go.layout.Margin(l=70, r=50, b=40, t=50, pad=1),
                xaxis=dict(
                    title=x_label,
                    showgrid=True,
                    zeroline=True,
                    showline=True,
                    nticks=10,
                    hoverformat=".3f",
                ),
                yaxis=dict(
                    title=y_label,
                    showgrid=True,
                    zeroline=True,
                    showline=True,
                    nticks=5,
                    hoverformat=".3f",
                ),
            ),
        )

    @observe("variables")
    def on_variables(self, change):
        """Handle changes in variable list."""
        for axis in ("x", "y"):
            dropdown = self.widgets["axes"][axis]
            v = dropdown.value
            dropdown.options = change["new"]
            dropdown.value = v

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

    def graphics_handler(self, change: Dict[str, Any]) -> None:
        """Handle click event graphics type."""
        new = change["new"]
        if new:
            # Update display widget
            self.widgets["axes"]["y"].layout.display = (
                "none" if new == "Histogram" else "flex"
            )
            # Clear figure
            self.widgets["plot"].data = []
            self.widgets["plot"].layout.shapes = []
            self.update({"graphics": new})

    def update(
        self, change: Dict[str, Any] = {"new": True}, force: bool = True, **kwargs
    ) -> None:
        """Handler to update the figure."""
        if self.recorder.paused:
            return

        with self.widgets["debug"]:
            if not force:
                self._counter += 1
                if self.live_update == 0 or self._counter % self.live_update != 0:
                    return
            else:
                self._counter = -1
            super(Statistics, self).update(change, **kwargs)

            plot = self.widgets["plot"]
            graphics = self.widgets["graphics"].value
            if graphics == "Histogram":
                field = self.widgets["axes"]["x"].value
                new_plot = self._compute_histogram(field)

                # Update the figure
                if plot.data and len(plot.data) == len(new_plot["data"]):
                    plot.update(
                        data=[{"x": grp["x"]} for grp in new_plot["data"]],
                        layout={
                            "title": "Probability - " + field,
                            "xaxis": {"title": field},
                            "shapes": new_plot["layout"]["shapes"],
                        },
                    )
                else:
                    # Force removing existing series - in case the number of trace changes
                    plot.data = []
                    for grp in new_plot["data"]:
                        plot.add_histogram(**grp)
                    plot.update(layout=new_plot["layout"])

            elif graphics == "Scatter":
                x_data = self.widgets["axes"]["x"].value
                y_data = self.widgets["axes"]["y"].value
                new_plot = self._compute_scatter(x_data, y_data)

                if plot.data:
                    plot.update(
                        data=[
                            {
                                "x": new_plot["data"]["x"],
                                "error_x": {
                                    "array": new_plot["data"]["error_x"]["array"],
                                    "arrayminus": new_plot["data"]["error_x"][
                                        "arrayminus"
                                    ],
                                },
                                "y": new_plot["data"]["y"],
                                "error_y": {
                                    "array": new_plot["data"]["error_y"]["array"],
                                    "arrayminus": new_plot["data"]["error_y"][
                                        "arrayminus"
                                    ],
                                },
                            }
                        ],
                        layout={"xaxis": {"title": x_data}, "yaxis": {"title": y_data}},
                    )
                else:
                    plot.add_scatter(**new_plot["data"])
                    plot.update(layout=new_plot["layout"])
