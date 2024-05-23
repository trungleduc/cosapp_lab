from cosapp_lab.widgets.base.base_widget import BaseWidget
from typing import List, Union
from cosapp.systems import System
from traitlets import Unicode
from .info_component import SystemInfoComponent


class SystemInfoWidget(BaseWidget):

    _model_name = Unicode("SystemInfoWidgetModel").tag(sync=True)
    _view_name = Unicode("SystemInfoWidgetView").tag(sync=True)

    def __init__(self, data: Union[System, List[System]] = None, **kwargs):
        self.title = "System info widget"
        super().__init__(data, **kwargs)

    def init_component(self, **kwargs):
        self.register(SystemInfoComponent)
