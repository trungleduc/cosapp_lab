from .cosapp_init import cosapp_init
from .cosapp_jupyterlab import cosapp_jupyterlab, LOGO
from .cosapp_module import (
    cosapp_load_file,
    cosapp_module_register,
    cosapp_module_list,
    cosapp_module_remove,
    cosapp_load_module,
)

cosapp_script = {
    "init": cosapp_init,
    "lab": cosapp_jupyterlab,
    "cosapp_load_file": cosapp_load_file,
    "cosapp_load_module": cosapp_load_module,
    "cosapp_module_register": cosapp_module_register,
    "cosapp_module_list": cosapp_module_list,
    "cosapp_module_remove": cosapp_module_remove,
}
