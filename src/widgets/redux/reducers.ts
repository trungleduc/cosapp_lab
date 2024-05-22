import { Action, ActionType, StateInterface } from './types';
import * as ActionFunc from './actions';

export const initialState: StateInterface = {
  systemConfig: {},
  mainState: {
    panel_0: [false, 'Project_Overview'],
    panel_1: [true, 'System_Arc'],
    panel_2: [false, 'Module_Creator'],
    panel_3: [false, 'Dashboard'],
    panel_4: [false, 'User_Management'],
    panel_5: [false, 'Module_Library'],
  },
  saveSignal: 0,
  systemArch: {
    lockStatus: false,
    systemTree: {
      nodeData: [{ title: 'Root' }],
      nodePath: [],
      selectedNode: null,
    },
    systemData: { mainData: {}, portData: {} },
    systemGraph: {
      systemGraphData: {
        Root: {
          inPort: ['inwards'],
          outPort: ['outwards'],
          connections: [],
        },
      },
      systemList: ['Root'],
      graphJsonData: {},
      updateData: {},
    },
    systemPBS: {},
    systemPBSUpdated: 0,
  },
  dashboardState: {
    computing: false,
    timeStepList: ['None'],
    data3D: {},
    variableData: {},
    portMetaData: {},
    selectedVariable: {},
    computedResult: {},
    recorderData: {},
    driverData : {}
  },
};

export function rootReducer(
  state: StateInterface = initialState,
  action: ActionType
): StateInterface {
  switch (action.type) {
    case Action.RESET_STORE: {
      return initialState;
    }

    case Action.SAVE_STATE: {
      return ActionFunc.saveState_(state);
    }

    case Action.SWITCH_PANEL: {
      return ActionFunc.mainSwitchPanel_(state, action);
    }

    case Action.LOCK_GRAPH: {
      return {
        ...state,
        systemArch: {
          ...state.systemArch,
          lockStatus: action.status,
        },
      };
    }

    case Action.GET_SERVER_DATA: {
      return ActionFunc.serverGetData_(state, action);
    }

    case Action.ARCH_SAVE_GRAPH_JSON: {
      return ActionFunc.archSaveGraphJson_(state, action);
    }

    case Action.ARCH_SAVE_GRAPH_POSITION: {
      return ActionFunc.archSaveGraphPosition_(state, action);
    }

    case Action.ARCH_UPDATE_CONNECTION_GRAPH: {
      return ActionFunc.archUpdateConnectionGraph_(state, action);
    }

    case Action.ARCH_FILTER_NODE: {
      return ActionFunc.archFilterNode_(state, action);
    }

    case Action.SELECT_NODE: {
      return ActionFunc.archSelectNode_(state, action);
    }

    case Action.ADD_NODE: {
      return ActionFunc.archAddNode_(state, action);
    }

    case Action.UPDATE_TREE: {
      return ActionFunc.archUpdateTreeData_(state, action);
    }

    case Action.REMOVE_NODE: {
      return ActionFunc.archRemoveNode_(state, action);
    }

    case Action.DASHBOARD_ADD_3D_DATA: {
      return ActionFunc.dashboardAdd3DData_(state, action);
    }

    case Action.DASHBOARD_TOGGLE_RUN: {
      return {
        ...state,
        dashboardState: {
          ...state.dashboardState,
          computing: !state.dashboardState.computing,
        },
      };
    }

    case Action.DASHBOARD_SET_CONTROLLER: {
      return ActionFunc.dashboardSetController_(state, action);
    }
    case Action.DASHBOARD_ADD_CONTROLLER: {
      return ActionFunc.dashboardAddController_(state, action);
    }

    case Action.DASHBOARD_REMOVE_CONTROLLER: {
      return ActionFunc.dashboardRemoveController_(state, action);
    }

    case Action.DASHBOARD_UPDATE_CONTROLLER: {
      return ActionFunc.dashboardUpdateController_(state, action);
    }

    case Action.DASHBOARD_UPDATE_COMPUTED_RESULT: {
      return ActionFunc.dashboardUpdateComputedResult_(state, action);
    }

  }

  return state;
}
