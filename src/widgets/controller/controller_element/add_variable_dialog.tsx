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

import * as ReduxAction from '../../redux/actions';
import { StateInterface } from '../../redux/types';

const styles: Styles<Theme, any> = (theme: Theme) => ({
  formControl: {
    padding: theme.spacing(1),
    minWidth: 300,
    width: '100%'
  }
});

/**
 * Selector to get state from redux store.
 * @param state
 */
const getVariableList = (state: StateInterface) => {
  return {
    variableData: state.dashboardState.variableData,
    selectedVariable: state.dashboardState.selectedVariable
  };
};

const mapStateToProps = (state: StateInterface) => {
  return getVariableList(state);
};

/**
 *
 * @param dispatch
 */
const mapDispatchToProps = (dispatch: (f: any) => void) => {
  return {
    addParameterController: (variableName: string, value: number) =>
      dispatch(ReduxAction.dashboardAddController(variableName, value)),
    removeParameterController: (variableName: string) =>
      dispatch(ReduxAction.dashboardRemoveController(variableName))
  };
};

interface AppStates {
  open: boolean;
  selectedVar: string;
}

interface AppProps {
  closeHandle: () => void;
  open: boolean;
  classes: any;
  variableData: { [key: string]: any };
  selectedVariable: { [key: string]: number };
  addParameterController: (variableName: string, value: number) => void;
}

/**
 *
 * React component displaying the modal to add new controller.
 * @class AddVariableDialog
 * @extends {Component<AppProps, AppStates>}
 */
class AddVariableDialog extends Component<AppProps, AppStates> {
  systemList: string[]; // List a available variable in system.

  /**
   *Creates an instance of AddVariableDialog.
   * @param {AppProps} props - React properties object. This object should
   * contain the following properties:
   *
   * @param {() => void} props.closeHandle - Handle to close modal.
   *
   * @param {boolean} open - open / close status of modal.
   *
   * @param {[key: string]: any} variableData - Object with variable name as key and
   * the data of this variable as value.
   *
   * @param {[key: string]: number} selectedVariable -Object with selected variable
   *  as name and value of its controller as value.
   *
   * @memberof AddVariableDialog
   */
  constructor(props: AppProps) {
    super(props);
    this.state = { open: false, selectedVar: '' };
    this.systemList = [];

    Object.keys(this.props.variableData).forEach(key => {
      if (typeof this.props.variableData[key].value === 'number') {
        this.systemList.push(key);
      } else if (Array.isArray(this.props.variableData[key].value)) {
        for (
          let idx = 0;
          idx < this.props.variableData[key].value.length;
          idx++
        ) {
          this.systemList.push(key + '[' + idx + ']');
        }
      } else {
        //
      }
    });
  }

  /**
   *
   *
   * @param {AppProps} oldProps
   * @param {AppStates} oldState
   * @memberof AddVariableDialog
   */
  componentDidUpdate(oldProps: AppProps, _: AppStates) {
    if (this.props.selectedVariable !== oldProps.selectedVariable) {
      //
    }
  }

  /**
   *
   *
   * @memberof AddVariableDialog
   */
  handleOpen = () => {
    this.setState({ open: true });
  };

  /**
   *
   *
   * @memberof AddVariableDialog
   */
  handleClose = () => {
    this.setState({ open: false });
  };

  /**
   *
   *
   * @memberof AddVariableDialog
   */
  handleVariableChange = (event: React.ChangeEvent<any>, value: string) => {
    this.setState({ ...this.state, selectedVar: value });
  };

  handdleAddBtnClick = () => {
    const regExp = /\[([^)]+)\]/;
    let varName;
    let varIdx = '-1';
    let varValue;
    const match = regExp.exec(this.state.selectedVar);
    if (match) {
      varName = this.state.selectedVar.replace(match[0], '');
      varIdx = match[1];
      varValue = this.props.variableData[varName].value[parseInt(varIdx)];
    } else {
      varName = this.state.selectedVar;
      varValue = this.props.variableData[this.state.selectedVar].value;
    }
    this.props.addParameterController(this.state.selectedVar, varValue);
  };

  /**
   *
   *
   * @memberof AddVariableDialog
   */
  render() {
    const classes = this.props.classes;
    return (
      <Dialog
        keepMounted={true}
        open={this.props.open}
        onClose={this.handleClose}
        aria-labelledby="form-dialog-title"
        fullWidth={true}
        maxWidth="sm"
      >
        <DialogTitle>Add new controller</DialogTitle>
        <DialogContent style={{ overflowY: 'unset' }}>
          <FormControl className={classes.formControl}>
            <Autocomplete
              value={this.state.selectedVar}
              onChange={this.handleVariableChange}
              options={this.systemList}
              getOptionLabel={(option: string) =>
                option.split('.').slice(1).join('.')
              }
              defaultValue={this.systemList[0]}
              renderInput={params => (
                <TextField
                  {...params}
                  variant="standard"
                  label="Select variable"
                  placeholder=""
                  fullWidth
                />
              )}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={this.props.closeHandle}>
            close
          </Button>
          <Button color="primary" onClick={this.handdleAddBtnClick}>
            add
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(AddVariableDialog)
);
