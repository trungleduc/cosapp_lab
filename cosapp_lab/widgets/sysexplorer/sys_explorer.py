#!/usr/bin/env python
# coding: utf-8

# Copyright (c) CoSApp Team.

from typing import Union, List
from traitlets import Unicode

from cosapp.systems import System

from cosapp_lab.widgets.base import BaseWidget
from cosapp_lab.widgets.chartwidget import ChartElement
from cosapp_lab.widgets.controllerwidget import ControllerComponent
from cosapp_lab.widgets.geometrywidget import GeometryComponent
from cosapp_lab.widgets.structurewidget import StructureComponent
from cosapp_lab.widgets.infowidget import SystemInfoComponent
from .component import WidgetView, DocumentView, SysExplorerComponent


class SysExplorer(BaseWidget):

    _model_name = Unicode("SysExplorerModel").tag(sync=True)
    _view_name = Unicode("SysExplorerView").tag(sync=True)

    def __init__(self, data: Union[System, List[System]] = None, **kwargs):
        self.title = "SysExplorer widget"
        super().__init__(data, **kwargs)

    def init_component(self, **kwargs):
        self.register(SysExplorerComponent, **kwargs)
        self.register(ChartElement, **kwargs)
        self.register(StructureComponent, **kwargs)
        self.register(ControllerComponent, **kwargs)
        geom_options = dict(
            get_shapes = kwargs.pop("get_shapes", None),
            add_shape = kwargs.pop("add_shape", None),  # to be deprecated
            source = kwargs.pop("source", None),
        )
        self.register(GeometryComponent, **geom_options, **kwargs)
        self.register(WidgetView, **kwargs)
        self.register(DocumentView, **kwargs)
        self.register(SystemInfoComponent, **kwargs)
