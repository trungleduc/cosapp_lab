from cosapp_lab.widgets.base.base_widget import BaseWidget
from typing import List, Union
from cosapp.systems import System
from traitlets import Unicode


class PbsWidget(BaseWidget):

    _model_name = Unicode("PbsWidgetModel").tag(sync=True)
    _view_name = Unicode("PbsWidgetView").tag(sync=True)

    def __init__(self, data: Union[System, List[System]] = None, **kwargs):
        self.title = "PBS widget"
        super().__init__(data, **kwargs)

    def init_component(self, **kwargs):
        pass
