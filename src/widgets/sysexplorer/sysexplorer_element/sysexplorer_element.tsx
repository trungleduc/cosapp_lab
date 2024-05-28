import * as FlexLayout from 'flexlayout-react';
import { ServerConnection } from '@jupyterlab/services';
import { withStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import { Theme } from '@material-ui/core/styles';
import AddToPhotosOutlinedIcon from '@material-ui/icons/AddToPhotosOutlined';
import { Styles } from '@material-ui/styles/withStyles';
import 'flexlayout-react/style/light.css';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import * as ReduxAction from '../../redux/actions';
import CoSAppGetUrl from '../../../cosapp_app/cosapp_url';
import ChartElement from '../../chart_viewer/chart_element/chartelement';
import GraphPanel from '../../connection_viewer/connection_element/graph_view';
import Controller from '../../controller/controller_element/controller';
import DataViewer from '../../data_viewer/data_element/data_viewer';
import GeometryElement from '../../geometry_viewer/geometry_element/geometry_element';
import PBSElement from '../../pbs_viewer/pbs_element/pbs_element';
import { IDict, StateInterface } from '../../redux/types';
import StructureElement from '../../structure_widget/structure_element/structure_element';
import SystemInfoElement from '../../system_info_widget/system_info_element/system_info_element';
import DocumentViewer, { IAvailableDocument } from './document_viewer';
import WidgetViewer, { IAvailableWidget } from './widget_viewer';

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
    color: 'rgb(250, 250, 250)',
    background: '#525354',
    margin: '0px 5px'
  },
  backGround: {
    color: 'rgb(50, 50, 50)'
  },
  formControl: {
    padding: theme.spacing(1),
    width: '90%'
  }
});

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
    }) => dispatch(ReduxAction.dashboardUpdateComputedResult(data)),
    toggleComputing: () => dispatch(ReduxAction.dashboardToggleRun()),
    setControllerState: (data: { [key: string]: number }) =>
      dispatch(ReduxAction.dashboardSetController(data))
  };
};

interface AppProps {
  send_msg: any;
  model: any;
  classes: any;
  selectedVariable: { [key: string]: number };
  computingState: boolean;
  systemConfig: IDict<any>;
  toggleComputing: () => void;
  setControllerState: (data: { [key: string]: number }) => void;
  updateComputedResult: (data: {
    variable: { [key: string]: any };
    recorder: { [key: string]: any };
    driver: { [key: string]: any };
  }) => void;
}

interface AppStates {
  model: FlexLayout.Model; // Model of FlexLayout
  selectedTab: string;
  saveDialog: boolean;
  jsonName: string;
  enableClose: boolean;
}

const DEFAULT_MODEL = {
  global: {
    tabEnableRename: true
  },
  layout: {
    type: 'row',
    id: '#1',
    children: [
      {
        type: 'tabset',
        id: '#2',
        children: [],
        active: true
      }
    ]
  },
  borders: []
};

const DEFAULT_OUTER_MODEL = {
  global: {
    tabEnableRename: true,
    tabSetTabLocation: 'bottom'
  },
  layout: {
    type: 'row',
    id: '#1',
    children: [
      {
        type: 'tabset',
        id: '#2',
        children: [
          {
            type: 'tab',
            id: '#3',
            name: 'New section ',
            component: 'sub',
            config: {
              model: {
                global: {},
                layout: {
                  type: 'row',
                  id: '#1',
                  children: [
                    {
                      type: 'tabset',
                      id: '#3',
                      children: [],
                      active: true
                    }
                  ]
                },
                borders: []
              }
            }
          }
        ],
        active: true
      }
    ]
  },
  borders: []
};

interface COMPONENT_TYPE {
  grid: string;
  dataView: string;
  controller: string;
  '3Dview': string;
  structureView: string;
  infoView: string;
  PBS: string;
  connectionView: string;
  documentView: string;
  widgetView: string;
}

/**
 *
 * React component displaying the ChartViewer.
 * @class SysExplorerElement
 * @extends {Component<AppProps, AppStates>}
 */
export class SysExplorerElement extends Component<AppProps, AppStates> {
  geoData: any; // Geometry data received from backend
  divRef: { [key: string]: React.RefObject<any> }; // Reference of render div
  model: any;
  innerlayoutRef: { [key: string]: React.RefObject<FlexLayout.Layout> };
  layoutRef = React.createRef<FlexLayout.Layout>();
  tabProps: { [key: string]: any };
  tabUpdateSignal: { [key: string]: 0 };
  initialStateAll: { [key: string]: any };
  chartTemplate: {
    modelJson: IDict<any>;
    plotJson: IDict<any>;
    selectedVariable: IDict<any>;
  };
  templatePath: string;
  availableWidget: IDict<IAvailableWidget>;
  availableDocument: IDict<IAvailableDocument>;

  static COMPONENT_DICT: COMPONENT_TYPE = {
    grid: 'Chart widget',
    dataView: 'Data widget',
    controller: 'Controller widget',
    '3Dview': '3D widget',
    structureView: 'Structure widget',
    infoView: 'System info widget',
    PBS: 'PBS widget',
    connectionView: 'Connection widget',
    documentView: 'Document widget',
    widgetView: 'Custom widget'
  };

  /**
   *Creates an instance of SysExplorerElement.
   * @param {AppProps} props
   * @memberof SysExplorerElement
   */
  constructor(props: AppProps) {
    super(props);
    this.initialStateAll = {};
    this.divRef = {};
    this.innerlayoutRef = {};
    this.layoutRef = React.createRef();
    this.tabProps = {};
    this.tabUpdateSignal = {};

    props.model.listenTo(props.model, 'msg:custom', this.on_msg);

    const { chart_template = {}, template_path = null } =
      this.props.model.get('chart_template');
    this.chartTemplate = chart_template;
    this.templatePath = template_path;

    this.availableWidget = this.get_python_code(this.chartTemplate);
    this.availableDocument = this.get_document_source(this.chartTemplate);

    if ('selectedVariable' in this.chartTemplate) {
      const selectedVariable: { [key: string]: number } = {};
      for (const key in this.chartTemplate['selectedVariable']) {
        selectedVariable[`${this.props.systemConfig['root_name']}.${key}`] =
          this.chartTemplate['selectedVariable'][key];
      }
      props.setControllerState(selectedVariable);
    }
    DEFAULT_MODEL.global['tabEnableClose'] = this.props.systemConfig.enableEdit;
    DEFAULT_OUTER_MODEL.global['tabEnableClose'] =
      this.props.systemConfig.enableEdit;
    this.state = {
      model: FlexLayout.Model.fromJson(DEFAULT_OUTER_MODEL as any),
      selectedTab: '',
      saveDialog: false,
      jsonName: this.templatePath ? this.templatePath : '',
      enableClose: this.props.systemConfig.enableEdit
    };
  }

  /**
   * Parser the initial template to get all available custom
   * widgets
   *
   * @memberof SysExplorerElement
   */
  get_python_code = (chartTemplate: {
    modelJson: IDict<any>;
    plotJson: IDict<any>;
    selectedVariable: IDict<any>;
  }): IDict<IAvailableWidget> => {
    const availableWidget: IDict<IAvailableWidget> = {};
    let initialPlotJson: IDict<any>;
    if ('plotJson' in chartTemplate) {
      initialPlotJson = chartTemplate.plotJson;
    } else {
      initialPlotJson = {};
    }
    for (const [key, val] of Object.entries(initialPlotJson)) {
      const { traceConfig = {} } = val;
      if (
        'pythonCode' in traceConfig &&
        'widgetName' in traceConfig &&
        traceConfig['widgetName'].length > 0
      ) {
        availableWidget[traceConfig['widgetName'] + key] = {
          pythonCode: traceConfig['pythonCode'],
          id: key,
          widgetName: traceConfig['widgetName']
        };
      }
    }
    return availableWidget;
  };
  get_document_source = (chartTemplate: {
    modelJson: IDict<any>;
    plotJson: IDict<any>;
    selectedVariable: IDict<any>;
  }): IDict<IAvailableDocument> => {
    const availableDocument: IDict<IAvailableDocument> = {};
    let initialPlotJson: IDict<any>;
    if ('plotJson' in chartTemplate) {
      initialPlotJson = chartTemplate.plotJson;
    } else {
      initialPlotJson = {};
    }
    for (const [key, val] of Object.entries(initialPlotJson)) {
      const { traceConfig = {} } = val;

      if (
        'documentSource' in traceConfig &&
        'widgetName' in traceConfig &&
        traceConfig['widgetName'].length > 0
      ) {
        availableDocument[traceConfig['widgetName'] + key] = {
          documentSource: traceConfig['documentSource'],
          id: key,
          widgetName: traceConfig['widgetName']
        };
      }
    }
    return availableDocument;
  };

  /**
   *
   *
   * @memberof SysExplorerElement
   */
  on_msg = (
    data: { type: string; payload: { [key: string]: any } },
    buffer: any[]
  ) => {
    const { type, payload } = data;
    switch (type) {
      case 'ChartElement::update_signal': {
        this.computedUpdate(payload as any);
        break;
      }
      case 'SysExplorer::update_save_path': {
        this.templatePath = payload['templatePath'];
      }
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

  /**
   * If ChartViewer is instanced with `template` parameter,
   * the template will go to `chart_template` and the state will
   * be set with the template data
   *
   * @memberof SysExplorerElement
   */
  componentDidMount() {
    if ('modelJson' in this.chartTemplate && 'plotJson' in this.chartTemplate) {
      this.initialStateAll = JSON.parse(
        JSON.stringify(this.chartTemplate['plotJson'])
      );
      this.setState(old => ({
        ...old,
        model: FlexLayout.Model.fromJson(this.chartTemplate['modelJson'] as any)
      }));
    } else {
      // setTimeout(this.onAdd, 500);
    }
  }

  /**
   * Load layout and plot configuration from file.
   *
   * @memberof SysExplorerElement
   */
  loadChartFromJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    const jsonFile = target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const { modelJson, plotJson, selectedVariable } = JSON.parse(
        reader.result as string
      );

      if (selectedVariable) {
        this.props.setControllerState(selectedVariable);
      }

      this.initialStateAll = JSON.parse(JSON.stringify(plotJson));
      this.setState(old => ({
        ...old,
        model: FlexLayout.Model.fromJson(modelJson)
      }));
    };
    reader.readAsText(jsonFile);
  };

  addGraph = (
    component: keyof COMPONENT_TYPE,
    nodeId: string = null,
    tabsetId: string = null
  ) => {
    if (nodeId && nodeId in this.innerlayoutRef) {
      this.innerlayoutRef[nodeId].current.addTabToTabSet(tabsetId, {
        component: component,
        name: SysExplorerElement.COMPONENT_DICT[component],
        config: { layoutID: nodeId }
      });
    }
  };

  onRenderTabSet = (
    tabSetNode: FlexLayout.TabSetNode | FlexLayout.BorderNode,
    renderValues: {
      headerContent?: React.ReactNode;
      buttons: React.ReactNode[];
    },
    nodeId: string
  ) => {
    const tabsetId = tabSetNode.getId();
    renderValues.buttons.push(AddTabMenu(this.addGraph, nodeId, tabsetId));
  };

  prepare_data_for_factory = (
    config: { [key: string]: any },
    nodeId: string
  ) => {
    let layoutId = '';
    if (config && 'layoutID' in config) {
      layoutId = config['layoutID'];
    }

    const id = `${layoutId}@${nodeId}`;
    this.divRef[id] = React.createRef<any>();
    let data: { [key: string]: any } | null;

    if (id in this.initialStateAll) {
      data = JSON.parse(JSON.stringify(this.initialStateAll[id]));
      delete this.initialStateAll[id];

      if ('traceConfig' in data) {
        this.correctKey(data.traceConfig, 'add');
      }
    } else {
      data = null;
    }

    return { id, data };
  };
  /**
   * This method products the ChartElement component for FlexLayout,
   * the ref of  ChartElement component is stored in `this.divRef`,
   * if `initialState` is available, it will be passed to component props.
   *
   * @memberof SysExplorerElement
   */
  factory = (node: FlexLayout.TabNode): JSX.Element => {
    const component = node.getComponent() as keyof COMPONENT_TYPE | 'sub';
    const config = node.getConfig();
    const nodeId = node.getId();
    const name = node.getName();
    const nameList = Object.values(SysExplorerElement.COMPONENT_DICT);
    nameList.push('Section');
    // if (nameList.includes(name)) {
    //   try {
    //     node
    //       .getModel()
    //       .doAction(FlexLayout.Actions.renameTab(nodeId, `${name} ${nodeId}`));
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }
    switch (component) {
      case 'grid': {
        const { id, data } = this.prepare_data_for_factory(config, nodeId);
        return (
          <ChartElement
            ref={this.divRef[id]}
            model={this.props.model}
            send_msg={this.props.send_msg}
            id={id}
            classes={{}}
            initialState={data}
          />
        );
      }
      case 'controller': {
        return (
          <Controller model={this.props.model} send_msg={this.props.send_msg} />
        );
      }
      case '3Dview': {
        return (
          <GeometryElement
            model={this.props.model}
            send_msg={this.props.send_msg}
          />
        );
      }
      case 'structureView': {
        const { id, data } = this.prepare_data_for_factory(config, nodeId);

        return (
          <StructureElement
            ref={this.divRef[id]}
            model={this.props.model}
            send_msg={this.props.send_msg}
            initialState={data}
          />
        );
      }
      case 'PBS': {
        return <PBSElement />;
      }
      case 'connectionView': {
        return <GraphPanel />;
      }
      case 'infoView': {
        return (
          <SystemInfoElement
            model={this.props.model}
            send_msg={this.props.send_msg}
          />
        );
      }
      case 'dataView': {
        const { id, data } = this.prepare_data_for_factory(config, nodeId);
        return (
          <DataViewer
            ref={this.divRef[id]}
            model={this.props.model}
            send_msg={this.props.send_msg}
            id={id}
            initialState={data}
          />
        );
      }
      case 'widgetView': {
        const { id, data } = this.prepare_data_for_factory(config, nodeId);
        return (
          <WidgetViewer
            ref={this.divRef[id]}
            model={this.props.model}
            send_msg={this.props.send_msg}
            id={id}
            initialState={data}
            availableWidget={this.availableWidget}
          ></WidgetViewer>
        );
      }
      case 'documentView': {
        const { id, data } = this.prepare_data_for_factory(config, nodeId);
        return (
          <DocumentViewer
            ref={this.divRef[id]}
            model={this.props.model}
            send_msg={this.props.send_msg}
            id={id}
            initialState={data}
            availableDocument={this.availableDocument}
          ></DocumentViewer>
        );
      }
      case 'sub': {
        return this.generateSection(node, nodeId);
      }
    }
    // if (component === 'grid') {
    // } else if (component === 'controller') {
    // } else if (component === '3Dview') {
    // } else if (component === 'PBS') {
    // } else if (component === 'dataView') {
    // } else if (component === 'widgetView') {
    // } else if (component === 'sub') {
    // }
    return null;
  };

  /**
   *
   *
   * @memberof SysExplorerElement
   */
  generateSection = (node: FlexLayout.TabNode, nodeId: string) => {
    let model = node.getExtraData().model;
    let defaultModel: any;
    this.innerlayoutRef[nodeId] = React.createRef<FlexLayout.Layout>();
    if (node.getConfig() && node.getConfig().model) {
      defaultModel = node.getConfig().model;
    } else {
      defaultModel = DEFAULT_MODEL;
    }

    if (!model) {
      node.getExtraData().model = FlexLayout.Model.fromJson(defaultModel);
      model = node.getExtraData().model;
      // save sub-model on save event
      node.setEventListener('save', (p: any) => {
        this.state.model!.doAction(
          FlexLayout.Actions.updateNodeAttributes(nodeId, {
            config: {
              model: node.getExtraData().model.toJson()
            }
          })
        );
        //  node.getConfig().model = node.getExtraData().model.toJson();
      });
    }
    return (
      <FlexLayout.Layout
        ref={this.innerlayoutRef[nodeId]}
        classNameMapper={className => {
          if (className === 'flexlayout__tabset-selected') {
            className =
              'inner__flexlayout__tabset-selected flexlayout__tabset-selected';
          } else if (className === 'flexlayout__tabset') {
            className = 'inner__flexlayout__tabset flexlayout__tabset';
          } else if (className === 'flexlayout__tab') {
            className = 'inner__flexlayout__tab flexlayout__tab';
          }

          return className;
        }}
        model={model}
        factory={this.factory}
        onRenderTabSet={(
          tabSetNode: FlexLayout.TabSetNode | FlexLayout.BorderNode,
          renderValues: {
            headerContent?: React.ReactNode;
            buttons: React.ReactNode[];
          }
        ) => {
          this.onRenderTabSet(tabSetNode, renderValues, nodeId);
        }}
        onAction={(action: FlexLayout.Action) =>
          this.innerOnAction(nodeId, action)
        }
      />
    );
  };
  /**
   * Add a new tab to current active tab set
   *
   * @memberof SysExplorerElement
   */
  onAddRow = () => {
    this.layoutRef.current.addTabToActiveTabSet({
      component: 'sub',
      name: 'New section'
    });
  };

  /**
   * Add a new tab to current active tab set
   *
   * @memberof SysExplorerElement
   */
  onAdd = () => {
    this.layoutRef.current.addTabToActiveTabSet({
      component: 'grid',
      name: 'New chart'
    });
  };

  onAddController = () => {
    this.layoutRef.current.addTabToActiveTabSet({
      component: 'controller',
      name: 'New controller'
    });
  };

  /**
   * This method helps resize the component if this is a tab moved
   * or deleted, in case of delete tab, the corresponding ref of ChartElement
   * component is also deleted.
   *
   * @memberof SysExplorerElement
   */
  onAction = (action: FlexLayout.Action) => {
    if (
      action.type === 'FlexLayout_MoveNode' ||
      action.type === 'FlexLayout_AdjustSplit' ||
      action.type === 'FlexLayout_DeleteTab' ||
      action.type === 'FlexLayout_MaximizeToggle' ||
      action.type === 'FlexLayout_SelectTab'
    ) {
      window.dispatchEvent(new Event('resize'));
    }
    if (action.type === 'FlexLayout_DeleteTab') {
      const id = action.data.node;

      for (const key in this.divRef) {
        if (key.split('@')[0] === id) {
          delete this.divRef[key];
        }
      }

      for (const key in this.initialStateAll) {
        if (key.split('@')[0] === id) {
          delete this.initialStateAll[key];
        }
      }
    }

    return action;
  };

  innerOnAction = (outerNodeID: string, action: FlexLayout.Action) => {
    if (
      action.type === 'FlexLayout_MoveNode' ||
      action.type === 'FlexLayout_AdjustSplit' ||
      action.type === 'FlexLayout_DeleteTab' ||
      action.type === 'FlexLayout_MaximizeToggle'
    ) {
      window.dispatchEvent(new Event('resize'));
    }
    if (action.type === 'FlexLayout_DeleteTab') {
      const innerNodeid = action.data.node;
      const id = `${outerNodeID}@${innerNodeid}`;
      if (id in this.divRef) {
        delete this.divRef[id];
      }
      if (id in this.initialStateAll) {
        delete this.initialStateAll[id];
      }
    }

    return action;
  };

  onModelChange = () => {
    console.log();
  };

  /**
   * Switch to open/close the save template dialog.
   *
   * @memberof SysExplorerElement
   */
  toggleSaveDialog = () => {
    this.setState(old => {
      if (old.saveDialog) {
        return { ...old, saveDialog: !old.saveDialog };
      } else {
        return {
          ...old,
          saveDialog: !old.saveDialog,
          jsonName: this.templatePath
        };
      }
    });
  };

  handleJsonName = (event: any) => {
    const jsonName = event.target.value;
    this.setState(old => ({ ...old, jsonName }));
  };

  correctKey = (traceConfig: IDict<any>, mode: 'add' | 'remove') => {
    const keyToCorrectList = [
      'systemNameX',
      'systemNameY',
      'systemNameZ',
      'systemName'
    ];
    const rootName = this.props.systemConfig['root_name'];
    Object.keys(traceConfig).forEach(key => {
      if (key === 'systemName' && typeof traceConfig[key] === 'string') {
        if (mode === 'add') {
          if (traceConfig[key] === '') {
            traceConfig[key] = rootName;
          } else {
            traceConfig[key] = `${rootName}.${traceConfig[key]}`;
          }
        } else {
          if (traceConfig[key] === rootName) {
            traceConfig[key] = '';
          } else {
            traceConfig[key] = traceConfig[key].replace(`${rootName}.`, '');
          }
        }
      } else if (
        typeof traceConfig[key] === 'object' &&
        traceConfig[key] !== null
      ) {
        for (const keyToCorrect of keyToCorrectList) {
          if (keyToCorrect in traceConfig[key]) {
            if (mode === 'add') {
              if (traceConfig[key][keyToCorrect] === '') {
                traceConfig[key][keyToCorrect] = rootName;
              } else {
                traceConfig[key][keyToCorrect] =
                  `${rootName}.${traceConfig[key][keyToCorrect]}`;
              }
            } else {
              if (traceConfig[key][keyToCorrect] === rootName) {
                traceConfig[key][keyToCorrect] = '';
              } else {
                traceConfig[key][keyToCorrect] = traceConfig[key][
                  keyToCorrect
                ].replace(`${rootName}.`, '');
              }
            }
          }
        }
      }
    });
  };
  /**
   * Save layout and plot configuration to file.
   *
   * @memberof SysExplorerElement
   */
  saveChartToJson = () => {
    const jsonName = this.state.jsonName;
    const modelJson = this.state.model.toJson();
    const plotJson = {};
    for (const [id, ref] of Object.entries(this.divRef)) {
      const traceConfig = JSON.parse(
        JSON.stringify(ref.current.state.traceConfig)
      );

      this.correctKey(traceConfig, 'remove');
      plotJson[id] = {
        traceConfig,
        plotLayout: ref.current.state.plotLayout,
        advancedTraceDataConfig: ref.current.state.advancedTraceDataConfig
      };
    }
    for (const key in this.initialStateAll) {
      if (!(key in plotJson)) {
        plotJson[key] = this.initialStateAll[key];
      }
    }

    const selectedVariable = {};
    const rootName = this.props.systemConfig['root_name'];
    for (const key in this.props.selectedVariable) {
      const newKey = key.replace(`${rootName}.`, '');
      selectedVariable[newKey] = this.props.selectedVariable[key];
    }

    this.props.send_msg({
      action: 'SysExplorer::chartViewerSaveJson',
      payload: {
        jsonName,
        jsonData: { modelJson, plotJson, selectedVariable }
      }
    });
    this.toggleSaveDialog();
  };

  /**
   * Send refresh request to backend.
   *
   * @memberof SysExplorerElement
   */
  async restartKernel() {
    if (!confirm('Do you want to restart kernel an refresh page?')) {
      return;
    }
    const { BASEURL, COSAPP_MODULE } = CoSAppGetUrl();
    const id = window.sessionStorage.getItem('adso_kernel_id');
    if (id) {
      const url = `${BASEURL}api/kernels/${id}`;
      const setting = ServerConnection.makeSettings();
      const init = {
        method: 'DELETE'
      };
      let response: Response;
      try {
        response = await ServerConnection.makeRequest(url, init, setting);
      } catch (error) {
        console.log('error', error);
        return;
      }
      const data = await response;
      if (data.ok) {
        window.sessionStorage.removeItem('adso_kernel_id');
        window.sessionStorage.removeItem('adso_kernel_name');
        location.reload();
      }
    }
  }

  toggleLockTab = () => {
    this.state.model.doAction(
      FlexLayout.Actions.updateModelAttributes({
        tabEnableClose: this.state.enableClose
      })
    );
    for (const key in this.innerlayoutRef) {
      this.innerlayoutRef[key].current.props.model.doAction(
        FlexLayout.Actions.updateModelAttributes({
          tabEnableClose: this.state.enableClose
        })
      );
    }
  };

  render() {
    const { classes } = this.props;
    const saveButton = (
      <Button
        onClick={this.toggleSaveDialog}
        classes={{ root: classes.textColor }}
      >
        save
      </Button>
    );
    const loadButton = (
      <div>
        <input
          onChange={e => this.loadChartFromJson(e)}
          onClick={event => {
            event.currentTarget.value = null;
          }}
          style={{ display: 'None' }}
          id="load-chart-from-json-input"
          type="file"
        />
        <label htmlFor="load-chart-from-json-input">
          <Button classes={{ root: classes.textColor }} component="span">
            load
          </Button>
        </label>
      </div>
    );
    return (
      <div style={{ height: '100%' }}>
        <Dialog
          open={this.state.saveDialog}
          aria-labelledby="draggable-dialog-title"
          fullWidth={true}
          maxWidth="sm"
        >
          <DialogTitle
            style={{ cursor: 'move' }}
            className="draggable-dialog-title"
          >
            Save configuration
          </DialogTitle>
          <DialogContent>
            <FormControl className={this.props.classes.formControl}>
              <TextField
                value={this.state.jsonName}
                onChange={this.handleJsonName}
                label="File name"
              />
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={this.toggleSaveDialog} color="primary">
              Close
            </Button>
            <Button autoFocus onClick={this.saveChartToJson} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
        <div
          style={{
            width: '100%',
            height: 'calc(100% - 36px)',
            background: 'radial-gradient(#efeded, #8f9091)'
          }}
        >
          <FlexLayout.Layout
            ref={this.layoutRef}
            model={this.state.model}
            factory={this.factory}
            classNameMapper={className => {
              if (className === 'flexlayout__layout') {
                className =
                  'chartviewer__flexlayout__layout flexlayout__layout ';
              } else if (className === 'flexlayout__tabset-selected') {
                className =
                  'outer__flexlayout__tabset-selected flexlayout__tabset-selected ';
              }
              return className;
            }}
            onAction={this.onAction}
          />
        </div>
        <Toolbar variant="dense" classes={{ dense: classes.toolbarHeigt }}>
          <Button onClick={this.onAddRow} classes={{ root: classes.textColor }}>
            {/* <AddCircleOutlineIcon /> */}
            Add section
          </Button>
          {this.props.systemConfig.enableEdit ? saveButton : <div />}
          {this.props.systemConfig.enableEdit ? loadButton : <div />}
          {this.props.systemConfig.enableEdit ? (
            <div />
          ) : (
            <Button
              onClick={this.restartKernel}
              classes={{ root: classes.textColor }}
            >
              {/* <AddCircleOutlineIcon /> */}
              Restart
            </Button>
          )}

          <Button
            onClick={() => {
              this.setState(
                old => ({ ...old, enableClose: !old.enableClose }),
                this.toggleLockTab
              );
            }}
            classes={{ root: classes.textColor }}
          >
            {/* <AddCircleOutlineIcon /> */}
            {this.state.enableClose ? 'lock' : 'unlock'}
          </Button>
        </Toolbar>
      </div>
    );
  }
}

function AddTabMenu(
  addGraph: (
    component: keyof COMPONENT_TYPE, // 'grid' | 'controller' | '3Dview' | 'PBS',
    nodeId: string,
    tabsetId: string
  ) => void,
  nodeId: string,
  tabsetId: string
) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const menuId = 'tab_settings_popover_' + nodeId + tabsetId;
  const menuItem = Object.keys(SysExplorerElement.COMPONENT_DICT).map(
    (key: keyof COMPONENT_TYPE) => {
      return (
        <MenuItem
          key={key}
          onClick={() => {
            addGraph(key, nodeId, tabsetId);
            handleClose();
          }}
        >
          {SysExplorerElement.COMPONENT_DICT[key]}
        </MenuItem>
      );
    }
  );
  return (
    <div key={menuId}>
      <Button
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <AddToPhotosOutlinedIcon style={{ color: 'darkgreen' }} />
      </Button>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {menuItem}
      </Menu>
    </div>
  );
}

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(SysExplorerElement)
);
