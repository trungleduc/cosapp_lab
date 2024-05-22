import { withStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import { Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Edit from '@material-ui/icons/Edit';
import SettingsIcon from '@material-ui/icons/Settings';
import { Styles } from '@material-ui/styles/withStyles';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/comment-fold';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/mode/python/python';
import 'codemirror/theme/material.css';
import 'flexlayout-react/style/light.css';
import React, { Component, forwardRef } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import Draggable from 'react-draggable';
import { connect } from 'react-redux';

import { create_UUID } from '../../../utils/tools';
import { IDict, StateInterface } from '../../redux/types';

function PaperComponent(props: PaperProps) {
  return (
    <Draggable
      handle='.draggable-dialog-title'
      cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

const styles: Styles<any, any> = (theme: Theme) => ({
  textSizeSmall: {
    //fontSize: "0.75rem"
  },
  toolbarHeigt: {
    minHeight: 36,
    background: 'rgb(50, 50, 50)',
  },
  viewSelector: {
    minWidth: 120,
    //fontSize: "0.75rem",
    color: 'rgb(250, 250, 250)',
  },
  bgSelector: {
    minWidth: 60,
    //fontSize: "0.75rem",
    color: 'rgb(250, 250, 250)',
  },
  textColor: {
    color: 'rgb(250, 250, 250)',
  },
  backGround: {
    color: 'rgb(50, 50, 50)',
  },
  formControl: {
    padding: '10px 5% 0px 5%;',
    width: '90%',
  },
  formControlShort: {
    padding: theme.spacing(1),
    width: 'calc(50% - 16px)',
  },
  formControlTiny: {
    width: '22%',
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: '90%',
  },
  bottomBarDiv: {
    width: '100%',
    height: '35px',
    background: '#e0e0e0',
    display: 'flex',
    flexDirection: 'row-reverse',
  },
});

const getStoreData = (state: StateInterface) => {
  return { systemConfig: state.systemConfig };
};

const mapStateToProps = (state: StateInterface) => {
  return getStoreData(state);
};

const mapDispatchToProps = (dispatch: (f: any) => void) => {
  return {};
};

export interface IAvailableWidget {
  pythonCode: string;
  id: string;
  widgetName: string;
}

interface IAppProps {
  send_msg: any;
  model: any;
  classes: any;
  id: string;
  initialState: IDict<any>;
  availableWidget: IDict<IAvailableWidget>;
  systemConfig: IDict<any>;
}

interface IAppStates {
  traceConfig: {
    pythonCode: string;
    widgetName: string;
  };
  openSetting: boolean;
  openEdit: boolean;
  selectedWidget: string;
}

function betterTab(cm) {
  if (cm.somethingSelected()) {
    cm.indentSelection('add');
  } else {
    cm.replaceSelection(
      cm.getOption('indentWithTabs')
        ? '\t'
        : Array(cm.getOption('indentUnit') + 1).join(' '),
      'end',
      '+input'
    );
  }
}

/**
 *
 * React component displaying the render window.
 * @class WidgetViewer
 * @extends {Component<IAppProps, IAppStates>}
 */
export class WidgetViewer extends Component<IAppProps, IAppStates> {
  /**
   *Creates an instance of WidgetViewer.
   * @param {IAppProps} props
   * @memberof WidgetViewer
   */

  initialState: IDict<IDict<any>>;
  divID: string;

  constructor(props: IAppProps) {
    super(props);
    this.initialState = props.initialState;
    this.divID = `widget-viewer-${create_UUID()}`;

    let selectedWidget = '';
    let widgetName = '';
    for (const [key, value] of Object.entries(this.props.availableWidget)) {
      if (value.id === this.props.id) {
        selectedWidget = key;
        widgetName = value['widgetName'];
      }
    }

    this.state = {
      traceConfig: {
        pythonCode: `# Define widget generation function here

import ipywidgets as widgets
from cosapp.systems import System
def generate_widget(sys : System)-> widgets.Widget:
    pass
`,
        widgetName,
      },
      openSetting: false,
      openEdit: false,
      selectedWidget,
    };
  }

  componentDidMount() {
    if (this.initialState) {
      const { pythonCode = '' } = this.initialState.traceConfig;

      this.setState(
        (old) => {
          return {
            ...old,
            traceConfig: { ...old.traceConfig, pythonCode },
          };
        },
        () => {
          this.props.send_msg({
            action: 'WidgetViewer::executeCode',
            payload: {
              code: pythonCode,
              title: this.divID,
            },
          });
        }
      );
    }
  }

  /**
   *
   *
   * @param {IAppProps} oldProps
   * @param {IAppStates} oldState
   * @memberof WidgetViewer
   */
  componentDidUpdate(oldProps: IAppProps, oldState: IAppStates) {}

  /**
   *
   *
   * @memberof WidgetViewer
   */
  pythonCodeChange = (event: React.ChangeEvent<any>) => {
    const pythonCode = event.target.value;
    this.setState((old) => ({
      ...old,
      traceConfig: { ...old.traceConfig, pythonCode },
    }));
  };
  toggleSetting = () => {
    this.setState((old) => ({ ...old, openSetting: !old.openSetting }));
  };
  toggleEdit = () => {
    this.setState((old) => ({ ...old, openEdit: !old.openEdit }));
  };

  handleWidgetNameChange = (event: any) => {
    const widgetName = event.target.value;
    this.setState((old) => ({
      ...old,
      traceConfig: { ...old.traceConfig, widgetName },
    }));
  };
  updateSetting = () => {
    const code = this.state.traceConfig.pythonCode;

    this.props.send_msg({
      action: 'WidgetViewer::executeCode',
      payload: {
        code,
        title: this.divID,
      },
    });
    this.setState((old) => ({ ...old, openSetting: false }));
  };
  handleSelectedWidgetChange = (event: React.ChangeEvent<any>) => {
    const selectedWidget = event.target.value;
    this.setState((old) => ({ ...old, selectedWidget }));
  };

  updateWidgetSelect = () => {
    let code: string;
    if (this.state.selectedWidget in this.props.availableWidget) {
      code = this.props.availableWidget[this.state.selectedWidget].pythonCode;
    } else {
      code = '';
    }
    this.setState(
      (old) => ({
        ...old,
        traceConfig: { ...old.traceConfig, pythonCode: code },
        openEdit: false,
      }),
      () => {
        this.props.send_msg({
          action: 'WidgetViewer::executeCode',
          payload: {
            code,
            title: this.divID,
          },
        });
      }
    );
  };
  /**
   *
   *
   * @returns
   * @memberof WidgetViewer
   */
  render() {
    const classes = this.props.classes;
    return (
      <div className={'cosapp-widget-box'}>
        <Dialog
          open={this.state.openSetting}
          aria-labelledby='draggable-dialog-title'
          fullWidth={true}
          maxWidth='md'
          PaperComponent={PaperComponent}>
          <DialogTitle
            style={{ cursor: 'move' }}
            className='draggable-dialog-title'>
            Widget viewer configuration
          </DialogTitle>
          <DialogContent style={{ height: '50vh' }}>
            <div style={{ height: 'calc(100% - 60px)', overflowY: 'auto' }}>
              <CodeMirror
                value={this.state.traceConfig.pythonCode}
                options={{
                  mode: 'python',
                  lineNumbers: true,
                  lineWrapping: true,
                  smartIndent: true,
                  indentWithTabs: false,
                  tabSize: 4,
                  indentUnit: 4,
                  foldGutter: true,
                  gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
                  autoCloseTags: true,
                  matchBrackets: true,
                  autoCloseBrackets: true,
                  extraKeys: { Tab: betterTab },
                }}
                onBeforeChange={(editor, data, value) => {
                  this.setState((old) => ({
                    ...old,
                    traceConfig: { ...old.traceConfig, pythonCode: value },
                  }));
                }}
                onChange={(editor, data, value) => {}}
              />
            </div>
            <FormControl className={this.props.classes.formControl}>
              <TextField
                value={this.state.traceConfig.widgetName}
                onChange={this.handleWidgetNameChange}
                label='Widget name'
              />
            </FormControl>
          </DialogContent>

          <DialogActions>
            <Button autoFocus onClick={this.toggleSetting} color='primary'>
              Close
            </Button>
            <Button autoFocus onClick={this.updateSetting} color='primary'>
              Save
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.openEdit}
          aria-labelledby='draggable-dialog-title'
          fullWidth={true}
          maxWidth='sm'
          PaperComponent={PaperComponent}>
          <DialogTitle
            style={{ cursor: 'move' }}
            className='draggable-dialog-title'>
            Widget viewer selector
          </DialogTitle>
          <DialogContent>
            <FormControl style={{ width: '100%' }}>
              <InputLabel id='plot-type-select-id'>Select widget</InputLabel>
              <Select
                labelId='plot-type-select-id'
                value={this.state.selectedWidget}
                onChange={this.handleSelectedWidgetChange}>
                {Object.entries(this.props.availableWidget).map(
                  ([key, val]) => (
                    <MenuItem key={key} value={key}>
                      {val.widgetName}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          </DialogContent>

          <DialogActions>
            <Button autoFocus onClick={this.toggleEdit} color='primary'>
              Close
            </Button>
            <Button autoFocus onClick={this.updateWidgetSelect} color='primary'>
              Select
            </Button>
          </DialogActions>
        </Dialog>
        <div
          id={this.divID}
          className='WidgetViewerMain'
          style={{
            width: '100%',
            height: 'calc(100% - 35px)',
            overflow: 'auto',
            boxSizing: 'border-box',
            padding: '10px',
            background: 'white',
          }}></div>
        <div className={this.props.classes.bottomBarDiv}>
          <Button onClick={this.toggleEdit} style={{ color: 'rgb(50,50,50)' }}>
            {' '}
            <SettingsIcon />
          </Button>
          {this.props.systemConfig.enableEdit ? (
            <Button
              onClick={this.toggleSetting}
              style={{ color: 'rgb(50,50,50)' }}>
              {' '}
              <Edit />
            </Button>
          ) : (
            <div />
          )}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, null, {
  forwardRef: true,
})(
  withStyles(styles)(
    forwardRef((props: IAppProps, ref: any) => (
      <WidgetViewer {...props} ref={ref} />
    ))
  )
);
