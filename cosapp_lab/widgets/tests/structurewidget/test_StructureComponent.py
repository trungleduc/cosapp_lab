from cosapp_lab.widgets.structurewidget import StructureComponent
from unittest.mock import MagicMock
import weakref


def test_StructureComponent(SystemFactory):
    a = SystemFactory("simple")
    send_func = MagicMock()
    c = StructureComponent(weakref.ref(a), None, send_func)
    c._handle_button_msg({}, {"action": f"{c.name}::getData"}, [])
    send_func.assert_called_once()
