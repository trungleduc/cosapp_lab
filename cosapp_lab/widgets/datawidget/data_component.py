#!/usr/bin/env python
# coding: utf-8

# Copyright (c) CoSApp Team.


from cosapp_lab.widgets.base.base_component import BaseComponent


class DataComponent(BaseComponent):
    name = "DataComponent"

    def computed_notification(self):
        computed_data = self.sys_data.serialize_data_from_system(False)
        recorder_data = self.sys_data.serialize_recorder()
        driver_data = self.sys_data.serialize_driver_data()
        self.time_step = 0
        self.send(
            {
                "type": "DataComponent::update_signal",
                "payload": {
                    "computed_data": computed_data,
                    "recorder_data": recorder_data,
                    "driver_data": driver_data,
                },
            }
        )
