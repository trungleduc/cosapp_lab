import pytest
from cosapp_lab.script import cosapp_module
from pathlib import Path
import json


@pytest.fixture
def patched_COSAPP_CONFIG_DIR(monkeypatch):
    patched = Path(__file__).parent
    monkeypatch.setattr("cosapp_lab.script.cosapp_module.COSAPP_CONFIG_DIR", patched)
    return patched


def clear_data():
    json_path = Path(__file__).parent / "app" / "cosapp_module.json"
    if json_path.is_file():
        json_path.unlink()


def create_data():
    json_path = Path(__file__).parent / "app" / "cosapp_module.json"
    data = {"foo": {"code": "print('hello world')", "title": "A Foo module"}}
    with open(json_path, "w+") as f:
        json.dump(data, f)


def test_get_module_json_data_empty(patched_COSAPP_CONFIG_DIR):
    clear_data()
    data = cosapp_module._get_module_json_data()
    assert data == {}


def test_get_module_json_data(patched_COSAPP_CONFIG_DIR):
    create_data()
    data = cosapp_module._get_module_json_data()
    assert data == {"foo": {"code": "print('hello world')", "title": "A Foo module"}}
    clear_data()


def test_cosapp_module_list_empty(patched_COSAPP_CONFIG_DIR, capsys):
    clear_data()
    cosapp_module.cosapp_module_list()
    captured = capsys.readouterr()
    assert "No CoSApp module registered" in captured.out


def test_cosapp_module_list(patched_COSAPP_CONFIG_DIR, capsys):
    create_data()
    cosapp_module.cosapp_module_list()
    captured = capsys.readouterr()
    assert "A Foo module" in captured.out
    clear_data()


@pytest.mark.parametrize(
    "module_name, expect",
    [
        ("NonCosappModule", "NonCosappModule is not a CoSApp module"),
        ("DefaultCosappModule", "Interface configuration is not implemented"),
        (
            "WorkingCosappModule",
            "WorkingCosappModule is successfully registered as CoSApp standalone module"
        ),
    ],
)
def test_cosapp_module_register(
    patched_COSAPP_CONFIG_DIR, monkeypatch, capsys, module_name, expect
):
    clear_data()
    monkeypatch.syspath_prepend(Path(__file__).parent / "Mock_Module")
    cosapp_module.cosapp_module_register([module_name])
    captured = capsys.readouterr()
    data = cosapp_module._get_module_json_data()
    if len(data) > 0:
        assert "kernel" in data["WorkingCosappModule"]
        assert "env_name" in data["WorkingCosappModule"]["meta"]  
    assert expect in captured.out


def test_cosapp_module_register_all(patched_COSAPP_CONFIG_DIR, monkeypatch, capsys):
    clear_data()
    monkeypatch.syspath_prepend(Path(__file__).parent / "Mock_Module")
    status = cosapp_module.cosapp_module_register(
        ["NonCosappModule", "DefaultCosappModule", "WorkingCosappModule"]
    )
    captured = capsys.readouterr()
    assert "NonCosappModule is not a CoSApp module, skipping" in captured.out
    assert (
        "Interface configuration is not implemented in DefaultCosappModule, skipping"
        in captured.out
    )
    assert (
        "WorkingCosappModule is successfully registered as CoSApp standalone module"
        in captured.out
    )
    assert status == 1


def test_cosapp_module_remove_empty(patched_COSAPP_CONFIG_DIR, monkeypatch, capsys):
    clear_data()
    cosapp_module.cosapp_module_remove(["Foo"])
    captured = capsys.readouterr()
    assert "Foo can not be found" in captured.out


def test_cosapp_module_remove(patched_COSAPP_CONFIG_DIR, monkeypatch, capsys):
    create_data()
    cosapp_module.cosapp_module_remove(["foo"])
    captured = capsys.readouterr()
    assert "foo is successfully removed from standalone module list" in captured.out
    clear_data()
