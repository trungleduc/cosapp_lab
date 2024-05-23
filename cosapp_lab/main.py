import click
from click.utils import echo
from cosapp_lab.script import cosapp_script, LOGO
from cosapp_lab import __version__ as cosapp_lab_version
from cosapp.core import __version__ as cosapp_version

CONTEXT_SETTINGS = dict(help_option_names=["-h", "--help"], ignore_unknown_options=True)


@click.group(
    invoke_without_command=True,
    no_args_is_help=False,
    context_settings=CONTEXT_SETTINGS,
)
@click.option("-v", "--version", is_flag=True, default=False)
@click.pass_context
def cosapp(ctx, version):
    """CosApp CLI tool."""
    if version:
        echo(f"CosApp version {cosapp_version}")
        echo(f"CosApp Lab version {cosapp_lab_version}")
    else:
        if ctx.invoked_subcommand is None:
            lab_app = cosapp_script["lab"]
            if lab_app is not None:
                echo(LOGO)
                lab_app()
            else:
                echo(
                    f"Please start CoSApp in an environnement with JupyterLab installed "
                )


@cosapp.command("init", short_help="Initialize a new CosApp project")
def init():
    cosapp_script["init"]()


@cosapp.group(
    "module",
    short_help="CoSApp modules management tool",
    invoke_without_command=False,
    no_args_is_help=False,
    context_settings=CONTEXT_SETTINGS,
)
def cosapp_module():
    pass


@cosapp_module.command(
    "register", short_help="Register a CoSApp library as standalone module"
)
@click.argument("name")
def cosapp_module_register(name: str):
    cosapp_script["cosapp_module_register"]([name])


@cosapp_module.command(
    "remove", short_help="Remove a CoSApp library from standalone module list"
)
@click.argument("module")
def cosapp_module_register(module):
    cosapp_script["cosapp_module_remove"]([module])


@cosapp_module.command("list", short_help="List all CoSApp standalone modules")
def cosapp_module_register():
    cosapp_script["cosapp_module_list"]()


@cosapp.command("load", short_help="Start a CosApp module in standalone mode")
@click.argument("module", default=None, required=False)
@click.option(
    "-a",
    "--all",
    flag_value=True,
    required=False,
    help="Flag to load all available module",
)
@click.option("-f", "--file", default=None, required=False, help="Path to script file")
@click.option(
    "-args",
    "--arguments",
    default=None,
    required=False,
    nargs=1,
    type=str,
    help="A string contains list of parameters for module initial function",
)
@click.option(
    "-p",
    "--port",
    default=6789,
    required=False,
    nargs=1,
    type=int,
    help="Port number for CoSApp Lab server",
)
@click.option(
    "-pre",
    "--url_prefix",
    default="",
    required=False,
    nargs=1,
    type=str,
    help="Prefix of application URL",
)
@click.option(
    "--open_browser",
    default=True,
    required=False,
    nargs=1,
    type=bool,
    help="Open local web browser",
)
def load_module(module, file, all, arguments, port, url_prefix, open_browser):
    """Start a CoSApp standalone module. Use -f/--file option to start server from a python script

    - MODULE: named of registered CoSApp module.
    """
    echo(LOGO)
    if all:
        cosapp_script["cosapp_load_module"]("__all__", arguments)
    else:
        if module is None and file is None:
            echo("Please specify module name or file path.")
            return
        elif module is None:
            if arguments is not None:
                echo("Arguments is not supported for python script")
            cosapp_script["cosapp_load_file"](file)
        elif file is None:
            cosapp_script["cosapp_load_module"](module, arguments)
        else:
            cosapp_script["cosapp_load_module"](module, arguments)


if __name__ == "__main__":
    cosapp()  # pragma: no cover
