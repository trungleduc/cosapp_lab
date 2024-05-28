import { withStyles } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import Popover from '@material-ui/core/Popover';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import { Theme } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import { Styles } from '@material-ui/styles/withStyles';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import * as ReduxAction from '../../redux/actions';
import { create_UUID } from '../../../utils/tools';
import { IDict, StateInterface } from '../../redux/types';

const styles: Styles<Theme, any> = (theme: Theme) => ({
  popover: {
    pointerEvents: 'none'
  },
  paper: {
    padding: theme.spacing(1)
  }
});

const getVariableList = (state: StateInterface) => {
  return { portMetaData: state.dashboardState.portMetaData };
};

const mapStateToProps = (state: StateInterface) => {
  return getVariableList(state);
};

const mapDispatchToProps = (dispatch: (f: any) => void) => {
  return {
    removeParameterController: (variableName: string) =>
      dispatch(ReduxAction.dashboardRemoveController(variableName)),
    updateHandle: (key: string, val: number) =>
      dispatch(ReduxAction.dashboardUpdateController(key, val))
  };
};

interface AppStates {
  value: number;
  desc: string;
  range: Array<number>;
  unit: string;
  anchorEl: any;
}

interface AppProps {
  value: number;
  variableName: string;
  classes: any;
  portMetaData: IDict<any>;
  removeParameterController: (varName: string) => void;
  updateHandle: (key: string, val: number) => void;
}

/**
 *
 * React component displaying the variable controller.
 * @class ParameterController
 * @extends {Component<AppProps, AppStates>}
 */
class ParameterController extends Component<AppProps, AppStates> {
  initialVal: number; // Default value of controller.
  _uuid: string;
  /**
   *Creates an instance of ParameterController.
   * @param {AppProps} props
   * @memberof ParameterController
   */
  constructor(props: AppProps) {
    super(props);
    this.initialVal = Number(props.value.toPrecision(3));
    let varName: string;
    if (this.props.variableName.endsWith(']')) {
      const idx = this.props.variableName.indexOf('[');
      varName = this.props.variableName.slice(0, idx);
    } else {
      varName = this.props.variableName;
    }
    const { desc, range, unit } = this.getMetaData(varName);
    this.state = { value: this.initialVal, desc, range, unit, anchorEl: null };
    this._uuid = create_UUID();
  }

  /**
   *
   *
   * @memberof ParameterController
   */
  handleSliderChange = (event: any, newValue: number) => {
    const newVal = Number(newValue.toPrecision(3));
    this.setState({
      value:
        Math.abs(newVal) < 0.00001 ? Number(newVal.toExponential()) : newVal
    });
  };

  getMetaData = (
    varPath: string
  ): {
    desc: string | null;
    unit: string | null;
    range: Array<number> | null;
  } => {
    const pathList = varPath.split('.');
    const pathLength = pathList.length;
    const variableName = pathList[pathLength - 1];
    const portName = pathList[pathLength - 2];
    const sysPath = pathList.slice(0, pathLength - 2).join('.');
    const metaData = this.props.portMetaData[sysPath][portName][variableName];
    const { desc, limits, valid_range, unit } = metaData;
    let range;
    if (limits) {
      range = limits;
    } else if (valid_range) {
      range = valid_range;
    } else {
      range = null;
    }
    return { desc, range, unit };
  };

  /**
   *
   *
   * @memberof ParameterController
   */
  handleInputChange = (
    event: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    this.setState(
      {
        value: event.target.value === '' ? 0 : Number(event.target.value)
      },
      () => {
        this.props.updateHandle(this.props.variableName, this.state.value);
      }
    );
  };

  handlePopoverOpen = event => {
    const target = event.currentTarget;
    if (target) {
      this.setState(old => ({ ...old, anchorEl: target }));
    }
  };
  handlePopoverClose = () => {
    this.setState(old => ({ ...old, anchorEl: null }));
  };
  render() {
    const { desc, range, unit } = this.state;
    const title = (
      <Typography
        aria-owns={this.state.anchorEl ? this._uuid : undefined}
        aria-haspopup="true"
        onMouseEnter={desc ? this.handlePopoverOpen : null}
        onMouseLeave={desc ? this.handlePopoverClose : null}
      >
        {this.props.variableName}
      </Typography>
    );
    let sliderProps;
    let inputProps;
    if (range) {
      sliderProps = {
        min: range[0],
        max: range[1],
        step: Math.abs(range[1] - range[0]) / 100
      };
      inputProps = {
        step: Math.abs(range[1] - range[0]) / 100,
        min: range[0],
        max: range[1],
        type: 'number',
        'aria-labelledby': 'input-slider'
      };
    } else {
      sliderProps = {};
      inputProps = { type: 'number', 'aria-labelledby': 'input-slider' };
    }

    const slider = (
      <Slider
        {...sliderProps}
        value={this.state.value}
        onChange={this.handleSliderChange}
        onChangeCommitted={() => {
          this.props.updateHandle(this.props.variableName, this.state.value);
        }}
        aria-labelledby="input-slider"
      />
    );
    const input = (
      <Input
        value={this.state.value}
        margin="dense"
        onChange={event => {
          this.setState({
            value: event.target.value as any
          });
        }}
        inputProps={inputProps}
        onBlur={this.handleInputChange}
      />
    );
    const classes = this.props.classes;
    let popover;
    if (desc) {
      popover = (
        <Popover
          id={this._uuid}
          className={classes.popover}
          classes={{
            paper: classes.paper
          }}
          open={Boolean(this.state.anchorEl)}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}
          onClose={this.handlePopoverClose}
          disableRestoreFocus
        >
          <Typography>
            {desc} - unit : {unit ? unit : 'undefined'}
          </Typography>
        </Popover>
      );
    }
    return (
      <div
        style={{
          padding: '10px 10px 10px 10px',
          borderBottom: 'solid 0.5px black'
        }}
      >
        {desc ? popover : <div />}
        {range ? title : <div />}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={7}>
            {range ? slider : title}
          </Grid>
          <Grid item xs={3}>
            {input}
          </Grid>
          <Grid item xs={2}>
            <IconButton
              aria-label="delete"
              onClick={() => {
                this.props.removeParameterController(this.props.variableName);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(ParameterController)
);
