from cosapp_lab.widgets.base.base_widget import BaseWidget
from typing import List, Union
from cosapp.systems import System
from traitlets import Unicode
from .controller_component import ControllerComponent


class ControllerWidget(BaseWidget):

    _model_name = Unicode("ControllerWidgetModel").tag(sync=True)
    _view_name = Unicode("ControllerWidgetView").tag(sync=True)

    def __init__(self, data: Union[System, List[System]] = None, **kwargs):
        self.title = "Controller widget"
        super().__init__(data, **kwargs)

    def init_component(self, **kwargs):
        self.register(ControllerComponent, **kwargs)
