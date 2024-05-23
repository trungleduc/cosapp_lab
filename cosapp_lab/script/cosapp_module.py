import importlib
import json
import logging
import sys, os
from pathlib import Path
from typing import Dict, List, Union, Optional
from cosapp_lab._version import __version__
from click.utils import echo
from cosapp_lab.module import CosappModuleServer
from cosapp_lab.utils.helpers import Suppressor, get_abs_dir, get_readme_from_path


from ..module.module_server import MODULE_MODE

CODE_TEMPLATE = """
from {{name}} import _cosapp_lab_load_module
args_list = {{args}}
_cosapp_lab_load_module(*args_list)
"""

COSAPP_CONFIG_DIR = Path.home() / ".cosapp.d"
OKGREEN = "\033[92m"
ENDC = "\033[0m"


def _get_module_json_data() -> Dict:
    """Helper function to read module data from CoSApp configuration folder"""
    config_path = COSAPP_CONFIG_DIR / "app"
    if not config_path.exists():
        config_path.mkdir(parents=True, exist_ok=True)
    json_path = config_path / "cosapp_module.json"
    if json_path.is_file():
        with open(json_path, "r") as f:
            old_data = json.load(f)
    else:
        old_data = {}

    return old_data


def cosapp_module_list() -> None:
    """Function to show all registered CosApp modules."""
    old_data = _get_module_json_data()

    if len(old_data) == 0:
        echo("No CoSApp module registered")
    else:
        echo(f"CoSApp Lab version {__version__}")
        for key, value in old_data.items():
            try:
                echo(
                    f'({value["meta"]["env_name"]}) {OKGREEN}{key}{ENDC} {value["meta"]["version"]} - {value["title"]}'
                )
            except KeyError:
                echo(f'{OKGREEN}{key}{ENDC}              {value["title"]}')


def cosapp_module_register(name_list: List[str]) -> Union[None, int]:
    """
    Function to register CoSApp modules to library.

    Parameters
    -----------
    - name_list :  List[str]
        List of module name to be registered.

    Returns
    --------
    Union[None, int]
        Returns the status of operation, `None` if failed, `1` if succeeded.

    """
    try:
        from nb_conda_kernels import CondaKernelSpecManager
    except ImportError:
        env_name = None
        conda_kernel_name = None
    else:
        logger = logging.getLogger()
        logger.setLevel(logging.ERROR)
        kernel_name = env_name = os.environ.get("CONDA_DEFAULT_ENV", None)
        conda_kernel_name = None
        if env_name == "base":
            kernel_name = "root"

        cksm = CondaKernelSpecManager(conda_only=True)
        specs = cksm.get_all_specs()
        for name in specs:
            conda_env_name = specs[name]["spec"]["metadata"]["conda_env_name"]
            if conda_env_name == kernel_name:
                conda_kernel_name = name
                break

    old_data = _get_module_json_data()
    status = None
    for name in name_list:
        try:
            logging.disable(logging.CRITICAL)
            module = importlib.import_module(f"{name}")
            init_function = getattr(module, "_cosapp_lab_load_module")
        except ModuleNotFoundError:
            echo(f"Can't import module {name}, skipping.")
            continue
        except AttributeError:
            echo(f"{name} is not a CoSApp module, skipping.")
            continue
        try:
            with Suppressor():
                init_function()
        except NotImplementedError:
            echo(f"Interface configuration is not implemented in {name}, skipping.")
            continue

        try:
            version = f"v{module.__version__}"
        except AttributeError:
            version = "Unknown"

        if name in old_data:
            echo(f"Module {name} already registered, skipping.")
            continue
        else:
            meta_function = getattr(module, "_cosapp_lab_module_meta")
            meta = meta_function()
            if meta is None:
                meta = {}
            if "version" not in meta:
                meta["version"] = version
            title = meta.get("title", name)
            code = CODE_TEMPLATE.replace("{{name}}", name)
            path = Path(module.__file__).parent
            readme = get_readme_from_path(path.parent)
            if readme is None:
                readme = get_readme_from_path(path)
            meta["readme"] = readme
            meta["env_name"] = env_name
            old_data[name] = {
                "code": code,
                "title": title,
                "meta": meta,
                "kernel": conda_kernel_name,
            }
            echo(f"{name} is successfully registered as CoSApp standalone module")
            status = 1
    
    json_path = COSAPP_CONFIG_DIR / "app" / "cosapp_module.json"
    with open(json_path, "w") as f:
        json.dump(old_data, f)

    return status


def cosapp_module_remove(nameList: List[str]) -> None:
    """
    Function to remove CoSApp modules from library.

    Parameters
    -----------
    - name_list :  List[str]
        List of module name to be removed.
    """
    old_data = _get_module_json_data()
    for name in nameList:
        if name in old_data:
            del old_data[name]
            echo(f"{name} is successfully removed from standalone module list")
        else:
            echo(f"{name} can not be found, skipping.")
            continue
    json_path = COSAPP_CONFIG_DIR / "app" / "cosapp_module.json"
    with open(json_path, "w+") as f:
        json.dump(old_data, f)


def cosapp_load_file(file: str) -> None:
    """
    Function to start CoSApp module server from a python file.

    Parameters
    -----------
    - file :  str
        Path to python file to be loaded.
    """
    file_path = get_abs_dir(Path().absolute(), file)
    try:
        with open(file_path, "r") as f:
            file_content = f.read()
    except FileNotFoundError:
        echo(f"No such file {file_path}")
        return
    CosappModuleServer.startup_code = file_content
    CosappModuleServer.title = f"CoSApp application - {file}"
    CosappModuleServer.module_mode = MODULE_MODE.SINGLE
    if "--arguments" in sys.argv:
        sys.argv.remove("--arguments")
    CosappModuleServer.launch_instance()


def cosapp_load_module(module: str, args: Optional[str] = None) -> None:
    """
    Function to start CoSApp module server from a registered CoSApp module.

    Parameters
    -----------
    - module :  str
        Name of registered CoSApp module.
    - args : Optional[str]
        List of arguments expressed in form of string. For example, a list of
        3 arguments `foo1`, `foo2`, `foo3` need to be expressed as "foo1 foo2 foo3"
    """
    if args is not None:
        str_list = [f'"{str(x.strip())}"' for x in args.split(" ")]
        args_list = f'[{",".join(str_list)}]'
    else:
        args_list = "[]"
    old_data = _get_module_json_data()
    CosappModuleServer.all_module_data = old_data
    CosappModuleServer.module_name = module
    if module == "__all__":
        if "--all" in sys.argv:
            sys.argv.remove("--all")
        if "-a" in sys.argv:
            sys.argv.remove("-a")
        CosappModuleServer.startup_code = ""
        CosappModuleServer.title = ""
        CosappModuleServer.module_mode = MODULE_MODE.MULTIPLE
        CosappModuleServer.launch_instance()
    else:
        if module in old_data:
            title = old_data[module]["title"]
            if title is None:
                title = f"CoSApp application - {module}"
            CosappModuleServer.startup_code = old_data[module]["code"]
            CosappModuleServer.title = title
            CosappModuleServer.args_list = args_list
            CosappModuleServer.module_mode = MODULE_MODE.SINGLE
            if "--arguments" in sys.argv:
                sys.argv.remove("--arguments")
            if "-args" in sys.argv:
                sys.argv.remove("-args")
            CosappModuleServer.launch_instance()
        else:
            echo(f"Module {module} is not registered yet, start registering")
            check = cosapp_module_register(module)
            if check == 1:
                cosapp_load_module(module, args)
