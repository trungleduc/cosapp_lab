/**
 * Interface of redux store
 */
export interface StateInterface {
  /** Global configuration */
  systemConfig: { [key: string]: any };
  /** State of activated panel */
  mainState: PanelStatusInterface;
  saveSignal: number;
  /** State of system architecture panel*/
  systemArch: {
    lockStatus: boolean; // lock status of diagram
    /** State of system tree structure */
    systemTree: {
      nodeData: any; // Data of each node
      nodePath: string[]; // Path from root to each node
      selectedNode: string; // Current selected node for editing
    };
    /** State which holds the data of each system */
    systemData: SystemDataInterface;
    /** State which holds the data of for diagram */
    systemGraph: SystemGraphInterface;
    /** State of system pbs view */
    systemPBS: { [key: string]: { visible: boolean; position: Array<number> } };
    /**Signal for node filtering */
    systemPBSUpdated: number;
  };
  /**State of dashboard panel */
  dashboardState: {
    computing: boolean; // True if a driver is running, False otherwise.
    timeStepList: string[]; // List of time step available.
    data3D: { [key: string]: any[] }; // Not used yet.
    variableData: {[key: string]: any;}; // System variable data received from backend.
    portMetaData: { [key: string]: any }; // Port meta data received from backend.
    selectedVariable: { [key: string]: number }; // Controller variable and its value.
    computedResult: { [key: string]: any }; // Value of all variable, used for plot
    recorderData: { [key: string]: any }; // Cosapp recorder
    driverData: { [key: string]: any }; // Cosapp driver data
  };
}

export interface IDict<T> {[key:string]: T}
export interface SystemDataInterface {
  mainData: {
    // key is name of system
    [key: string]: {
      user: UserListType[];
      class: string;
      portList: string[];
    };
  };
  portData: {
    //key in form of "systemName/portName"
    [key: string]: {
      variable: string[];
      connection: string[]; // Destination port in form of "systemName/portName"
    };
  };
}

export interface PanelStatusInterface {
  [key: string]: [boolean, string];
}

export interface SystemGraphInterface {
  systemGraphData: {
    [key: string]: {
      inPort: Array<string>;
      outPort: Array<string>;
      connections: Array<Array<any>>;
      position?: Array<number>;
    };
  };
  systemList: Array<string>;
  graphJsonData: { [key: string]: any };
  updateData: { [key: string]: any };
}

export enum Action {
  SAVE_STATE = 'SAVE_STATE',
  RESET_STORE = 'RESET_STORE',
  SWITCH_PANEL = 'SWITCH_PANEL',
  SELECT_NODE = 'SELECT_NODE',
  ADD_NODE = 'ADD_NODE',
  REMOVE_NODE = 'REMOVE_NODE',
  UPDATE_TREE = 'UPDATE_TREE',
  ARCH_SAVE_GRAPH_JSON = 'ARCH_SAVE_GRAPH_JSON',
  ARCH_SAVE_GRAPH_POSITION = 'ARCH_SAVE_GRAPH_POSITION',
  ARCH_UPDATE_CONNECTION_GRAPH = 'ARCH_UPDATE_CONNECTION_GRAPH',
  ARCH_FILTER_NODE = 'ARCH_FILTER_NODE',
  LOCK_GRAPH = 'LOCK_GRAPH',
  DASHBOARD_ADD_3D_DATA = 'DASHBOARD_ADD_3D_DATA',
  GET_SERVER_DATA = 'GET_SERVER_DATA',
  DASHBOARD_TOGGLE_RUN = 'DASHBOARD_TOGGLE_RUN',
  DASHBOARD_ADD_CONTROLLER = 'DASHBOARD_ADD_CONTROLLER',
  DASHBOARD_SET_CONTROLLER = 'DASHBOARD_SET_CONTROLLER',
  DASHBOARD_REMOVE_CONTROLLER = 'DASHBOARD_REMOVE_CONTROLLER',
  DASHBOARD_UPDATE_CONTROLLER = 'DASHBOARD_UPDATE_CONTROLLER',
  DASHBOARD_UPDATE_COMPUTED_RESULT = 'DASHBOARD_UPDATE_COMPUTED_RESULT',
  DASHBOARD_UPDATE_RECORDER_DATA = 'DASHBOARD_UPDATE_RECORDER_DATA',
  DASHBOARD_UPDATE_DRIVER_DATA = 'DASHBOARD_UPDATE_DRIVER_DATA'
}

export interface SaveState {
  type: Action.SAVE_STATE;
}
export interface ResetStore {
  type: Action.RESET_STORE;
}
export interface MainSwitchPanel {
  type: Action.SWITCH_PANEL;
  panelName: string;
}

export interface UserListType {
  uid: number;
  name: string;
}

export interface ServerGetData {
  type: Action.GET_SERVER_DATA;
  data: any;
}

export interface ArchSaveGraphJson {
  type: Action.ARCH_SAVE_GRAPH_JSON;
  data: { [key: string]: any };
}

export interface ArchSaveGraphPosition {
  type: Action.ARCH_SAVE_GRAPH_POSITION;
  data: { [key: string]: { visible: boolean; position: Array<number> } };
}

export interface ArchFilterNode {
  type: Action.ARCH_FILTER_NODE;
  data: Array<string>;
  selected: Array<string>;
}

export interface ArchUpdateConnectionGraph {
  type: Action.ARCH_UPDATE_CONNECTION_GRAPH;
  data: { [key: string]: string };
  root: string;
}

export interface ArchLockGraph {
  type: Action.LOCK_GRAPH;
  status: boolean;
}

export interface ArchSelectNode {
  type: Action.SELECT_NODE;
  nodeId: string;
}

export interface ArchAddNode {
  type: Action.ADD_NODE;
  nodeName: string;
  nodePath: any;
  nodeData: {
    personName: UserListType[];
    sysClass: string;
    portList: {
      portName: string;
      portDirection: number;
      portClass: string;
    }[];
  };
}

export interface ArchRemoveNode {
  type: Action.REMOVE_NODE;
  nodeData: any;
  nodePath: any;
}

export interface ArchUpdateTree {
  type: Action.UPDATE_TREE;
  treeData: any;
  updatePbs: boolean;
}
export interface DashboardAddData {
  type: Action.DASHBOARD_ADD_3D_DATA;
  data: any;
}

export interface DashboardToggleRun {
  type: Action.DASHBOARD_TOGGLE_RUN;
}

export interface DashboardSetController {
  type: Action.DASHBOARD_SET_CONTROLLER;
  data: { [key: string]: number };
}
export interface DashboardAddController {
  type: Action.DASHBOARD_ADD_CONTROLLER;
  variableName: string;
  value: number;
}

export interface DashboardUpdateController {
  type: Action.DASHBOARD_UPDATE_CONTROLLER;
  variableName: string;
  value: number;
}

export interface DashboardRemoveController {
  type: Action.DASHBOARD_REMOVE_CONTROLLER;
  variableName: string;
}

export interface DashboardUpdateComputedResult {
  type: Action.DASHBOARD_UPDATE_COMPUTED_RESULT;
  data: {
    variable: { [key: string]: any };
    recorder: { [key: string]: any };
    driver: { [key: string]: any };
  };
}

export type ActionType =
  | ResetStore
  | SaveState
  | MainSwitchPanel
  | ServerGetData
  | ArchSaveGraphJson
  | ArchSaveGraphPosition
  | ArchFilterNode
  | ArchLockGraph
  | ArchUpdateTree
  | ArchSelectNode
  | ArchAddNode
  | ArchRemoveNode
  | ArchUpdateConnectionGraph
  | DashboardAddData
  | DashboardToggleRun
  | DashboardSetController
  | DashboardAddController
  | DashboardRemoveController
  | DashboardUpdateController
  | DashboardUpdateComputedResult;
