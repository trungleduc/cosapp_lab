from cosapp_lab.widgets.base.base_widget import BaseWidget
from typing import List, Union
from cosapp.systems import System
from traitlets import Unicode


class ConnectionWidget(BaseWidget):

    _model_name = Unicode("ConnectionWidgetModel").tag(sync=True)
    _view_name = Unicode("ConnectionWidgetView").tag(sync=True)

    def __init__(self, data: Union[System, List[System]] = None, **kwargs):
        self.title = "Connection widget"
        super().__init__(data, **kwargs)

    def init_component(self, **kwargs):
        pass
