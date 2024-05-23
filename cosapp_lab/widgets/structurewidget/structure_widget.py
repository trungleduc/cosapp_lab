from cosapp_lab.widgets.base.base_widget import BaseWidget
from typing import List, Union
from cosapp.systems import System
from traitlets import Unicode
from .structure_component import StructureComponent


class StructureWidget(BaseWidget):

    _model_name = Unicode("StructureWidgetModel").tag(sync=True)
    _view_name = Unicode("StructureWidgetView").tag(sync=True)

    def __init__(self, data: Union[System, List[System]] = None, **kwargs):
        self.title = "Structure widget"
        super().__init__(data, **kwargs)

    def init_component(self, **kwargs):
        self.register(StructureComponent)
