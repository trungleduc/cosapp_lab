import {withStyles} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Toolbar from '@material-ui/core/Toolbar';
import PauseIcon from '@material-ui/icons/Pause';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import {Styles} from '@material-ui/styles/withStyles';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {Line2} from 'three/examples/jsm/lines/Line2.js';
import {LineGeometry} from 'three/examples/jsm/lines/LineGeometry.js';
import {LineMaterial} from 'three/examples/jsm/lines/LineMaterial.js';
import {colorNameToHex} from '../../../utils/tools';
import * as ReduxAction from '../../redux/actions';
import {StateInterface} from '../../redux/types';
interface AppProps {
  send_msg: any;
  model: any;
  displayStatus: boolean;
  classes: any;
  threeData: { [key: string]: any };
  timeStepList: string[];
  add3DData: any;
  updateSignal: number;
}

interface AppStates {
  selectedView: number;
  selectedUpDir: number;
  bgColor: string;
  selectedTime: number;
  playAnimation: boolean;
}
const styles: Styles<{}, {}> = () => ({
  textSizeSmall: {
    //fontSize: "0.75rem"
  },
  toolbarHeigt: {
    minHeight: 36,
    background: 'rgb(224 224 224)',
  },
  viewSelector: {
    minWidth: 120,
    //fontSize: "0.75rem",
    color: 'rgb(50, 50, 50)',
  },
  bgSelector: {
    minWidth: 60,
    //fontSize: "0.75rem",
    color: 'rgb(50, 50, 50)',
  },
  textColor: {
    color: 'rgb(50, 50, 50)',
  },
  backGround: {
    color: 'rgb(50, 50, 50)',
  },
});

const DARK_BG = 'linear-gradient(rgb(0, 0, 42), rgb(82, 87, 110))';
const LIGHT_BG = 'radial-gradient(#efeded, #8f9091)';

const getThreeData = (state: StateInterface) => {
  return {
    timeStepList: state.dashboardState.timeStepList,
  };
};

const mapStateToProps = (state: StateInterface) => {
  return getThreeData(state);
};

const mapDispatchToProps = (dispatch: (f: any) => void) => {
  return {
    add3DData: (data: any) => dispatch(ReduxAction.dashboardAdd3DData(data)),
  };
};

/**
 *
 * React component displaying the render window.
 * @class Plot3DView
 * @extends {Component<AppProps, AppStates>}
 */
export class Plot3DView extends Component<AppProps, AppStates> {
  geoData: any; // Geometry data received from backend
  divRef = React.createRef<HTMLDivElement>(); // Reference of render div
  scene: THREE.Scene; // Threejs scene
  camera: THREE.PerspectiveCamera; // Threejs camera
  renderer: THREE.WebGLRenderer; // Threejs render
  requestID: any = null; // ID of window.requestAnimationFrame
  controls: any; // Threejs control
  geometry: THREE.BufferGeometry; // Threejs BufferGeometry
  refLength: number; // Length of bounding box of current object
  gridHelper: THREE.GridHelper; // Threejs grid
  sceneAxe: (THREE.ArrowHelper | Line2)[]; // Array of  X, Y and Z axe
  shapeGroup: THREE.Group; // Group of object's shapes.
  animationInverval: any; //Interval used to create animation.
  sceneScaled: boolean; // Boolean to check if scene is scaled of not.
  computedScene: { [key: number]: any }; // Object contains time step as key
  // and computed scene as value.
  progressData: { time_step: number; data: any }; // Object contains geometry data for running computation.
  resizeTimeout: NodeJS.Timeout;
  /**
   *Creates an instance of Plot3DView.
   * @param {AppProps} props
   * @memberof Plot3DView
   */
  constructor(props: AppProps) {
    super(props);
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setDrawRange(0, 3 * 10000);
    this.refLength = 0;
    this.sceneAxe = [];
    this.shapeGroup = new THREE.Group();
    this.sceneScaled = false;
    this.computedScene = {};
    this.progressData = { time_step: -1, data: {} };
    this.state = {
      selectedView: 0,
      selectedUpDir: 30,
      bgColor: LIGHT_BG,
      selectedTime: 0,
      playAnimation: false,
    };
    this.resizeTimeout = null;
  }

  /**
   *
   *
   * @memberof Plot3DView
   */
  componentDidMount() {
    this.generateScene();
    window.addEventListener('resize', this.handleWindowResize);
    if (this.props.timeStepList.length > 1) {
      this.getDataHandle(0);
      this.setState({
        ...this.state,
        selectedTime: 1,
      });
    }
  }

  /**
   *
   *
   * @param {AppProps} oldProps
   * @param {AppStates} oldState
   * @memberof Plot3DView
   */
  componentDidUpdate(oldProps: AppProps, oldState: AppStates) {
    if (this.props.displayStatus) {
      this.resizeCanvasToDisplaySize();
    }
    if (this.state.selectedView !== oldState.selectedView) {
      this.updateCamera(this.state.selectedView);
    }

    if (this.state.selectedUpDir !== oldState.selectedUpDir) {
      this.updateUpDirection(this.state.selectedUpDir);
    }
    if (this.props.updateSignal !== oldProps.updateSignal) {
      this.computedScene = {};
      if (this.state.selectedTime !== 0) {
        this.getDataHandle(this.state.selectedTime - 1, true);
      }
    }
    if (
      this.props.timeStepList.length > 1 &&
      oldProps.timeStepList.length == 1
    ) {
      this.getDataHandle(0);
      this.setState({
        ...this.state,
        selectedTime: 1,
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
    window.cancelAnimationFrame(this.requestID);
    this.controls.dispose();
  }

  /**
   *
   *
   * @memberof Plot3DView
   */
  generateScene = () => {
    this.sceneSetup();
    this.startAnimationLoop();
    this.resizeCanvasToDisplaySize();
  };

  /**
   *
   *
   * @memberof Plot3DView
   */
  resizeCanvasToDisplaySize = () => {
    if (this.divRef.current !== null) {
      this.renderer.setSize(
        this.divRef.current.clientWidth,
        this.divRef.current.clientHeight,
        false
      );
      this.camera.aspect =
        this.divRef.current.clientWidth / this.divRef.current.clientHeight;
      this.camera.updateProjectionMatrix();
    }
  };

  /**
   *
   *
   * @memberof Plot3DView
   */
  handleWindowResize = () => {
    clearTimeout(this.resizeTimeout);
    // const width = this.divRef.current.clientWidth;
    // const height = this.divRef.current.clientHeight;
    // this.camera.aspect = width / height;
    // this.camera.updateProjectionMatrix();
    this.resizeTimeout = setTimeout(() => {
      this.forceUpdate();
    }, 500);
  };

  /**
   *
   *
   * @memberof Plot3DView
   */
  sceneSetup = () => {
    if (this.divRef.current !== null) {
      this.camera = new THREE.PerspectiveCamera(90, 2, 0.1, 1000);
      this.camera.position.set(8, 8, 8);
      this.camera.up.set(0, 0, 1);

      this.scene = new THREE.Scene();
      const size = 40;
      const divisions = 40;
      this.gridHelper = new THREE.GridHelper(
        size,
        divisions,
        0x888888,
        0x888888
      );
      this.gridHelper.geometry.rotateX(Math.PI / 2);

      this.scene.add(this.gridHelper);
      this.addSceneAxe(new THREE.Vector3(1, 0, 0), 0x00ff00);
      this.addSceneAxe(new THREE.Vector3(0, 1, 0), 0xff0000);
      this.addSceneAxe(new THREE.Vector3(0, 0, 1), 0xffff00);

      const lights = [];
      lights[0] = new THREE.AmbientLight(0x404040); // soft white light
      lights[1] = new THREE.PointLight(0xffffff, 1, 0);

      this.scene.add(lights[0]);
      this.camera.add(lights[1]);
      this.scene.add(this.camera);

      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
      });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setClearColor(0x000000, 0);
      this.renderer.setSize(500, 500, false);
      this.divRef.current.appendChild(this.renderer.domElement); // mount using React ref

      const controls = new OrbitControls(this.camera, this.renderer.domElement);
      // var controls = new TrackballControls(this.camera, this.renderer.domElement);
      controls.rotateSpeed = 1.0;
      controls.zoomSpeed = 1.2;
      controls.panSpeed = 0.8;
      controls.target.set(
        this.scene.position.x,
        this.scene.position.y,
        this.scene.position.z
      );
      this.controls = controls;
    }
  };

  /**
   *
   *
   * @memberof Plot3DView
   */
  addSceneAxe = (dir: THREE.Vector3, color: number) => {
    const origin = new THREE.Vector3(0, 0, 0);
    const length = 20;
    const arrowHelperX = new THREE.ArrowHelper(
      dir,
      origin,
      length,
      color,
      0.4,
      0.2
    );
    this.scene.add(arrowHelperX);
    const positions = [
      origin.x,
      origin.y,
      origin.z,
      length * dir.x,
      length * dir.y,
      length * dir.z,
    ];

    const lineColor = new THREE.Color(color);
    const colors = [
      lineColor.r,
      lineColor.g,
      lineColor.b,
      lineColor.r,
      lineColor.g,
      lineColor.b,
    ];
    const geo = new LineGeometry();
    geo.setPositions(positions);
    geo.setColors(colors);
    const matLine = new LineMaterial({
      linewidth: 1.5, // in pixels
      vertexColors: true,
    });
    matLine.resolution.set(800, 600);
    const line = new Line2(geo, matLine);
    this.sceneAxe.push(arrowHelperX, line);
    this.scene.add(line);
  };

  /**
   * This static function takes the key and  geometry
   * data then create the ThreeJs object from data. Depend on the
   * type of key (edge data, misc. data or shape date), the
   * coresponding object is created.
   *
   * @static
   * @memberof Plot3DView
   */
  static dataProcessing = (
    key: string,
    inputData: Array<any> | { [key: string]: any }
  ) => {
    const facesGroup = new THREE.Group();
    let newRefLength = 0;
    if (key.includes('edge')) {
      for (let index = 0; index < inputData.length; index++) {
        const data = inputData[index];
        const material = new THREE.LineBasicMaterial({
          linewidth: 10,
          color: 'black',
        });
        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array(data.vertices.length);
        for (let index = 0; index < data.vertices.length; index++) {
          vertices[index] = data.vertices[index];
        }
        geometry.setAttribute(
          'position',
          new THREE.BufferAttribute(vertices, 3, false)
        );
        geometry.setIndex(data.faces);
        const mesh = new THREE.Line(geometry, material);
        mesh.quaternion.set(
          data.quat[0],
          data.quat[1],
          data.quat[2],
          data.quat[3]
        );
        mesh.position.set(data.pos[0], data.pos[1], data.pos[2]);
        facesGroup.add(mesh);
      }
    } else if (key.includes('misc')) {
      // Draw misc data

      for (const misc_key in inputData) {
        const misc_data: Array<any> = inputData[misc_key];
        if (misc_key === 'points') {
          misc_data.forEach((pointData) => {
            const pointPosition: Array<number> = pointData['position'];
            let radius: number;
            let color: string;
            if (pointData.hasOwnProperty('radius')) {
              radius = pointData['radius'];
            } else {
              radius = 0.1;
            }
            if (pointData.hasOwnProperty('color')) {
              color = pointData['color'];
            } else {
              color = 'yellow';
            }

            const geometry = new THREE.SphereBufferGeometry(radius);
            const material = new THREE.MeshBasicMaterial({ color: color });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(
              pointPosition[0],
              pointPosition[1],
              pointPosition[2]
            );
            facesGroup.add(sphere);
            const refLength = 1.5 * radius;
            newRefLength = Math.max(newRefLength, refLength);
          });
        } else if (misc_key === 'vectors') {
          misc_data.forEach((vectorData) => {
            let color: number;
            if (vectorData.hasOwnProperty('color')) {
              color = colorNameToHex(vectorData['color']);
            } else {
              color = 0x3900f2;
            }
            const position = new THREE.Vector3(
              vectorData['position'][0],
              vectorData['position'][1],
              vectorData['position'][2]
            );
            const dir = new THREE.Vector3(
              vectorData['direction'][0],
              vectorData['direction'][1],
              vectorData['direction'][2]
            );
            const length = dir.length();
            dir.normalize();
            const arrow = new THREE.ArrowHelper(
              dir,
              position,
              length,
              color,
              0.4,
              0.2
            );
            facesGroup.add(arrow);
            const refLength = 1.5 * length;
            newRefLength = Math.max(newRefLength, refLength);
          });
        }
      }
    } else {
      for (let index = 0; index < inputData.length; index++) {
        const data = inputData[index];

        let material;
        if (data.transparent) {
          material = new THREE.MeshPhongMaterial({
            color: data.color,
            side: THREE.DoubleSide,
            transparent: data.transparent,
            opacity: 0.33,
            wireframe: false,
            flatShading: true,
          });
        } else {
          material = new THREE.MeshPhongMaterial({
            color: data.color,
            side: THREE.DoubleSide,
            wireframe: false,
            flatShading: true,
          });
        }

        // let vertices = new Float32Array(data.vertices.length);
        // vertices.set(data.vertices)
        // for (let index = 0; index < data.vertices.length; index++) {
        //   vertices[index] = data.vertices[index];
        // }
        // let faces = new Int32Array(data.faces.length);
        // for (let index = 0; index < data.faces.length; index++) {
        //   faces[index] = data.faces[index];
        // }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          'position',
          new THREE.BufferAttribute(data.vertices, 3, false)
        );
        geometry.setIndex(data.faces);
        geometry.computeVertexNormals();

        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
        const bbox = geometry.boundingBox;
        const boxSizeVec = new THREE.Vector3();
        bbox.getSize(boxSizeVec);
        const refLength = Math.max(boxSizeVec.x, boxSizeVec.y, boxSizeVec.z);
        newRefLength = Math.max(newRefLength, refLength);

        const mesh = new THREE.Mesh(geometry, material);
        mesh.quaternion.set(
          data.quat[0],
          data.quat[1],
          data.quat[2],
          data.quat[3]
        );
        mesh.position.set(data.pos[0], data.pos[1], data.pos[2]);
        facesGroup.add(mesh);
      }
    }

    return { facesGroup, newRefLength };
  };

  /**
   *
   *
   * @memberof Plot3DView
   */
  updateGeo = (shapeIndex: number, shapeData: any, forceUpdate = false) => {
    if (this.computedScene.hasOwnProperty(shapeIndex) && !forceUpdate) {
      for (const key in this.computedScene[shapeIndex]) {
        if (this.computedScene[shapeIndex].hasOwnProperty(key)) {
          const facesGroup: THREE.Group = this.computedScene[shapeIndex][key];
          this.shapeGroup.add(facesGroup);
        }
      }
      this.scene.add(this.shapeGroup);
    } else {
      this.computedScene[shapeIndex] = {};
      for (const key in shapeData) {
        if (shapeData.hasOwnProperty(key)) {
          const { facesGroup, newRefLength } = Plot3DView.dataProcessing(
            key,
            shapeData[key]
          );

          this.refLength = Math.max(newRefLength, this.refLength);
          this.computedScene[shapeIndex][key] = facesGroup;
          this.shapeGroup.add(facesGroup);
        }
      }
      this.scene.add(this.shapeGroup);
    }
  };

  /**
   *
   *
   * @memberof Plot3DView
   */
  updateCamera = (cam: number) => {
    let length = 0;
    if (this.refLength == 0) {
      length = 8;
    } else {
      length = 2 * this.refLength;
    }
    if (cam == 0) {
      this.camera.position.set(length, length, length);
    } else if (cam == 10) {
      this.camera.position.set(length, 0, 0);
    } else if (cam == 20) {
      this.camera.position.set(0, length, 0);
    } else if (cam == 30) {
      this.camera.position.set(0, 0, length);
    }
  };

  /**
   * Update up direction of camera
   * @param cam
   * @memberof Plot3DView
   */
  updateUpDirection = (cam: number) => {
    window.cancelAnimationFrame(this.requestID);
    this.controls.dispose();
    if (cam == 10) {
      this.camera.up.set(1, 0, 0);
    } else if (cam == 20) {
      this.camera.up.set(0, 1, 0);
    } else if (cam == 30) {
      this.camera.up.set(0, 0, 1);
    }

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // var controls = new TrackballControls(this.camera, this.renderer.domElement);
    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.2;
    this.controls.panSpeed = 0.8;
    this.controls.target.set(
      this.scene.position.x,
      this.scene.position.y,
      this.scene.position.z
    );
    this.startAnimationLoop();
  };

  startAnimationLoop = () => {
    this.requestID = window.requestAnimationFrame(this.startAnimationLoop);
    this.controls.update();
    this.renderer.clearDepth();
    this.renderer.render(this.scene, this.camera);
  };

  cleanScene = () => {
    this.scene.remove(this.shapeGroup);
    this.shapeGroup = new THREE.Group();
  };

  /**
   *
   *
   * @memberof Plot3DView
   */
  getDataHandle = (index: number, forceUpdate = false) => {
    this.cleanScene();

    let geoData: { [key: string]: any[] };
    if (this.props.threeData.hasOwnProperty(index)) {
      geoData = this.props.threeData[index];
    } else {
      return;
    }

    this.updateGeo(index, geoData, forceUpdate);

    if (!this.sceneScaled) {
      this.camera.lookAt(this.scene.position);
      this.camera.position.set(
        2 * this.refLength,
        2 * this.refLength,
        2 * this.refLength
      );
      this.camera.far = 40 * this.refLength;
      this.gridHelper.scale.multiplyScalar(this.refLength / 5);
      for (let index = 0; index < this.sceneAxe.length; index++) {
        this.sceneAxe[index].scale.multiplyScalar(this.refLength / 5);
      }
      this.sceneScaled = true;
    }

    this.renderer.render(this.scene, this.camera);
  };

  handleNextBtn = () => {
    let newIndex;
    this.setState(
      (prevState: AppStates) => {
        newIndex = prevState.selectedTime + 1;
        if (newIndex < this.props.timeStepList.length) {
          return { ...prevState, selectedTime: newIndex };
        } else if (
          newIndex === this.props.timeStepList.length &&
          newIndex !== 1
        ) {
          return { ...prevState, selectedTime: 1 };
        } else {
          return prevState;
        }
      },
      () => {
        if (this.state.selectedTime !== 0) {
          this.getDataHandle(this.state.selectedTime - 1);
        }
      }
    );
  };
  handlePreviousBtn = () => {
    let newIndex;
    this.setState(
      (prevState: AppStates) => {
        newIndex = prevState.selectedTime - 1;
        if (newIndex > 0) {
          return { ...prevState, selectedTime: newIndex };
        } else if (newIndex === 0) {
          return {
            ...prevState,
            selectedTime: this.props.timeStepList.length - 1,
          };
        } else {
          return prevState;
        }
      },
      () => {
        if (this.state.selectedTime !== 0) {
          this.getDataHandle(this.state.selectedTime - 1);
        }
      }
    );
  };
  handlePlayBtn = () => {
    if (this.props.timeStepList.length === 1) {
      return;
    }
    if (this.state.playAnimation) {
      clearInterval(this.animationInverval);
      this.setState({ ...this.state, playAnimation: false });
    } else {
      this.animationInverval = setInterval(() => {
        let newIndex;
        this.setState((prevState: AppStates) => {
          newIndex = prevState.selectedTime + 1;
          if (newIndex < this.props.timeStepList.length) {
            return {
              ...prevState,
              selectedTime: newIndex,
              playAnimation: true,
            };
          } else if (
            newIndex === this.props.timeStepList.length &&
            newIndex !== 1
          ) {
            newIndex = 1;
            return { ...prevState, selectedTime: 1, playAnimation: true };
          } else {
            newIndex = prevState.selectedTime;
            return { ...prevState, playAnimation: true };
          }
        });
        if (newIndex !== 0) {
          this.getDataHandle(newIndex - 1);
        }
      }, 40);
    }
  };
  render() {
    const { classes } = this.props;
    return (
      <div className={'cosapp-widget-box'}>
        <div
          ref={this.divRef}
          style={{
            width: '100%',
            height: 'calc(100% - 36px)',
            background: this.state.bgColor, //"radial-gradient(#efeded, #8f9091)"
          }}
        />
        <Toolbar variant='dense' classes={{ dense: classes.toolbarHeigt }}>
          <FormControl style={{ marginRight: 10 }}>
            <Select
              value={this.state.selectedView}
              classes={{
                icon: classes.textColor,
                select: classes.viewSelector,
              }}
              onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                this.setState({
                  ...this.state,
                  selectedView: event.target.value as number,
                });
              }}
            >
              <MenuItem value={0}>3D</MenuItem>
              <MenuItem value={10}>Orientation X</MenuItem>
              <MenuItem value={20}>Orientation Y</MenuItem>
              <MenuItem value={30}>Orientation Z</MenuItem>
            </Select>
          </FormControl>
          <FormControl style={{ marginRight: 10 }}>
            <Select
              value={this.state.selectedUpDir}
              classes={{
                icon: classes.textColor,
                select: classes.viewSelector,
              }}
              onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                this.setState({
                  ...this.state,
                  selectedUpDir: event.target.value as number,
                });
              }}
            >
              <MenuItem value={10}>X Direction</MenuItem>
              <MenuItem value={20}>Y Direction</MenuItem>
              <MenuItem value={30}>Z Direction</MenuItem>
            </Select>
          </FormControl>
          {/* <FormControl style={{ marginRight: 10 }}>
            <Select
              value={this.state.bgColor}
              classes={{ icon: classes.textColor, select: classes.bgSelector }}
              onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                this.setState({
                  ...this.state,
                  bgColor: event.target.value as string
                });
              }}>
              <MenuItem value={DARK_BG}>Dark</MenuItem>
              <MenuItem value={LIGHT_BG}>Light</MenuItem>
            </Select>
          </FormControl> */}
          <FormControl style={{ marginRight: 10 }}>
            <Select
              value={this.state.selectedTime}
              classes={{
                icon: classes.textColor,
                select: classes.viewSelector,
              }}
              onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                const index = event.target.value as number;
                if (index !== 0) {
                  this.getDataHandle(index - 1);
                }
                this.setState({
                  ...this.state,
                  selectedTime: index,
                });
              }}
            >
              {this.props.timeStepList.map((name, index) => {
                return (
                  <MenuItem key={index} value={index}>
                    {name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {/* <Button
            onClick={this.handlePreviousBtn}
            classes={{ root: classes.textColor }}>
            <SkipPreviousIcon />
          </Button> */}
          <Button
            onClick={this.handlePlayBtn}
            classes={{ root: classes.textColor }}
          >
            {this.state.playAnimation ? <PauseIcon /> : <PlayArrowIcon />}
          </Button>
          {/* <Button
            onClick={this.handleNextBtn}
            classes={{ root: classes.textColor }}>
            <SkipNextIcon />
          </Button> */}
        </Toolbar>
      </div>
    );
  }
}

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(Plot3DView)
);
