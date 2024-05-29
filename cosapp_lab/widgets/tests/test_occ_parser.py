import numpy

from cosapp_lab.widgets.utils import OccParser
from multibody.ports import GeometryPort
from conftest import require_pyoccad


def add_shapes(r, system):
    for child in system.children.values():
        add_shapes(r, child)

    def filter_shapes(p: "ExtensiblePort") -> "bool":
        return isinstance(p, GeometryPort) and p.visible and p.shape is not None

    for port in filter(filter_shapes, system.outputs.values()):
        [r.append(port.shape)]


@require_pyoccad
def test_occ_init(SystemFactory):
    a = SystemFactory("pendulum")
    r = []

    add_shapes(r, a)
    data = OccParser(r)
    ret = [0.0, 0.0, 0.0, 0.0, 0.0, 0.05, 0.0, 0.05, 0.0, 0.0, 0.05, 0.05]
    assert numpy.allclose(data.binary_data[0], ret)
