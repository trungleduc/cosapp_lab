from cosapp_lab.widgets.base.base_widget import BaseWidget
from typing import List, Union
from cosapp.systems import System
from traitlets import Unicode
from .chart_component import ChartElement


class ChartWidget(BaseWidget):

    _model_name = Unicode("ChartWidgetModel").tag(sync=True)
    _view_name = Unicode("ChartWidgetView").tag(sync=True)

    def __init__(self, data: Union[System, List[System]] = None, **kwargs):
        self.title = "Chart widget"
        super().__init__(data, **kwargs)

    def init_component(self, **kwargs):
        self.register(ChartElement, **kwargs)
