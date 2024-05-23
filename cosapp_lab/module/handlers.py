import json
import os
from enum import Enum
from pathlib import Path

from jupyter_server.base.handlers import APIHandler
from tornado.web import RequestHandler


class MODULE_MODE(Enum):
    SINGLE = 0
    MULTIPLE = 1


ROOT = Path(os.path.dirname(__file__)).parent
TEMPLATE_ROOT = ROOT / "module" / "templates"
DEFAULT_STATIC_ROOT = ROOT / "app_static" / "static"


class StartupCodeHandler(APIHandler):
    """"""

    def initialize(self, **kwargs):
        self._code = kwargs.get("code", "")
        self._title = kwargs.get("title", "CoSApp application")
        self._args = kwargs.get("args", "[]")
        self._all_module_data = kwargs.get("all_module_data", {})

    def get(self):
        self.finish({"libData": self._all_module_data})

    def post(self):
        data = self.get_json_body()
        module_name = data.get("module", None)
        code = ""
        title = self._title
        if self._code is not None and len(self._code) > 0:
            code = self._code.replace("{{args}}", self._args)
        else:
            if module_name is not None and module_name in self._all_module_data:
                code = self._all_module_data[module_name]["code"].replace(
                    "{{args}}", self._args
                )
                title = self._all_module_data[module_name]["title"]
        self.finish({"code": code, "title": title})


class MainModuleHandler(RequestHandler):
    """"""

    def initialize(self, **kwargs):
        self._all_module_data = kwargs.get("all_module_data", {})
        self._module_mode = kwargs.get("module_mode", MODULE_MODE.MULTIPLE)
        self._url_prefix = kwargs.get("url_prefix", "")

    def get(self, module_name):
        static_prefix = ".."

        if self._module_mode == MODULE_MODE.SINGLE:
            self.render(
                str(TEMPLATE_ROOT / "404.html"),
                error_msg="CoSApp Lab server started in single module mode!",
                static_prefix=static_prefix,
            )
        else:
            if module_name not in self._all_module_data:
                self.render(
                    str(TEMPLATE_ROOT / "404.html"),
                    error_msg="Module can not be found!",
                    static_prefix=static_prefix,

                )
            else:
                path = ROOT / "app_static" / "main.html"
                kernel_name = self._all_module_data[module_name].get("kernel", None)
                try:
                    import nb_conda_kernels

                    cosapp_lab_config = {"kernel": kernel_name}
                except ImportError:
                    cosapp_lab_config = {"kernel": None}
                self.render(
                    str(path),
                    static_prefix=static_prefix,
                    cosapp_lab_config=json.dumps(cosapp_lab_config),
                    url_prefix=self._url_prefix
                )


class MainEntryHandler(RequestHandler):
    """"""

    def initialize(self, **kwargs):
        self._all_module_data = kwargs.get("all_module_data", {})
        self._module_mode = kwargs.get("module_mode", MODULE_MODE.MULTIPLE)
        self.module_name = kwargs.get("module_name", None)

    def get(self):
        if self._module_mode == MODULE_MODE.SINGLE:
            if self.module_name is not None:
                path = ROOT / "app_static" / "main.html"
                kernel_name = self._all_module_data[self.module_name].get(
                    "kernel", None
                )
                try:
                    import nb_conda_kernels
                    cosapp_lab_config = {"kernel": kernel_name}
                except ImportError:
                    cosapp_lab_config = {"kernel": None}
                static_prefix = "."
                self.render(
                    str(path),
                    static_prefix=static_prefix,
                    cosapp_lab_config=cosapp_lab_config,
                )
            else:
                self.render(
                    str(TEMPLATE_ROOT / "404.html"),
                    error_msg="Requested module can not be found",
                    static_prefix="..",
                )
        elif self._module_mode == MODULE_MODE.MULTIPLE:
            path = ROOT / "app_static" / "index.html"
            static_prefix = "."
            self.render(str(path), static_prefix=static_prefix)


class Default404Handler(RequestHandler):
    def prepare(self):
        self.set_status(404)
        self.render(
            str(TEMPLATE_ROOT / "404.html"),
            error_msg="Invalid resource path!",
            static_prefix="..",
        )
