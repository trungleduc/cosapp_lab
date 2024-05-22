import {
  Action,
  ActionType,
  StateInterface,
  ArchAddNode,
  MainSwitchPanel,
  PanelStatusInterface,
  ArchSaveGraphJson,
  ArchSaveGraphPosition,
  ArchFilterNode,
  ArchRemoveNode,
  ArchSelectNode,
  ArchUpdateTree,
  ArchUpdateConnectionGraph,
  UserListType,
  ServerGetData,
  DashboardAddData,
  DashboardSetController,
  DashboardAddController,
  DashboardRemoveController,
  DashboardUpdateController,
  DashboardUpdateComputedResult
} from './types';
import { addNodeUnderParent, removeNodeAtPath } from 'react-sortable-tree';
import { getNodeFullPath } from './tools';
/**
 * Reset store to initial state
 */
export function resetStore(): ActionType {
  return { type: Action.RESET_STORE };
}

/**
 *
 *
 * Send save state signal to all component
 * @returns {ActionType}
 */
export function saveState(): ActionType {
  return { type: Action.SAVE_STATE };
}

/**
 *
 *
 * Action to update saveSignal of state
 * @param {StateInterface} state
 */
export function saveState_(state: StateInterface) {
  const oldSignal = state.saveSignal;
  const newState: StateInterface = { ...state, saveSignal: oldSignal + 1 };
  return newState;
}

/**
 * Action to switch activated panel
 * @param panelName - Name of requested panel
 */
export function mainSwitchPanel(panelName: string): ActionType {
  return { type: Action.SWITCH_PANEL, panelName };
}

/**
 * Undate store for panel activation. This function is called
 * when `mainSwitchPanel` is dispatched
 * @param state
 * @param action
 */
export function mainSwitchPanel_(
  state: StateInterface,
  action: MainSwitchPanel
): StateInterface {
  const newPanelStatus: PanelStatusInterface = {
    panel_0: [false, 'Project_Overview'],
    panel_1: [false, 'System_Arc'],
    panel_2: [false, 'Module_Creator'],
    panel_3: [false, 'Dashboard'],
    panel_4: [false, 'User_Management'],
    panel_5: [false, 'Module_Library']
  };
  for (const key in newPanelStatus) {
    if (newPanelStatus.hasOwnProperty(key)) {
      newPanelStatus[key][0] = action.panelName === newPanelStatus[key][1];
    }
  }

  return {
    ...state,
    mainState: newPanelStatus
  };
}

/**
 * Lock/ unlock diagram.
 * @param status
 */
export function archLockGraph(status: boolean): ActionType {
  return { type: Action.LOCK_GRAPH, status };
}

/**
 * Action to save data from backend to redux store.
 * @param data
 */
export function serverGetData(data: any): ActionType {
  return { type: Action.GET_SERVER_DATA, data };
}

/**
 * Update store with data from backend. This function is
 * called when `serverGetData` is dispatched
 * @param state
 * @param action
 */
export function serverGetData_(state: StateInterface, action: ServerGetData) {
  return {
    ...state,
    systemArch: {
      ...state.systemArch,
      systemGraph: action.data.systemGraph,
      systemTree: {
        ...state.systemArch.systemTree,
        nodeData: action.data.systemTree
      }
    },
    dashboardState: {
      ...state.dashboardState,
      variableData: action.data.variableData
    }
  };
}

/**
 *
 * Save diagram json data to state
 * @export
 * @param {{[key:string]: any}} data
 * @returns {ActionType}
 */
export function archSaveGraphJson(data: { [key: string]: any }): ActionType {
  return { type: Action.ARCH_SAVE_GRAPH_JSON, data };
}

/**
 *
 * This function is called when archSaveGraphJson is dispatched
 * @export
 * @param {StateInterface} state
 * @param {ArchSaveGraphJson} action
 * @returns {StateInterface}
 */
export function archSaveGraphJson_(
  state: StateInterface,
  action: ArchSaveGraphJson
): StateInterface {
  const connectionData = action.data.connection;
  const positionData = action.data.position;
  const new_state = { ...state };

  for (const sysKey in new_state.systemArch.systemGraph.systemGraphData) {
    if (connectionData.hasOwnProperty(sysKey)) {
      new_state.systemArch.systemGraph.systemGraphData[sysKey]['connections'] =
        connectionData[sysKey];
    }
    if (positionData.hasOwnProperty(sysKey)) {
      new_state.systemArch.systemGraph.systemGraphData[sysKey]['position'] =
        positionData[sysKey];
    }
  }
  const stringData = JSON.stringify(new_state, null, 2);

  const blob = new Blob([stringData], {
    type: 'application/json'
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'store.json';

  a.click();
  return { ...state };
}

/**
 *
 * Save the position of all node in pbs graph to store
 * @export
 * @param {{
 *   [key: string]: Array<number>;
 * }} data
 * @returns {ActionType}
 */
export function archSaveGraphPosition(data: {
  [key: string]: { visible: boolean; position: Array<number> };
}): ActionType {
  return { type: Action.ARCH_SAVE_GRAPH_POSITION, data };
}

/**
 *
 * This function is called when archSaveGraphPosition is dispatched
 * @export
 * @param {StateInterface} state
 * @param {ArchSaveGraphPosition} action
 * @returns {StateInterface}
 */
export function archSaveGraphPosition_(
  state: StateInterface,
  action: ArchSaveGraphPosition
): StateInterface {
  return {
    ...state,
    systemArch: { ...state.systemArch, systemPBS: action.data }
  };
}

/**
 *
 * Modify the visibility flag of node data in store
 * @export
 * @param {Array<string>} data
 * @returns {ActionType}
 */
export function archFilterNode(
  data: Array<string>,
  selected: Array<string>
): ActionType {
  return { type: Action.ARCH_FILTER_NODE, data, selected };
}

/**
 *
 * This function is called when archFilterNode is dispatched
 * @export
 * @param {StateInterface} state
 * @param {ArchFilterNode} action
 * @returns {StateInterface}
 */
export function archFilterNode_(
  state: StateInterface,
  action: ArchFilterNode
): StateInterface {
  let currentData: {
    [key: string]: { visible: boolean; position: Array<number> };
  };
  currentData = JSON.parse(JSON.stringify(state.systemArch.systemPBS));
  const currentSignal = state.systemArch.systemPBSUpdated;
  const selected = action.selected;
  if (action.data.length > 0) {
    for (const key in currentData) {
      currentData[key].visible = false;
    }
    action.data.forEach(nodeName => {
      currentData[nodeName].visible = true;
    });
  } else {
    for (const key in currentData) {
      currentData[key].visible = true;
    }
  }
  return {
    ...state,
    systemArch: {
      ...state.systemArch,
      systemTree: { ...state.systemArch.systemTree, nodePath: selected },
      systemPBS: currentData,
      systemPBSUpdated: currentSignal + 1
    }
  };
}

/**
 * Update connection graph data from tree data
 *
 * @export
 * @param {string} oldId
 * @param {string} newId
 * @returns {ActionType}
 */
export function archUpdateConnectionGraph(
  data: { [key: string]: string },
  root: string
): ActionType {
  return { type: Action.ARCH_UPDATE_CONNECTION_GRAPH, data, root };
}

/**
 * This function is called when `archUpdateConnectionGraph` is dispatched
 * @param state
 * @param action
 */
export function archUpdateConnectionGraph_(
  state: StateInterface,
  action: ArchUpdateConnectionGraph
): StateInterface {
  const updateData = action.data;

  const root = action.root;
  const { systemGraphData, systemList } = { ...state.systemArch.systemGraph };
  const newSystemGraphData = { ...systemGraphData };
  let newSystemList = [...systemList];

  const rootPath = root.split('.');
  if (rootPath.length > 1) {
    const rootChild = rootPath[rootPath.length - 1];
    const rootParent = root.replace(`.${rootChild}`, '');

    const newConnection = newSystemGraphData[rootParent].connections.filter(
      (value: string[]) =>
        !(value[0].includes(rootChild) || value[1].includes(rootChild))
    );
    newSystemGraphData[rootParent].connections = newConnection;
  }

  for (const [oldId, newId] of Object.entries(updateData)) {
    if (oldId in systemGraphData) {
      newSystemGraphData[newId] = systemGraphData[oldId];
      delete newSystemGraphData[oldId];
    }
  }
  newSystemList = Object.keys(newSystemGraphData);
  const newNodePath = [];
  state.systemArch.systemTree.nodePath.forEach(element => {
    if (Object.keys(updateData).includes(element)) {
      newNodePath.push(updateData[element]);
    }
  });

  return {
    ...state,
    systemArch: {
      ...state.systemArch,
      systemTree: { ...state.systemArch.systemTree, nodePath: newNodePath },
      systemGraph: {
        ...state.systemArch.systemGraph,
        systemGraphData: newSystemGraphData,
        systemList: newSystemList,
        updateData
      }
    }
  };
}

/**
 *
 *
 * @export
 * @param {string} nodeId
 * @returns {ActionType}
 */
export function archSelectNode(nodeId: string): ActionType {
  return { type: Action.SELECT_NODE, nodeId };
}

/**
 *
 *
 * @export
 * @param {StateInterface} state
 * @param {ArchSelectNode} action
 * @returns {StateInterface}
 */
export function archSelectNode_(
  state: StateInterface,
  action: ArchSelectNode
): StateInterface {
  return {
    ...state,
    systemArch: {
      ...state.systemArch,
      systemTree: {
        ...state.systemArch.systemTree,
        selectedNode: action.nodeId
      }
    }
  };
}

/**
 * Add a new node to system structure tree
 * @param nodeName
 * @param nodePath
 * @param nodeData
 */
export function archAddNode(
  nodeName: string,
  nodePath: string,
  nodeData: {
    personName: UserListType[];
    sysClass: string;
    portList: {
      portName: string;
      portDirection: number;
      portClass: string;
    }[];
  }
): ActionType {
  return { type: Action.ADD_NODE, nodeName, nodePath, nodeData };
}

/**
 * This function is called when `archAddNode` is dispatched
 * @param state
 * @param action
 */
export function archAddNode_(
  state: StateInterface,
  action: ArchAddNode
): StateInterface {
  const getNodeKey = (obj: { treeIndex: any }) => obj.treeIndex;

  const path = action.nodePath;
  const fullPath = getNodeFullPath(state.systemArch.systemTree.nodeData, path);
  const newTreeData = addNodeUnderParent({
    treeData: state.systemArch.systemTree.nodeData,
    parentKey: path[path.length - 1],
    expandParent: true,
    getNodeKey,
    newNode: {
      title: action.nodeName
    }
  }).treeData;
  const newNodeName = action.nodeName;
  const fullNodeName = fullPath.concat('.' + newNodeName);

  const inPortList: Array<string> = ['inwards'];
  const outPortList: Array<string> = ['outwards'];
  const connectionList: Array<Array<string>> = [];
  for (let index = 0; index < action.nodeData.portList.length; index++) {
    const element = action.nodeData.portList[index];
    if (element.portDirection === 0) {
      inPortList.push(element.portName);
    } else {
      outPortList.push(element.portName);
    }
  }
  return {
    ...state,
    systemArch: {
      ...state.systemArch,
      systemTree: {
        ...state.systemArch.systemTree,
        nodeData: newTreeData
      },
      systemGraph: {
        ...state.systemArch.systemGraph,
        systemGraphData: {
          ...state.systemArch.systemGraph.systemGraphData,
          [fullNodeName]: {
            inPort: inPortList,
            outPort: outPortList,
            connections: connectionList
          }
        },
        systemList: [...state.systemArch.systemGraph.systemList, fullNodeName]
      },
      systemData: {
        ...state.systemArch.systemData,
        mainData: {
          ...state.systemArch.systemData.mainData,
          [fullNodeName]: {
            user: action.nodeData.personName,
            class: action.nodeData.sysClass,
            portList: inPortList.concat(outPortList)
          }
        },
        portData: {
          ...state.systemArch.systemData.portData
        }
      }
    }
  };
}

/**
 * Remove the selected node from system structure tree
 * @param nodeData
 * @param nodePath
 */
export function archRemoveNode(nodeData: any, nodePath: any): ActionType {
  return { type: Action.REMOVE_NODE, nodeData, nodePath };
}

/**
 * This function is called when `archRemoveNode` is dispatched
 * @param state
 * @param action
 */
export function archRemoveNode_(
  state: StateInterface,
  action: ArchRemoveNode
): StateInterface {
  const getNodeKey = (obj: { treeIndex: any }) => obj.treeIndex;
  const path = action.nodePath;
  const fullNodeName = getNodeFullPath(
    state.systemArch.systemTree.nodeData,
    path
  );

  const newSystemList = [];
  const newSystemGraphData = {};
  const newSystemData = {};

  const newTreeData = removeNodeAtPath({
    treeData: state.systemArch.systemTree.nodeData,
    path,
    getNodeKey
  });
  state.systemArch.systemGraph.systemList.forEach(fullSysName => {
    if (fullSysName.startsWith(fullNodeName)) {
    } else {
      newSystemList.push(fullSysName);
      if (
        state.systemArch.systemGraph.systemGraphData.hasOwnProperty(fullSysName)
      ) {
        newSystemGraphData[fullSysName] =
          state.systemArch.systemGraph.systemGraphData[fullSysName];
        newSystemData[fullSysName] =
          state.systemArch.systemData.mainData[fullSysName];
      }
    }
  });

  return {
    ...state,
    systemArch: {
      ...state.systemArch,
      systemTree: {
        ...state.systemArch.systemTree,
        nodeData: newTreeData
      },
      systemGraph: {
        ...state.systemArch.systemGraph,
        systemList: newSystemList,
        systemGraphData: newSystemGraphData
      },
      systemData: {
        ...state.systemArch.systemData,
        mainData: newSystemData,
        portData: {
          ...state.systemArch.systemData.portData
        }
      }
    }
  };
}

/**
 * Update structure tree data
 * @param treeData
 */
export function archUpdateTreeData(
  treeData: any,
  updatePbs = false
): ActionType {
  return { type: Action.UPDATE_TREE, treeData, updatePbs };
}

export function archUpdateTreeData_(
  state: StateInterface,
  action: ArchUpdateTree
): StateInterface {
  let pbsUpdateSignal = state.systemArch.systemPBSUpdated;
  if (action.updatePbs) {
    pbsUpdateSignal += 1;
  }

  return {
    ...state,
    systemArch: {
      ...state.systemArch,
      systemTree: {
        ...state.systemArch.systemTree,
        nodeData: action.treeData
      },
      systemPBSUpdated: pbsUpdateSignal
    }
  };
}

/**
 * Update time step list in redux store
 * @param data
 */
export function dashboardAdd3DData(data: any): ActionType {
  return { type: Action.DASHBOARD_ADD_3D_DATA, data };
}

/**
 * This function is called if `dashboardAdd3DData` is dispatched
 * @param state
 * @param action
 */
export function dashboardAdd3DData_(
  state: StateInterface,
  action: DashboardAddData
): StateInterface {
  const newTimeList = ['None', ...action.data];

  return {
    ...state,
    dashboardState: { ...state.dashboardState, timeStepList: newTimeList }
  };
}

/**
 * Toggle run status of store
 */
export function dashboardToggleRun() {
  return { type: Action.DASHBOARD_TOGGLE_RUN };
}

export function dashboardSetController(data: {
  [key: string]: number;
}): ActionType {
  return { type: Action.DASHBOARD_SET_CONTROLLER, data };
}

export function dashboardSetController_(
  state: StateInterface,
  action: DashboardSetController
): StateInterface {
  return {
    ...state,
    dashboardState: { ...state.dashboardState, selectedVariable: action.data }
  };
}

/**
 * Add a parameter controller to store
 * @param variableName
 * @param value
 */
export function dashboardAddController(
  variableName: string,
  value: number
): ActionType {
  return { type: Action.DASHBOARD_ADD_CONTROLLER, variableName, value };
}

/**
 * This function is called if `dashboardAddController` is dispatched
 * @param state
 * @param action
 */
export function dashboardAddController_(
  state: StateInterface,
  action: DashboardAddController
): StateInterface {
  const currentVarlist = Object.keys(state.dashboardState.selectedVariable);
  if (!currentVarlist.includes(action.variableName)) {
    const newVarList = {
      ...state.dashboardState.selectedVariable,
      [action.variableName]: action.value
    };
    return {
      ...state,
      dashboardState: { ...state.dashboardState, selectedVariable: newVarList }
    };
  } else {
    return state;
  }
}

/**
 * Update the value of selected controller
 * @param variableName
 * @param value
 */
export function dashboardUpdateController(
  variableName: string,
  value: number
): ActionType {
  return {
    type: Action.DASHBOARD_UPDATE_CONTROLLER,
    variableName,
    value
  };
}

/**
 * This function is called if `dashboardUpdateController` is dispatched
 * @param state
 * @param action
 */
export function dashboardUpdateController_(
  state: StateInterface,
  action: DashboardUpdateController
): StateInterface {
  if (
    state.dashboardState.selectedVariable.hasOwnProperty(action.variableName)
  ) {
    return {
      ...state,
      dashboardState: {
        ...state.dashboardState,
        selectedVariable: {
          ...state.dashboardState.selectedVariable,
          [action.variableName]: action.value
        }
      }
    };
  } else {
    return state;
  }
}

/**
 * Remove selected controller
 * @param variableName
 */
export function dashboardRemoveController(variableName: string): ActionType {
  return {
    type: Action.DASHBOARD_REMOVE_CONTROLLER,
    variableName: variableName
  };
}

/**
 * This function is called if `dashboardRemoveController` is dispatched
 * @param state
 * @param action
 */
export function dashboardRemoveController_(
  state: StateInterface,
  action: DashboardRemoveController
): StateInterface {
  const {
    [action.variableName]: value,
    ...newVarList
  } = state.dashboardState.selectedVariable;
  return {
    ...state,
    dashboardState: { ...state.dashboardState, selectedVariable: newVarList }
  };
}

/**
 *
 *
 * @export
 * @param {{
 *   [key: string]: any;
 * }} data
 * @returns {ActionType}
 */
export function dashboardUpdateComputedResult(data: {
  variable: { [key: string]: any };
  recorder: { [key: string]: any };
  driver: { [key: string]: any };
}): ActionType {
  return {
    type: Action.DASHBOARD_UPDATE_COMPUTED_RESULT,
    data
  };
}

/**
 *
 *
 * @export
 * @param {StateInterface} state
 * @param {DashboardUpdateComputedResult} action
 * @returns {StateInterface}
 */
export function dashboardUpdateComputedResult_(
  state: StateInterface,
  action: DashboardUpdateComputedResult
): StateInterface {
  const computedResult = action.data.variable;
  const recorderData = action.data.recorder;
  const driverData = action.data.driver;
  return {
    ...state,
    dashboardState: {
      ...state.dashboardState,
      computedResult,
      recorderData,
      driverData
    }
  };
}
