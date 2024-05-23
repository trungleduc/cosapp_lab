from cosapp_lab.widgets.base.base_widget import BaseWidget
from typing import List, Union
from cosapp.systems import System
from traitlets import Unicode
from .geometry_component import GeometryComponent


class GeometryWidget(BaseWidget):

    _model_name = Unicode("GeometryWidgetModel").tag(sync=True)
    _view_name = Unicode("GeometryWidgetView").tag(sync=True)

    def __init__(self, data: Union[System, List[System]] = None, **kwargs):
        self.title = "Geometry widget"
        super().__init__(data, **kwargs)

    def init_component(self, **kwargs):
        self.register(GeometryComponent, **kwargs)
