import numpy
from numpy.linalg import norm as length
from scipy.spatial.transform import Rotation

from OCC.Core.gp import gp_Quaternion, gp_Mat

EPS = 1e-13


def normalize(vector):
    """Returns the normalized vector."""
    norm = length(vector)
    return vector / norm if norm > EPS else vector / EPS


def skew(vector):
    """Returns a numpy array with the skew symmetric cross product matrix for vector.

    The skew symmetric cross product matrix is defined such that
    np.cross(a, b) = np.dot(skew(a), b)
    """
    return numpy.array(
        [
            [0, -vector[2], vector[1]],
            [vector[2], 0, -vector[0]],
            [-vector[1], vector[0], 0],
        ]
    )


def angular_velocity_2(T, Tdot):
    """Angular velocity from frame 2 with respect to frame 1, resolved in frame 2 (skew(w)=T*der(transpose(T)))"""
    R = T.reshape(3, 3)
    Rdot = Tdot.reshape(3, 3)
    return numpy.array(
        [
            numpy.inner(R[2, :], Rdot[1, :]),
            -1 * numpy.inner(R[2, :], Rdot[0, :]),
            numpy.inner(R[1, :], Rdot[0, :]),
        ]
    )


def planar_rotation(e, angle):
    """Return transformation matrix of a planar rotation"""
    outer = numpy.outer(e, e)
    return (
        outer + (numpy.eye(3) - outer) * numpy.cos(angle) - skew(e) * numpy.sin(angle)
    )


def absolute_rotation(R, R_rel):
    """Return absolute orientation from another absolute and a relative orientation"""
    return (R_rel @ R.reshape(3, 3)).ravel()


def R_to_Q(R: "numpy.ndarray") -> "gp.gp_Quaternion":
    """Convert a rotation matrix in quaternion."""
    m = gp_Mat(*R.T.ravel().tolist())
    Q = gp_Quaternion()
    Q.SetMatrix(m)
    return Q


def Q_to_R(Q: "gp.gp_Quaternion") -> "numpy.ndarray":
    m = Q.GetMatrix()
    R = numpy.zeros((3, 3))
    for i in range(3):
        for j in range(3):
            R[j, i] = m.Value(i + 1, j + 1)

    return R


def R_residues(phi_0, R):
    # TODO simplify
    q = Rotation.from_rotvec(phi_0)
    Q = gp_Quaternion(*q.as_quat().tolist())
    Rres = Q_to_R(Q) @ R.T
    return numpy.array([Rres[1, 2], Rres[2, 0], Rres[0, 1]])


def axisRotation(axis, angle):
    """Return rotation object to rotate around one frame axis

    Args
        axis (int) : Rotate around 'axis' of frame 1 (min=1, max=3)
        angle (radian) : Rotation angle to rotate frame 1 into frame 2 along 'axis' of frame 1

    Returns
        Orientation object to rotate frame 1 into frame 2
    """

    if axis == 1:
        return numpy.array(
            [
                [1, 0, 0],
                [0, numpy.cos(angle), -numpy.sin(angle)],
                [0, numpy.sin(angle), numpy.cos(angle)],
            ]
        )
    elif axis == 2:
        return numpy.array(
            [
                [numpy.cos(angle), 0, numpy.sin(angle)],
                [0, 1, 0],
                [-numpy.sin(angle), 0, numpy.cos(angle)],
            ]
        )
    elif axis == 3:
        return numpy.array(
            [
                [numpy.cos(angle), -numpy.sin(angle), 0],
                [numpy.sin(angle), numpy.cos(angle), 0],
                [0, 0, 1],
            ]
        )
    else:
        raise ValueError(f"axis must be in [1, 2, 3]; got {axis}")


def axesRotations(angles, sequence=[1, 2, 3]):
    """Return fixed rotation object to rotate in sequence around fixed angles along 3 axes

    Args
        sequence (int[3]) Sequence of rotations from frame 1 to frame 2 along axis sequence[i] (min={1,1,1}, max={3,3,3})
        angles (radians[3]) Rotation angles around the axes defined in 'sequence'

    Returns
        Orientation object to rotate frame 1 into frame 2
    """

    return (
        axisRotation(sequence[2], angles[2])
        @ axisRotation(sequence[1], angles[1])
        @ axisRotation(sequence[0], angles[0])
    )
