#!/usr/bin/env python
# coding: utf-8

# Copyright (c) CoSApp Team.


from typing import Any, Callable, Dict, List
from weakref import ReferenceType
from cosapp_lab.widgets.widgetview import IpyWidgetRender
from cosapp.systems import System
from cosapp_lab.widgets.utils import CosappObjectParser
from cosapp_lab.widgets.base.base_component import BaseComponent
import markdown
from ipywidgets import HTML


class DocumentView(BaseComponent):
    name = "DocumentViewer"

    def __init__(
        self,
        data: "ReferenceType[System]",
        sys_data: CosappObjectParser,
        send_func: Callable,
        **kwargs,
    ):
        super().__init__(data=data, sys_data=sys_data, send_func=send_func, **kwargs)

    def _handle_button_msg(self, model: Any, content: Dict, buffers: List)-> None:
        if content["action"] == f"{self.name}::generateDocument":
            src: str = content["payload"]["source"]
            title: str = content["payload"]["title"]
            if len(title) == 0:
                return
            IpyWidgetRender(title=title, children=[self.generate_html(src)])


    def generate_html(self, src: str) -> HTML:
        html = markdown.markdown(src)
        return HTML(html)
