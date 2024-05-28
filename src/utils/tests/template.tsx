import { withStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import { Theme } from '@material-ui/core/styles';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Styles } from '@material-ui/styles/withStyles';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import * as ReduxAction from '../redux/actions';
import { StateInterface } from '../redux/types';

const styles: Styles<Theme, {}> = (theme: Theme) => ({});

interface AppProps {
  classes: any;
}
interface AppState {}

const mapStateToProps = (state: StateInterface) => {
  return {};
};

const mapDispatchToProps = (dispatch: (f: any) => void) => {
  return {};
};

export class Template extends Component<AppProps, AppState> {
  render() {
    const { classes } = this.props;
    return <div></div>;
  }
}

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(Template)
);
