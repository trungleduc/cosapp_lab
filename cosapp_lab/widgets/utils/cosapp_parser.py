import copy
from typing import Callable, Dict, List, Optional, Union

from cosapp.drivers.time.interfaces import ExplicitTimeDriver
from cosapp.systems import System
from abc import ABCMeta, abstractmethod


class CosappParser(metaclass=ABCMeta):
    """Abstract class to read/modifier/interact with  cosapp system

    Parameters
    ----------
    system : cosapp.systems.System
    """

    def __init__(self, system: Union[System, Dict]) -> None:
        self.system_name = None
        self._system = None

        self._children = {}
        self._driver = {}
        self.system_variable_data = {}
        self.variable_list = []

        self.set_up_system(system)

        self.flattened_system = self.flatten_system_dict(self.system_dict)
        self.tree_dict = self.system_to_tree_dict(self.system_dict)

    @abstractmethod
    def set_up_system(self, data: Union[Dict, System]) -> None:
        pass

    @property
    def children_list(self) -> List[str]:
        """Return the list of all sub-systems in the form
        of path (ex.: `parent.sub_parent.current_system`)
        """
        return list(self._children)

    @property
    def children_port(self) -> Dict[str, List[str]]:
        """Get a dictionary which contains system name
        as key and list of all ports of this system as value

        Returns
        -------
        Dict[str, List[str]]
            Dict contains name of port of each child in input system, including itself
        """
        ret = {}
        for sys, data in self._children.items():
            ret[sys] = data["port_list"]
        return ret

    @property
    def children_in_port(self) -> Dict[str, List[str]]:
        """Get a dictionary which contains system name
        as key and list of all input ports of this system as value

        Returns
        -------
        Dict[str, List[str]]
            Dict contains name of port of each child in input system, including itself
        """

        ret = {}
        for sys, data in self._children.items():
            ret[sys] = data["in_port_list"]
        return ret

    @property
    def children_out_port(self) -> Dict[str, List[str]]:
        """Get a dictionary which contains system name
        as key and list of all out ports of this system as value

        Returns
        -------
        Dict[str, List[str]]
            Dict contains name of port of each child in input system, including itself
        """
        ret = {}
        for sys, data in self._children.items():
            ret[sys] = data["out_port_list"]
        return ret

    @property
    def children_drive(self) -> Dict[str, List[str]]:
        """Get a dictionary which contains system name
        as key and list of all drivers of this system as value

        Returns
        -------
        Dict[str, List[str]]
            Dict contains name of drivers of each child in input system, including itself
        """
        ret = {}
        for key in self.children_list:
            if key in self._driver:
                driver = self._driver[key]
                ret[key] = list(driver) if len(driver) > 0 else ["None"]
        return ret

    def get_children_var(self, sys_name: str, port_name: str) -> List[str]:
        """Get all variables in a port of a system."""
        return []

    def get_children_var_input(
        self, sys_name: str, port_name: str, check_input: bool = False
    ) -> Dict[str, Dict]:
        """Get the variables of a port which is not a sink of any
        connection"""
        return {}

    def connect_main_driver(self, f: Callable) -> None:
        """Connect the computed signal of first driver of system to slot f"""
        pass

    def get_time_driver(self) -> List[ExplicitTimeDriver]:
        """Return the list of ExplicitTimeDriver in system"""
        return []

    @abstractmethod
    def _discover_children(
        self, system: Union[System, dict], parent: Optional[str] = None
    ) -> None:
        """Get the sub system of input system

        Parameters
        ----------
        system : Union[cosapp.systems.System, Dict]
            The input system

        parent: Optional[str]
            Path in form of "parent.child.sub-child ..." to the parent of input system.
            parent = None if input system does not have parent.

        Returns
        -------
        Dict[str, List[str]]
            Dictionary of sub system of input system with their children.
        """
        pass

    def flatten_system_dict(self, data: Dict) -> Dict:
        """Create of flattened version of self.system_dict with the keys
        in form of "parent.sub1.sub2" and content in form of
            {"class" : str,
            "inputs": {},
            "connections" : {},
            "subsystems" : List[str],
            "exec_order" : List[str]}

        Parameters
        ----------
        data : Dict
            System dictionary obtained by to_dict() method.

        Returns
        -------
        Dict[str, Dict]
            Flattend system dictionary.

        """

        flattened_system = {}
        if len(data) > 0:
            for system_path in self.children_list:
                system_list = system_path.split(".")
                if len(system_list) == 1:
                    current_system = data[system_list[0]]
                else:
                    current_system = data[system_list[0]]
                    for item in system_list[1:]:
                        current_system = current_system["subsystems"][item]

                flattened_system[system_path] = copy.deepcopy(current_system)
                try:
                    flattened_system[system_path]["subsystems"] = list(
                        current_system["subsystems"]
                    )
                except:
                    flattened_system[system_path]["subsystems"] = []

        return flattened_system

    def system_to_tree_dict(self, data: Dict, root=True, parent=None) -> Dict:
        """Convert the cosapp dict obtained by `to_dict`
        method into a compatible dict used by fontend to
        display the tree structure.

        Parameters
        ----------
        data : Dict
            System dictionary obtained by to_dict() method.

        root : boolean
            Flag to check if input data is main system or sub-system
        Returns
        -------
        Dict[str, Dict]
            System  tree dictionary.
        """

        ret = []
        if len(data) > 0:
            if root:
                temp = {
                    "title": self.system_name,
                    "id": self.system_name,
                    "expanded": True,
                }
                if "subsystems" in data[self.system_name]:
                    temp["children"] = self.system_to_tree_dict(
                        data[self.system_name]["subsystems"], False, self.system_name
                    )
                ret.append(temp)
            else:
                for key, key_data in data.items():
                    temp = {"title": key, "id": f"{parent}.{key}", "expanded": True}
                    if "subsystems" in key_data:
                        temp["children"] = self.system_to_tree_dict(
                            key_data["subsystems"], False, f"{parent}.{key}"
                        )
                    ret.append(temp)
        else:
            ret.append(
                {"title": self.system_name, "id": self.system_name, "expanded": True}
            )

        return ret
