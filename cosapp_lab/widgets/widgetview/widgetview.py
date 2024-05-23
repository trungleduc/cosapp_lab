#!/usr/bin/env python
# coding: utf-8

# Copyright (c) CoSApp Team.


"""
Widget container for ChartView
"""

from ipywidgets import VBox
from traitlets import Unicode, CaselessStrEnum
from cosapp_lab._frontend import module_name, module_version


class IpyWidgetRender(VBox):
    """Widget container as sidecar panel.

    Attributes
    ----------
    title: str,
        id of div used to attach widget
    children: list of Widget
        List of widget to show in frontend
    """

    _model_name = Unicode("IpyWidgetRenderModel").tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode("IpyWidgetRenderView").tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)
    title = Unicode("").tag(sync=True)
