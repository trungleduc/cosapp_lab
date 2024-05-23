#!/usr/bin/env python
# coding: utf-8

# Copyright (c) CoSApp Team.


from typing import Any, Dict, List, Type, Union

from cosapp.systems import System
from cosapp_lab._frontend import module_name, module_version
from cosapp_lab.widgets.utils import (
    CosappObjectParser,
    is_jsonable,
)
import copy, json
from ipywidgets import Box
from traitlets import CaselessStrEnum
from traitlets import Unicode
from traitlets import Dict as tDict
from traitlets import Int, Unicode
from weakref import ReferenceType, ref
from .base_component import BaseComponent
import numpy as np


class BaseWidget(Box):

    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)
    title = Unicode("BaseWidget").tag(sync=True)
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
    system_data = tDict(default_value={"key": "None"}, allow_none=False).tag(sync=True)
    update_signal = Int(default_value=0, allow_none=False).tag(sync=True)

    initial_store = tDict(default_value={}, allow_none=False).tag(sync=True)
    chart_template = tDict(default_value={}, allow_none=False).tag(sync=True)

    system_config = tDict(default_value={}, allow_none=False).tag(sync=True)

    def __init__(self, data: Union[System, List[System]] = None, **kwargs):

        template_path = kwargs.pop("template", None)

        if template_path is not None:
            try:
                with open(template_path, "r") as f:
                    json_data = json.load(f)
            except FileNotFoundError:
                raise FileNotFoundError(f"No such template file: {template_path!r}")
            required = {"modelJson"}
            missing = required.difference(json_data)
            if missing:
                raise KeyError(
                    f"Required keys {sorted(missing)} not found in {template_path}"
                )
            else:
                self.chart_template = {
                    "chart_template": json_data,
                    "template_path": template_path,
                }
                self._template_path = template_path.replace(".json", "")
        else:
            self.chart_template = {}
            self._template_path = ""

        if hasattr(data, "__iter__"):
            root = System("chart_viewer")
            for sys in data:
                root.add_child(sys)
                key_list = list(sys.drivers)
                if len(key_list) > 0:
                    sys.drivers[key_list[0]].computed.connect(
                        self.computed_notification
                    )
                else:
                    sys.computed.connect(self.computed_notification)

            self.init_value(root, **kwargs)

        else:
            self.init_value(data, **kwargs)

        self.__component = {}
        self.msg_handlers = []
        self.computed_callbacks = []
        self.init_component(_template_path=self._template_path, **kwargs)
        super().__init__(**kwargs)

    def init_component(self, **kwargs):
        raise NotImplementedError

    def init_value(self, data: System, **kwargs):
        self._system: ReferenceType[System] = ref(data)
        self.system_config = {"mode": "run", "enableEdit": True, "root_name": data.name}
        user_config = kwargs.get("config", {})
        for key, val in user_config.items():
            if key in self.system_config:
                self.system_config[key] = val
        self.initial_store = {"systemConfig": copy.deepcopy(self.system_config)}
        self.update_signal = 0
        self.time_step = 0

        self.__init_data(data)
        self.__init_connection()

    def __init_data(self, data: System):
        """Parse cosapp System and return list of sub-systems,
        list of ports...

        Parameters
        ----------
        data : cosapp.systems.System
            Input system
        """
        self.system_variable = {}
        if isinstance(data, System):
            self.sys_data = CosappObjectParser(data)
        else:
            raise TypeError(f"{data} is not a CoSApp system")
        self.system_dict = self.sys_data.flattened_system
        # self._system = ref(data)
        self._system_list = self.sys_data.children_list
        self._driver_list = self.sys_data.children_drive
        in_port_dict = self.sys_data.children_in_port
        out_port_dict = self.sys_data.children_out_port
        self.systemGraphData = {}
        for key in self._system_list:
            try:
                connection_list = self.system_dict[key]["connections"]
            except:
                connection_list = []
            self.systemGraphData[key] = {
                "inPort": in_port_dict[key],
                "outPort": out_port_dict[key],
                "connections": connection_list,
            }

        port_dict = self.sys_data.children_port
        for sys_name in port_dict:
            for port_name in port_dict[sys_name]:
                variable_dict = self.sys_data.get_children_var_input(
                    sys_name, port_name
                )
                if "Mutable variable not found" not in variable_dict:
                    for var_name in variable_dict:
                        if isinstance(variable_dict[var_name]["value"], np.ndarray):
                            variable_dict[var_name]["value"] = variable_dict[var_name][
                                "value"
                            ].tolist()
                            self.system_variable[
                                f"{sys_name}.{port_name}.{var_name}"
                            ] = variable_dict[var_name]
                        elif is_jsonable(variable_dict[var_name]["value"]):
                            self.system_variable[
                                f"{sys_name}.{port_name}.{var_name}"
                            ] = variable_dict[var_name]

        computedResult = self.sys_data.serialize_data_from_system(False)
        recorderData = self.sys_data.serialize_recorder()
        driverData = self.sys_data.serialize_driver_data()

        self.system_data = {
            "systemGraph": {
                "systemGraphData": self.systemGraphData,
                "systemList": self._system_list,
                "graphJsonData": {},
            },
            "systemPBS": {},
            "systemTree": self.sys_data.tree_dict,
            "portMetaData": self.sys_data.children_port_meta,
            "variableData": self.system_variable,
            "computedResult": computedResult,
            "recorderData": recorderData,
            "driverData": driverData,
        }

    def __init_connection(self) -> None:
        """Initialize the connection between fontend - backend and
        between input system with the callbacks.
        """
        self.sys_data.connect_main_driver(self.computed_notification)
        self.on_msg(self._handle_button_msg)

    def computed_notification(self) -> None:
        """Callback function used to update geometry data from buffer
        and to emit update signal to front end.

        """
        for callback in self.computed_callbacks:
            callback()

    def _handle_button_msg(self, model: Any, content: Dict, buffers: List) -> None:
        """Helper function to receive message from front end.

        Parameters
        ----------
        - model [ChartViewerModel]:
            Current model value.

        - content : {"action" : "runSignal" | "requestUpdate", "payload" : Dict}
            If action == "runSignal" => run the main
            driver of system, payload contains a dict of system parameters
            and its value.
            If action == "requestUpdate" => Send the geometry of
            the last computed step to front-end to update the computing
            progress.

        - buffers : List
        """
        for msg_handler in self.msg_handlers:
            msg_handler(model, content, buffers)

    def register(self, Cls: Type[BaseComponent], **kwargs) -> None:
        key = Cls.name
        if key in self.__component:
            raise KeyError(f"Component {key!r} already registered")
        
        self.__component[key] = component = Cls(
            self._system, self.sys_data, self.send, **kwargs
        )
        self.msg_handlers.append(component._handle_button_msg)  # TODO Use dict instead of list
        self.computed_callbacks.append(component.computed_notification)
