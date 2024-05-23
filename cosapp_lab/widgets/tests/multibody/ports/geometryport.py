from cosapp.ports import Port


class GeometryPort(Port):
    """
    Parameters
    ----------
    entity :
       Shape
    topology : Dict[str, Shape]
       Group geometrical entities by topological label
    """

    def setup(self):
        self.add_variable("visible", True, desc="Should this geometry be shown?")
        self.add_variable("shape", None, desc="Geometrical object")
        self.add_variable(
            "topology", {}, desc="Topological description of the geometry"
        )
