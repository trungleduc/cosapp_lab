#!/usr/bin/env python
# coding: utf-8

# Copyright (c) CoSApp Team.


"""
Widget container as SysExp panel
"""
import copy
import json
import logging
import os
import re

from collections import OrderedDict
from datetime import datetime
from io import StringIO
from typing import Dict, List, NoReturn, Union, Any
from weakref import ReferenceType, ref

import ipykernel.connect as kernel
import numpy as np
import requests
from cosapp.recorders import DataFrameRecorder
from cosapp.systems import System
from cosapp_lab._frontend import module_name, module_version
from cosapp_lab.widgets.utils import (
    CosappJsonParser,
    CosappObjectParser,
    OccParser,
    get_nonexistant_path,
    is_jsonable,
)
from ipywidgets import Box
from traitlets import CaselessStrEnum
from traitlets import Dict as tDict
from traitlets import Int, Unicode, observe

COSAPP_URL_START = "cosapp/server/start"
COSAPP_URL_STOP = "cosapp/server/stop"
COSAPP_URL_RUN = "cosapp/server/run"


class SysExplorer(Box):
    """Widget container as SysExplorer panel.

    If more than one children is given, they will be appended top to bottom.

    Attributes
    ----------
    title: str, optional
        Tab title for the SysExplorer; default "SysExplorer"
    anchor: str - one of ['split-right', 'split-left', 'split-top', 'split-bottom', 'tab-before', 'tab-after', 'right']
        Position of the SysExplorer; default "split-right"
    children: list of Widget
        List of widget to insert in the SysExplorer
    """

    _model_name = Unicode("SysExplorerModel").tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode("SysExplorerView").tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)
    title = Unicode("SysExplorer").tag(sync=True)
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
        default_value="tab-after",
        allow_none=False,
    ).tag(sync=True)
    system_data = tDict(default_value={"key": "None"}, allow_none=False).tag(sync=True)
    system_dict = tDict(default_value={"key": "None"}, allow_none=False).tag(sync=True)
    geo_data = tDict(default_value={"key": "None"}, allow_none=False).tag(sync=True)
    computed_data = tDict(default_value={"key": "None"}, allow_none=False).tag(
        sync=True
    )
    recorder_data = tDict(default_value={"key": "None"}, allow_none=False).tag(
        sync=True
    )
    driver_data = tDict(default_value={"key": "None"}, allow_none=False).tag(sync=True)
    progress_geo_update = tDict(default_value={"key": "None"}, allow_none=False).tag(
        sync=True
    )
    update_signal = Int(default_value=0, allow_none=False).tag(sync=True)
    notification_msg = tDict(
        default_value={"update": 0, "msg": "", "log": ""}, allow_none=False
    ).tag(sync=True)
    initial_store = tDict(default_value={}, allow_none=False).tag(sync=True)

    server_msg = tDict(
        default_value={"update": 0, "msg": "", "log": ""}, allow_none=False
    ).tag(sync=True)

    system_config = tDict(default_value={}, allow_none=False).tag(sync=True)

    def __init__(self, data: Union[System, Dict] = None, **kwargs):
        """Initialize class from input system

        Attributes
        ----------
        self._system : ReferenceType
            The weak reference of input system

        self.add_shape : Callable
            The helper function used to get geometry from system.
            If it is not provided, self.default_add_shape will
            be used.

        self.title : str
            The title of widget tab.

        self.update_signal : int
            The signal which is observed in frontend, it is incremented each time
            the main driver is computed

        self.time_step : int
            The counter for time step

        self.geo_data : Dict
            The dictionary which holds the parsed geometry data.

        self.notification_msg : Dict
            The message which is sent to frontend after each time step.

        """

        if isinstance(data, System):
            self._system: ReferenceType[System] = ref(data)
            data_name = data.name
            self.system_config = {"mode": "run"}
        elif isinstance(data, Dict):
            self._system: ReferenceType[System] = ref(System("temp"))
            data_name = list(data["Systems"].keys())[0]
            self.system_config = {"mode": "edit"}
        else:
            return
        self.geo_source = kwargs.get("source", None)
        self.add_shape = kwargs.get("add_shape", None)
        self.initial_store = kwargs.get("state", {"systemConfig": self.system_config})
        # self.title = f"{data_name} - SysExplorer {module_version}"
        self.update_signal = 0
        self.time_step = 0
        self.geo_data = OrderedDict()
        self.computed_data = {}
        self.recorder_data = {}
        self.driver_data = {}
        self.progress_geo_update = {}
        self.local_buffer = OrderedDict()
        self.server_process = None
        self.server_log = ""
        self.__init_data(data)
        self.__init_connection()

        self.notification_msg = {"update": 0, "msg": "", "log": ""}
        self.cosapp_thread = None
        super().__init__(**kwargs)

    @observe("system_data")
    def handle_data_change(self, change):
        """
        Not implemented yet
        """
        pass

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
        elif isinstance(data, Dict):
            self.sys_data = CosappJsonParser(data)

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

        if self.system_config["mode"] == "run":
            computedResult = self.sys_data.serialize_data_from_system(False)
            recorderData = self.sys_data.serialize_recorder()
            driverData = self.sys_data.serialize_driver_data()
        else:
            recorderData = {}
            computedResult = {}
            driverData = {}
        self.system_data = {
            "systemGraph": {
                "systemGraphData": self.systemGraphData,
                "systemList": self._system_list,
                "graphJsonData": {},
            },
            "systemPBS": {},
            "systemTree": self.sys_data.tree_dict,
            "variableData": self.system_variable,
            "computedResult": computedResult,
            "recorderData": recorderData,
            "driverData": driverData,
        }
        geo_data = self.get_geometry(self._system())
        threejs_data = geo_data.threejs_data
        if len(threejs_data) > 0:
            self.geo_data[0] = threejs_data

    def __init_connection(self) -> None:
        """Initialize the connection between fontend - backend and
        between input system with the callbacks.
        """
        self.sys_data.connect_main_driver(self.computed_notification)
        self.on_msg(self._handle_button_msg)
        self.old_log = ""
        self.log_stream = StringIO()
        logger = logging.getLogger()
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler(stream=self.log_stream)
        handler.setFormatter(logging.Formatter(fmt="%(levelname)s:%(message)s"))
        logger.addHandler(handler)

        if self.geo_source is not None and "recorder" in self.geo_source:
            self._static = False
            path_list = self.geo_source["recorder"].split(".")
            driver_name = path_list[-1]
            if len(path_list) == 1:
                recorder = self._system().drivers[driver_name].recorder
            else:
                recorder = (
                    self._system()[".".join(path_list[0:-1])]
                    .drivers[driver_name]
                    .recorder
                )
            recorder.state_recorded.connect(self.save_data)
        else:
            driver_list = self.sys_data.get_time_driver()
            if len(driver_list) > 0:
                self._static = False
                time_driver = driver_list[0]
                if time_driver.recorder is not None:
                    time_driver.recorder.state_recorded.connect(self.save_data)
                else:
                    notification_recorder = time_driver.add_recorder(
                        DataFrameRecorder(includes=["_"])
                    )
                    notification_recorder.state_recorded.connect(self.save_data)
            else:
                self._static = True

    def computed_notification(self) -> None:
        """Callback function used to update geometry data from buffer
        and to emit update signal to front end.

        This function is called after the main driver finished. The
        geometry data is transferred from local buffer into `self.geo_data`,
        this traitlet is synchronized with the frontend.
        The traitlet `self.update_signal` is incremented to notify the fontend
        about the termination signal.
        """

        if self._static:
            self.save_data(time_ref=0)
        self.geo_data = self.local_buffer
        self.computed_data = self.sys_data.serialize_data_from_system(False)
        self.recorder_data = self.sys_data.serialize_recorder()
        self.driver_data = self.sys_data.serialize_driver_data()
        self.update_signal = self.update_signal + 1
        self.server_log = self.log_stream.getvalue()
        self.log_stream.truncate(0)
        self.log_stream.seek(0)
        self.local_buffer = OrderedDict()
        self.time_step = 0

    def update_server_log(self, msg: str) -> NoReturn:
        """Update log message of server in frontend"""
        current_update = self.server_msg["update"]
        now = datetime.now().strftime("[%H:%M:%S]")
        self.server_msg = {
            "update": current_update + 1,
            "msg": "update",
            "log": f"{now} {msg} \n",
        }

    def start_server(self, token: str, base_url: str):
        """Create and then start a server process for `cosapp_server`.
        Current cosapp system is transferred to the server through
        `server_data.json` file.

        """
        if self.server_process is None and COSAPP_URL_START is not None:
            connection_file_path = kernel.get_connection_file()
            system_name = self._system().name
            data = {
                "token": token,
                "connection": connection_file_path,
                "system_name": system_name,
            }
            start_url = base_url + COSAPP_URL_START
            try:
                proxies = {"http": None, "https": None}

                r = requests.post(start_url, json=data, proxies=proxies)
                if r.text == "1":
                    self.server_process = {"token": token, "base_url": base_url}
                    server_update = self.server_msg["update"]
                    self.server_msg = {
                        "update": server_update + 1,
                        "msg": "ok",
                        "log": "",
                    }
            except Exception as e:
                server_update = self.server_msg["update"]
                self.server_msg = {
                    "update": server_update + 1,
                    "msg": "error",
                    "log": str(e),
                }

    def stop_server(self):
        """Stop running cosapp server and remove `server_data.json` file."""
        if self.server_process is not None:
            data = {"token": self.server_process["token"]}
            stop_url = self.server_process["base_url"] + COSAPP_URL_STOP
            try:
                proxies = {"http": None, "https": None}
                r = requests.post(stop_url, json=data, proxies=proxies)
                if r.text == "1":
                    self.server_process = None
            except Exception as e:
                print(e)

    def _handle_button_msg(self, model: Any, content: Dict, buffers: List) -> None:
        """Helper function to receive message from front end.

        Parameters
        ----------
        model : SysExplorerModel
            Current model value.

        content : {"action" : "runSignal" | "requestUpdate", "payload" : Dict}
            If action == "runSignal" => run the main
            driver of system, payload contains a dict of system parameters
            and its value.
            If action == "requestUpdate" => Send the geometry of
            the last computed step to front-end to update the computing
            progress.

        buffers : List

        """
        if content["action"] == "runSignal":
            self.sys_data.reset_variable_value()
            for key, variable_value in content["payload"].items():
                idx_group = re.search(r"\[(.*?)\]", key)
                if idx_group is not None:
                    var_idx = int(idx_group.group(1))
                    var_key = key.replace(idx_group.group(0), "")
                    sys_path = ".".join(var_key.split(".")[:-2])
                    port = var_key.split(".")[-2]
                    variable_name = var_key.split(".")[-1]

                    selected_system = self.sys_data.get_system_from_name(sys_path)
                    var_value = copy.deepcopy(selected_system[port][variable_name])
                    var_value[var_idx] = variable_value
                    self.sys_data.set_variable_value(
                        sys_path, port, variable_name, var_value
                    )
                else:
                    sys_path = ".".join(key.split(".")[:-2])
                    port = key.split(".")[-2]
                    variable_name = key.split(".")[-1]

                    self.sys_data.set_variable_value(
                        sys_path, port, variable_name, variable_value
                    )

            self.time_step = 0
            # clear() won't work here because we need a new reference for  self.geo_data
            # in order to notify the font end about the change of data.
            self.geo_data = OrderedDict()
            self.local_buffer = OrderedDict()
            self.server_log = ""

            if "currentThread" in content:
                self.sys_data.run_system()
            else:
                # if self.cosapp_thread is not None and self.cosapp_thread.is_alive():
                #     self.cosapp_thread.join()
                # self.cosapp_thread = threading.Thread(target=self.sys_data.run_system)
                # self.cosapp_thread.start()
                self.sys_data.run_system()

        elif content["action"] == "requestUpdate":
            key_list = list(self.local_buffer)
            if len(key_list) > 0:
                self.progress_geo_update = {
                    "data": self.local_buffer[key_list[-1]],
                    "time_step": key_list[-1],
                }

        elif content["action"] == "switchServer":
            request_token = content["payload"]["token"]
            request_url = content["payload"]["url"]
            if content["payload"]["signal"]:
                self.start_server(request_token, request_url)
            else:
                self.stop_server()
        elif content["action"] == "requestComputedNotification":
            self.computed_notification()
        elif content["action"] == "chartViewerSaveJson":
            json_name = content["payload"]["jsonName"].replace(".json", "")
            file_path = get_nonexistant_path(
                os.path.join(os.getcwd(), f"{json_name}.json")
            )
            json_data = content["payload"]["jsonData"]
            with open(file_path, "w") as f:
                json.dump(json_data, f)

        elif content["action"] == "requestInitialGeometry":
            self.send_initial_geometry()

    def send_initial_geometry(self) -> None:
        pass

    @staticmethod
    def default_add_shape(r: List, system: System) -> None:
        """Helper function used to extract all geometry inside
        system, it will be used if user defined function is not provided.

        Parameters
        ----------
        r : List
            The list contains all geometry variable of system.

        system : System
            The input system.

        """
        # TODO The method used to get shape from system should be generalized
        # in CosApp level instead of interface level.

        for child in system.children.values():
            SysExplorer.default_add_shape(r, child)

        def filter_shapes(p: "Port") -> bool:
            try:
                shape = p.shape
                visible = p.visible
            except AttributeError:
                return False
            else:
                return visible and shape is not None

        for port in filter(filter_shapes, system.outputs.values()):
            # print(f"{port.owner.full_name()}.{port.name}")
            if isinstance(port.shape, List):
                r.extend(port.shape)
            else:
                r.append(port.shape)

    def get_geometry(
        self, sys: System, get_all=False
    ) -> Union[
        OccParser, Dict[int, OccParser]
    ]:  # Dict[int, List[Dict[str, List[Union[int, float]]]]]:
        """Convert the open cascade object inside system into
        serializable data in order to send to front end.

        Parameters
        ----------
        sys : System
            The input system.

        Returns
        -------
        Dict[int, List[Dict[str, List[Union[int, float]]]]]
            A dictionary contains geometry data.
        """

        if self.geo_source is not None and "recorder" in self.geo_source:

            path_list = self.geo_source["recorder"].split(".")
            driver_name = path_list[-1]
            if len(path_list) == 1:
                recorder = self._system().drivers[driver_name].recorder
            else:
                recorder = (
                    self._system()[".".join(path_list[0:-1])]
                    .drivers[driver_name]
                    .recorder
                )
            try:
                recorder_data = recorder.export_data()
            except:
                recorder_data = recorder.data
            n_index = len(recorder_data.index)
            if get_all:
                ret = OrderedDict()
                for idx in range(n_index):
                    r = []
                    for var_name in self.geo_source.get("variables", []):
                        column = recorder_data.get(var_name)
                        r.append(column[idx])
                    shape_data = OccParser(r)
                    ret[idx] = shape_data
                return ret
            else:
                r = []
                for var_name in self.geo_source.get("variables", []):
                    column = recorder_data.get(var_name)
                    r.append(column[n_index - 1])
                shape_data = OccParser(r)
                return shape_data

        else:

            add_shape = self.add_shape or SysExplorer.default_add_shape
            r = []

            try:
                add_shape(r, sys)
            except:
                pass

            return OccParser(r)

    def save_data(self, **kwarg) -> None:
        """Callback function used to get geometry data and log value
        after each time step.

        If a time driver exists in system, this function will be connected
        to the signal of corresponding recorder. Otherwise, il will be
        called after the main driver finished.

        Each time called, this function will read the geometry in system
        at current time step and store in `self.local_buffer`. The computation
        log of CosApp is used to update the `self.notification_msg`, which is
        observed in front-end.

        """
        time_ref = kwarg.get("time_ref")

        data = self.get_geometry(self._system())

        self.local_buffer[self.time_step] = data.threejs_data
        if self.old_log == "":
            log_value = self.log_stream.getvalue()
        else:
            log_value = "".join(self.log_stream.getvalue().rsplit(self.old_log))
        self.old_log = self.log_stream.getvalue()

        self.notification_msg = {
            "update": self.notification_msg["update"] + 1,
            "msg": f"Computed step {time_ref}",
            "log": log_value,
        }

        self.time_step += 1

    def __del__(self):
        if self.cosapp_thread is not None and self.cosapp_thread.is_alive():
            self.cosapp_thread.join()

        if self.cosapp_thread is not None:
            self.cosapp_thread.kill()

        if self.server_process is not None:
            self.stop_server()
