#!/usr/bin/env python
# coding: utf-8

# Copyright (c) CoSApp Team.

from typing import Any, Callable, Dict, List, OrderedDict
from weakref import ReferenceType

from cosapp.core.module import Module
from cosapp.ports.port import Port
from cosapp.systems import System
from cosapp.tools.help import DocDisplay
from cosapp_lab.widgets.base.base_component import BaseComponent
from cosapp_lab.widgets.utils import CosappObjectParser


class SystemInfoComponent(BaseComponent):
    name = "SystemInfoComponent"

    def __init__(
        self,
        data: "ReferenceType[System]",
        sys_data: CosappObjectParser,
        send_func: Callable,
        **kwargs,
    ):
        super().__init__(data=data, sys_data=sys_data, send_func=send_func, **kwargs)


    @staticmethod
    def create_html(sys_obj : System, context_name: str) -> str:
        """Returns the markdown-formatted documentation of the input system.

        Parameters
        ----------
        sys_obj: System
            System object to generate documentation

        context_name: str
            Current contextual name of input object.
            
        Returns
        -------
        str
            String in Markdown format.
        """

        raw_string = DocDisplay(sys_obj)._repr_markdown_().strip()
        
        idx = 0
        while True:
            if raw_string[idx] != '#':
                break
            else:
                idx += 1       
        first_line = f"{'#'*idx} System: {context_name} - "          
        return first_line + raw_string[idx:]


    def build_info_dict(self)-> OrderedDict:
        
        """Returns a dictionary of the markdown-formatted documentation of `self.system`
        and its children.

        Returns
        -------
        OrderedDict
            Ordered dictionary with key is contextual name of system and value is its
            documentation.
        """        

        ret = OrderedDict()
        root_name = self.system.name
        def _build_info(sys: System, ret):
            if sys.parent is None:
                context_name = root_name
            else:
                context_name = f"{root_name}.{sys.contextual_name}"
            ret[context_name] = SystemInfoComponent.create_html(sys, context_name)
            for child in sys.children.values():
                _build_info(child, ret)

        _build_info(self.system, ret)
        return ret

    def _handle_button_msg(self, model: Any, content: Dict, buffers: List)-> None:
        
        """Handlers for message of System Info Widget from front end.
        
        Parameters
        ----------
        model: Any
            Current System Info Widget model (unused)

        content: Dict
            Content of message.
        
        """        
        
        if content["action"] == f"{self.name}::getData":
            html_dict = self.build_info_dict()
            self.send(
                {
                    "type": f"{self.name}::infoData",
                    "payload": html_dict,
                }
            )

    def computed_notification(self) -> None:

        """Callback to be called after `computed` signal of `self.system`.
                
        """         
        html_dict = self.build_info_dict()
        self.send(
            {
                "type": f"{self.name}::updateData",
                "payload": html_dict,
            }
        )        
