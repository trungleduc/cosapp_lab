from cosapp_lab.widgets.utils import replicate_dict_structure
import pytest
import numpy


@pytest.mark.parametrize(
    "input, result",
    [
        ({"a": 0, "b": 1}, {"a": 0, "b": 1}),
        (
            {"a": 0, "b": {"c": 1, "d": {"e": 1}}},
            {"a": 0, "b": {"c": 1, "d": {"e": 1}}},
        ),
        ({"a": 0, "b": numpy.array([1, 2])}, {"a": 0, "b": None}),
    ],
)
def test_replicate_dict_structure(input, result):
    new_dict = replicate_dict_structure(input)
    assert new_dict == result
