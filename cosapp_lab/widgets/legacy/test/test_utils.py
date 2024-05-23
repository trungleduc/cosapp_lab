from cosapp_lab.widgets.legacy.utils import default_step
import pytest


@pytest.mark.parametrize(
    "value, result", [(0.0, 0.5), (-7.0, 5e-2), (1e-6, 5e-5), (2e8, 5e6), (-0.06, 5e-3)]
)
def test_default_step(value, result):
    assert default_step(value) == result


@pytest.mark.parametrize(
    "value, result", [(0.0, 0.5), (-7.0, 5e-2), (1e-6, 5e-5), (2e8, 5e6), (-0.06, 5e-3)]
)
def test_default_step(value, result):
    assert default_step(value) == result
