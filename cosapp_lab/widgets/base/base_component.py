#!/usr/bin/env python
# coding: utf-8

# Copyright (c) CoSApp Team.


from cosapp.systems import System
from weakref import ReferenceType
from typing import Callable, Dict, List, Any
from cosapp_lab.widgets.utils import CosappObjectParser


class BaseComponent:

    name = "BaseComponent"

    def __init__(
        self,
        data: "ReferenceType[System]" = None,
        sys_data: CosappObjectParser = None,
        send_func: Callable = None,
        **kwargs
    ):

        self._system = data
        self.sys_data = sys_data
        self.send = send_func

    def _handle_button_msg(self, model: Any, content: Dict, buffers: List) -> None:
        pass

    def computed_notification(self) -> None:
        pass

    @property
    def system(self) -> System:
        return self._system()
