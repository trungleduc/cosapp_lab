from jupyter_client.blocking import BlockingKernelClient
import json
import queue
from typing import Tuple, Union, Dict


class CosappKernelConnetion:
    """
    A class to encapsulate a `BlockingKernelClient` of jupyter.

    Parameters
    ----------
    connection_file: str
        Path to the `connection_file` of the kernel we want to connect with.

    system_name: str
        The name of Cosapp system, this name is used to get correct `SysExplorer` instance.

    Attributes
    ----------
    client : BlockingKernelClient
        The blocking client instance of connected kernel

    idle_count : int
        Counter used to get output of execution, this counter is reset
        to 0 each time a command is ternimated.

    sysexplorer : str
        Name of the `SysExplorer` instance associated with `system_name`
        in connected kernel.

    system_name : str
        Name of the `cosapp` system instance in connected kernel.

    """

    def __init__(self, connection_file: str, system_name: str):
        self.client = BlockingKernelClient()

        self.client.load_connection_file(connection_file)
        self.client.start_channels()
        self.idle_count = 0
        self.sysexplorer, self.system_name = self.get_variable_name(system_name)
        if self.sysexplorer == None:
            raise NameError("Requested SysExplorer instance can not be found")

    def execute(self, cmd: str, to_json=True) -> Tuple[str, Union[str, Dict]]:
        """
        Execute a command in connected kernel and return the output

        Parameters
        ----------
        cmd: str
            Python command to be executed.

        to_json: bool
            Flag to convert output string into a Dict.

        Returns
        -------

        value_type : str
            Type of return value.

        value : Union[str, Dict]
            Depend on `to_json` flag, `value` will be a string or a dict .
        """
        msg_id = self.client.execute(cmd)
        value = None
        value_type = "unknown"
        while True:
            try:
                io_msg = self.client.get_iopub_msg(timeout=30)["content"]
                if "data" in io_msg:
                    if "text/plain" in io_msg["data"]:
                        value_string: str = io_msg["data"]["text/plain"]
                        value_type = "data"
                        if to_json:
                            if value_string.startswith("'"):
                                value = json.loads(value_string[1:-1].replace("'", '"'))
                            elif value_string.startswith("{"):
                                value = json.loads(value_string.replace("'", '"'))
                            else:
                                value = ["Json parser error", "Data format incorrect"]
                                value_type = "error"
                        else:
                            value = value_string

                elif "name" in io_msg:
                    value = io_msg["text"]
                    value_type = "text"
                elif "traceback" in io_msg:
                    value = [io_msg["ename"], io_msg["evalue"]]
                    value_type = "error"
                elif (
                    "execution_state" in io_msg and io_msg["execution_state"] == "idle"
                ):
                    if self.idle_count == 0:
                        if value is None and value_type == "unknown":
                            self.idle_count += 1
                        else:
                            break
                    else:
                        break

            except queue.Empty as e:
                if value is None and value_type == "unknown":
                    return "error", ["error log", str(e)]
                else:
                    print(e)
        return value_type, value

    def get_variable_name(self, requested_system_name: str) -> Tuple[str]:
        """
        Get the `SysExplorer` instance associated with `requested_system_name`
        in connected kernel.

        Parameters
        ----------
        requested_system_name: str
            Name of the `cosapp` system instance in connected kernel.
        """
        ret = None
        system_name = None
        flag, var_string = self.execute("%who", False)
        var_list = var_string.replace("\n", "").split("\t")
        if len(var_list) == 1 and var_list[0] == "Interactive namespace is empty.":
            return None, None
        for var in var_list:
            var_name = var.strip()
            if len(var_name) > 0:
                flag, var_type = self.execute(
                    f"isinstance({var_name}, SysExplorer)", False
                )
                if flag == "data" and var_type == "True":
                    flag, system_name_test = self.execute(
                        f"{var_name}._system().name", False
                    )
                    if (
                        system_name_test.replace("'", "").replace('"', "")
                        == requested_system_name
                    ):
                        ret = var_name
                        system_name = system_name_test
        return ret, system_name

    def disconnect(self):
        """
        Stop the connection to kernel
        """
        self.client.stop_channels()
