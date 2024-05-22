import {withStyles} from '@material-ui/core';
import {Styles} from '@material-ui/styles/withStyles';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as ReduxAction from '../../redux/actions';
import {StateInterface} from '../../redux/types';
import Plot3DView from './3dview';

/**
 *
 *
 * @param {StateInterface} state
 * @returns
 */
const mapStateToProps = (state: StateInterface) => {
  return {};
};

/**
 *
 *
 * @param {(f: any) => void} dispatch
 * @returns
 */
const mapDispatchToProps = (dispatch: (f: any) => void) => {
  return {
    add3DData: (data: any) => dispatch(ReduxAction.dashboardAdd3DData(data)),
  };
};

const styles: Styles<{}, {}> = () => ({
  root: {
    height: '100%',
    flexGrow: 1,
  },
  paper: {
    background: 'aliceblue',
    height: '100%',
  },
});

interface AppProps {
  send_msg: any;
  model: any;
  classes: any;
  add3DData: (data: any) => void;
}

interface AppState {
  threeData: { [key: string]: any };
  updateSignal: number;
}

/**
 *
 * React component displaying the dashboard panel
 * @class GeometryElement
 * @extends {Component<AppProps, AppState>}
 */
class GeometryElement extends Component<AppProps, AppState> {
  divRef: any;
  time_step: number;
  buffer_data: { [key: number]: any };
  /**
   * Build a new object.
   *
   * @param props - React properties object. This object should
   * contain the following properties:
   *
   * @param props.model - Current jupyterlab model of widget.
   *
   * @param props.send_msg - Function to send message to backend.
   *
   * @param props.classes - Class for applying style to component.
   * This props is created from `withStyles`.
   *
   * @param props.add3DData - Function to dispatch 3D data to redux store.
   * This props is mapped from store.
   *
   */
  constructor(props: AppProps) {
    super(props);
    props.model.listenTo(props.model, 'msg:custom', this.on_msg);
    const geo_data = {}; // this.props.model.get("geo_data");
    const step_data = [];
    for (let index = 0; index < Object.keys(geo_data).length; index++) {
      step_data.push('Time step ' + index.toString());
    }
    this.props.add3DData(step_data);

    this.state = { threeData: geo_data, updateSignal: 0 };

    this.divRef = React.createRef<any>();
    this.time_step = 0;
    this.buffer_data = {};
  }

  on_msg = (
    data: { type: string; payload: { [key: string]: any } },
    buffer: any[]
  ) => {
    const { type, payload } = data;
    switch (type) {
      case 'GeometryView::geo_data': {
        const threejs_data = payload['threejs_data'];
        const binary_position = payload['binary_position'];
        const time_step = payload['time_step'];
        for (const shape_idx in binary_position) {
          const pos_data = binary_position[shape_idx];
          const face_length = (pos_data[1] - pos_data[0] + 1) / 2;
          for (let idx = 0; idx < face_length; idx++) {
            const vertices = new Float64Array(
              buffer[pos_data[0] + 2 * idx].buffer
            );
            const faces = new Uint16Array(
              buffer[pos_data[0] + 2 * idx + 1].buffer
            );
            const new_vertices = new Float32Array(vertices.length);
            new_vertices.set(vertices);
            threejs_data[shape_idx][idx]['vertices'] = new_vertices;
            threejs_data[shape_idx][idx]['faces'] = Array.from(faces);
          }
        }
        this.buffer_data[time_step] = threejs_data;
        if ('remaining' in payload && payload['remaining'] == 0) {
          this.computedUpdate();
        }
        break;
      }
      case 'GeometryView::update_signal': {
        this.computedUpdate();
        break;
      }
    }
  };

  componentDidMount = () => {
    this.props.send_msg({ action: 'GeometryView::requestInitialGeometry' });
  };

  /**
   *
   * Clear update interval once the component is unmounted.
   * @memberof GeometryElement
   */
   componentWillUnmount = () => {
    this.props.model.stopListening(this.props.model, 'msg:custom', this.on_msg);
  };

  /**
   * Update render window after each time step
   *
   * @memberof GeometryElement
   */
  updateScene = () => {};

  /**
   *
   * This function is called once the computation is finished.
   * Geometry data from backend will be stored to internal state
   * and computing state will be set to `false`
   * @memberof GeometryElement
   */
  computedUpdate = () => {
    const step_data = [];

    for (let index = 0; index < Object.keys(this.buffer_data).length; index++) {
      step_data.push('Time step ' + index.toString());
    }
    this.props.add3DData(step_data);

    this.setState(
      (prevState: AppState) => ({
        ...prevState,
        threeData: { ...this.buffer_data },
      }),
      () => {
        this.updateRender();
        this.time_step = 0;
        this.buffer_data = {};
      }
    );
  };

  /**
   *
   * Send update signal to `Plot3DView` component.
   * @memberof GeometryElement
   */
  updateRender = () => {
    this.setState((prevState: AppState) => ({
      ...prevState,
      updateSignal: prevState.updateSignal + 1,
    }));
  };

  render() {
    return (
      <Plot3DView
        model={this.props.model}
        send_msg={this.props.send_msg}
        displayStatus={true}
        threeData={this.state.threeData}
        updateSignal={this.state.updateSignal}
      />
    );
  }
}

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(GeometryElement)
);
