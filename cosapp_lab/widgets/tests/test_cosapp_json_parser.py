import pytest


@pytest.mark.skip("Waiting for new cosapp version")
@pytest.mark.parametrize(
    "sys_name,  result",
    [
        ("pendulum", []),
    ],
)
def test__init__(SystemFactory, sys_name, result):
    a = SystemFactory(sys_name)
    data = a.export_structure()
    assert True
    # sys_data = CosappJsonParser(data)
    # assert sys_data._children == result
