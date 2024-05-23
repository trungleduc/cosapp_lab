import json
from typing import Dict, NoReturn
from notebook.base.handlers import APIHandler
from notebook.notebookapp import NotebookWebApplication
from notebook.utils import url_path_join
from pathlib import Path
import shutil
from .cosapp_kernel import CosappKernelConnetion

COSAPP_URL_START = "cosapp/server/start"
COSAPP_URL_STOP = "cosapp/server/stop"
COSAPP_URL_INFO = "cosapp/server/info"
COSAPP_URL_RUN = "cosapp/server/run"
COSAPP_CONFIG_DIR = Path.home() / ".cosapp.d"


def setup_cosapp_server_handlers(web_app: NotebookWebApplication):
    """Setup handlers for to cosapp server.

    Parameters
    ----------
    web_app : notebook.notebookapp.NotebookWebApplication
        The notebook web application
    """
    host_pattern = ".*$"

    def build_url(url_extension: str) -> str:
        return url_path_join(web_app.settings["base_url"], url_extension)

    web_app.add_handlers(
        host_pattern,
        [
            (build_url(COSAPP_URL_START), StartSessionHandler),
            (build_url(COSAPP_URL_STOP), StopSessionHandler),
            (build_url(COSAPP_URL_RUN), RunSessionHandler),
            (build_url(COSAPP_URL_INFO), InfoSessionHandler),
        ],
    )


class CustomAPI(APIHandler):
    """
    Custom `APIHandler` to bypass `xsrf` cookie check and
    close kernel connection on finish.
    """

    def check_xsrf_cookie(self):
        return

    def on_finish(self):
        if hasattr(self, "kc") and self.kc is not None:
            self.kc.disconnect()

    def create_kernel_connection(self, token: str) -> CosappKernelConnetion:
        """
        Helper function to connect to kernel by using
        configuration stored in `server` folder of `COSAPP_CONFIG_DIR`
        """
        folder_path = COSAPP_CONFIG_DIR / "server" / token
        if folder_path.exists():
            try:
                kernel_config = folder_path / "config.json"
                with open(kernel_config, "r") as f:
                    config = json.load(f)
                connection_file = config["connection"]
                request_name = config["system_name"]
                kc = CosappKernelConnetion(connection_file, request_name)
            except Exception as e:
                print(e)
                kc = None
        else:
            kc = None
        return kc


class StartSessionHandler(CustomAPI):
    """
    Handle start session request, this handler will clear
    all old configuration file in `COSAPP_CONFIG_DIR` before
    creating new session.
    """

    def get(self):
        self.finish("Start")

    def post(self):
        self.clear_server_folder()
        input_data = self.get_json_body()
        folder_path = COSAPP_CONFIG_DIR / "server" / input_data["token"]
        folder_path.mkdir(parents=True, exist_ok=True)
        kernel_config = folder_path / "config.json"
        with open(kernel_config, "w") as f:
            json.dump(input_data, f)

        self.finish("1")

    def clear_server_folder(self):
        folder_path = COSAPP_CONFIG_DIR / "server"
        for sub_folder in folder_path.glob("*"):
            config_path = folder_path / sub_folder
            try:
                kc = self.create_kernel_connection(sub_folder)
                if kc == None:
                    shutil.rmtree(config_path)
                else:
                    kc.disconnect()
            except:
                shutil.rmtree(config_path)


class StopSessionHandler(CustomAPI):
    """
    Handle stop session request, this handler will remove
    associated configuration file.
    """

    def get(self):
        self.finish("Stop")

    def post(self):
        input_data = self.get_json_body()
        folder_path = COSAPP_CONFIG_DIR / "server" / input_data["token"]
        if folder_path.exists():
            try:
                shutil.rmtree(folder_path)
                self.finish("1")
            except Exception as e:
                print(e)
                self.finish("-1")

        else:
            self.finish("-1")


class InfoSessionHandler(CustomAPI):
    """
    Handle system information request.
    """

    def post(self):

        input_data = self.get_json_body()
        server_msg = f"Received INFO request from {self.request.remote_ip}"
        self.kc = self.create_kernel_connection(input_data["token"])

        if self.kc is not None:
            self.kc.execute(f"{self.kc.sysexplorer}.update_server_log('{server_msg}')")
            msg = {}
            for name in ["children_list", "children_port", "children_drive"]:
                cmd = f"{self.kc.sysexplorer}.sys_data.{name}"
                try:
                    flag, ret = self.kc.execute(cmd)
                    msg[name] = ret
                except Exception as e:
                    print(e)
                    msg["error"] = e
                    break
            self.finish(msg)
        else:
            self.finish("-1")


class RunSessionHandler(CustomAPI):

    """
    Handle run system request.
    """

    def post(self):
        input_data = self.get_json_body()
        post_data: Dict = input_data["data"]
        requested_result = post_data["result"]
        server_msg = f"Received RUN request from {self.request.remote_ip}"
        self.kc = self.create_kernel_connection(input_data["token"])
        if self.kc is not None:
            self.kc.execute(f"{self.kc.sysexplorer}.update_server_log('{server_msg}')")
            param_dict = post_data["parameters"]
            post_content = {}
            for key, val in param_dict.items():
                post_content[f"{key}.{val[0]}.{val[1]}"] = val[2]
            content = json.dumps(
                {"action": "runSignal", "payload": post_content, "currentThread": "1"}
            )

            cmd = f"{self.kc.sysexplorer}._handle_button_msg('SysExplorerModel', {content}, [])"
            run_flag, run_log = self.kc.execute(cmd, False)
            if run_flag == "error":
                self.finish({"error": run_log, "result": None, "log": None})
            else:
                flag, exec_result = self.kc.execute(
                    f"{self.kc.sysexplorer}.sys_data.serialize_data_from_system()", True
                )
                ret = {}

                if len(requested_result) == 0:
                    ret = exec_result
                else:
                    for result_key in requested_result:
                        for key, value in exec_result.items():
                            if key.startswith(result_key):
                                ret[key] = value

                flag, exec_log = self.kc.execute(
                    f"{self.kc.sysexplorer}.server_log", False
                )
                self.finish({"error": None, "result": ret, "log": exec_log})
        else:
            self.finish("-1")
