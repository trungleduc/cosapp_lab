from cosapp_lab.widgets.base.base_widget import BaseWidget
from typing import List, Union
from cosapp.systems import System
from traitlets import Unicode
from .data_component import DataComponent


class DataWidget(BaseWidget):

    _model_name = Unicode("DataWidgetModel").tag(sync=True)
    _view_name = Unicode("DataWidgetView").tag(sync=True)

    def __init__(self, data: Union[System, List[System]] = None, **kwargs):
        self.title = "Data widget"
        super().__init__(data, **kwargs)

    def init_component(self, **kwargs):
        self.register(DataComponent, **kwargs)
