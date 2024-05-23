import logging
import uuid
import numpy

from typing import List, Optional

try:
    from OCC import Core as OCC_Core
    from OCC.Core.BRepMesh import BRepMesh_IncrementalMesh
    from OCC.Core import Poly
    from OCC.Core.TopExp import TopExp_Explorer
    from OCC.Core.BRepBndLib import brepbndlib
    from OCC.Core.Bnd import Bnd_Box
    _OCC_found = True

except ImportError as e:
    print(e)
    OCC_Core = None
    Poly = None
    BRepMesh_IncrementalMesh = None
    TopExp_Explorer = None
    _OCC_found = False

logger = logging.getLogger(__name__)


class OccParser:
    """Helper class to create a triangulation of shape."""

    def __init__(self,
        shape_list: Optional[List["OCC_Core.TopoDS.TopoDS_Shape"]] = None,
        mesh_quality = 0.75,
    ):
        if _OCC_found:
            input_shape_list = shape_list
        else:
            input_shape_list = []
            logger.warning(
                "OCC or pyoccad cannot be found; geometry viewer will not work"
            )

        self.threejs_data = {}
        self.binary_data: List[numpy.ndarray] = []
        self.binary_position = {}
        self._faces = {}
        self._faces_pos = {}
        self.shape_idx = 0

        for shape in input_shape_list:
            if isinstance(shape, OCC_Core.TopoDS.TopoDS_Shape):
                my_deviation = self.compute_default_deviation(shape)

                self.threejs_data[self.shape_idx] = []
                if self.shape_idx == 0:
                    self.binary_position[self.shape_idx] = [0, -1]
                else:
                    last = self.binary_position[self.shape_idx - 1][1]
                    self.binary_position[self.shape_idx] = [last + 1, last]
                self.threejs_data[f"edge_{self.shape_idx}"] = []
                BRepMesh_IncrementalMesh(
                    shape, my_deviation * mesh_quality, False, 0.5 * mesh_quality, True
                )
                self.__build_face_mesh(shape)
                self.__build_edge_mesh(shape)
                self.shape_idx += 1

            elif isinstance(shape, dict):
                self.threejs_data[self.shape_idx] = []
                if self.shape_idx == 0:
                    self.binary_position[self.shape_idx] = [0, -1]
                else:
                    last = self.binary_position[self.shape_idx - 1][1]
                    self.binary_position[self.shape_idx] = [last + 1, last]
                self.threejs_data[f"edge_{self.shape_idx}"] = []
                self.threejs_data[f"misc_{self.shape_idx}"] = shape.get("misc_data", {})
                if shape["shape"] is not None:
                    BRepMesh_IncrementalMesh(shape["shape"], 0.005, True, 0.5, True)
                    color = shape.get("color", "#156289")
                    trans = shape.get("transparent", False)
                    self.__build_face_mesh(shape["shape"], color, trans)
                    render_edge = shape.get("edge", False)
                    if render_edge:
                        self.__build_edge_mesh(shape["shape"])

                self.shape_idx += 1

    def __build_face_mesh(
        self,
        sh: "OCC_Core.TopoDS.TopoDS_Shape",
        color: str = "#156289",
        transparent: bool = False,
    ):
        """
        Create a triangle mesh of surface of input shape. This is a simplified
        version of the corresponding function in Pyoccad

        Parameters
        ----------
        sh : OCC_Core.TopoDS.TopoDS_Shape
            Input shape to me meshed.

        """
        expl = TopExp_Explorer(sh, OCC_Core.TopAbs.TopAbs_FACE)
        while expl.More():
            face = OCC_Core.TopoDS.topods.Face(expl.Current())
            self.__addFaceMesh(face, color, transparent)
            expl.Next()

    def __addFaceMesh(self,
        face: "OCC_Core.TopoDS.TopoDS_Face",
        color: str,
        transparent: bool,
    ):
        """
        Helper function to create a triangle mesh of input surface . This is a simplified
        version of the corresponding function in Pyoccad

        Parameters
        ----------
        face : OCC_Core.TopoDS.TopoDS_Face
            Input shape to me meshed.
        """
        loc = OCC_Core.TopLoc.TopLoc_Location()
        T = OCC_Core.BRep.BRep_Tool().Triangulation(face, loc)
        if T is None:
            return

        vtx = []
        for node in self.get_nodes(T):
            vtx.extend(node.Coord(d) for d in range(1, 4))
        idx = []
        for triangle in self.get_triangles(T):
            idx.extend(triangle.Value(d) - 1 for d in range(1, 4))

        faces = numpy.array(idx, "uint16")
        trf = loc.Transformation()
        translation = trf.TranslationPart()
        quaternion = trf.GetRotation()
        self.threejs_data[self.shape_idx].append(
            {
                # "vertices": vtx,
                # "faces": faces.tolist(),
                "pos": [
                    translation.X(),
                    translation.Y(),
                    translation.Z(),
                ],
                "quat": [
                    quaternion.X(),
                    quaternion.Y(),
                    quaternion.Z(),
                    quaternion.W(),
                ],
                "color": color,
                "transparent": transparent,
            }
        )
        self.binary_data.append(numpy.array(vtx, dtype="float64"))
        self.binary_data.append(faces)
        self.binary_position[self.shape_idx][1] += 2
        mesh_id = uuid.uuid4().hex
        self._faces[mesh_id] = face
        self._faces_pos[mesh_id] = vtx

    def __build_edge_mesh(self, sh: "OCC_Core.TopoDS.TopoDS_Shape"):
        """
        Create a the edge mesh input shape. This is a simplified
        version of the corresponding function in Pyoccad

        Parameters
        ----------
        sh : OCC_Core.TopoDS.TopoDS_Shape
            Input shape to me meshed.
        """
        edgeMap = OCC_Core.TopTools.TopTools_IndexedDataMapOfShapeListOfShape()
        OCC_Core.TopExp.topexp.MapShapesAndAncestors(
            sh, OCC_Core.TopAbs.TopAbs_EDGE, OCC_Core.TopAbs.TopAbs_FACE, edgeMap
        )

        for i in range(1, edgeMap.Size() + 1):
            faceList = edgeMap.FindFromIndex(i)
            if faceList.Size() != 0:
                face = OCC_Core.TopoDS.topods.Face(faceList.First())
                edge = OCC_Core.TopoDS.topods.Edge(edgeMap.FindKey(i))
                # Looking for face mesh to recover position buffer and save memory
                for mesh_id, f in self._faces.items():
                    if face.IsSame(f):
                        vertexBuffer = self._faces_pos.get(mesh_id, None)

                if vertexBuffer is not None:
                    loc = OCC_Core.TopLoc.TopLoc_Location()
                    tri = OCC_Core.BRep.BRep_Tool().Triangulation(face, loc)
                    trf = loc.Transformation()
                    translation = trf.TranslationPart()
                    quaternion = trf.GetRotation()
                    # polygon = Poly.PolygonOnTriangulation(edge, face, loc)
                    polygon = OCC_Core.BRep.BRep_Tool().PolygonOnTriangulation(edge, tri, loc)

                    self.threejs_data[f"edge_{self.shape_idx}"].append(
                        {
                            "vertices": vertexBuffer,
                            "faces": list(range(polygon.NbNodes())),
                            "pos": [
                                translation.X(),
                                translation.Y(),
                                translation.Z(),
                            ],
                            "quat": [
                                quaternion.X(),
                                quaternion.Y(),
                                quaternion.Z(),
                                quaternion.W(),
                            ],
                        }
                    )

    def compute_default_deviation(self, shape) -> float:
        """Compute the minimum size of `shape` bounding box.
        This function is used to compute the mesh quality in tesselation.
        """
        box = Bnd_Box()
        brepbndlib.Add(shape, box)
        x_min, y_min, z_min, x_max, y_max, z_max = box.Get()
        return max(x_max - x_min, y_max - y_min, z_max - z_min) * 2e-2

    @staticmethod
    def get_nodes(T):
        for i in range(T.NbNodes()):
            yield T.Node(i + 1)

    @staticmethod
    def get_triangles(T):
        yield from T.Triangles()
