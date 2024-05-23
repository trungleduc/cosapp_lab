import json, copy, os
from typing import Any, Dict


def is_jsonable(x: Any) -> bool:
    """Helper function to check if input is jsonable

    Parameters
    ----------
    x : Any

    """

    try:
        json.dumps(x)
    except (TypeError, OverflowError):
        return False
    else:
        return True


def replicate_dict_structure(x: Dict) -> Dict:
    """Helper function to replicate a dict and remove all
    non-jsonable value

    Parameters
    ----------
    x : Dict

    Return
    -------
    New dict

    """
    new_dict = {}
    for key, current_val in x.items():
        if is_jsonable(current_val):
            new_dict[key] = copy.deepcopy(current_val)
        elif isinstance(current_val, dict):
            new_dict[key] = replicate_dict_structure(current_val)
        else:
            new_dict[key] = None
    return new_dict


def get_nonexistant_path(fname_path):
    if not os.path.exists(fname_path):
        return fname_path
    filename, extension = os.path.splitext(fname_path)
    get_name = lambda i: f"{filename}-{i}{extension}"
    i = 1
    new_fname = get_name(i)
    while os.path.exists(new_fname):
        i += 1
        new_fname = get_name(i)
    return new_fname
