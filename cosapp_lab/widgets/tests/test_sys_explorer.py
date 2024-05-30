import pytest
from cosapp_lab.widgets.sysexplorer import SysExplorer
from unittest.mock import MagicMock
from conftest import require_pyoccad


@require_pyoccad
@pytest.mark.parametrize(
    "sys_name, variable, result",
    [
        ("tube", "tube.splitter.fl_in.W", 10.0),
        ("pendulum", "p.inwards.g_0", [0.0, -9.81, 0.0]),
        ("circuit", "circuit.source.inwards.I", 0.1),
        ("dynamics", "dynamics.tank1.inwards.area", 1.0),
    ],
)
def test____init(SystemFactory, sys_name, variable, result):
    a = SystemFactory(sys_name)
    widget = SysExplorer(a)

    assert widget._system() is a
    assert widget.add_shape is None
    assert widget.initial_store == {"systemConfig": {"mode": "run"}}
    assert widget.title == "SysExplorer"
    assert widget.update_signal == 0
    assert widget.time_step == 0
    assert widget.progress_geo_update == {}
    assert widget.server_process is None
    assert widget.server_log == ""


@require_pyoccad
@pytest.mark.parametrize(
    "sys_name, variable, result",
    [
        ("tube", "tube.splitter.fl_in.W", 10.0),
        ("pendulum", "p.inwards.g_0", [0.0, -9.81, 0.0]),
        ("circuit", "circuit.source.inwards.I", 0.1),
        ("dynamics", "dynamics.tank1.inwards.area", 1.0),
    ],
)
def test____init_data(SystemFactory, sys_name, variable, result):
    a = SystemFactory(sys_name)
    widget = SysExplorer(a)
    assert pytest.approx(widget.system_variable[variable]["value"]) == result


@require_pyoccad
@pytest.mark.parametrize(
    "sys_name,  result",
    [("tube", True), ("pendulum", False), ("circuit", True), ("dynamics", False)],
)
def test___init_connection(SystemFactory, sys_name, result):
    a = SystemFactory(sys_name)
    widget = SysExplorer(a)
    time_driver_list = widget.sys_data.get_time_driver()
    assert widget._static == result
    if len(time_driver_list) > 0:
        assert time_driver_list[0].recorder is not None


@require_pyoccad
@pytest.mark.parametrize("sys_name, result", [
    ("tube", 8), ("pendulum", 2), ("circuit", 0),
])
def test_default_add_shape(SystemFactory, sys_name, result):
    a = SystemFactory(sys_name)
    widget = SysExplorer(a)
    data = []
    widget.default_add_shape(data, a)
    assert len(data) == result


@require_pyoccad
@pytest.mark.parametrize("sys_name", ["tube", "circuit", "dynamics"])
def test_computed_notification(SystemFactory, sys_name):
    a = SystemFactory(sys_name)
    widget = SysExplorer(a)
    assert widget.update_signal == 0
    a.run_drivers()
    assert widget.update_signal == 1


@require_pyoccad
@pytest.mark.parametrize(
    "sys_name", ["tube", "pendulum", "circuit", "dynamics"]
)
def test_update_server_log(SystemFactory, sys_name):
    a = SystemFactory(sys_name)
    widget = SysExplorer(a)
    widget.update_server_log("foo")
    assert widget.server_msg["update"] == 1
    assert "foo" in widget.server_msg["log"]


@require_pyoccad
@pytest.mark.parametrize("sys_name", ["tube", "circuit", "dynamics"])
def test__handle_button_msg(SystemFactory, sys_name):
    a = SystemFactory(sys_name)
    widget = SysExplorer(a)
    assert widget.update_signal == 0
    assert len(widget.server_log) == 0
    content = {"action": "runSignal", "payload": {}, "currentThread": True}
    widget._handle_button_msg(None, content, [])
    assert widget.update_signal == 1


@require_pyoccad
@pytest.mark.parametrize("sys_name", ["tube", "circuit", "dynamics"])
def test__handle_button_msg_2(SystemFactory, sys_name):
    a = SystemFactory(sys_name)
    widget = SysExplorer(a)

    content = {
        "action": "switchServer",
        "payload": {"token": "foo", "url": "bar", "signal": True},
    }
    widget.start_server = MagicMock()
    widget._handle_button_msg(None, content, [])
    widget.start_server.assert_called_with("foo", "bar")


@require_pyoccad
@pytest.mark.parametrize("sys_name", ["tube", "pendulum", "dynamics"])
def test_get_geometry(SystemFactory, sys_name):
    pass
