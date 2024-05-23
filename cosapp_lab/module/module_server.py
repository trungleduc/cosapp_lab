import logging
import shutil
import tempfile
import re
import webbrowser
import tornado.ioloop
import tornado.web
from jupyter_server.base.handlers import log

try:
    from nb_conda_kernels import CondaKernelSpecManager as KernelSpecManager
except ImportError:
    from jupyter_client.kernelspec import KernelSpecManager

import logging

import jinja2
from jupyter_server.services.kernels.handlers import (
    KernelHandler,
    MainKernelHandler,
)

try:
    from jupyter_server.services.kernels.websocket import KernelWebsocketHandler
except ImportError:
    # For jupyter_server < 2
    from jupyter_server.services.kernels.handlers import ZMQChannelsHandler as KernelWebsocketHandler

from jupyter_server.services.kernels.kernelmanager import MappingKernelManager
from jupyter_server.services.kernelspecs.handlers import MainKernelSpecHandler
from traitlets import Dict as tDict
from traitlets import Integer, Bool, Unicode, default
from traitlets.config.application import Application

from .handlers import (
    DEFAULT_STATIC_ROOT,
    MODULE_MODE,
    ROOT,
    TEMPLATE_ROOT,
    Default404Handler,
    MainEntryHandler,
    MainModuleHandler,
    StartupCodeHandler,
)

ENTRY_POINT = {MODULE_MODE.SINGLE: "main.html", MODULE_MODE.MULTIPLE: "index.html"}

_kernel_id_regex = r"(?P<kernel_id>\w+-\w+-\w+-\w+-\w+)"


class CosappModuleServer(Application):
    name = "cosapp_module"
    description = Unicode(
        """ 
        This launches a stand-alone server for CoSApp application.
        """
    )
    option_description = Unicode(
        """
        """
    )

    startup_code = Unicode(
        """
        """
    )

    args_list = Unicode("[]")

    title = Unicode(
        """
        CoSApp application
        """
    )

    module_name = Unicode("__all__")

    file = Unicode("file", config=True)

    port = Integer(6789, config=True, help="Port of the CoSApp server. Default 6789.")
    static_root = Unicode(
        str(DEFAULT_STATIC_ROOT),
        config=True,
        help="Directory holding static assets (HTML, JS and CSS files).",
    )
    aliases = {
        "port": "CosappModuleServer.port",
        "p": "CosappModuleServer.port",
        "static": "CosappModuleServer.static_root",
        "f": "CosappModuleServer.file",
        "url_prefix": "CosappModuleServer.url_prefix",
        "open_browser": "CosappModuleServer.open_browser",
    }
    connection_dir_root = Unicode(
        config=True,
        help=(
            "Location of temporary connection files. Defaults "
            "to system `tempfile.gettempdir()` value."
        ),
    )
    connection_dir = Unicode()

    all_module_data = tDict({}, help="Content of CoSApp module json file")

    module_mode = Integer(
        0, help="Module mode, 0 for single module, 1 for multiple modules"
    )

    url_prefix = Unicode("", config=True, help=("Prefix to append to handlers URL."))

    open_browser = Bool(True, config=True, help=("True if local web browser is used, False otherwise"))

    @default("connection_dir_root")
    def _default_connection_dir(self):
        return tempfile.gettempdir()

    @default("log_level")
    def _default_log_level(self):
        return logging.INFO

    def start(self):
        connection_dir = tempfile.mkdtemp(
            prefix="cosapp_module_", dir=self.connection_dir_root
        )
        kernel_spec_manager = KernelSpecManager(parent=self)
        kernel_manager = MappingKernelManager(
            parent=self,
            kernel_spec_manager=kernel_spec_manager,
            connection_dir=connection_dir,
            cull_idle_timeout=600,
            cull_interval=600,
            cull_connected=True,
        )
        if len(self.title) == 0:
            self.title = "CoSApp Application"
        HANDLE_PREFIX = r"%s" % self.url_prefix
        handlers = [
            (
                HANDLE_PREFIX + r"/cosapp/code",
                StartupCodeHandler,
                {
                    "code": self.startup_code,
                    "title": self.title,
                    "args": self.args_list,
                    "all_module_data": self.all_module_data,
                },
            ),
            (
                HANDLE_PREFIX + r"/module/([^/]+)",
                MainModuleHandler,
                {
                    "all_module_data": self.all_module_data,
                    "module_mode": self.module_mode,
                    "url_prefix": HANDLE_PREFIX,
                },
            ),
            (
                HANDLE_PREFIX + r"/api/kernels",
                MainKernelHandler,
            ),
            (HANDLE_PREFIX + r"/api/kernels/%s" % _kernel_id_regex, KernelHandler),
            (
                HANDLE_PREFIX + r"/api/kernels/%s/channels" % _kernel_id_regex,
                KernelWebsocketHandler,
            ),
            (HANDLE_PREFIX + r"/api/kernelspecs", MainKernelSpecHandler),
            (
                HANDLE_PREFIX + r"/static/(.*)",
                tornado.web.StaticFileHandler,
                {"path": self.static_root},
            ),
            (
                HANDLE_PREFIX + r"/",
                MainEntryHandler,
                {
                    "all_module_data": self.all_module_data,
                    "module_name": self.module_name,
                    "module_mode": self.module_mode,
                },
            ),
        ]
        env = jinja2.Environment(loader=jinja2.FileSystemLoader(TEMPLATE_ROOT))
        app = tornado.web.Application(
            handlers,
            kernel_manager=kernel_manager,
            kernel_spec_manager=kernel_spec_manager,
            autoreload=False,
            jinja2_env=env,
            compress_response=False,
            allow_remote_access=True,
            allow_origin_pat=re.compile(".*"),
            default_handler_class=Default404Handler,
        )
        app.listen(self.port)
        url = f"http://localhost:{self.port}{self.url_prefix}/"
        self.log.info(f"CoSApp server listening on port {self.port}")
        self.log.info(f"Address: {url}")
        try:
            if self.open_browser:
                webbrowser.open(url)
            logging.getLogger("tornado.access").disabled = True
            tornado.ioloop.IOLoop.current().start()

        finally:
            self.log.info("Remove connection files")
            shutil.rmtree(connection_dir)


launch_server = CosappModuleServer.launch_instance

if __name__ == "__main__":
    CosappModuleServer.startup_code = ""
    CosappModuleServer.title = ""
    CosappModuleServer.module_mode = MODULE_MODE.MULTIPLE
    CosappModuleServer.launch_instance()
