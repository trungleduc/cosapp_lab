import re
from weakref import ref

from ipywidgets import HTML, HBox, Layout, ToggleButton, VBox
from traitlets import Dict, Unicode

from cosapp.systems import System
from cosapp.utils.validate import validate


class Validation(VBox):
    warnings = Dict(value_trait=Unicode())
    errors = Dict(value_trait=Unicode())

    CLEAN_NAME = r"\.(" + System.INWARDS + r"|" + System.OUTWARDS + r")\."

    def __init__(self, system: System):
        self._system = ref(system)
        self.status_button = ToggleButton(
            description="Nothing run yet",
            button_style="",
            tooltip="Click me to show the log.",
            layout=Layout(height="100%"),
        )
        self.validation_log = HTML(
            value="", layout=Layout(display="none", overflow_y="auto")
        )
        super(Validation, self).__init__(
            children=[
                HBox([self.status_button], layout=Layout(justify_content="center")),
                self.validation_log,
            ],
            layout=Layout(align_self="flex-start", width="100%"),
        )

        # Connect event
        def toggle(change):
            self.validation_log.layout.display = "unset" if change["new"] else "none"

        self.status_button.observe(toggle, names="value")

        # Add callback to system
        system.clean_ran.connect(self._set_validities)

        # Update status
        self._set_validities()

    def _set_validities(self):
        """Update UI depending on the validation status."""
        if self._system() is None:
            return

        self.warnings, self.errors = validate(self._system())

        warnings = {
            re.sub(Validation.CLEAN_NAME, ".", name): comment
            for name, comment in self.warnings.items()
        }
        errors = {
            re.sub(Validation.CLEAN_NAME, ".", name): comment
            for name, comment in self.errors.items()
        }

        # Feedback on button
        style = "success"
        info = "Ok"

        # Customize here the HTML rendering
        log_html = """<div id="validationLog">
            <style>
                #validationLog { 
                    white-space: nowrap;
                    line-height: normal;
                }
            </style>"""
        if len(errors):
            style = "danger"
            info = "Out of physical limits"
            log_html += "<h3>Out of modeling limits</h3><ul>"

            for name, comment in errors.items():
                log_html += "<li>{}{}</li>".format(name, comment)
            log_html += "</ul>"

        if len(warnings):
            if style != "danger":
                style = "warning"
                info = "On modeling limits"
            log_html += "<h3>On modeling limits</h3><ul>"

            for name, comment in warnings.items():
                log_html += "<li>{}{}</li>".format(name, comment)
            log_html += "</ul>"
        log_html += "</div>"

        self.status_button.button_style = style
        self.status_button.description = info
        self.validation_log.value = log_html
