import os
from typing import Dict, NoReturn, Optional

from cookiecutter.main import cookiecutter
from jinja2 import Environment, FileSystemLoader
from .cosapp_parser import CosappParser
from .utils import replicate_dict_structure
from pathlib import Path


class CosappJsonParser(CosappParser):
    def __init__(self, json_data: Dict):

        super().__init__(json_data)

    def set_up_system(self, data: Dict) -> None:
        self._json_data = data
        self.system_name = list(data["Systems"].keys())[0]
        self._system = None
        try:
            self.system_dict = replicate_dict_structure(data["Systems"])
        except:
            self.system_dict = {}
        self._discover_children(data["Systems"])

    def _discover_children(
        self, system_dict: Dict, parent: Optional[str] = None
    ) -> None:
        """Get the sub system of input system

        Parameters
        ----------
        system : Dict
            The dictionary of input system

        parent: Optional[str]
            Path in form of "parent.child.sub-child ..." to the parent of input system.
            parent = None if input system does not have parent.

        Returns
        -------
        Dict[str, List[str]]
            Dictionary of sub system of input system with their children.
        """
        system_name = list(system_dict.keys())[0]
        system_data = system_dict[system_name]
        if parent is not None:
            key = parent + "." + system_name
        else:
            key = system_name

        if key in self._children:
            content = self._children[key]

        else:
            content = {}

        if "subsystems" not in system_data:
            content["children"] = None
        else:
            content["children"] = list(system_data["subsystems"])

        child_name = ".".join(key.split(".")[1:])

        content["path"] = key
        content["driver_list"] = []
        content["out_port_list"] = list(system_data["outputs"])
        content["in_port_list"] = list(system_data["inputs"])
        content["port_list"] = content["out_port_list"] + content["in_port_list"]
        content["port_data"] = {}

        for port_direction in ["inputs", "outputs"]:
            for port_key, port_val in system_data[port_direction].items():
                if port_key not in content["port_data"]:
                    content["port_data"][port_key] = [
                        _ for _ in list(port_val) if _ != "__class__"
                    ]
                else:
                    content["port_data"][port_key] += [
                        _ for _ in list(port_val) if _ != "__class__"
                    ]

        if key not in self._children:
            self._children[key] = content
        else:
            for content_key in content:
                self._children[key][content_key] = content[content_key]
        if "subsystems" in system_data:
            for sub_key, sub_data in system_data["subsystems"].items():
                self._discover_children({sub_key: sub_data}, key)

    def create_project(self, project_data: Dict = {}, output_dir=".") -> NoReturn:
        """
        Generate cosapp code from json data
        """

        def format_port_data(data: Dict) -> None:
            for key, val in data.items():
                for sub_key, sub_val in val.items():
                    if sub_key in ["unit", "desc"]:
                        val[sub_key] = f'"{sub_val}"'
                    if sub_key in ["limits", "valid_range"] and sub_val is not None:
                        if sub_val[0] == "-inf":
                            sub_val[0] = None
                        if sub_val[1] == "inf":
                            sub_val[1] = None
                        val[sub_key] = tuple(sub_val)

        sys_data = self._json_data
        dir_path = Path(os.path.dirname(__file__)).parent.parent / "utils" / "templates"
        template_path = dir_path / "cookiecutter-cosapp-workspace"
        file_template_path = dir_path / "file_template"
        if len(project_data) > 0:
            cookiecutter(
                template_path,
                no_input=True,
                extra_context=project_data,
                output_dir=output_dir,
                overwrite_if_exists=True,
            )
        else:
            cookiecutter(
                template_path,
                no_input=True,
                output_dir=output_dir,
                overwrite_if_exists=True,
            )
        project_name = project_data.get("project_name", "cosapp_project")
        ports_path = os.path.join(output_dir, project_name, project_name, "ports")
        systems_path = os.path.join(output_dir, project_name, project_name, "systems")

        env = Environment(
            loader=FileSystemLoader(file_template_path),
            trim_blocks=True,
            lstrip_blocks=True,
        )
        port_template = env.get_template("port.j2")
        for class_name, variable_data in sys_data["Ports"].items():
            format_port_data(variable_data)
            port_template.stream(
                class_name=class_name, variable_data=variable_data
            ).dump(os.path.join(ports_path, f"{class_name.lower()}.py"))

        system_template_data = {}
        self.get_cls_definition_from_json(sys_data["Systems"], system_template_data)
        sys_template = env.get_template("system.j2")

        for class_name, variable_data in system_template_data.items():
            variable_data["import"] = {"port": [], "system": []}
            variable_data["module_name"] = project_name
            for direction, extensible_port_name in [
                ("inputs", "inwards"),
                ("outputs", "outwards"),
            ]:
                if direction in variable_data:
                    for port_name in variable_data[direction]:
                        if port_name == extensible_port_name:
                            format_port_data(variable_data[direction][port_name])
                        else:
                            port_cls_name = variable_data[direction][port_name][
                                "__class__"
                            ]
                            if port_cls_name not in variable_data["import"]["port"]:
                                variable_data["import"]["port"].append(port_cls_name)
            if "subsystems" in variable_data:
                for sys_cls_name in variable_data["subsystems"].values():
                    real_name = sys_cls_name.replace("__main__.", "")
                    if real_name not in variable_data["import"]["system"]:
                        variable_data["import"]["system"].append(real_name)

            sys_template.stream(class_name=class_name, **variable_data).dump(
                os.path.join(systems_path, f"{class_name.lower()}.py")
            )

    @classmethod
    def get_cls_definition_from_json(cls, input: Dict, output: Dict) -> None:
        data = input[list(input.keys())[0]]
        class_name = data["class"].replace("__main__.", "")
        if class_name not in output:
            output[class_name] = {"subsystems": {}}
            for key, value in data.items():
                if key == "subsystems":
                    for sub_key, sub_val in value.items():
                        output[class_name]["subsystems"][sub_key] = sub_val["class"]
                elif key == "class":
                    pass
                else:
                    output[class_name][key] = value
        if "subsystems" in data:
            for system_key, system_data in data["subsystems"].items():
                cls.get_cls_definition_from_json({system_key: system_data}, output)
