import { withStyles } from '@material-ui/core';
import { Styles } from '@material-ui/styles/withStyles';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import * as ReduxAction from '../redux/actions';
import { StateInterface } from '../redux/types';

const styles: Styles<any, any> = () => ({});

const getStoreData = (state: StateInterface) => {
  return {
    computingState: state.dashboardState.computing,
    selectedVariable: state.dashboardState.selectedVariable,
    systemConfig: state.systemConfig
  };
};

const mapStateToProps = (state: StateInterface) => {
  return getStoreData(state);
};

const mapDispatchToProps = (dispatch: (f: any) => void) => {
  return {
    updateComputedResult: (data: {
      variable: { [key: string]: any };
      recorder: { [key: string]: any };
      driver: { [key: string]: any };
    }) => dispatch(ReduxAction.dashboardUpdateComputedResult(data))
  };
};

interface AppProps {
  send_msg: any;
  model: any;
  CompClass: any;
  updateComputedResult: (data: {
    variable: { [key: string]: any };
    recorder: { [key: string]: any };
    driver: { [key: string]: any };
  }) => void;
}

export class ElementWrapper extends Component<AppProps, any> {
  constructor(props: AppProps) {
    super(props);
    props.model.listenTo(props.model, 'msg:custom', this.on_msg);
  }

  on_msg = (data: { type: string; payload: { [key: string]: any } }) => {
    const { type, payload } = data;
    if (type.includes('::update_signal')) {
      this.computedUpdate(payload as any);
    }
  };
  componentWillUnmount = () => {
    this.props.model.stopListening(this.props.model, 'msg:custom', this.on_msg);
  };

  computedUpdate = (payload: {
    computed_data: { [key: string]: any };
    recorder_data: { [key: string]: any };
    driver_data: { [key: string]: any };
  }) => {
    const computedResult = payload['computed_data'];
    const recorderData = payload['recorder_data'];
    const driverData = payload['driver_data'];

    this.props.updateComputedResult({
      variable: computedResult,
      recorder: recorderData,
      driver: driverData
    });
  };

  render() {
    return (
      <this.props.CompClass
        ref={null}
        id={0}
        initialState={null}
        send_msg={this.props.send_msg}
        model={this.props.model}
      />
    );
  }
}

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(ElementWrapper)
);
