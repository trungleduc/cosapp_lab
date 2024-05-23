import logging
from weakref import ref
from typing import Optional

from ipywidgets import HBox, HTML, Layout, Output, ToggleButton

from cosapp.systems import System
from .sidecar import Sidecar


class WidgetLogger(logging.Handler):
    """Custom logging handler sending logs to an output widget.

    Parameters
    ----------
    system : cosapp.systems.System
        System of interest
    level : int, optional
        Logging level printed; default logging.INFO
    format : str, optional
        Logging formatter string (see `documentation <https://docs.python.org/3/library/logging.html#formatter-objects>`_); default [%(levelname)s] %(message)s
    overwrite: bool, optional
        Remove all other logging handlers specified at root level; default True.
    """

    def __init__(
        self,
        system: System,
        level: int = logging.INFO,
        format: Optional[str] = "[%(levelname)s] %(message)s",
        overwrite: bool = True,
    ):
        super(WidgetLogger, self).__init__(level=level)
        if format:
            self.setFormatter(logging.Formatter(format))

        self._system = ref(system)
        self.auto_clear = True
        self.out = Output(layout=Layout(overflow_y="auto"))

        logger = logging.getLogger()
        if overwrite:
            for handle in logger.handlers:
                logger.removeHandler(handle)
        logger.addHandler(self)

        # Connect events
        system.setup_ran.connect(self._auto_clear)

    def _auto_clear(self):
        """Clear logs if auto_clear is True."""
        if self.auto_clear:
            self.clear_logs()

    def emit(self, record):
        """ Overload of logging.Handler method """
        formatted_record = self.format(record)
        # Workaround for JupyterLab see issue:
        # https://github.com/jupyter-widgets/ipywidgets/issues/1810
        self.out.append_stdout(formatted_record + "\n")
        # with self.out:
        #     print(formatted_record)

    def show_logs(self):
        """ Show the logs """
        auto_clear_but = ToggleButton(
            value=self.auto_clear,
            icon="eraser",
            button_style="",
            tooltip="Toogle log auto clear.",
            layout=Layout(flex="0 0 auto", width="auto"),
        )

        def toogle(change):
            self.auto_clear = change["new"]

        auto_clear_but.observe(toogle, names="value")

        Sidecar(
            [
                HBox(
                    [
                        auto_clear_but,
                        HTML(
                            r"<style>.cosapp-sidecar .jp-OutputPrompt.jp-OutputArea-prompt { display: none;}</style>"
                        ),
                    ],
                    layout=Layout(flex="0 0 auto"),
                ),
                self.out,
            ],
            title="Log",
            anchor="split-bottom",
        )

    def clear_logs(self):
        """ Clear the current logs """
        self.out.clear_output()
        self.out.outputs = ()
