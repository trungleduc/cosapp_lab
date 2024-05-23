import pytest
from cosapp_lab.widgets.infowidget import SystemInfoComponent
from unittest.mock import MagicMock
import weakref


def test_SystemInfoComponent_handle_button_msg(SystemFactory):
    a = SystemFactory("simple")
    send_func = MagicMock()
    c = SystemInfoComponent(weakref.ref(a), None, send_func)
    c._handle_button_msg({}, {"action": f"{c.name}::getData"}, [])
    send_func.assert_called_once()


def test_SystemInfoComponent_computed_notification(SystemFactory):
    a = SystemFactory("simple")
    send_func = MagicMock()
    c = SystemInfoComponent(weakref.ref(a), None, send_func)
    a.computed.connect(c.computed_notification)
    a.run_drivers()
    send_func.assert_called()    
    
def test_SystemInfoComponent_build_info_dict(SystemFactory):
    a = SystemFactory("simple")
    c = SystemInfoComponent(weakref.ref(a), None, None)
    ret = c.build_info_dict()

    assert "simple" in list(ret)[0]

@pytest.mark.skip("Waiting for new cosapp version")    
def test_SystemInfoComponent_create_html(SystemFactory):
    a = SystemFactory("simple")
    ret = SystemInfoComponent.create_html(a,"simple")
    assert ret.splitlines()[0] == "## System: simple -  Class: Simple"
