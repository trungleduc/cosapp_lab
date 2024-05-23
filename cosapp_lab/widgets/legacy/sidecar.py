#!/usr/bin/env python
# coding: utf-8

# Copyright (c) CoSApp Team.


"""
Widget container as sidecar panel
"""

from ipywidgets import VBox
from traitlets import Unicode, CaselessStrEnum
from cosapp_lab._frontend import module_name, module_version


class Sidecar(VBox):
    """Widget container as sidecar panel.

    If more than one children is given, they will be appended top to bottom.

    Attributes
    ----------
    title: str, optional
        Tab title for the sidecar; default "Sidecar"
    anchor: str - one of ['split-right', 'split-left', 'split-top', 'split-bottom', 'tab-before', 'tab-after', 'right']
        Position of the sidecar; default "split-right"
    children: list of Widget
        List of widget to insert in the sidecar
    """

    _model_name = Unicode("SidecarModel").tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode("SidecarView").tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)
    title = Unicode("Sidecar").tag(sync=True)
    anchor = CaselessStrEnum(
        [
            "split-right",
            "split-left",
            "split-top",
            "split-bottom",
            "tab-before",
            "tab-after",
            "right",
        ],
        default_value="split-right",
        allow_none=False,
    ).tag(sync=True)
