import * as actions from '../actions';
import * as types from '../types';
import { initialState } from '../reducers';

const nodeData: types.ArchAddNode = {
  type: types.Action.ADD_NODE,
  nodeName: 'test',
  nodePath: [0],
  nodeData: {
    personName: [
      {
        uid: 5,
        name: 'User'
      }
    ],
    sysClass: 'Demo system 1',
    portList: []
  }
};

const removeNodeData: types.ArchRemoveNode = {
  type: types.Action.REMOVE_NODE,
  nodeData: {
    title: 'test'
  },
  nodePath: [0, 1]
};

describe('Test redux actions', () => {
  it('Action to switch main panel', () => {
    expect(actions.mainSwitchPanel('Project_Overview')).toEqual({
      type: types.Action.SWITCH_PANEL,
      panelName: 'Project_Overview'
    });
  });

  it('Action to add new node', () => {
    expect(
      actions.archAddNode(
        nodeData.nodeName,
        nodeData.nodePath,
        nodeData.nodeData
      )
    ).toEqual(nodeData);
  });

  it('Action to lock graph', () => {
    expect(actions.archLockGraph(false)).toEqual({
      type: types.Action.LOCK_GRAPH,
      status: false
    });
  });

  it('Action to remove node', () => {
    expect(
      actions.archRemoveNode(removeNodeData.nodeData, removeNodeData.nodePath)
    ).toEqual({
      type: types.Action.REMOVE_NODE,
      nodeData: removeNodeData.nodeData,
      nodePath: removeNodeData.nodePath
    });
  });

  it('Action to update time step list', () => {
    expect(actions.dashboardAdd3DData(['step 1'])).toEqual({
      type: types.Action.DASHBOARD_ADD_3D_DATA,
      data: ['step 1']
    });
  });

  it('Action to save pbs node position', () => {
    expect(actions.archSaveGraphPosition({'root': {visible : true, position : [0,0]}})).toEqual({
      type : types.Action.ARCH_SAVE_GRAPH_POSITION,
      data : {'root': {visible : true, position : [0,0]}}
    })
  })

  it('Action to modify the visibility flag of node data', () => {
    expect(actions.archFilterNode(['root'], [])).toEqual({
      type : types.Action.ARCH_FILTER_NODE,
      data : ['root'],
      selected: []
    })
  })
});



describe('Test redux functions', () => {
  it('Functions to switch main panel', () => {
    expect(
      actions.mainSwitchPanel_(initialState, {
        type: types.Action.SWITCH_PANEL,
        panelName: 'Project_Overview'
      }).mainState
    ).toEqual({
      panel_0: [true, 'Project_Overview'],
      panel_1: [false, 'System_Arc'],
      panel_2: [false, 'Module_Creator'],
      panel_3: [false, 'Dashboard'],
      panel_4: [false, 'User_Management'],
      panel_5: [false, 'Module_Library']
    });
  });
});

describe('Test redux functions', () => {
  const expectedState = {
    lockStatus: false,
    systemTree: {
      nodeData: [
        {
          title: 'Root',
          expanded: true,
          children: [
            {
              title: 'test'
            }
          ]
        }
      ],
      nodePath: [],
      selectedNode: null
    },
    systemData: {
      mainData: {
        'Root.test': {
          user: [
            {
              uid: 5,
              name: 'User'
            }
          ],
          class: 'Demo system 1',
          portList: ['inwards', 'outwards']
        }
      },
      portData: {}
    },
    systemGraph: {
      systemGraphData: {
        Root: {
          inPort: ['inwards'],
          outPort: ['outwards'],
          connections: []
        },
        'Root.test': {
          inPort: ['inwards'],
          outPort: ['outwards'],
          connections: []
        }
      },
      systemList: ['Root', 'Root.test'],
      updateData: {},
      graphJsonData: {}
    },
    systemPBS : {},
    systemPBSUpdated : 0
  };
  it('Function to add node to store', () => {
    expect(actions.archAddNode_(initialState, nodeData).systemArch).toEqual(
      expectedState
    );
  });
});

describe('Test redux functions', () => {
  const currentState = actions.archAddNode_(initialState, nodeData);
  const expectedState = {
    lockStatus: false,
    systemTree: {
      nodeData: [
        {
          title: 'Root',
          expanded: true,
          children: []
        }
      ],
      nodePath: [],
      selectedNode: null
    },
    systemData: {
      mainData: { 'Root' : undefined},
      portData: {}
    },
    systemGraph: {
      systemGraphData: {
        Root: {
          inPort: ['inwards'],
          outPort: ['outwards'],
          connections: []
        }
      },
      systemList: ['Root'],
      updateData: {},
      graphJsonData: {}
    },
    systemPBS : {},
    systemPBSUpdated : 0
  };
  it('Function to remove node from store', () => {
    expect(
      actions.archRemoveNode_(currentState, removeNodeData).systemArch
    ).toEqual(expectedState);
  });
});

describe('Test redux functions', () => {
  const expectedState = {'root': {'position': [0, 0], 'visible': true}};
  it('Function to save pbs node position to store', () => {
    expect(
      actions.archSaveGraphPosition_(initialState, {
        type : types.Action.ARCH_SAVE_GRAPH_POSITION,
        data : {'root': {visible : true, position : [0,0]}}
      }).systemArch.systemPBS
    ).toEqual(expectedState);
  });
});


describe('Test redux functions', () => {
  const expectedState = {'root': {visible : true, position : [0,0]} ,'root.foo': {visible : false, position : [1,1]}};
  it('Function to modify the visibility flag of node data', () => {
    const state = actions.archSaveGraphPosition_(initialState, {
      type : types.Action.ARCH_SAVE_GRAPH_POSITION,
      data : {'root': {visible : true, position : [0,0]} ,'root.foo': {visible : true, position : [1,1]}}
    })
    expect(
      actions.archFilterNode_(state, {
        type : types.Action.ARCH_FILTER_NODE,
        data : ['root'],
        selected: []
      }).systemArch.systemPBS
    ).toEqual(expectedState);
  });
});



describe('Test redux functions', () => {
  const expectedState = ['None', 'step 1'];
  it('Function to update time step list in store', () => {
    expect(
      actions.dashboardAdd3DData_(initialState, {
        type: types.Action.DASHBOARD_ADD_3D_DATA,
        data: ['step 1']
      }).dashboardState.timeStepList
    ).toEqual(expectedState);
  });
});

