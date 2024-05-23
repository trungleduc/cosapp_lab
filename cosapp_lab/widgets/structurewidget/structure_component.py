#!/usr/bin/env python
# coding: utf-8

# Copyright (c) CoSApp Team.

from typing import Any, Callable, Dict, List
from weakref import ReferenceType
from cosapp.systems import System
from cosapp_lab.widgets.utils import CosappObjectParser
from cosapp_lab.widgets.base.base_component import BaseComponent



class StructureComponent(BaseComponent):
    name = "StructureView"

    def __init__(
        self,
        data: "ReferenceType[System]",
        sys_data: CosappObjectParser,
        send_func: Callable,
        **kwargs,
    ):
        super().__init__(data=data, sys_data=sys_data, send_func=send_func, **kwargs)

    def _handle_button_msg(self, model: Any, content: Dict, buffers: List):
        if content["action"] == f"{self.name}::getData":
            try:
                from cosapp.tools import VisJsRenderer

            except ImportError:
                self.send(
                    {
                        "type": f"{self.name}::importError",
                    }
                )
            else:
                visJsData = VisJsRenderer(self.system)
                self.send(
                    {
                        "type": f"{self.name}::structureData",
                        "payload": visJsData.get_data(),
                    }
                )
