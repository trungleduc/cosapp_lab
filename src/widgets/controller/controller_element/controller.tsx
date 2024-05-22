import { withStyles } from '@material-ui/core';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Fab from '@material-ui/core/Fab';
import { Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ListOutlinedIcon from '@material-ui/icons/ListOutlined';
import PlayArrowOutlinedIcon from '@material-ui/icons/PlayArrowOutlined';
import { Styles } from '@material-ui/styles/withStyles';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as ReduxAction from '../../redux/actions';
import { StateInterface } from '../../redux/types';
import AddVariableDialog from './add_variable_dialog';
import ParameterController from './param_controller';
const styles: Styles<Theme, {}> = (theme: Theme) => ({
  mainPanel: {
    display: 'flex',
    flexDirection: 'column'
  },
  topPanel: {
    width: '100%',
    flex: '1 1 auto',
    overflowY: 'auto',
    height: 0,
    marginBottom: 30
  },
  bottomPanel: {
    height: 'auto',
    width: '100%'
  },
  summaryExpandIcon: {
    padding: 0
  },
  summaryContent: {
    margin: '7px 0!important'
  },
  summaryRoot: {
    minHeight: 36,
    margin: '16px 0 0 0',
    background: '#e0e0e0',
    color: 'rgb(50,50,50)'
  },
  summaryExpanded: {
    minHeight: '24px!important'
  },
  panelRoot: {
    height: 150,
    overflowY: 'auto',
    marginBottom: 10
  }
});

interface AppStates {
  treeData: any;
  expandNotification: boolean;
  addVariableDialog: boolean;
  controllerList: { [key: string]: { component: any; value: number } };
  logMsg: string;
}

interface AppProps {
  send_msg: any;
  model: any;
  classes: any;
  toggleComputing: () => void;
  computingState: boolean;
  selectedVariable: { [key: string]: number };
  variableData: { [key: string]: any };
}

const mapStateToProps = (state: StateInterface) => {
  return {
    computingState: state.dashboardState.computing,
    variableData: state.dashboardState.variableData,
    selectedVariable: state.dashboardState.selectedVariable
  };
};

const mapDispatchToProps = (dispatch: (f: any) => void) => {
  return {
    toggleComputing: () => dispatch(ReduxAction.dashboardToggleRun())
  };
};

/**
 *
 * React component displaying the control panel of dashboard.
 * It contains a log windows, the buttons to control the system
 * and an area for variable controllers.
 * @class Controller
 * @extends {Component<AppProps, AppStates>}
 */
class Controller extends Component<AppProps, AppStates> {
  notificationRef: React.RefObject<HTMLDivElement>;

  /**
   *Creates an instance of Controller.
   * @param {AppProps} props
   * @memberof Controller
   */
  constructor(props: AppProps) {
    super(props);
    this.state = {
      treeData: {},
      expandNotification: false,
      addVariableDialog: false,
      controllerList: {},
      logMsg: ''
    };
    this.notificationRef = React.createRef<HTMLDivElement>();
    props.model.listenTo(props.model, 'msg:custom', this.on_msg);
  }

  on_msg = (
    data: { type: string; payload: { [key: string]: any } },
    buffer: any[]
  ) => {
    const { type, payload } = data;
    switch (type) {
      case 'Controller::update_signal': {
        const logMsg: string =
          this.state.logMsg +
          '\n' +
          '<b>' +
          new Date().toLocaleString() +
          '</b> ' +
          'Done';
        this.setState(old => ({ ...old, logMsg }));
        if (this.props.computingState) {
          this.props.toggleComputing();
        }
        break;
      }
      case 'Controller::notification_msg': {
        this.updateLog(payload as any);
        break;
      }
    }
  };

  componentWillUnmount = () => {
    this.props.model.stopListening(this.props.model, 'msg:custom', this.on_msg);
  };
  componentDidUpdate(prevProps: AppProps, prevState: AppStates) {}

  /**
   *
   * @static
   * @param {AppProps} nextProps
   * @param {AppStates} prevState
   * @returns
   * @memberof Controller
   */
  static getDerivedStateFromProps(nextProps: AppProps, prevState: AppStates) {
    let update = false;
    const newController = { ...prevState.controllerList };
    const oldVarList = Object.keys(prevState.controllerList);
    const selectedVarList = Object.keys(nextProps.selectedVariable);
    if (oldVarList.length < selectedVarList.length) {
      selectedVarList.forEach(selectedVar => {
        if (!oldVarList.includes(selectedVar)) {
          update = true;
          const regExp = /\[([^)]+)\]/;
          let varName;
          let varIdx = '-1';
          let varValue;
          const match = regExp.exec(selectedVar);
          if (match) {
            varName = selectedVar.replace(match[0], '');
            varIdx = match[1];
            varValue = nextProps.variableData[varName].value[
              parseInt(varIdx)
            ] as number;
          } else {
            varName = selectedVar;
            varValue = nextProps.variableData[varName].value as number;
          }

          newController[selectedVar] = {
            component: (
              <ParameterController
                variableName={selectedVar}
                key={selectedVar}
                value={varValue}
              />
            ),
            value: varValue
          };
        }
      });
    } else {
      oldVarList.forEach(oldVar => {
        if (!selectedVarList.includes(oldVar)) {
          update = true;
          delete newController[oldVar];
        }
      });
    }
    if (update) {
      return { controllerList: newController };
    } else {
      return null;
    }
  }

  /**
   *
   *
   * @memberof Controller
   */
  scrollToBottom = () => {
    this.notificationRef.current.scrollTop =
      this.notificationRef.current.scrollHeight;
  };

  updateLog = (newMsg: { update: number; msg: string; log: string }) => {
    const newLog: string =
      this.state.logMsg +
      '\n' +
      (newMsg.log !== '' ? newMsg.log + '\n' : '') +
      '<b>' +
      new Date().toLocaleString() +
      '</b> ' +
      newMsg.msg;
    this.setState(prevState => ({ ...prevState, logMsg: newLog }));
  };

  printToLog = (content: string) => {
    const newLog: string =
      this.state.logMsg +
      '\n' +
      '<b>' +
      new Date().toLocaleString() +
      '</b> ' +
      content;
    this.setState(prevState => ({ ...prevState, logMsg: newLog }));
  };

  runBtnHandle = () => {
    if (this.props.computingState) {
      this.printToLog('A driver is running, please wait!');
    } else {
      this.printToLog('Start computing');
      this.props.send_msg({
        action: 'Controller::runSignal',
        payload: this.props.selectedVariable
      });
    }
  };

  /**
   *
   *
   * @memberof Controller
   */
  clickRunButton = () => {
    if (!this.props.computingState) {
      this.props.toggleComputing();
    }
    this.setState(prevState => ({
      ...this.state,
      expandNotification: false
    }));
    this.runBtnHandle();
  };

  /**
   *
   *
   * @memberof Controller
   */
  closeAddVariableDialog = () => {
    this.setState({ ...this.state, addVariableDialog: false });
  };

  /**
   *
   *
   * @returns
   * @memberof Controller
   */
  render() {
    const { classes } = this.props;
    return (
      <div
        className={`${classes.mainPanel} cosapp-widget-box`}
        style={{ background: 'white' }}
      >
        <AddVariableDialog
          open={this.state.addVariableDialog}
          closeHandle={this.closeAddVariableDialog}
        />
        <div className={classes.topPanel}>
          {Object.keys(this.state.controllerList).map(
            (value, index) => this.state.controllerList[value].component
          )}
        </div>
        <div className={classes.bottom}>
          <div style={{ textAlign: 'center' }}>
            <Fab
              color="primary"
              aria-label="add"
              size="small"
              style={{ margin: '0 10px 0 10px' }}
              onClick={() => {
                this.setState({ ...this.state, addVariableDialog: true });
              }}
            >
              <AddIcon />
            </Fab>
            <Fab
              onClick={this.clickRunButton}
              color={this.props.computingState ? 'secondary' : 'primary'}
              aria-label="add"
              size="small"
              style={{ margin: '0 10px 0 10px' }}
            >
              <PlayArrowOutlinedIcon />
            </Fab>
            <Fab
              color="primary"
              aria-label="add"
              size="small"
              style={{ margin: '0 10px 0 10px' }}
            >
              <ListOutlinedIcon />
            </Fab>
          </div>

          <Accordion
            square={false}
            expanded={this.state.expandNotification}
            onChange={(event: React.ChangeEvent<any>) => {
              this.setState(prevState => ({
                ...prevState,
                expandNotification: !prevState.expandNotification
              }));
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              classes={{
                root: classes.summaryRoot,
                expanded: classes.summaryExpanded,
                expandIcon: classes.summaryExpandIcon,
                content: classes.summaryContent
              }}
            >
              <Typography className={classes.heading}>Log</Typography>
            </AccordionSummary>
            <AccordionDetails
              ref={this.notificationRef}
              classes={{ root: classes.panelRoot }}
            >
              <Typography
                style={{ whiteSpace: 'pre-line' }}
                variant="body2"
                dangerouslySetInnerHTML={{
                  __html: this.state.logMsg
                }}
              ></Typography>
            </AccordionDetails>
          </Accordion>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(Controller)
);
