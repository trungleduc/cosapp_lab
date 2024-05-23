import pytest
import numpy as np
import pprint
import json
from conftest import require_pyoccad

from cosapp_lab.widgets.utils import CosappObjectParser
from cosapp.utils.naming import CommonPorts
from cosapp.base import System

pp = pprint.PrettyPrinter(indent=4)


@pytest.fixture
def CosappObjectParserFactory(SystemFactory):
    def factory(sys_name: str) -> CosappObjectParser:
        system: System = SystemFactory(sys_name)
        return CosappObjectParser(system)
    return factory


@require_pyoccad
@pytest.mark.parametrize(
    "sys_name, expected",
    [
        (
            "pendulum",
            [
                {
                    "title": "p",
                    "id": "p",
                    "expanded": True,
                    "children": [
                        {"title": "ref0", "id": "p.ref0", "expanded": True},
                        {"title": "rev1", "id": "p.rev1", "expanded": True},
                        {
                            "title": "arm",
                            "id": "p.arm",
                            "expanded": True,
                            "children": [
                                {"title": "geom", "id": "p.arm.geom", "expanded": True},
                                {"title": "dyn", "id": "p.arm.dyn", "expanded": True},
                                {"title": "arm", "id": "p.arm.arm", "expanded": True},
                            ],
                        },
                        {"title": "rev2", "id": "p.rev2", "expanded": True},
                        {
                            "title": "mass",
                            "id": "p.mass",
                            "expanded": True,
                            "children": [
                                {
                                    "title": "geom",
                                    "id": "p.mass.geom",
                                    "expanded": True,
                                },
                                {"title": "dyn", "id": "p.mass.dyn", "expanded": True},
                            ],
                        },
                    ],
                }
            ],
        ),
        (
            "circuit",
            [
                {
                    "title": "circuit",
                    "id": "circuit",
                    "expanded": True,
                    "children": [
                        {"title": "source", "id": "circuit.source", "expanded": True},
                        {"title": "ground", "id": "circuit.ground", "expanded": True},
                        {
                            "title": "circuit",
                            "id": "circuit.circuit",
                            "expanded": True,
                            "children": [
                                {
                                    "title": "n1",
                                    "id": "circuit.circuit.n1",
                                    "expanded": True,
                                },
                                {
                                    "title": "n2",
                                    "id": "circuit.circuit.n2",
                                    "expanded": True,
                                },
                                {
                                    "title": "R1",
                                    "id": "circuit.circuit.R1",
                                    "expanded": True,
                                },
                                {
                                    "title": "R2",
                                    "id": "circuit.circuit.R2",
                                    "expanded": True,
                                },
                                {
                                    "title": "R3",
                                    "id": "circuit.circuit.R3",
                                    "expanded": True,
                                },
                            ],
                        },
                    ],
                }
            ],
        ),
        (
            "dynamics",
            [
                {
                    "title": "dynamics",
                    "id": "dynamics",
                    "expanded": True,
                    "children": [
                        {"title": "tank1", "id": "dynamics.tank1", "expanded": True},
                        {"title": "tank2", "id": "dynamics.tank2", "expanded": True},
                        {"title": "pipe", "id": "dynamics.pipe", "expanded": True},
                    ],
                }
            ],
        ),
    ],
)
def test_CosappObjectParser_system_to_tree_dict(CosappObjectParserFactory, sys_name, expected):
    sys_data: CosappObjectParser = CosappObjectParserFactory(sys_name)
    assert sys_data.tree_dict == expected


@require_pyoccad
@pytest.mark.parametrize(
    "sys_name, expected",
    [
        (
            "pendulum",
            [
                "p",
                "p.ref0",
                "p.rev1",
                "p.arm",
                "p.arm.geom",
                "p.arm.dyn",
                "p.arm.arm",
                "p.rev2",
                "p.mass",
                "p.mass.geom",
                "p.mass.dyn",
            ],
        ),
        (
            "circuit",
            [
                "circuit",
                "circuit.source",
                "circuit.ground",
                "circuit.circuit",
                "circuit.circuit.n1",
                "circuit.circuit.n2",
                "circuit.circuit.R1",
                "circuit.circuit.R2",
                "circuit.circuit.R3",
            ],
        ),
        ("dynamics", ["dynamics", "dynamics.tank1", "dynamics.tank2", "dynamics.pipe"]),
    ],
)
def test_CosappObjectParser_flatten_system_dict(CosappObjectParserFactory, sys_name, expected):
    sys_data: CosappObjectParser = CosappObjectParserFactory(sys_name)
    sub_dict = sys_data.flattened_system
    assert list(sub_dict) == expected


@require_pyoccad
@pytest.mark.parametrize(
    "sys_name, expected",
    [
        ("tube", [21, "tube", "tube.merger.geom.arc"]),
        ("pendulum", [11, "p", "p.mass.dyn"]),
        ("circuit", [9, "circuit", "circuit.circuit.R3"]),
        ("dynamics", [4, "dynamics", "dynamics.pipe"]),
    ],
)
def test_CosappObjectParser_children_list(CosappObjectParserFactory, sys_name, expected):
    sys_data: CosappObjectParser = CosappObjectParserFactory(sys_name)
    child_list = sys_data.children_list
    assert len(child_list) == expected[0]
    assert child_list[0] == expected[1]
    assert child_list[-1] == expected[2]


@require_pyoccad
@pytest.mark.parametrize(
    "sys_name, sub_system, port_names",
    [
        (
            "tube",
            "tube.merger.geom",
            ["frame_a", "frame_b_secondary", "frame_b"],
        ),
        (
            "pendulum",
            "p.mass.dyn",
            ["frame_a", "geom_ref", "force_a", "geom"],
        ),
        (
            "circuit",
            "circuit.circuit.R3",
            ["V_in", "V_out", "I"],
        ),
        ("dynamics", "dynamics.pipe", ["p1", "p2", "Q1", "Q2"]),
    ],
)
def test_CosappObjectParser_children_port(CosappObjectParserFactory, sys_name, sub_system, port_names):
    """Test sub-system port list.
    Note: Common port names, like 'inwards' or 'outwards', are automatically added to
    the expected list; thus, argument `port_names` do not need to include them.
    """
    sys_data: CosappObjectParser = CosappObjectParserFactory(sys_name)

    expected = set(port_names).union(CommonPorts.names())
    assert set(sys_data.children_port[sub_system]) == expected


@pytest.mark.parametrize(
    "sys_name, expected",
    [
        (
            "simple",
            {
                "inw": {
                    "unit": None,
                    "invalid_comment": None,
                    "out_of_limits_comment": None,
                    "desc": None,
                    "distribution": None,
                    "valid_range": None,
                    "limits": None,
                }
            },
        ),
    ],
)
def test_CosappObjectParser_children_port_meta(CosappObjectParserFactory, sys_name, expected):
    sys_data: CosappObjectParser = CosappObjectParserFactory(sys_name)
    key = list(sys_data.children_port_meta.keys())[0]
    data = sys_data.children_port_meta[key]

    assert data["inwards"] == expected


@require_pyoccad
@pytest.mark.parametrize(
    "sys_name,sub_system, expected",
    [
        ("tube", "tube.merger.geom", ["inwards", "modevars_in", "frame_a"]),
        ("pendulum", "p.mass.dyn", ["inwards", "modevars_in", "frame_a", "geom_ref"]),
        ("circuit", "circuit.circuit.R3", ["inwards", "modevars_in", "V_in", "V_out"]),
        ("dynamics", "dynamics.pipe", ["inwards", "modevars_in", "p1", "p2"]),
    ],
)
def test_CosappObjectParser_children_in_port(CosappObjectParserFactory, sys_name, sub_system, expected):
    sys_data: CosappObjectParser = CosappObjectParserFactory(sys_name)
    assert sys_data.children_in_port[sub_system] == expected


@require_pyoccad
@pytest.mark.parametrize(
    "sys_name,sub_system, expected",
    [
        ("tube", "tube.merger.geom", ["outwards", "modevars_out", "frame_b_secondary", "frame_b"]),
        ("pendulum", "p.mass.dyn", ["outwards", "modevars_out", "force_a", "geom"]),
        ("circuit", "circuit.circuit.R3", ["outwards", "modevars_out", "I"]),
        ("dynamics", "dynamics.pipe", ["outwards", "modevars_out", "Q1", "Q2"]),
    ],
)
def test_CosappObjectParser_children_out_port(CosappObjectParserFactory, sys_name, sub_system, expected):
    sys_data: CosappObjectParser = CosappObjectParserFactory(sys_name)
    assert sys_data.children_out_port[sub_system] == expected


@require_pyoccad
@pytest.mark.parametrize(
    "sys_name,sub_system, expected",
    [
        ("tube", "tube.merger.geom", dict(name="geom", classname="TPipe")),
        ("pendulum", "p.mass.dyn", dict(name="dyn", classname="Dynamics")),
        ("circuit", "circuit.circuit.R3", dict(name="R3", classname="Resistor")),
        ("dynamics", "dynamics.pipe", dict(name="pipe", classname="Pipe")),
],
)
def test_CosappObjectParser_get_system_from_name(CosappObjectParserFactory, sys_name, sub_system, expected):
    sys_data: CosappObjectParser = CosappObjectParserFactory(sys_name)
    assert sys_data.get_system_from_name(sub_system).name == expected['name']
    assert sys_data.get_system_from_name(sub_system).__class__.__name__ == expected['classname']


@require_pyoccad
@pytest.mark.parametrize(
    "sys_name, varname, expected",
    [
        ("tube", "tube1.aero.fl_out.P", 101100.909),
        ("pendulum", "mass.dyn.frame_a.r_0", [0.21213203, -0.21213203, 0.0]),
        ("circuit", "circuit.R3.V_in.V", 14.28571405834926),
        ("dynamics", "tank2.rho", 1000),
    ],
)
def test_CosappObjectParser_system_variable_data(CosappObjectParserFactory, sys_name, varname, expected):
    sys_data: CosappObjectParser = CosappObjectParserFactory(sys_name)
    var = sys_data.system_variable_data[varname]
    assert var["value"] == pytest.approx(expected)
    assert var["size"] == np.size(expected)


@require_pyoccad
@pytest.mark.parametrize(
    "sys_name, sys_path, port, variable, expected",
    [
        ("tube", "tube.tube1.aero", "fl_out", "P", 1),
        ("pendulum", "p.mass.dyn", "frame_a", "r_0", np.r_[1.0, 1.0, 1.0]),
        ("circuit", "circuit.circuit.R3", "V_in", "V", 1),
        ("dynamics", "dynamics.tank2", "inwards", "rho", 10000),
    ],
)
def test_CosappObjectParser_set_variable_value(
    SystemFactory, sys_name, sys_path, port, variable, expected,
):
    a: System = SystemFactory(sys_name)
    sys_data = CosappObjectParser(a)
    sys_data.set_variable_value(sys_path, port, variable, expected)
    varname = ".".join(sys_path.split(".")[1:] + [port, variable])
    assert a[varname] == pytest.approx(expected), varname


@require_pyoccad
@pytest.mark.parametrize(
    "sys_name, sys_path, port, variable, expected",
    [
        ("tube", "tube.tube1.aero", "fl_out", "P", 101100.909),
        ("pendulum", "p.arm", "geom", "density", 7750),
        ("circuit", "circuit.circuit.R3", "V_in", "V", 14.28571405834926),
        ("dynamics", "dynamics.tank2", "inwards", "rho", 1000),
    ],
)
def test_CosappObjectParser_reset_variable_value(
    SystemFactory, sys_name, sys_path, port, variable, expected,
):
    a: System = SystemFactory(sys_name)
    sys_data = CosappObjectParser(a)
    sys_data.set_variable_value(sys_path, port, variable, 1)
    sys_data.reset_variable_value()
    varname = ".".join(sys_path.split(".")[1:] + [port, variable])
    assert a[varname] == pytest.approx(expected), varname


@pytest.mark.skip("Waiting for new cosapp version")
@require_pyoccad
@pytest.mark.parametrize(
    "sys_name, sub_system, expected",
    [
        ("tube", "tube", ["solve", "run1", "run2"]),
        (
            "pendulum", "p",
            ["RK", "solve", "runner"],
        ),
        ("circuit", "circuit", ["design", "pt1", "pt2"]),
        (
            "dynamics", "dynamics",
            ["RK", "solver", "run"],
        ),
    ],
)
def test_CosappObjectParser__discover_driver(CosappObjectParserFactory, sys_name, sub_system, expected):
    sys_data: CosappObjectParser = CosappObjectParserFactory(sys_name)
    driver_list = list(sys_data._driver[sub_system])
    assert driver_list == expected


@require_pyoccad
@pytest.mark.parametrize(
    "sys_name,  expected",
    [("tube", 0), ("pendulum", 1), ("circuit", 0), ("dynamics", 1),]
)
def test_CosappObjectParser_get_time_driver(CosappObjectParserFactory, sys_name, expected):
    sys_data: CosappObjectParser = CosappObjectParserFactory(sys_name)
    assert len(sys_data.get_time_driver()) == expected


@require_pyoccad
@pytest.mark.parametrize(
    "sys_name, key, expected",
    [
        ("tube", "tube.splitter.fl_in.P", ["float", 101325.0]),
        ("pendulum", "p.inwards.g_0", ["ndarray", [0.0, -9.81, 0.0]]),
        ("circuit", "circuit.source.inwards.I", ["float", 0.1]),
        ("dynamics", "dynamics.tank1.inwards.area", ["float", 1.0]),
    ],
)
def test_CosappObjectParser_serialize_data_from_system(CosappObjectParserFactory, sys_name, key, expected):
    sys_data: CosappObjectParser = CosappObjectParserFactory(sys_name)
    data = sys_data.serialize_data_from_system()
    system_dict = json.loads(data)
    assert system_dict[key] == expected


@pytest.mark.skip("Waiting for new cosapp version")
@require_pyoccad
@pytest.mark.parametrize(
    "sys_name, expected",
    [
        ("tube", {}),
        ("pendulum", {}),
        (
            "circuit",
            {
                "circuit.design": {
                    "Section": [],
                    "Status": [],
                    "Error code": [],
                    "Reference": [],
                    "circuit.R1.R": [],
                    "circuit.R2.R": [],
                    "circuit.n1.V": [],
                    "circuit.n2.V": [],
                    "ground.V": [],
                }
            },
        ),
        (
            "dynamics",
            {
                "dynamics.RK": {
                    "Section": [],
                    "Status": [],
                    "Error code": [],
                    "Reference": [],
                    "tank1.height": [],
                    "tank2.height": [],
                    "time": [],
                }
            },
        ),
    ],
)
def test_CosappObjectParser_serialize_recorder(CosappObjectParserFactory, sys_name, expected):
    sys_data: CosappObjectParser = CosappObjectParserFactory(sys_name)
    assert sys_data.serialize_recorder() == expected


@require_pyoccad
@pytest.mark.parametrize(
    "sys_name, expected",
    [("tube", {}), ("circuit", {}), ("dynamics", {})],
)
def test_CosappObjectParser_serialize_driver_data(SystemFactory, sys_name, expected):
    a: System = SystemFactory(sys_name)
    a.run_drivers()
    sys_data = CosappObjectParser(a)

    assert sys_data.serialize_driver_data() == expected
