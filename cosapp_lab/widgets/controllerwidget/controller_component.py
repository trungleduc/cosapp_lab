#!/usr/bin/env python
# coding: utf-8

# Copyright (c) CoSApp Team.


import copy
import logging
import re
from io import StringIO
from typing import Any, Callable, Dict, List
from weakref import ReferenceType

from cosapp.recorders import DataFrameRecorder
from cosapp.systems import System
from cosapp_lab.widgets.utils import CosappObjectParser
from cosapp_lab.widgets.base.base_component import BaseComponent


class ControllerComponent(BaseComponent):
    name = "Controller"

    def __init__(
        self,
        data: "ReferenceType[System]",
        sys_data: CosappObjectParser,
        send_func: Callable,
        **kwargs,
    ):
        super().__init__(data=data, sys_data=sys_data, send_func=send_func, **kwargs)
        self.__init_connection()

    def __init_connection(self) -> None:
        """Initialize the connection between fontend - backend and
        between input system with the callbacks.
        """
        self.old_log = ""
        self.log_stream = StringIO()
        logger = logging.getLogger()
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler(stream=self.log_stream)
        handler.setFormatter(logging.Formatter(fmt="%(levelname)s:%(message)s"))
        logger.addHandler(handler)
        driver_list = self.sys_data.get_time_driver()
        if len(driver_list) > 0:
            self._static = False
            time_driver = driver_list[0]
            if time_driver.recorder is not None:
                time_driver.recorder.state_recorded.connect(self.update_log)
            else:
                notification_recorder = time_driver.add_recorder(
                    DataFrameRecorder(includes=["_"])
                )
                notification_recorder.state_recorded.connect(self.update_log)

    def update_log(self, **kwarg) -> None:
        """Callback function used to send log value to front end
        after each time step.

        If a time driver exists in system, this function will be connected
        to the signal of corresponding recorder. Otherwise, il will be
        called after the main driver finished.

        Each time called, this function will read the log of system
        at current time step and send a message with type
        `Controller::notification_msg` to front-end

        """
        time_ref = kwarg.get("time_ref")

        if self.old_log == "":
            log_value = self.log_stream.getvalue()
        else:
            log_value = "".join(self.log_stream.getvalue().rsplit(self.old_log))
        self.old_log = self.log_stream.getvalue()

        notification_msg = {
            "update": 1,
            "msg": f"Computed step {time_ref}",
            "log": log_value,
        }
        self.send({"type": "Controller::notification_msg", "payload": notification_msg})

    def computed_notification(self):

        server_log = self.log_stream.getvalue()
        self.log_stream.truncate(0)
        self.log_stream.seek(0)
        self.send(
            {
                "type": "Controller::update_signal",
                "payload": {"server_log": server_log},
            }
        )

    def _handle_button_msg(self, model: Any, content: Dict, buffers: List):
        if content["action"] == "Controller::runSignal":
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

            self.sys_data.run_system()
