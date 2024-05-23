#!/usr/bin/env python
# coding: utf-8

# Copyright (c) CoSApp Team.


from typing import Any, Callable, Dict, List
from weakref import ReferenceType
from cosapp_lab.widgets.widgetview import IpyWidgetRender
from cosapp.systems import System
from cosapp_lab.widgets.utils import CosappObjectParser
from cosapp_lab.widgets.base.base_component import BaseComponent
import re


class WidgetView(BaseComponent):
    name = "WidgetViewer"

    def __init__(
        self,
        data: "ReferenceType[System]",
        sys_data: CosappObjectParser,
        send_func: Callable,
        **kwargs,
    ):
        super().__init__(data=data, sys_data=sys_data, send_func=send_func, **kwargs)

    def _handle_button_msg(self, model: Any, content: Dict, buffers: List):
        if content["action"] == f"{self.name}::executeCode":
            code: str = content["payload"]["code"]
            title = content["payload"]["title"]
            sys_var = f"sys_{title}".replace("-", "_")
            check_code = re.search("[a-zA-Z]", code)
            if check_code is None or len(title) == 0 or "generate_widget" not in code:
                return
            global_dict = {
                sys_var: self.system,
                "IpyWidgetRender": IpyWidgetRender,
                "title": title,
            }
            exec(code, global_dict)
            code_with_arg = (
                f"IpyWidgetRender(title=title, children=[ generate_widget({sys_var})])"
            )
            code_without_arg = (
                f"IpyWidgetRender(title=title, children=[ generate_widget()])"
            )
            try:
                exec(code_with_arg, global_dict)
            except TypeError:
                exec(code_without_arg, global_dict)
            except:
                raise
