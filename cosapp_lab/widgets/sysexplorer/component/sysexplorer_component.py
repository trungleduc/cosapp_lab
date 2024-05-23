#!/usr/bin/env python
# coding: utf-8

# Copyright (c) CoSApp Team.


from typing import Any, Callable, Dict, List
from weakref import ReferenceType
import os, json
from cosapp.systems import System
from cosapp_lab.widgets.base.base_component import BaseComponent
from cosapp_lab.widgets.utils import (
    CosappObjectParser,
    get_nonexistant_path,
)


class SysExplorerComponent(BaseComponent):
    name = "SysExplorer"

    def __init__(
        self,
        data: "ReferenceType[System]",
        sys_data: CosappObjectParser,
        send_func: Callable,
        **kwargs,
    ):
        self._template_path = kwargs.get("_template_path")
        super().__init__(data=data, sys_data=sys_data, send_func=send_func, **kwargs)

    def _handle_button_msg(self, model: Any, content: Dict, buffers: List) -> None:

        if content["action"] == "SysExplorer::chartViewerSaveJson":
            json_name = content["payload"]["jsonName"].replace(".json", "")
            if json_name != self._template_path:
                file_path = get_nonexistant_path(
                    os.path.join(os.getcwd(), f"{json_name}.json")
                )
                self._template_path = os.path.basename(file_path).replace(".json", "")
            else:
                file_path = f"{json_name}.json"
            self.send(
                {
                    "type": "SysExplorer::update_save_path",
                    "payload": {"templatePath": self._template_path},
                }
            )
            json_data = content["payload"]["jsonData"]
            with open(file_path, "w") as f:
                json.dump(json_data, f)
