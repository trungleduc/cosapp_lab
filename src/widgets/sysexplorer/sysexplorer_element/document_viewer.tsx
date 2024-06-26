import { markdown } from '@codemirror/lang-markdown';
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
import TextField from '@material-ui/core/TextField';
import { Theme } from '@material-ui/core/styles';
import Edit from '@material-ui/icons/Edit';
import SettingsIcon from '@material-ui/icons/Settings';
import { Styles } from '@material-ui/styles/withStyles';
import CodeMirror from '@uiw/react-codemirror';
import 'flexlayout-react/style/light.css';
import React, { Component, forwardRef } from 'react';
import { connect } from 'react-redux';

import { create_UUID } from '../../../utils/tools';
import { IDict, StateInterface } from '../../redux/types';

function PaperComponent(props: PaperProps) {
  return <Paper {...props} />;
}

const styles: Styles<any, any> = (theme: Theme) => ({
  textSizeSmall: {
    //fontSize: "0.75rem"
  },
  toolbarHeigt: {
    minHeight: 36,
    background: 'rgb(50, 50, 50)'
  },
  viewSelector: {
    minWidth: 120,
    //fontSize: "0.75rem",
    color: 'rgb(250, 250, 250)'
  },
  bgSelector: {
    minWidth: 60,
    //fontSize: "0.75rem",
    color: 'rgb(250, 250, 250)'
  },
  textColor: {
    color: 'rgb(250, 250, 250)'
  },
  backGround: {
    color: 'rgb(50, 50, 50)'
  },
  formControl: {
    padding: '10px 5% 0px 5%;',
    width: '90%'
  },
  formControlShort: {
    padding: theme.spacing(1),
    width: 'calc(50% - 16px)'
  },
  formControlTiny: {
    width: '22%'
  },
  selectEmpty: {
    marginTop: theme.spacing(2)
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: '90%'
  },
  bottomBarDiv: {
    width: '100%',
    height: '35px',
    background: '#e0e0e0',
    display: 'flex',
    flexDirection: 'row-reverse'
  }
});

const getStoreData = (state: StateInterface) => {
  return { systemConfig: state.systemConfig };
};

const mapStateToProps = (state: StateInterface) => {
  return getStoreData(state);
};

const mapDispatchToProps = () => {
  return {};
};

export interface IAvailableDocument {
  documentSource: string;
  id: string;
  widgetName: string;
}

interface IAppProps {
  send_msg: any;
  model: any;
  classes: any;
  id: string;
  initialState: IDict<any>;
  availableDocument: IDict<IAvailableDocument>;
  systemConfig: IDict<any>;
}

interface IAppStates {
  traceConfig: {
    documentSource: string;
    widgetName: string;
  };
  openSetting: boolean;
  openEdit: boolean;
  selectedWidget: string;
}

/**
 *
 * React component displaying the render window.
 * @class DocumentViewer
 * @extends {Component<IAppProps, IAppStates>}
 */
export class DocumentViewer extends Component<IAppProps, IAppStates> {
  /**
   *Creates an instance of DocumentViewer.
   * @param {IAppProps} props
   * @memberof DocumentViewer
   */

  initialState: IDict<IDict<any>>;
  divID: string;

  constructor(props: IAppProps) {
    super(props);
    this.initialState = props.initialState;
    this.divID = `document-viewer-${create_UUID()}`;

    let selectedWidget = '';
    let widgetName = '';
    for (const [key, value] of Object.entries(this.props.availableDocument)) {
      if (value.id === this.props.id) {
        selectedWidget = key;
        widgetName = value['widgetName'];
      }
    }

    this.state = {
      traceConfig: {
        documentSource: '',
        widgetName
      },
      openSetting: false,
      openEdit: false,
      selectedWidget
    };
  }

  componentDidMount() {
    if (this.initialState) {
      let { documentSource = '' } = this.initialState.traceConfig;
      if (documentSource.length === 0) {
        documentSource = '\n'.repeat(10);
      }
      this.setState(
        old => {
          return {
            ...old,
            traceConfig: { ...old.traceConfig, documentSource }
          };
        },
        () => {
          this.props.send_msg({
            action: 'DocumentViewer::generateDocument',
            payload: {
              source: documentSource,
              title: this.divID
            }
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
   * @memberof DocumentViewer
   */
  componentDidUpdate() {}

  /**
   *
   *
   * @memberof DocumentViewer
   */
  documentSourceChange = (event: React.ChangeEvent<any>) => {
    const documentSource = event.target.value;
    this.setState(old => ({
      ...old,
      traceConfig: { ...old.traceConfig, documentSource }
    }));
  };
  toggleSetting = () => {
    this.setState(old => ({ ...old, openSetting: !old.openSetting }));
  };
  toggleEdit = () => {
    this.setState(old => ({ ...old, openEdit: !old.openEdit }));
  };

  handleWidgetNameChange = (event: any) => {
    const widgetName = event.target.value;
    this.setState(old => ({
      ...old,
      traceConfig: { ...old.traceConfig, widgetName }
    }));
  };
  updateSetting = () => {
    const code = this.state.traceConfig.documentSource;

    this.props.send_msg({
      action: 'DocumentViewer::generateDocument',
      payload: {
        source: code,
        title: this.divID
      }
    });
    this.setState(old => ({ ...old, openSetting: false }));
  };
  handleSelectedWidgetChange = (event: React.ChangeEvent<any>) => {
    const selectedWidget = event.target.value;
    this.setState(old => ({ ...old, selectedWidget }));
  };

  updateWidgetSelect = () => {
    let source: string;
    if (this.state.selectedWidget in this.props.availableDocument) {
      source =
        this.props.availableDocument[this.state.selectedWidget].documentSource;
    } else {
      source = '';
    }
    this.setState(
      old => ({
        ...old,
        traceConfig: { ...old.traceConfig, documentSource: source },
        openEdit: false
      }),
      () => {
        this.props.send_msg({
          action: 'DocumentViewer::generateDocument',
          payload: {
            source,
            title: this.divID
          }
        });
      }
    );
  };
  /**
   *
   *
   * @returns
   * @memberof DocumentViewer
   */
  render() {
    return (
      <div className={'cosapp-widget-box'}>
        <Dialog
          open={this.state.openSetting}
          aria-labelledby="draggable-dialog-title"
          fullWidth={true}
          maxWidth="md"
          PaperComponent={PaperComponent}
        >
          <DialogTitle
            style={{ cursor: 'move' }}
            className="draggable-dialog-title"
          >
            Document viewer configuration
          </DialogTitle>
          <DialogContent style={{ height: '50vh' }}>
            <div style={{ height: 'calc(100% - 60px)', overflowY: 'auto' }}>
              <CodeMirror
                value={this.state.traceConfig.documentSource}
                height="100%"
                extensions={[markdown()]}
                basicSetup={{
                  lineNumbers: true,
                  tabSize: 4,
                  foldGutter: true
                }}
                onChange={value => {
                  this.setState(old => ({
                    ...old,
                    traceConfig: { ...old.traceConfig, documentSource: value }
                  }));
                }}
              />
            </div>
            <FormControl className={this.props.classes.formControl}>
              <TextField
                value={this.state.traceConfig.widgetName}
                onChange={this.handleWidgetNameChange}
                label="Document name"
              />
            </FormControl>
          </DialogContent>

          <DialogActions>
            <Button autoFocus onClick={this.toggleSetting} color="primary">
              Close
            </Button>
            <Button autoFocus onClick={this.updateSetting} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.openEdit}
          aria-labelledby="draggable-dialog-title"
          fullWidth={true}
          maxWidth="sm"
          PaperComponent={PaperComponent}
        >
          <DialogTitle
            style={{ cursor: 'move' }}
            className="draggable-dialog-title"
          >
            Document viewer selector
          </DialogTitle>
          <DialogContent>
            <FormControl style={{ width: '100%' }}>
              <InputLabel id="doct-type-select-id">Select document</InputLabel>
              <Select
                labelId="doc-type-select-id"
                value={this.state.selectedWidget}
                onChange={this.handleSelectedWidgetChange}
              >
                {Object.entries(this.props.availableDocument).map(
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
            <Button autoFocus onClick={this.toggleEdit} color="primary">
              Close
            </Button>
            <Button autoFocus onClick={this.updateWidgetSelect} color="primary">
              Select
            </Button>
          </DialogActions>
        </Dialog>
        <div
          id={this.divID}
          className="DocumentViewerMain"
          style={{
            width: '100%',
            height: 'calc(100% - 35px)',
            overflow: 'auto',
            boxSizing: 'border-box',
            padding: '10px',
            background: 'white'
          }}
        ></div>
        <div className={this.props.classes.bottomBarDiv}>
          <Button onClick={this.toggleEdit} style={{ color: 'rgb(50,50,50)' }}>
            {' '}
            <SettingsIcon />
          </Button>
          {this.props.systemConfig.enableEdit ? (
            <Button
              onClick={this.toggleSetting}
              style={{ color: 'rgb(50,50,50)' }}
            >
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
  forwardRef: true
})(
  withStyles(styles)(
    forwardRef((props: IAppProps, ref: any) => (
      <DocumentViewer {...props} ref={ref} />
    ))
  )
);
