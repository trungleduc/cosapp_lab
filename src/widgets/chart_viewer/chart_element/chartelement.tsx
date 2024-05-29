import { javascript } from '@codemirror/lang-javascript';
import { withStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormLabel from '@material-ui/core/FormLabel';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import { Theme } from '@material-ui/core/styles';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import EditIcon from '@material-ui/icons/Edit';
import SettingsIcon from '@material-ui/icons/Settings';
import StorageIcon from '@material-ui/icons/Storage';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Styles } from '@material-ui/styles/withStyles';
import CodeMirror from '@uiw/react-codemirror';
import 'flexlayout-react/style/light.css';
import React, { Component, forwardRef } from 'react';
import { connect } from 'react-redux';

import { carpet_data_factory } from '../../../utils/tools';
import { IDict, StateInterface } from '../../redux/types';
import Plot from './plotly_factory';

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
    padding: theme.spacing(1),
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
  return {
    computedResult: state.dashboardState.computedResult,
    recorderData: state.dashboardState.recorderData,
    driverData: state.dashboardState.driverData
  };
};

const mapStateToProps = (state: StateInterface) => {
  return getStoreData(state);
};

const mapDispatchToProps = (_: (f: any) => void) => {
  return {};
};

interface AppProps {
  send_msg: any;
  model: any;
  classes: any;
  id: string;
  initialState: { [key: string]: any };
  computedResult: { [key: string]: any };
  recorderData: { [key: string]: Array<any> };
  driverData: { [key: string]: any };
}

interface ISingleTrace {
  name: string;
  plotType: string;
  dataSource: string;
  xAxisConfig: boolean;
  systemNameX: string;
  recorderRefX: string;
  xData: any;
  xDataIndex: string;
  yAxisConfig: boolean;
  systemNameY: string;
  recorderRefY: string;
  yData: any;
  yDataIndex: string;
  zAxisConfig?: boolean;
  systemNameZ?: string;
  recorderRefZ?: string;
  zData?: any;
  zDataIndex?: string;
}

interface ITraceData {
  [key: string]: ISingleTrace;
}

interface ILayoutConfig {
  title: string;
  xAxis: string;
  yAxis: string;
  zAxis: string;
  xAxisMin: string;
  xAxisMax: string;
  yAxisMin: string;
  yAxisMax: string;
  zAxisMin: string;
  zAxisMax: string;
}
interface AppStates {
  renderSignal: number; // Signal to re-render plot
  openSetting: boolean; // Flag to close/open graph setting dialog
  layoutSettingDialog: boolean; // Flag to close/open layout setting dialog
  plotLayoutConfig: ILayoutConfig; // Configuration of layout
  legendPosition: string; // Position of legend, "h" or "v"
  xAxisScale: string; // Config for scaling x axis, "normal" or "log"
  yAxisScale: string; // Config for scaling y axis, "normal" or "log"
  zAxisScale: string; // Config for scaling y axis, "normal" or "log"
  dialogType: string; // Type of add trace dialog; "add" or "edit"
  traceNameHistory: string; // Old name of current editing trace
  advanceTraceNameHistory: string; // List of all trace in plot
  advancedTraceDataConfig: { [key: string]: any }; // Adcanced trace config ,
  currentAdvancedTraceDataConfig: string; // Adcanced trace config ,
  traceName: string; // Name of current  trace
  plotType: string; // Type of plot
  dataSource: string; // Source of data

  xAxisConfig: boolean; // Flag to activate/deactivate x axis
  systemNameX: string; // Name of system or recorder used for x axis data
  recorderRefX: string; // Reference of recorder used for x axis data
  xData: any; // Name of variable or recorder column to get data for x axis
  xDataIndex: any; // Position to get data if xData is a vector

  yAxisConfig: boolean; // Flag to activate/deactivate y axis
  systemNameY: string; // Name of system or recorder used for y axis data
  recorderRefY: string; // Reference of recorder used for y axis data
  yData: any; // Name of variable or recorder column to get data for y axis
  yDataIndex: any; // Position to get data if yData is a vector

  zAxisConfig: boolean; // Flag to activate/deactivate z axis
  systemNameZ: string; // Name of system or recorder used for z axis data
  recorderRefZ: string; // Reference of recorder used for z axis data
  zData: any; // Name of variable or recorder column to get data for z axis
  zDataIndex: any; // Position to get data if zData is a vector

  listDriverWithTrace: string[]; // List of driver name which contains residue data
  dictDriverVariable: { [key: string]: string[] }; // Dict contains the residue vector of drivers

  listRecorder: string[]; // List of recorders
  dictRecorderVariable: { [key: string]: string[] }; // A dict mapping recorder name with its variable list
  dictRecorderVariableLength: { [key: string]: { [key: string]: any } }; // A dict holds the length of variable in recorder
  dictRecorderRef: { [key: string]: string[] }; // A dict holds the ref column of recorder

  listSystem: string[]; // List of system
  dictSystemVariable: { [key: string]: string[] }; // A dict mapping system name with its variable list
  dictSystemVariableLength: { [key: string]: { [key: string]: any } }; // A dict holds the length of variable in system

  listSelector: string[]; // Current activated list to show in "Select system" or "Select recorder" selector
  dictSelector: { [key: string]: string[] }; // Current activated dict, selected between `dictRecorderVariable` or `dictSystemVariable`
  traceConfig: ITraceData; // Configuration of traces
  traceData: { [key: string]: any }[]; // the data created by `plotDataFactory` and is used to plotly to plot traces
  plotLayout: { [key: string]: any }; // Layout configuration for plotly
}

/**
 *
 * React component displaying the render window.
 * @class ChartElement
 * @extends {Component<AppProps, AppStates>}
 */
export class ChartElement extends Component<AppProps, AppStates> {
  /**
   *Creates an instance of ChartElement.
   * @param {AppProps} props
   * @memberof ChartElement
   */
  dialogInput:
    | {
        traceSelector: JSX.Element;
        traceName: JSX.Element;
        dataSource: JSX.Element;
        plotType: JSX.Element;
        systemAndRefX: JSX.Element;
        systemAndRefY: JSX.Element;
        systemAndRefZ: JSX.Element;
      }
    | undefined;
  initialState: { [key: string]: any };
  constructor(props: AppProps) {
    super(props);
    this.initialState = props.initialState;

    const {
      listSystem,
      dictSystemVariable,
      dictSystemVariableLength,
      listRecorder,
      dictRecorderVariable,
      dictRecorderRef,
      dictRecorderVariableLength,
      listDriverWithTrace,
      dictDriverVariable
    } = {
      ...this.prepareStateData(
        props.computedResult,
        props.recorderData,
        props.driverData
      )
    };

    this.state = {
      renderSignal: -1,
      openSetting: false,
      layoutSettingDialog: false,
      plotLayoutConfig: {
        title: '',
        xAxis: '',
        yAxis: '',
        zAxis: '',
        xAxisMin: '',
        xAxisMax: '',
        yAxisMax: '',
        yAxisMin: '',
        zAxisMax: '',
        zAxisMin: ''
      },
      legendPosition: 'h',
      xAxisScale: 'normal',
      yAxisScale: 'normal',
      zAxisScale: 'normal',
      dialogType: 'new',
      traceNameHistory: '',
      advanceTraceNameHistory: '',
      advancedTraceDataConfig: {},
      currentAdvancedTraceDataConfig: '{}',
      traceName: '',
      dataSource: 'Variables',

      xAxisConfig: true,
      systemNameX: listSystem[0],
      recorderRefX: 'All',
      xData: dictSystemVariable[listSystem[0]][0],
      xDataIndex: 'All',

      yAxisConfig: true,
      systemNameY: listSystem[0],
      recorderRefY: 'All',
      yData: dictSystemVariable[listSystem[0]][0],
      yDataIndex: 'All',

      zAxisConfig: true,
      systemNameZ: listSystem[0],
      recorderRefZ: 'All',
      zData: dictSystemVariable[listSystem[0]][0],
      zDataIndex: 'All',

      listSystem,
      dictSystemVariable,
      dictSystemVariableLength,
      listRecorder,
      dictRecorderVariable,
      dictRecorderVariableLength,
      dictRecorderRef,
      listDriverWithTrace,
      dictDriverVariable,
      listSelector: listSystem,
      dictSelector: dictSystemVariable,
      plotType: 'scatter',
      traceConfig: {},
      traceData: [],
      plotLayout: {
        title: { text: 'New chart' },
        xaxis: {
          title: { text: 'X-axis' },
          exponentformat: 'power',
          autorange: true,
          type: 'normal'
        },
        yaxis: {
          title: { text: 'Y-axis' },
          exponentformat: 'power',
          autorange: true,
          type: 'normal'
        },
        zaxis: {
          title: { text: 'Y-axis' },
          exponentformat: 'power',
          autorange: true,
          type: 'normal'
        }
      }
    };
  }

  prepareStateData = (
    computedResult: { [key: string]: any },
    recorderData: { [key: string]: Array<any> },
    driverData: { [key: string]: any }
  ) => {
    const listSystem: string[] = [];
    const dictSystemVariable: IDict<any> = {};
    const dictSystemVariableLength: IDict<any> = {};

    Object.keys(computedResult).forEach(key => {
      const keySplit = key.split('.');
      const keyLength = keySplit.length;
      const variable = `${keySplit[keyLength - 2]}.${keySplit[keyLength - 1]}`;
      const sysName = keySplit.slice(0, keyLength - 2).join('.');
      const variableValue = computedResult[key][1];
      const content: Array<any> = ['All'];
      if (Array.isArray(variableValue)) {
        for (let idx = 0; idx < variableValue.length; idx++) {
          content.push('' + idx);
        }
      }
      if (dictSystemVariable[sysName]) {
        dictSystemVariable[sysName].push(variable);
        dictSystemVariableLength[sysName][variable] = content;
      } else {
        listSystem.push(sysName);
        dictSystemVariable[sysName] = [variable];
        dictSystemVariableLength[sysName] = { [variable]: content };
      }
    });

    const listRecorder = Object.keys(recorderData);
    const dictRecorderVariable: IDict<any> = {};
    const dictRecorderRef: IDict<any> = {};
    const dictRecorderVariableLength: IDict<any> = {};

    listRecorder.forEach(key => {
      dictRecorderVariable[key] = [];
      dictRecorderVariableLength[key] = {};
      for (const [variableName, variableValue] of Object.entries(
        recorderData[key]
      )) {
        if (
          !['Section', 'Status', 'Error code', 'Reference'].includes(
            variableName
          )
        ) {
          dictRecorderVariable[key].push(variableName);
          if (variableValue.length > 0) {
            if (Array.isArray(variableValue[0])) {
              const content: Array<any> = ['All'];
              for (let idx = 0; idx < variableValue[0].length; idx++) {
                content.push('' + idx);
              }
              dictRecorderVariableLength[key][variableName] = content;
            } else {
              dictRecorderVariableLength[key][variableName] = ['All'];
            }
          } else {
            dictRecorderVariableLength[key][variableName] = ['All'];
          }
        }
      }

      // dictRecorderVariable[key] = Object.keys();
      const refList: Array<any> = [...recorderData[key]['Reference' as any]];

      if (isNaN(refList[0])) {
        dictRecorderRef[key] = refList;
      } else {
        dictRecorderRef[key] = refList.map(item => '' + item);
      }
      dictRecorderRef[key].unshift('All');
    });

    const listDriverWithTrace = Object.keys(driverData);
    const dictDriverVariable: IDict<any> = {};
    listDriverWithTrace.forEach(key => {
      dictDriverVariable[key] = Object.keys(driverData[key]);
    });

    return {
      listSystem,
      dictSystemVariable,
      dictSystemVariableLength,
      listRecorder,
      dictRecorderVariable,
      dictRecorderRef,
      dictRecorderVariableLength,
      listDriverWithTrace,
      dictDriverVariable
    };
  };

  /**
   *
   *
   * @memberof ChartElement
   */
  componentDidMount() {
    if (this.initialState) {
      this.setState(old => {
        const newTraceData = this.plotDataFactory(
          this.initialState.traceConfig,
          old.dictRecorderRef,
          this.initialState.advancedTraceDataConfig,
          'advanced'
        );
        return {
          ...old,
          traceData: newTraceData,
          plotLayout: this.initialState.plotLayout,
          traceConfig: this.initialState.traceConfig,
          advancedTraceDataConfig: this.initialState.advancedTraceDataConfig
        };
      });
    }
  }

  /**
   *
   *
   * @param {AppProps} oldProps
   * @param {AppStates} oldState
   * @memberof ChartElement
   */
  componentDidUpdate(oldProps: AppProps, _: AppStates) {
    if (oldProps.computedResult !== this.props.computedResult) {
      const {
        dictSystemVariableLength,
        dictRecorderRef,
        dictRecorderVariableLength,
        listDriverWithTrace,
        dictDriverVariable
      } = {
        ...this.prepareStateData(
          this.props.computedResult,
          this.props.recorderData,
          this.props.driverData
        )
      };
      this.setState(old => {
        const newTraceData = this.plotDataFactory(
          old.traceConfig,
          dictRecorderRef,
          old.advancedTraceDataConfig,
          'advanced'
        );
        return {
          ...old,
          traceData: newTraceData,
          dictSystemVariableLength,
          dictRecorderRef,
          dictRecorderVariableLength,
          listDriverWithTrace,
          dictDriverVariable
        };
      });
    }
  }

  closeDialog = () => {
    this.setState(old => ({ ...old, openSetting: false }));
  };
  openSetting = () => {
    this.setState(old => ({ ...old, dialogType: 'new', openSetting: true }));
  };
  openAdvancedEdit = () => {
    const newAdvancedTraceData: IDict<any> = {};
    const unusedKey = ['x', 'y', 'z', 'a', 'b', 'name'];
    this.state.traceData.forEach(item => {
      newAdvancedTraceData[item.name] = {};
      for (const key in item) {
        if (!unusedKey.includes(key)) {
          newAdvancedTraceData[item.name][key] = JSON.parse(
            JSON.stringify(item[key])
          );
        }
      }
    });
    if (Object.keys(newAdvancedTraceData).length > 0) {
      const key = Object.keys(newAdvancedTraceData)[0];
      this.setState(old => ({
        ...old,
        dialogType: 'advance',
        openSetting: true,
        advancedTraceDataConfig: newAdvancedTraceData,
        advanceTraceNameHistory: key,
        currentAdvancedTraceDataConfig: JSON.stringify(
          newAdvancedTraceData[key],
          null,
          2
        )
      }));
    }
  };

  openEditing = () => {
    const value = Object.keys(this.state.traceConfig)[0];
    if (!value) {
      return;
    }
    const { ...traceConfig } = this.state.traceConfig[value];
    if (traceConfig.dataSource === 'Variables') {
      this.setState(old => {
        return {
          ...old,
          listSelector: old.listSystem,
          dictSelector: old.dictSystemVariable,
          traceNameHistory: value,
          traceName: value,
          dialogType: 'edit',
          openSetting: true,
          ...traceConfig
        };
      });
    } else if (traceConfig.dataSource === 'Recorders') {
      this.setState(old => {
        return {
          ...old,
          listSelector: old.listRecorder,
          dictSelector: old.dictRecorderVariable,
          traceNameHistory: value,
          traceName: value,
          dialogType: 'edit',
          openSetting: true,
          ...traceConfig
        };
      });
    } else if (traceConfig.dataSource === 'Drivers data') {
      this.setState(old => {
        return {
          ...old,
          listSelector: old.listDriverWithTrace,
          dictSelector: old.dictDriverVariable,
          traceNameHistory: value,
          traceName: value,
          dialogType: 'edit',
          openSetting: true,
          ...traceConfig
        };
      });
    }
  };

  openLayoutSetting = () => {
    this.setState(old => {
      if (old.layoutSettingDialog) {
        return {
          ...old,
          layoutSettingDialog: !old.layoutSettingDialog
        };
      } else {
        const plotLayoutConfig: ILayoutConfig = {
          title: old.plotLayout.title.text,
          xAxis: old.plotLayout.xaxis.title.text,
          yAxis: old.plotLayout.yaxis.title.text,
          zAxis: old.plotLayout.zaxis.title.text,
          xAxisMin: '',
          xAxisMax: '',
          yAxisMax: '',
          yAxisMin: '',
          zAxisMax: '',
          zAxisMin: ''
        };
        const _ = ['x', 'y', 'z'];
        _.forEach(ax => {
          const axis_conf = old.plotLayout[`${ax}axis`];
          if (
            old[`${ax}AxisScale` as keyof AppStates] === 'normal fixed' ||
            (old[`${ax}AxisScale` as keyof AppStates] === 'log fixed' &&
              axis_conf.range)
          ) {
            plotLayoutConfig[`${ax}AxisMin` as keyof ILayoutConfig] =
              axis_conf.range[0];
            plotLayoutConfig[`${ax}AxisMax` as keyof ILayoutConfig] =
              axis_conf.range[1];
          }
        });
        return {
          ...old,
          plotLayoutConfig,
          layoutSettingDialog: !old.layoutSettingDialog
        };
      }
    });
  };

  updatePlotLayout = () => {
    this.setState(old => ({
      ...old,
      layoutSettingDialog: false,
      plotLayout: {
        ...old.plotLayout,
        title: { ...old.plotLayout.title, text: old.plotLayoutConfig.title },
        xaxis: {
          ...old.plotLayout.xaxis,
          title: {
            ...old.plotLayout.xaxis.title,
            text: old.plotLayoutConfig.xAxis
          },
          type: old.xAxisScale.replace(' fixed', ''),
          range: old.xAxisScale.includes('fixed')
            ? [old.plotLayoutConfig.xAxisMin, old.plotLayoutConfig.xAxisMax]
            : ['', ''],
          autorange: !old.xAxisScale.includes('fixed')
        },
        yaxis: {
          ...old.plotLayout.yaxis,
          title: {
            ...old.plotLayout.yaxis.title,
            text: old.plotLayoutConfig.yAxis
          },
          type: old.yAxisScale.replace(' fixed', ''),
          range: old.yAxisScale.includes('fixed')
            ? [old.plotLayoutConfig.yAxisMin, old.plotLayoutConfig.yAxisMax]
            : ['', ''],
          autorange: !old.yAxisScale.includes('fixed')
        },
        zaxis: {
          ...old.plotLayout.zaxis,
          title: {
            ...old.plotLayout.zaxis.title,
            text: old.plotLayoutConfig.zAxis
          },
          type: old.zAxisScale.replace(' fixed', ''),
          range: old.zAxisScale.includes('fixed')
            ? [old.plotLayoutConfig.zAxisMin, old.plotLayoutConfig.zAxisMax]
            : ['', ''],
          autorange: !old.zAxisScale.includes('fixed')
        },
        legend: { ...old.plotLayout.legend, orientation: old.legendPosition }
      }
    }));
  };
  handleTraceNameChange = (event: any) => {
    this.setState({ ...this.state, traceName: event.target.value });
  };

  handlePlotTypeChange = (event: any) => {
    const plotType = event.target.value;
    if (plotType === 'contour' || plotType === '3D scatter') {
      this.setState({
        ...this.state,
        plotType,
        xAxisConfig: true,
        yAxisConfig: true,
        zAxisConfig: true
      });
    } else {
      this.setState({ ...this.state, plotType });
    }
  };
  handleDatasourceChange = (event: any) => {
    if (event.target.value === 'Variables') {
      const systemNameX = this.state.listSystem[0];

      const systemNameY = systemNameX;
      const systemNameZ = systemNameX;

      const xData = this.state.dictSystemVariable[systemNameX][0];
      const xDataIndex =
        this.state.dictSystemVariableLength[systemNameX][xData][0];
      const yData = xData;
      const yDataIndex = xDataIndex;
      const zData = xData;
      const zDataIndex = xDataIndex;

      this.setState(old => ({
        ...old,
        dataSource: 'Variables',
        listSelector: old.listSystem,
        dictSelector: old.dictSystemVariable,
        systemNameX,
        systemNameY,
        systemNameZ,
        xData,
        yData,
        zData,
        xDataIndex,
        yDataIndex,
        zDataIndex
      }));
    } else if (event.target.value === 'Recorders') {
      const systemNameX = this.state.listRecorder[0];

      const recorderRefX = this.state.dictRecorderRef[systemNameX][0];

      const xData = this.state.dictRecorderVariable[systemNameX][0];
      const xDataIndex =
        this.state.dictRecorderVariableLength[systemNameX][xData][0];
      const systemNameY = systemNameX;
      const recorderRefY = recorderRefX;
      const yData = xData;
      const yDataIndex = xDataIndex;
      const systemNameZ = systemNameX;
      const recorderRefZ = recorderRefX;
      const zData = xData;
      const zDataIndex = xDataIndex;
      this.setState(old => ({
        ...old,
        dataSource: 'Recorders',
        listSelector: old.listRecorder,
        dictSelector: old.dictRecorderVariable,
        systemNameX,
        recorderRefX,
        xData,
        xDataIndex,
        systemNameY,
        recorderRefY,
        yData,
        yDataIndex,
        systemNameZ,
        recorderRefZ,
        zData,
        zDataIndex
      }));
    } else if (event.target.value === 'Drivers data') {
      const systemNameX = this.state.listDriverWithTrace[0];
      const xData = this.state.dictDriverVariable[systemNameX][0];
      const systemNameY = systemNameX;
      const yData = xData;
      const systemNameZ = systemNameX;
      const zData = xData;
      this.setState(old => ({
        ...old,
        dataSource: 'Drivers data',
        listSelector: old.listDriverWithTrace,
        dictSelector: old.dictDriverVariable,
        systemNameX,
        xData,
        systemNameY,
        yData,
        systemNameZ,
        zData
      }));
    }
  };

  handleAxisConfig = (config: 'x' | 'y' | 'z') => () => {
    const key = `${config}AxisConfig` as keyof AppStates;
    const plotType = this.state.plotType;
    if (plotType === 'contour' || plotType === '3d scatter') {
      if (config === 'z') {
        this.setState(old => ({ ...old, [key]: !old[key] }));
      } else {
        this.setState(old => ({ ...old, [key]: true }));
      }
    } else {
      this.setState(old => ({ ...old, [key]: !old[key] }));
    }
  };

  handleSystemSelectChange =
    (config: 'x' | 'y' | 'z') =>
    (event: React.ChangeEvent<any>, value: string) => {
      let sysValue: string;
      if (value === '') {
        sysValue = Object.keys(this.state.dictSelector)[0];
      } else {
        sysValue = value;
      }

      let configData: string;
      if (this.state.dictSelector[sysValue].length > 0) {
        configData = this.state.dictSelector[sysValue][0];
      } else {
        configData = 'None';
      }
      let configDataIndex: any;
      if (this.state.dataSource === 'Variables') {
        configDataIndex =
          this.state.dictSystemVariableLength[sysValue][configData][0];
        this.setState(old => ({
          ...old,
          [`systemName${config.toUpperCase()}`]: value,
          [`${config}Data`]: configData,
          [`${config}DataIndex`]: configDataIndex
        }));
      } else if (this.state.dataSource === 'Recorders') {
        configDataIndex =
          this.state.dictRecorderVariableLength[sysValue][configData][0];
        this.setState(old => ({
          ...old,
          [`systemName${config.toUpperCase()}`]: value,
          [`${config}Data`]: configData,
          [`${config}DataIndex`]: configDataIndex
        }));
      } else if (this.state.dataSource === 'Drivers data') {
        this.setState(old => ({
          ...old,
          [`systemName${config.toUpperCase()}`]: value,
          [`${config}Data`]: configData
        }));
      }
    };

  handleRecorderRefChange =
    (config: 'x' | 'y' | 'z') =>
    (event: React.ChangeEvent<any>, value: string) => {
      const key = `recorderRef${config.toUpperCase()}`;
      this.setState({ ...this.state, [key]: value });
    };

  handleDataChange =
    (config: 'x' | 'y' | 'z') =>
    (event: React.ChangeEvent<any>, value: string) => {
      const systemName =
        this.state[`systemName${config.toUpperCase()}` as keyof AppStates];
      let dataIndex;
      if (this.state.dataSource === 'Variables') {
        dataIndex = this.state.dictSystemVariableLength[systemName][value][0];
        this.setState({
          ...this.state,
          [`${config}Data`]: value,
          [`${config}DataIndex`]: dataIndex
        });
      } else if (this.state.dataSource === 'Recorders') {
        dataIndex = this.state.dictRecorderVariableLength[systemName][value][0];
        this.setState({
          ...this.state,
          [`${config}Data`]: value,
          [`${config}DataIndex`]: dataIndex
        });
      } else if (this.state.dataSource === 'Drivers data') {
        this.setState({ ...this.state, [`${config}Data`]: value });
      }
    };

  handleDataIndexChange =
    (config: 'x' | 'y' | 'z') =>
    (event: React.ChangeEvent<any>, value: string) => {
      const key = `${config}DataIndex`;
      this.setState({ ...this.state, [key]: value });
    };

  handleAdvanceTraceSelectorChange = (
    _: React.ChangeEvent<any>,
    value: string
  ) => {
    const selectedConfig = JSON.stringify(
      this.state.advancedTraceDataConfig[value],
      null,
      2
    );
    this.setState(old => ({
      ...old,
      advanceTraceNameHistory: value,
      currentAdvancedTraceDataConfig: selectedConfig
    }));
  };

  handleAdvanceTraceConfigChange = (_, __, value) => {
    this.setState(old => ({ ...old, currentAdvancedTraceDataConfig: value }));
  };

  handleTraceSelectorChange = (
    event: React.ChangeEvent<any>,
    value: string
  ) => {
    const { ...traceConfig } = this.state.traceConfig[value];

    if (traceConfig.dataSource === 'Variables') {
      this.setState(old => {
        return {
          ...old,
          listSelector: old.listSystem,
          dictSelector: old.dictSystemVariable,
          traceNameHistory: value,
          traceName: value,
          ...traceConfig
        };
      });
    } else if (traceConfig.dataSource === 'Recorders') {
      this.setState(old => {
        return {
          ...old,
          listSelector: old.listRecorder,
          dictSelector: old.dictRecorderVariable,
          traceNameHistory: value,
          traceName: value,
          ...traceConfig
        };
      });
    } else if (traceConfig.dataSource === 'Drivers data') {
      this.setState(old => {
        return {
          ...old,
          listSelector: old.listDriverWithTrace,
          dictSelector: old.dictDriverVariable,
          traceNameHistory: value,
          traceName: value,
          ...traceConfig
        };
      });
    }
  };

  handlePlotLayoutChange =
    (name: keyof ILayoutConfig) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      event.persist();
      const { value } = event.target;
      this.setState(old => {
        return {
          ...old,
          plotLayoutConfig: { ...old.plotLayoutConfig, [name]: value }
        };
      });
    };

  handleAxisChange =
    (config: 'x' | 'y' | 'z') => (event: React.ChangeEvent<any>) => {
      const value = event.target.value;
      this.setState(old => ({ ...old, [`${config}AxisScale`]: value }));
    };
  handleLegendPosition = (event: React.ChangeEvent<any>) => {
    const value = event.target.value;
    this.setState(old => ({ ...old, legendPosition: value }));
  };

  appendTrace = () => {
    let newLayout;
    if (
      this.state.plotLayout.xaxis.title.text === 'X-axis' &&
      this.state.plotLayout.yaxis.title.text === 'Y-axis'
    ) {
      newLayout = {
        title: { text: 'New chart' },
        xaxis: {
          title: { text: this.state.xData },
          exponentformat: 'power',
          autorange: true,
          type: 'normal'
        },
        yaxis: {
          title: { text: this.state.yData },
          exponentformat: 'power',
          autorange: true,
          type: 'normal'
        },
        zaxis: {
          title: { text: this.state.zData },
          exponentformat: 'power',
          autorange: true,
          type: 'normal'
        },
        showlegend: true,
        legend: { orientation: this.state.legendPosition }
      };
    } else {
      newLayout = this.state.plotLayout;
    }

    this.setState(old => {
      let newTraceName = old.traceName;
      if (newTraceName === '') {
        newTraceName = `${old.xData}-${old.yData}:${old.plotType}`;
      }
      const traceConfigItem = {
        name: newTraceName,
        plotType: old.plotType,
        dataSource: old.dataSource,

        xAxisConfig: old.xAxisConfig,
        systemNameX: old.systemNameX,
        recorderRefX: old.recorderRefX,
        xData: old.xData,
        xDataIndex: old.xDataIndex,

        yAxisConfig: old.yAxisConfig,
        systemNameY: old.systemNameY,
        recorderRefY: old.recorderRefY,
        yData: old.yData,
        yDataIndex: old.yDataIndex,

        zAxisConfig: old.zAxisConfig,
        systemNameZ: old.systemNameZ,
        recorderRefZ: old.recorderRefZ,
        zData: old.zData,
        zDataIndex: old.zDataIndex
      };
      const newTraceConfig = {
        ...old.traceConfig,
        [newTraceName]: traceConfigItem
      };
      const newTraceData = this.plotDataFactory(
        newTraceConfig,
        old.dictRecorderRef,
        old.advancedTraceDataConfig
      );

      return {
        ...old,
        plotLayout: newLayout,
        traceConfig: newTraceConfig,
        traceData: newTraceData
      };
    });
  };

  newTrace = () => {
    let newLayout;
    if (
      this.state.plotLayout.xaxis.title.text === 'X-axis' &&
      this.state.plotLayout.yaxis.title.text === 'Y-axis' &&
      this.state.plotLayout.title.text === 'New chart'
    ) {
      newLayout = {
        title: { text: 'New chart' },
        xaxis: {
          title: { text: this.state.xData },
          exponentformat: 'power',
          autorange: true,
          type: 'normal'
        },
        yaxis: {
          title: { text: this.state.yData },
          exponentformat: 'power',
          autorange: true,
          type: 'normal'
        },
        zaxis: {
          title: { text: this.state.zData },
          exponentformat: 'power',
          autorange: true,
          type: 'normal'
        },
        showlegend: true,
        legend: { orientation: this.state.legendPosition }
      };
    } else {
      newLayout = this.state.plotLayout;
    }
    this.setState(old => {
      let newTraceName = old.traceName;
      if (newTraceName === '') {
        newTraceName = `${old.xData}-${old.yData}:${old.plotType}`;
      }
      const traceConfigItem = {
        name: newTraceName,
        plotType: old.plotType,
        dataSource: old.dataSource,

        xAxisConfig: old.xAxisConfig,
        systemNameX: old.systemNameX,
        recorderRefX: old.recorderRefX,
        xData: old.xData,
        xDataIndex: old.xDataIndex,

        yAxisConfig: old.yAxisConfig,
        systemNameY: old.systemNameY,
        recorderRefY: old.recorderRefY,
        yData: old.yData,
        yDataIndex: old.yDataIndex,

        zAxisConfig: old.zAxisConfig,
        systemNameZ: old.systemNameZ,
        recorderRefZ: old.recorderRefZ,
        zData: old.zData,
        zDataIndex: old.zDataIndex
      };
      const newTraceConfig = {
        [newTraceName]: traceConfigItem
      };
      const newTraceData = this.plotDataFactory(
        newTraceConfig,
        old.dictRecorderRef,
        this.state.advancedTraceDataConfig
      );

      return {
        ...old,
        plotLayout: newLayout,
        traceConfig: newTraceConfig,
        traceData: newTraceData
      };
    });
  };
  /**
   *
   *
   * @memberof ChartElement
   */
  plotDataFactory = (
    data: ITraceData,
    dictRecorderRef: { [key: string]: string[] },
    advancedTraceConfig = {},
    source: 'advanced' | 'interface' = 'interface'
  ) => {
    const newData: ITraceData = {};
    for (const [key, trace] of Object.entries(data)) {
      if (trace.dataSource === 'Recorders') {
        // Only check the case of all index for recorder
        const xDataIndexList =
          this.state.dictRecorderVariableLength[trace.systemNameX][
            trace.xData
          ].slice(1);
        const yDataIndexList =
          this.state.dictRecorderVariableLength[trace.systemNameY][
            trace.yData
          ].slice(1);

        if (trace.xAxisConfig && trace.yAxisConfig) {
          // If both x axis and y axis are configured
          if (trace.recorderRefX === 'All' && trace.recorderRefY === 'All') {
            // Plot all time step
            if (trace.xDataIndex === 'All') {
              // Plot all index of x data
              if (trace.yDataIndex === 'All') {
                // Plot all index of y data
                for (
                  let idx = 0;
                  idx < Math.min(xDataIndexList.length, yDataIndexList.length);
                  idx++
                ) {
                  const newKey = `${key}[${idx}]`;
                  const newTrace = { ...trace };
                  newTrace['name'] = newKey;
                  newTrace['xDataIndex'] = idx + '';
                  newTrace['yDataIndex'] = idx + '';
                  newData[newKey] = newTrace;
                }
              } else {
                // plot all index of x but not y
                for (let idx = 0; idx < xDataIndexList.length; idx++) {
                  const newKey = `${key}[${idx}]`;
                  const newTrace = { ...trace };
                  newTrace['name'] = newKey;
                  newTrace['xDataIndex'] = idx + '';
                  newData[newKey] = newTrace;
                }
              }
            } else {
              // Plot only one index of x data
              if (trace.yDataIndex === 'All') {
                //Plot all index of y data
                for (let idx = 0; idx < yDataIndexList.length; idx++) {
                  const newKey = `${key}[${idx}]`;
                  const newTrace = { ...trace };
                  newTrace['yDataIndex'] = idx + '';
                  newData[newKey] = newTrace;
                }
              } else {
                // Plot one index of both x data and y data -> no change
                newData[key] = trace;
              }
            }
          } else {
            // Plot only one time step -> no change
            newData[key] = trace;
          }
        } else if (trace.xAxisConfig && !trace.yAxisConfig) {
          // y axis is not configured
          if (trace.recorderRefX === 'All') {
            if (trace.xDataIndex === 'All') {
              for (let idx = 0; idx < xDataIndexList.length; idx++) {
                const newKey = `${key}[${idx}]`;
                const newTrace = { ...trace };
                newTrace['name'] = newKey;
                newTrace['xDataIndex'] = idx + '';
                newData[newKey] = newTrace;
              }
            } else {
              // Plot only one index of x data -> no change
              newData[key] = trace;
            }
          } else {
            // Plot only one time step -> no change
            newData[key] = trace;
          }
        } else if (!trace.xAxisConfig && trace.yAxisConfig) {
          // x axis is not configured
          if (trace.recorderRefY === 'All') {
            // Plot all time step
            if (trace.yDataIndex === 'All') {
              for (let idx = 0; idx < yDataIndexList.length; idx++) {
                const newKey = `${key}[${idx}]`;
                const newTrace = { ...trace };
                newTrace['name'] = newKey;
                newTrace['yDataIndex'] = idx + '';
                newData[newKey] = newTrace;
              }
            } else {
              // Plot only one index of x data -> no change
              newData[key] = trace;
            }
          } else {
            // Plot only one time step -> no change
            newData[key] = trace;
          }
        } else {
          // both x axis and y axis are deactivated
          newData[key] = trace;
        }
      } else {
        newData[key] = trace;
      }
    }

    const traceData = [];
    const carpetRange = [Infinity, -Infinity];
    for (const key in newData) {
      const trace = newData[key];
      const traceItem: IDict<any> = { name: trace.name };
      let contourCarpetItem = null;
      let mode_3D = false;
      if (trace.plotType === 'lines') {
        traceItem['type'] = 'scatter';
        traceItem['mode'] = 'lines';
      } else if (trace.plotType === 'bar') {
        traceItem['type'] = 'bar';
      } else if (trace.plotType === 'scatter') {
        traceItem['type'] = 'scatter';
        traceItem['mode'] = 'markers';
      } else if (trace.plotType === 'contour') {
        traceItem['type'] = 'carpet';
        traceItem['aaxis'] = { showticklabels: 'none', showgrid: false };
        traceItem['baxis'] = { showticklabels: 'none', showgrid: false };
        traceItem['carpet'] =
          Math.random().toString(36).substr(2, 16) +
          Math.random().toString(36).substr(2, 16);
        mode_3D = true;
      } else if (trace.plotType === '3d scatter') {
        traceItem['type'] = 'scatter3d';
        traceItem['mode'] = 'markers';
        mode_3D = true;
      }
      let xVar, yVar, zVar;

      if (trace.dataSource === 'Variables') {
        const xKey = `${trace.systemNameX}.${trace.xData}`;
        const yKey = `${trace.systemNameY}.${trace.yData}`;

        if (trace.xDataIndex === 'All') {
          xVar = this.props.computedResult[xKey][1];
        } else {
          xVar = this.props.computedResult[xKey][1][parseInt(trace.xDataIndex)];
        }
        if (trace.yDataIndex === 'All') {
          yVar = this.props.computedResult[yKey][1];
        } else {
          yVar = this.props.computedResult[yKey][1][parseInt(trace.yDataIndex)];
        }
        if (mode_3D) {
          const zKey = `${trace.systemNameZ}.${trace.zData}`;
          if (trace.zDataIndex === 'All') {
            zVar = this.props.computedResult[zKey][1];
          } else {
            zVar =
              this.props.computedResult[zKey][1][parseInt(trace.zDataIndex!)];
          }
        }
      } else if (trace.dataSource === 'Recorders') {
        const xDataMat: Array<any> =
          this.props.recorderData[trace.systemNameX][trace.xData];

        xVar = ChartElement.recorderDataSelector(
          dictRecorderRef,
          trace.recorderRefX,
          trace.xDataIndex,
          trace.systemNameX,
          xDataMat
        );

        const yDataMat =
          this.props.recorderData[trace.systemNameY][trace.yData];

        yVar = ChartElement.recorderDataSelector(
          dictRecorderRef,
          trace.recorderRefY,
          trace.yDataIndex,
          trace.systemNameY,
          yDataMat
        );

        if (mode_3D) {
          const zDataMat =
            this.props.recorderData[trace.systemNameZ!][trace.zData];

          zVar = ChartElement.recorderDataSelector(
            dictRecorderRef,
            trace.recorderRefZ!,
            trace.zDataIndex!,
            trace.systemNameZ!,
            zDataMat
          );
        }
      } else if (trace.dataSource === 'Drivers data') {
        xVar = this.props.driverData[trace.systemNameX][trace.xData];
        yVar = this.props.driverData[trace.systemNameY][trace.yData];
      }

      if (trace.xAxisConfig && trace.yAxisConfig) {
        traceItem['x'] = Array.isArray(xVar) ? xVar : [xVar];
        traceItem['y'] = Array.isArray(yVar) ? yVar : [yVar];
        if (trace.plotType === 'contour') {
          const { a, b, x, y, z } = carpet_data_factory(xVar, yVar, zVar);
          traceItem['a'] = a;
          traceItem['b'] = b;
          traceItem['x'] = x;
          traceItem['y'] = y;
          traceItem['z'] = z;

          carpetRange[0] = Math.min(carpetRange[0], Math.min(...z));
          carpetRange[1] = Math.max(carpetRange[1], Math.max(...z));
          if (trace.zAxisConfig) {
            contourCarpetItem = {
              name: trace.name + '_contour_carpet',
              type: 'contourcarpet',
              a,
              b,
              z,
              colorscale: 'RdBu',
              contours: { showlabels: true },
              carpet: traceItem['carpet'],
              colorbar: {
                exponentformat: 'power'
              }
            };
          } else {
            traceItem['aaxis'] = { showticklabels: 'none', showgrid: false };
            traceItem['baxis'] = { showticklabels: 'none', showgrid: false };
          }
        } else if (trace.plotType === '3d scatter') {
          traceItem['z'] = Array.isArray(zVar) ? zVar : [zVar];
        }
        if (
          trace.dataSource === 'Recorders' &&
          trace.recorderRefX === 'All' &&
          trace.recorderRefY === 'All'
        ) {
          traceItem['text'] = dictRecorderRef[trace.systemNameX]
            .slice(1)
            .map(val => 'Ref. = ' + val);
        }
      } else if (trace.xAxisConfig && !trace.yAxisConfig) {
        traceItem['x'] = Array.isArray(xVar) ? xVar : [xVar];

        if (trace.dataSource === 'Recorders' && trace.recorderRefX === 'All') {
          traceItem['y'] = dictRecorderRef[trace.systemNameX].slice(1);
        }
      } else if (!trace.xAxisConfig && trace.yAxisConfig) {
        traceItem['y'] = Array.isArray(yVar) ? yVar : [yVar];
        if (trace.dataSource === 'Recorders' && trace.recorderRefY === 'All') {
          traceItem['x'] = dictRecorderRef[trace.systemNameY].slice(1);
        }
      }

      traceData.push(traceItem);
      if (contourCarpetItem) {
        traceData.push(contourCarpetItem);
      }
    }

    traceData.forEach(data => {
      if (
        data.type === 'contourcarpet' &&
        carpetRange[0] !== Infinity &&
        carpetRange[1] !== -Infinity
      ) {
        const start = carpetRange[0];
        const end = carpetRange[1];
        const size = (end - start) / 10;
        (data as any).autocontour = false;
        data.contours = {
          showlabels: true,
          start,
          end,
          size
        };
      }

      const advancedData = advancedTraceConfig[data.name];
      if (advancedData) {
        for (const key in advancedData) {
          if (source === 'advanced') {
            data[key] = JSON.parse(JSON.stringify(advancedData[key]));
          } else if (source === 'interface') {
            if (!(key in data)) {
              data[key] = JSON.parse(JSON.stringify(advancedData[key]));
            }
          }
        }
      }
    });

    return traceData;
  };

  static recorderDataSelector = (
    dictRecorderRef: any,
    recorderRef: string,
    dataIndex: string,
    systemName: string,
    dataMat: Array<any>
  ) => {
    let dataValue;
    if (recorderRef === 'All') {
      if (dataIndex === 'All') {
        dataValue = { ...dataMat };
      } else {
        dataValue = [];
        dataMat.forEach(element => {
          dataValue.push(element[parseInt(dataIndex)]);
        });
      }
    } else {
      const refIndex = dictRecorderRef[systemName].indexOf(recorderRef) - 1;

      if (dataIndex === 'All') {
        dataValue = dataMat[refIndex];
      } else {
        dataValue = dataMat[refIndex][parseInt(dataIndex)];
      }
    }
    return dataValue;
  };

  removeAdvancedSetting = () => {
    const currentTraceName = this.state.advanceTraceNameHistory;
    const { [currentTraceName]: _, ...rest } =
      this.state.advancedTraceDataConfig;
    const newTraceData = this.plotDataFactory(
      this.state.traceConfig,
      this.state.dictRecorderRef,
      rest,
      'advanced'
    );

    if (Object.keys(rest).length === 0) {
      this.setState(
        old => ({
          ...old,
          advancedTraceDataConfig: rest,
          traceData: newTraceData
        }),
        this.closeDialog
      );
    } else {
      const firstKey = Object.keys(rest)[0];
      const firstData = JSON.stringify(rest[firstKey], null, 2);
      this.setState(old => ({
        ...old,
        advancedTraceDataConfig: rest,
        traceData: newTraceData,
        advanceTraceNameHistory: firstKey,
        currentAdvancedTraceDataConfig: firstData
      }));
    }
  };
  saveAdvancedSetting = () => {
    const currentTraceName = this.state.advanceTraceNameHistory;

    try {
      const newData = JSON.parse(this.state.currentAdvancedTraceDataConfig);
      const newAdvancedTraceDataConfig = {
        ...this.state.advancedTraceDataConfig,
        [currentTraceName]: newData
      };
      const newTraceData = this.plotDataFactory(
        this.state.traceConfig,
        this.state.dictRecorderRef,
        newAdvancedTraceDataConfig,
        'advanced'
      );
      this.setState(old => ({
        ...old,
        advancedTraceDataConfig: newAdvancedTraceDataConfig,
        traceData: newTraceData
      }));
    } catch (error) {
      alert(error);
    }
  };

  saveSetting = () => {
    const oldTraceName = this.state.traceNameHistory;
    const editedTraceName = this.state.traceName;

    this.setState(old => {
      const traceConfigItem = {
        name: editedTraceName,
        plotType: old.plotType,
        dataSource: old.dataSource,

        xAxisConfig: old.xAxisConfig,
        systemNameX: old.systemNameX,
        recorderRefX: old.recorderRefX,
        xData: old.xData,
        xDataIndex: old.xDataIndex,

        yAxisConfig: old.yAxisConfig,
        systemNameY: old.systemNameY,
        recorderRefY: old.recorderRefY,
        yData: old.yData,
        yDataIndex: old.yDataIndex,

        zAxisConfig: old.zAxisConfig,
        systemNameZ: old.systemNameZ,
        recorderRefZ: old.recorderRefZ,
        zData: old.zData,
        zDataIndex: old.zDataIndex
      };

      const { [oldTraceName]: _, ...removedTraceConfig } = old.traceConfig;
      const newTraceConfig = {
        ...removedTraceConfig,
        [editedTraceName]: traceConfigItem
      };

      const newTraceData = this.plotDataFactory(
        newTraceConfig,
        old.dictRecorderRef,
        this.state.advancedTraceDataConfig
      );

      return {
        ...old,
        traceNameHistory: editedTraceName,
        traceConfig: newTraceConfig,
        traceData: newTraceData
      };
    });
  };

  removeTrace = () => {
    const oldTraceName = this.state.traceNameHistory;

    this.setState(old => {
      const { [oldTraceName]: _, ...removedTraceConfig } = old.traceConfig;
      const removedTraceData = [];
      for (let idx = 0; idx < old.traceData.length; idx++) {
        const element = old.traceData[idx];
        if (element.name !== oldTraceName) {
          removedTraceData.push(element);
        }
      }
      const traceNameHistory = Object.keys(removedTraceConfig)[0];

      return {
        ...old,
        traceNameHistory,
        traceConfig: removedTraceConfig,
        traceData: removedTraceData
      };
    });
  };

  layoutAxisConfigFactory = (axis: 'x' | 'y' | 'z') => {
    return (
      <FormGroup style={{ flexDirection: 'row' }}>
        <FormControl
          className={this.props.classes.formControlTiny}
          style={{ margin: '8px 8px 8px 8px' }}
        >
          <TextField
            label={`${axis.toUpperCase()}-Axis title`}
            className={this.props.classes.textField}
            value={this.state.plotLayoutConfig[`${axis}Axis`]}
            onChange={this.handlePlotLayoutChange(`${axis}Axis` as any)}
            margin="normal"
          />
        </FormControl>
        <FormControl
          className={this.props.classes.formControlTiny}
          style={{ paddingTop: '16px' }}
        >
          <div
            style={{
              width: '90%',
              margin: '8px 8px 8px 8px',
              position: 'relative'
            }}
          >
            <InputLabel
              id={`${axis}-axis-scale-id`}
            >{`${axis.toUpperCase()}-Axis scale`}</InputLabel>
            <Select
              labelId={`${axis}-axis-scale-id`}
              style={{ width: '100%' }}
              value={this.state[`${axis}AxisScale`]}
              onChange={this.handleAxisChange(`${axis}` as any)}
            >
              <MenuItem value={'normal'}>Linear Auto</MenuItem>
              <MenuItem value={'normal fixed'}>Linear fixed</MenuItem>
              <MenuItem value={'log'}>Log Auto</MenuItem>
              <MenuItem value={'log fixed'}>Log fixed</MenuItem>
            </Select>
          </div>
        </FormControl>
        <FormControl
          className={this.props.classes.formControlTiny}
          style={{ margin: '8px 8px 8px 8px' }}
        >
          <TextField
            label={`${axis.toUpperCase()}-Axis min`}
            className={this.props.classes.textField}
            value={this.state.plotLayoutConfig[`${axis}AxisMin`]}
            onChange={this.handlePlotLayoutChange(`${axis}AxisMin` as any)}
            margin="normal"
          />
        </FormControl>
        <FormControl
          className={this.props.classes.formControlTiny}
          style={{ margin: '8px 8px 8px 8px' }}
        >
          <TextField
            label={`${axis.toUpperCase()}-Axis max`}
            className={this.props.classes.textField}
            value={this.state.plotLayoutConfig[`${axis}AxisMax`]}
            onChange={this.handlePlotLayoutChange(`${axis}AxisMax` as any)}
            margin="normal"
          />
        </FormControl>
      </FormGroup>
    );
  };

  render() {
    this.dialogInput = {
      traceSelector: (
        <FormControl className={this.props.classes.formControl}>
          <Autocomplete
            disableClearable={true}
            value={this.state.traceNameHistory}
            onChange={this.handleTraceSelectorChange}
            options={Object.keys(this.state.traceConfig)}
            renderInput={params => (
              <TextField
                {...params}
                variant="standard"
                label="Select trace"
                placeholder=""
                fullWidth
              />
            )}
          />
        </FormControl>
      ),

      traceName: (
        <FormControl className={this.props.classes.formControl}>
          <TextField
            value={this.state.traceName}
            onChange={this.handleTraceNameChange}
            label="Trace name"
          />
        </FormControl>
      ),
      dataSource: (
        <FormControl className={this.props.classes.formControlShort}>
          <InputLabel id="data-source-id">Select data source</InputLabel>
          <Select
            labelId="data-source-id"
            value={this.state.dataSource}
            onChange={this.handleDatasourceChange}
          >
            <MenuItem value={'Variables'}>Variables</MenuItem>
            <MenuItem
              disabled={this.state.listRecorder.length === 0}
              value={'Recorders'}
            >
              Recorders
            </MenuItem>
            <MenuItem
              disabled={this.state.listDriverWithTrace.length === 0}
              value={'Drivers data'}
            >
              Drivers data
            </MenuItem>
          </Select>
        </FormControl>
      ),
      plotType: (
        <FormControl className={this.props.classes.formControlShort}>
          <InputLabel id="plot-type-select-id">Select plot type</InputLabel>
          <Select
            labelId="plot-type-select-id"
            value={this.state.plotType}
            onChange={this.handlePlotTypeChange}
          >
            <MenuItem value={'scatter'}>Scatter charts</MenuItem>
            <MenuItem value={'lines'}>Line charts</MenuItem>
            <MenuItem value={'bar'}>Bar charts</MenuItem>
            <MenuItem value={'contour'}>Contour charts</MenuItem>
            <MenuItem value={'3d scatter'}>3D Scatter charts</MenuItem>
          </Select>
        </FormControl>
      ),
      systemAndRefX: chartConfigComp(
        {
          classes: this.props.classes,
          axisConfig: this.state.xAxisConfig,
          handleaxisConfig: this.handleAxisConfig('x'),
          systemName: this.state.systemNameX,
          handleSystemSelectChange: this.handleSystemSelectChange('x'),
          listSelector: this.state.listSelector,
          dictSelector: this.state.dictSelector,
          dataSource: this.state.dataSource,
          recorderRef: this.state.recorderRefX,
          handlerecorderRefChange: this.handleRecorderRefChange('x'),
          dictRecorderRef: this.state.dictRecorderRef,
          axisData: this.state.xData,
          handleDataChange: this.handleDataChange('x'),
          dataIndex: this.state.xDataIndex,
          handleDataIndexChange: this.handleDataIndexChange('x'),
          dictRecorderVariableLength: this.state.dictRecorderVariableLength,
          dictSystemVariableLength: this.state.dictSystemVariableLength
        },
        'X'
      ),
      systemAndRefY: chartConfigComp(
        {
          classes: this.props.classes,
          axisConfig: this.state.yAxisConfig,
          handleaxisConfig: this.handleAxisConfig('y'),
          systemName: this.state.systemNameY,
          handleSystemSelectChange: this.handleSystemSelectChange('y'),
          listSelector: this.state.listSelector,
          dictSelector: this.state.dictSelector,
          dataSource: this.state.dataSource,
          recorderRef: this.state.recorderRefY,
          handlerecorderRefChange: this.handleRecorderRefChange('y'),
          dictRecorderRef: this.state.dictRecorderRef,
          axisData: this.state.yData,
          handleDataChange: this.handleDataChange('y'),
          dataIndex: this.state.yDataIndex,
          handleDataIndexChange: this.handleDataIndexChange('y'),
          dictRecorderVariableLength: this.state.dictRecorderVariableLength,
          dictSystemVariableLength: this.state.dictSystemVariableLength
        },
        'Y'
      ),
      systemAndRefZ: chartConfigComp(
        {
          classes: this.props.classes,
          axisConfig: this.state.zAxisConfig,
          handleaxisConfig: this.handleAxisConfig('z'),
          systemName: this.state.systemNameZ,
          handleSystemSelectChange: this.handleSystemSelectChange('z'),
          listSelector: this.state.listSelector,
          dictSelector: this.state.dictSelector,
          dataSource: this.state.dataSource,
          recorderRef: this.state.recorderRefZ,
          handlerecorderRefChange: this.handleRecorderRefChange('z'),
          dictRecorderRef: this.state.dictRecorderRef,
          axisData: this.state.zData,
          handleDataChange: this.handleDataChange('z'),
          dataIndex: this.state.zDataIndex,
          handleDataIndexChange: this.handleDataIndexChange('z'),
          dictRecorderVariableLength: this.state.dictRecorderVariableLength,
          dictSystemVariableLength: this.state.dictSystemVariableLength
        },
        'Z'
      )
    };
    let buttonBlock: JSX.Element;
    let dialogContent: JSX.Element;
    if (this.state.dialogType === 'new') {
      buttonBlock = (
        <DialogActions>
          <Button autoFocus onClick={this.closeDialog} color="primary">
            Close
          </Button>
          <Button autoFocus onClick={this.appendTrace} color="primary">
            Append
          </Button>
          <Button autoFocus onClick={this.newTrace} color="primary">
            Plot
          </Button>
        </DialogActions>
      );
      dialogContent = (
        <DialogContent style={{ paddingTop: '0px' }}>
          {this.dialogInput.traceName}
          <FormControl className={this.props.classes.formControl}>
            <FormGroup style={{ flexDirection: 'row' }}>
              {this.dialogInput.plotType}
              {this.dialogInput.dataSource}
            </FormGroup>
          </FormControl>
          {this.dialogInput.systemAndRefX}
          {this.dialogInput.systemAndRefY}
          {['contour', '3d scatter'].includes(this.state.plotType) &&
          this.state.dataSource !== 'Drivers data' ? (
            this.dialogInput.systemAndRefZ
          ) : (
            <div></div>
          )}
        </DialogContent>
      );
    } else if (this.state.dialogType === 'edit') {
      dialogContent = (
        <DialogContent>
          {this.dialogInput.traceSelector}
          {this.dialogInput.traceName}
          <FormControl className={this.props.classes.formControl}>
            <FormGroup style={{ flexDirection: 'row' }}>
              {this.dialogInput.plotType}
              {this.dialogInput.dataSource}
            </FormGroup>
          </FormControl>
          {this.dialogInput.systemAndRefX}
          {this.dialogInput.systemAndRefY}
          {['contour', '3d scatter'].includes(this.state.plotType) ? (
            this.dialogInput.systemAndRefZ
          ) : (
            <div></div>
          )}
        </DialogContent>
      );
      buttonBlock = (
        <DialogActions>
          <Button autoFocus onClick={this.closeDialog} color="primary">
            Close
          </Button>
          <Button autoFocus onClick={this.removeTrace} color="primary">
            Remove
          </Button>
          <Button autoFocus onClick={this.saveSetting} color="primary">
            Save
          </Button>
        </DialogActions>
      );
    } else if (this.state.dialogType === 'advance') {
      dialogContent = (
        <DialogContent>
          <FormControl className={this.props.classes.formControl}>
            <Autocomplete
              disableClearable={true}
              value={this.state.advanceTraceNameHistory}
              onChange={this.handleAdvanceTraceSelectorChange}
              options={Object.keys(this.state.advancedTraceDataConfig)}
              renderInput={params => (
                <TextField
                  {...params}
                  variant="standard"
                  label="Select trace"
                  placeholder=""
                  fullWidth
                />
              )}
            />
          </FormControl>
          <FormControl className={this.props.classes.formControl}>
            <CodeMirror
              value={this.state.currentAdvancedTraceDataConfig}
              height="100%"
              extensions={[javascript()]}
              basicSetup={{
                lineNumbers: true,
                tabSize: 2,
                foldGutter: true
              }}
              onChange={value => {
                this.setState(old => ({
                  ...old,
                  currentAdvancedTraceDataConfig: value
                }));
              }}
            />
          </FormControl>
        </DialogContent>
      );
      buttonBlock = (
        <DialogActions>
          <Button autoFocus onClick={this.closeDialog} color="primary">
            Close
          </Button>
          <Button
            autoFocus
            onClick={this.removeAdvancedSetting}
            color="secondary"
          >
            Remove
          </Button>
          <Button autoFocus onClick={this.saveAdvancedSetting} color="primary">
            Save
          </Button>
        </DialogActions>
      );
    }
    const xAxisPlotLayouGroup = this.layoutAxisConfigFactory('x');
    const yAxisPlotLayouGroup = this.layoutAxisConfigFactory('y');
    const zAxisPlotLayouGroup = this.layoutAxisConfigFactory('z');
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
            style={{ cursor: 'move', paddingTop: '8px', paddingBottom: '0px' }}
            className="draggable-dialog-title"
          >
            Plot configuration
          </DialogTitle>
          {dialogContent}
          {buttonBlock}
        </Dialog>
        <Dialog
          open={this.state.layoutSettingDialog}
          aria-labelledby="draggable-dialog-title"
          fullWidth={true}
          maxWidth="md"
          PaperComponent={PaperComponent}
        >
          <DialogTitle
            style={{ cursor: 'move' }}
            className="draggable-dialog-title"
          >
            Layout configuration
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Plot title"
              className={this.props.classes.textField}
              value={this.state.plotLayoutConfig.title}
              onChange={this.handlePlotLayoutChange('title')}
              margin="normal"
            />
            {xAxisPlotLayouGroup}
            {yAxisPlotLayouGroup}
            {zAxisPlotLayouGroup}
            <FormGroup style={{ flexDirection: 'row' }}>
              <FormControl className={this.props.classes.formControlShort}>
                <div
                  style={{
                    width: '90%',
                    margin: '8px 8px 8px 8px',
                    position: 'relative'
                  }}
                >
                  <InputLabel id="legend-position-id">
                    Select legend position
                  </InputLabel>
                  <Select
                    labelId="legend-position-id"
                    style={{ width: '100%' }}
                    value={this.state.legendPosition}
                    onChange={this.handleLegendPosition}
                  >
                    <MenuItem value={'v'}>Vertical</MenuItem>
                    <MenuItem value={'h'}>Horizontal</MenuItem>
                  </Select>
                </div>
              </FormControl>
            </FormGroup>
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={this.openLayoutSetting} color="primary">
              Close
            </Button>
            <Button autoFocus onClick={this.updatePlotLayout} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        <Plot
          style={{ width: '100%', height: 'calc(100% - 35px)' }}
          data={this.state.traceData}
          layout={this.state.plotLayout}
          config={{ responsive: true }}
        />
        <div className={this.props.classes.bottomBarDiv}>
          {/* <IconButton
            onClick={this.openSetting}
            color='secondary'
            style={{
              margin: 0,
              position: "absolute",
              top: "auto",
              right: 0,
              bottom: 0,
              left: "auto",
            }}
            aria-label='setting'>
            <SettingsIcon />
          </IconButton> */}
          <Button onClick={this.openSetting} style={{ color: 'rgb(50,50,50)' }}>
            <AddCircleIcon />
          </Button>
          <Button onClick={this.openEditing} style={{ color: 'rgb(50,50,50)' }}>
            <EditIcon />
          </Button>
          <Button
            onClick={this.openAdvancedEdit}
            style={{ color: 'rgb(50,50,50)' }}
          >
            <StorageIcon />
          </Button>
          <Button
            onClick={this.openLayoutSetting}
            style={{ color: 'rgb(50,50,50)' }}
          >
            {' '}
            <SettingsIcon />
          </Button>
        </div>
      </div>
    );
  }
}

interface IProps {
  classes: any;
  axisConfig: boolean;
  handleaxisConfig: () => void;
  systemName: string;
  handleSystemSelectChange: (
    event: React.ChangeEvent<any>,
    value: string
  ) => void;
  listSelector: string[];
  dictSelector: { [key: string]: any };
  dataSource: string;
  recorderRef: string;
  handlerecorderRefChange: (
    event: React.ChangeEvent<any>,
    value: string
  ) => void;
  dictRecorderRef: { [key: string]: any };
  axisData: string;
  handleDataChange: (event: React.ChangeEvent<any>, value: string) => void;
  dataIndex: string;
  handleDataIndexChange: (event: React.ChangeEvent<any>, value: string) => void;
  dictRecorderVariableLength: { [key: string]: any };
  dictSystemVariableLength: { [key: string]: any };
}

function chartConfigComp(props: IProps, axis: string) {
  let indexAutoComplete: JSX.Element;
  if (props.dataSource === 'Recorders' || props.dataSource === 'Variables') {
    indexAutoComplete = (
      <Autocomplete
        disabled={!props.axisConfig}
        disableClearable={true}
        value={props.dataIndex}
        onChange={props.handleDataIndexChange}
        options={
          props.dataSource === 'Recorders'
            ? props.dictRecorderVariableLength[props.systemName][props.axisData]
            : props.dictSystemVariableLength[props.systemName][props.axisData]
        }
        renderInput={params => (
          <TextField
            {...params}
            variant="standard"
            label="Select variable index"
            placeholder=""
            fullWidth
          />
        )}
      />
    );
  } else if (props.dataSource === 'Drivers data') {
    indexAutoComplete = (
      <Autocomplete
        disabled={true}
        disableClearable={true}
        value={'None'}
        options={['None']}
        renderInput={params => (
          <TextField
            {...params}
            variant="standard"
            label="Select variable index"
            placeholder=""
            fullWidth
          />
        )}
      />
    );
  }

  return (
    <FormControl className={props.classes.formControl}>
      <FormLabel component="legend">
        <span
          style={{
            color: props.axisConfig ? '#3f51b5' : 'rgba(0, 0, 0, 0.54)'
          }}
        >
          {`${axis}-Axis configuration`}
        </span>
        <span style={{ marginLeft: '5%' }}></span>
        <Switch
          checked={props.axisConfig}
          onChange={props.handleaxisConfig}
          color="primary"
          size="small"
        />
      </FormLabel>
      <FormGroup style={{ flexDirection: 'row' }}>
        <Autocomplete // System or recorder name
          disabled={!props.axisConfig}
          className={props.classes.formControlShort}
          value={props.systemName}
          onChange={props.handleSystemSelectChange}
          options={props.listSelector}
          getOptionLabel={option => {
            const newLabel = option.replace('chart_viewer.', '');
            return newLabel;
          }}
          defaultValue={props.listSelector[0]}
          disableClearable={true}
          renderInput={params => (
            <TextField
              {...params}
              variant="standard"
              label={
                props.dataSource !== 'Recorders'
                  ? 'Select system'
                  : 'Select recorder'
              }
              placeholder=""
              fullWidth
            />
          )}
        />
        <Autocomplete // Recorder ref, invisible in case of variable data source
          disabled={!props.axisConfig || props.dataSource !== 'Recorders'}
          disableClearable={true}
          className={props.classes.formControlShort}
          value={props.dataSource === 'Recorders' ? props.recorderRef : 'None'}
          onChange={props.handlerecorderRefChange}
          options={
            props.dataSource === 'Recorders'
              ? props.dictRecorderRef[props.systemName]
              : ['None']
          }
          defaultValue="All"
          renderInput={params => (
            <TextField
              {...params}
              variant="standard"
              label="Select reference"
              placeholder=""
              fullWidth
            />
          )}
        />
        <FormControl className={props.classes.formControlShort}>
          <Autocomplete
            disabled={!props.axisConfig}
            disableClearable={true}
            value={props.axisData}
            onChange={props.handleDataChange}
            options={props.dictSelector[props.systemName]}
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
        <FormControl className={props.classes.formControlShort}>
          {indexAutoComplete}
        </FormControl>
      </FormGroup>
    </FormControl>
  );
}

export default connect(mapStateToProps, mapDispatchToProps, null, {
  forwardRef: true
})(
  withStyles(styles)(
    forwardRef((props: AppProps, ref: any) => (
      <ChartElement {...props} ref={ref} />
    ))
  )
);
