#!/usr/bin/env python
# coding: utf-8

# Copyright (c) CoSApp Team.


"""
Widget container as geometry viewer panel
"""
from collections import OrderedDict
from typing import Any, Callable, Dict, List, Union
from weakref import ReferenceType

from cosapp.recorders import DataFrameRecorder
from cosapp.systems import System
from cosapp_lab.widgets.utils import CosappObjectParser, OccParser
from cosapp_lab.widgets.base.base_component import BaseComponent

import warnings


class GeometryComponent(BaseComponent):
    name = "GeometryView"

    def __init__(
        self,
        data: "ReferenceType[System]",
        sys_data: CosappObjectParser,
        send_func: Callable,
        get_shapes = None,
        add_shape = None,  # to be deprecated
        source = None,
        **kwargs
    ):
        super().__init__(data=data, sys_data=sys_data, send_func=send_func, **kwargs)

        # TODO: remove block when `add_shape` is obsoleted
        if add_shape is not None:
            if get_shapes is None:
                def get_shapes(system: System) -> List[Any]:
                    """Encapsulation of legacy function `add_shape`"""
                    shapes = []
                    add_shape(shapes, system)
                    return shapes
                warnings.warn(
                    "`add_shape` has been replaced by `get_shapes`, and will be suppressed in future versions",
                    FutureWarning,
                )
            else:
                warnings.warn(
                    "Deprecated argument `add_shape` superseded by `get_shapes`",
                    RuntimeWarning,
                )
        self.get_shapes = get_shapes
        self.geo_source = source
        self.time_step = 0
        self.__init_connection()

    def __init_connection(self):
        """Initialize the connection between fontend - backend and
        between input system with the callbacks.
        """
        if self.geo_source is not None and "recorder" in self.geo_source:
            self._static = False
            path_list = self.geo_source["recorder"].split(".")
            driver_name = path_list[-1]
            if len(path_list) == 1:
                recorder = self.system.drivers[driver_name].recorder
            else:
                recorder = (
                    self.system[".".join(path_list[0:-1])]
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

    def save_data(self, **kwarg) -> None:
        """Callback function used to get geometry data
        after each time step.
        """
        data: OccParser = self.get_geometry()
        payload = {
            "threejs_data": data.threejs_data,
            "binary_position": data.binary_position,
            "time_step": self.time_step,
        }
        self.send(
            {"type": "GeometryView::geo_data", "payload": payload},
            [b.tobytes() for b in data.binary_data],
        )
        self.time_step += 1

    def send_initial_geometry(self) -> None:

        def pack_and_send(data, step=0, remaining=0) -> None:
            payload = {
                "threejs_data": data.threejs_data,
                "binary_position": data.binary_position,
                "time_step": step,
                "remaining": remaining,
            }
            self.send(
                {"type": "GeometryView::geo_data", "payload": payload},
                [b.tobytes() for b in data.binary_data],
            )

        if self.geo_source is not None and "recorder" in self.geo_source:
            all_data = self.get_geometry(get_all=True)
            remaining = len(all_data)
            for idx in all_data:
                remaining -= 1
                pack_and_send(all_data[idx], idx, remaining)
        else:
            data = self.get_geometry()
            if len(data.threejs_data) > 0:
                pack_and_send(data)

    def get_geometry(self, get_all=False) -> Union[OccParser, Dict[int, OccParser]]: 
        """Convert the open cascade objects inside `system` into
        serializable data in order to send to front end.

        Parameters
        ----------
        get_all : bool
            If `True`, returns all geometric data from recorder (if any)
            into a dictionary of `OccParser` objects.
            If `False` (default), returns geometric data collected in system.

        Returns
        -------
        Union[OccParser, Dict[int, OccParser]]
            `OccParser` object or dictionary thereof, depending on `get_all`.
        """
        if self.geo_source is not None and "recorder" in self.geo_source:
            # Argument `system` disregarded, here
            path_list = self.geo_source["recorder"].split(".")
            driver_name = path_list[-1]
            if len(path_list) == 1:
                system = self.system
            else:
                system = self.system[".".join(path_list[:-1])]
            recorder = system.drivers[driver_name].recorder
            columns = self.geo_source.get("variables", [])
            data = recorder.export_data().loc[:, columns]
            n_rows = len(data)

            get_occ_data = lambda i: OccParser(data.iloc[i].tolist())

            if get_all:
                return OrderedDict(
                    (i, get_occ_data(i))
                    for i in range(n_rows)
                )
            else:
                return get_occ_data(n_rows - 1)

        else:
            get_shapes = self.get_shapes or GeometryComponent.default_get_shapes
            try:
                shapes = get_shapes(self.system)
            except:
                shapes = []
            return OccParser(shapes)

    @staticmethod
    def default_get_shapes(system: System) -> List:
        """Default function used to extract geometry data from `system`,
        if no user-defined function is provided.

        Parameters
        ----------
        - system [System]:
            The system of interest.

        Returns
        -------
        - List:
            List containing all geometry variables of system.
        """
        # TODO The method used to get shapes from system should be generalized
        # in CosApp level instead of interface level.

        def is_geom_port(port: "Port") -> bool:
            try:
                shape = port.shape
                visible = port.visible
            except AttributeError:
                return False
            else:
                return visible and shape is not None

        def recursive_search(s: System, shapes: List):
            for child in s.children.values():
                recursive_search(child, shapes)
            
            for port in filter(is_geom_port, s.outputs.values()):
                if isinstance(port.shape, (list, tuple)):
                    shapes.extend(port.shape)
                else:
                    shapes.append(port.shape)

        shapes = []
        recursive_search(system, shapes)
        return shapes

    def computed_notification(self) -> None:
        """Callback function used to update geometry data from buffer
        and to emit update signal to front end.
        """
        if self._static:
            data = self.get_geometry()
            if len(data.threejs_data) > 0:
                payload = {
                    "threejs_data": data.threejs_data,
                    "binary_position": data.binary_position,
                    "time_step": 0,
                    "remaining": 0,
                }
                self.send(
                    {"type": "GeometryView::geo_data", "payload": payload},
                    [b.tobytes() for b in data.binary_data],
                )
        else:
            self.send(
                {
                    "type": "GeometryView::update_signal",
                    "payload": {},
                }
            )
            self.time_step = 0

    def _handle_button_msg(self, model: Any, content: Dict, buffers: List):
        if content["action"] == "GeometryView::requestInitialGeometry":
            self.send_initial_geometry()
