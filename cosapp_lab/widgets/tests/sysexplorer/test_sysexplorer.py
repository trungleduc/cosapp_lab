import pytest
from cosapp_lab.widgets import SysExplorer
from pathlib import Path
from unittest.mock import MagicMock
from cosapp_lab.widgets.chartwidget.chart_component import ChartElement


@pytest.fixture
def template_root():
    return Path(__file__).parent


def test_SysExplorer_init_single_system(SystemFactory):
    a = SystemFactory("simple")
    c = SysExplorer(a)
    assert "SysExplorer" in c.title
    assert c.chart_template == {}


def test_SysExplorer_init_multiple_systems(SystemFactory):
    a = SystemFactory("simple")
    b = SystemFactory("simple")
    c = SysExplorer([a, b])
    assert "SysExplorer" in c.title
    assert a.name not in c.title
    assert b.name not in c.title
    assert c.chart_template == {}
    assert c.sys_data.system_name == "chart_viewer"


def test_SysExplorer_init_load_template(SystemFactory, template_root):
    a = SystemFactory("simple")
    template_path = template_root / "template.json"
    c = SysExplorer(a, template=str(template_path))
    assert c.chart_template["chart_template"]["modelJson"] == {}
    assert "template.json" in c.chart_template["template_path"]


def test_SysExplorer_init_load_empty_template(SystemFactory, template_root):
    a = SystemFactory("simple")
    template_path = template_root / "empty_template.json"
    with pytest.raises(KeyError, match="Required keys \['modelJson'\] not found"):
        SysExplorer(a, template=str(template_path))


def test_SysExplorer_init_load_wrong_template(SystemFactory, template_root):
    a = SystemFactory("simple")
    template_path = template_root / "empty_template1.json"
    with pytest.raises(FileNotFoundError, match="No such template file"):
        SysExplorer(a, template=str(template_path))


def test_SysExplorer_init_component(SystemFactory):
    a = SystemFactory("simple")
    c = SysExplorer(a)
    assert "ChartElement" in c._BaseWidget__component
    assert "Controller" in c._BaseWidget__component
    assert "GeometryView" in c._BaseWidget__component
    assert len(c._BaseWidget__component) == len(c.computed_callbacks)
    assert len(c._BaseWidget__component) == len(c.msg_handlers)


def test_SysExplorer_init_value(SystemFactory):
    a = SystemFactory("simple")
    c = SysExplorer(a)
    assert c.system_config["mode"] == "run"
    assert c.system_config["enableEdit"]
    assert "simple" in c.system_config["root_name"]
    assert c._system() is a


def test_SysExplorer__init_data(SystemFactory):
    a = SystemFactory("simple")
    c = SysExplorer(a)

    assert c.system_dict[a.name] == {
        "class": "conftest.Simple",
        "inputs": {
            "inwards.inw": -1,
            "simple_in.number": 1,
            "simple_in.vector": None,
            "simple_in.matrix": None,
        },
        "subsystems": [],
    }
    assert c._system_list == [a.name]
    assert c._driver_list[a.name] == ["None"]
    assert c.systemGraphData[a.name] == {
        "inPort": ["inwards", "modevars_in", "simple_in"],
        "outPort": ["outwards", "modevars_out", "simple_out"],
        "connections": [],
    }


def test_computed_notification(SystemFactory):
    a = SystemFactory("simple")
    c = SysExplorer(a)
    c.computed_callbacks[0] = MagicMock()
    a.run_drivers()
    c.computed_callbacks[0].assert_called()


def test_register(SystemFactory):
    a = SystemFactory("simple")
    c = SysExplorer(a)
    with pytest.raises(KeyError, match="Component 'ChartElement' already registered"):
        c.register(ChartElement)
