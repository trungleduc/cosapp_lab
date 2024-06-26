import { StateInterface } from '../../widgets/redux/types';

export const mockState: StateInterface = {
  mainState: {
    panel_0: [false, 'Project_Overview'],
    panel_1: [false, 'System_Arc'],
    panel_2: [false, 'Module_Creator'],
    panel_3: [true, 'Dashboard'],
    panel_4: [false, 'User_Management'],
    panel_5: [false, 'Module_Library']
  },
  systemConfig: {},
  saveSignal: 2,
  systemArch: {
    lockStatus: false,
    systemTree: {
      nodeData: [
        {
          title: 'model',
          children: [
            {
              title: 'source'
            },
            {
              title: 'ground'
            },
            {
              title: 'circuit',
              children: [
                {
                  title: 'n1'
                },
                {
                  title: 'n2'
                },
                {
                  title: 'R1'
                },
                {
                  title: 'R2'
                },
                {
                  title: 'R3'
                }
              ]
            }
          ]
        }
      ],
      nodePath: [],
      selectedNode: null
    },
    systemData: {
      mainData: {},
      portData: {}
    },
    systemGraph: {
      systemGraphData: {
        model: {
          inPort: ['inwards'],
          outPort: ['outwards'],
          connections: [
            ['circuit.I_in', 'source.I_out'],
            ['circuit.Vg', 'ground.V_out']
          ],
          position: [735.5, 491.4921875]
        },
        'model.source': {
          inPort: ['inwards'],
          outPort: ['outwards', 'I_out'],
          connections: [],
          position: [427.75, 100]
        },
        'model.ground': {
          inPort: ['inwards'],
          outPort: ['outwards', 'V_out'],
          connections: [],
          position: [626.25, 100]
        },
        'model.circuit': {
          inPort: ['inwards', 'I_in', 'Vg'],
          outPort: ['outwards'],
          connections: [
            ['n1.I_in0', 'I_in'],
            ['n1.inwards', 'inwards'],
            ['n1.I_out0', 'R1.I'],
            ['n1.I_out1', 'R2.I'],
            ['R1.V_out', 'Vg'],
            ['R1.V_in', 'inwards'],
            ['R3.V_out', 'Vg'],
            ['R3.V_in', 'inwards'],
            ['R2.V_in', 'inwards'],
            ['R2.V_out', 'inwards'],
            ['n2.inwards', 'inwards'],
            ['n2.I_in0', 'R2.I'],
            ['n2.I_out0', 'R3.I']
          ],
          position: [427.75, 211.59375]
        },
        'model.circuit.n1': {
          inPort: ['inwards', 'I_in0', 'I_out0', 'I_out1'],
          outPort: ['outwards'],
          connections: [],
          position: [100, 467.1875]
        },
        'model.circuit.n2': {
          inPort: ['inwards', 'I_in0', 'I_out0'],
          outPort: ['outwards'],
          connections: [],
          position: [537, 475.2890625]
        },
        'model.circuit.R1': {
          inPort: ['inwards', 'V_in', 'V_out'],
          outPort: ['outwards', 'I'],
          connections: [],
          position: [229.25, 339.390625]
        },
        'model.circuit.R2': {
          inPort: ['inwards', 'V_in', 'V_out'],
          outPort: ['outwards', 'I'],
          connections: [],
          position: [427.75, 339.390625]
        },
        'model.circuit.R3': {
          inPort: ['inwards', 'V_in', 'V_out'],
          outPort: ['outwards', 'I'],
          connections: [],
          position: [646.25, 339.390625]
        }
      },
      systemList: [
        'model',
        'model.source',
        'model.ground',
        'model.circuit',
        'model.circuit.n1',
        'model.circuit.n2',
        'model.circuit.R1',
        'model.circuit.R2',
        'model.circuit.R3'
      ],
      graphJsonData: {},
      updateData: {}
    },
    systemPBS: {},
    systemPBSUpdated: 0
  },
  dashboardState: {
    computing: false,
    timeStepList: ['None'],
    data3D: {},
    variableData: {
      'model.source.inwards.I': {
        value: 0.1,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.source.I_out.I': {
        value: 0.1,
        valid_range: [0, 'inf'],
        invalid_comment: '',
        limits: [0, 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.ground.inwards.V': {
        value: 0,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.ground.V_out.V': {
        value: 0,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.inwards.n1_V': {
        value: 42.85714285871762,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.inwards.n2_V': {
        value: 14.285714288716745,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.I_in.I': {
        value: 0.1,
        valid_range: [0, 'inf'],
        invalid_comment: '',
        limits: [0, 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.Vg.V': {
        value: 0,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.n1.inwards.n_in': {
        value: 1,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.n1.inwards.n_out': {
        value: 2,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.n1.inwards.V': {
        value: 42.85714285871762,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.n1.I_in0.I': {
        value: 0.1,
        valid_range: [0, 'inf'],
        invalid_comment: '',
        limits: [0, 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.n1.I_out0.I': {
        value: 0.0428571428365806,
        valid_range: [0, 'inf'],
        invalid_comment: '',
        limits: [0, 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.n1.I_out1.I': {
        value: 0.057142857156291194,
        valid_range: [0, 'inf'],
        invalid_comment: '',
        limits: [0, 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.n1.outwards.sum_I_in': {
        value: 0.1,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.n1.outwards.sum_I_out': {
        value: 0.09999999999287179,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.n2.inwards.n_in': {
        value: 1,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.n2.inwards.n_out': {
        value: 1,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.n2.inwards.V': {
        value: 14.285714288716745,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.n2.I_in0.I': {
        value: 0.057142857156291305,
        valid_range: [0, 'inf'],
        invalid_comment: '',
        limits: [0, 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.n2.I_out0.I': {
        value: 0.057142857156291305,
        valid_range: [0, 'inf'],
        invalid_comment: '',
        limits: [0, 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.n2.outwards.sum_I_in': {
        value: 0.057142857156291305,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.n2.outwards.sum_I_out': {
        value: 0.057142857156291305,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.R1.inwards.R': {
        value: 1000,
        valid_range: [0, 'inf'],
        invalid_comment: '',
        limits: [0, 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.R1.V_in.V': {
        value: 42.85714285871762,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.R1.V_out.V': {
        value: 0,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.R1.outwards.deltaV': {
        value: 42.85714285871762,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.R1.I.I': {
        value: 0.042857142858717626,
        valid_range: [0, 'inf'],
        invalid_comment: '',
        limits: [0, 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.R2.inwards.R': {
        value: 500,
        valid_range: [0, 'inf'],
        invalid_comment: '',
        limits: [0, 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.R2.V_in.V': {
        value: 42.85714285871762,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.R2.V_out.V': {
        value: 14.285714288716745,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.R2.outwards.deltaV': {
        value: 28.571428570000876,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.R2.I.I': {
        value: 0.05714285714000175,
        valid_range: [0, 'inf'],
        invalid_comment: '',
        limits: [0, 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.R3.inwards.R': {
        value: 250,
        valid_range: [0, 'inf'],
        invalid_comment: '',
        limits: [0, 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.R3.V_in.V': {
        value: 14.285714288716745,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.R3.V_out.V': {
        value: 0,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.R3.outwards.deltaV': {
        value: 14.285714288716745,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.R3.I.I': {
        value: 0.05714285715486698,
        valid_range: [0, 'inf'],
        invalid_comment: '',
        limits: [0, 'inf'],
        out_of_limits_comment: '',
        distribution: null
      }
    },
    portMetaData: {},
    selectedVariable: {},
    computedResult: {},
    recorderData: {},
    driverData: {}
  }
};

export const panel1MockState: StateInterface = {
  mainState: {
    panel_0: [false, 'Project_Overview'],
    panel_1: [true, 'System_Arc'],
    panel_2: [false, 'Module_Creator'],
    panel_3: [false, 'Dashboard'],
    panel_4: [false, 'User_Management'],
    panel_5: [false, 'Module_Library']
  },
  systemConfig: {},
  saveSignal: 0,
  systemArch: {
    lockStatus: false,
    systemTree: {
      nodeData: [
        {
          title: 'model',
          id: 'model',
          expanded: true,
          children: [
            {
              title: 'source',
              id: 'model.source',
              expanded: true
            },
            {
              title: 'engine',
              id: 'model.engine',
              expanded: true
            },
            {
              title: 'circuit',
              id: 'model.circuit',
              expanded: true,
              children: [
                {
                  title: 'n1',
                  id: 'model.circuit.n1',
                  expanded: true
                },
                {
                  title: 'n2',
                  id: 'model.circuit.n2',
                  expanded: true
                },
                {
                  title: 'R1',
                  id: 'model.circuit.R1',
                  expanded: true
                },
                {
                  title: 'R2',
                  id: 'model.circuit.R2',
                  expanded: true
                },
                {
                  title: 'R3',
                  id: 'model.circuit.R3',
                  expanded: true
                }
              ]
            }
          ]
        }
      ],
      nodePath: [],
      selectedNode: null
    },
    systemData: {
      mainData: {},
      portData: {}
    },
    systemGraph: {
      systemGraphData: {
        model: {
          inPort: ['inwards'],
          outPort: ['outwards'],
          connections: [
            ['circuit.I_in', 'source.I_out'],
            ['circuit.Vg', 'engine.V_out']
          ]
        },
        'model.source': {
          inPort: ['inwards'],
          outPort: ['outwards', 'I_out'],
          connections: []
        },
        'model.engine': {
          inPort: ['inwards'],
          outPort: ['outwards', 'V_out'],
          connections: []
        },
        'model.circuit': {
          inPort: ['inwards', 'I_in', 'Vg'],
          outPort: ['outwards'],
          connections: [
            ['n1.I_in0', 'I_in'],
            [
              'n1.inwards',
              'inwards',
              {
                V: 'n1_V'
              }
            ],
            ['n1.I_out0', 'R1.I'],
            ['n1.I_out1', 'R2.I'],
            ['R1.V_out', 'Vg'],
            [
              'R1.V_in',
              'inwards',
              {
                V: 'n1_V'
              }
            ],
            ['R3.V_out', 'Vg'],
            [
              'R3.V_in',
              'inwards',
              {
                V: 'n2_V'
              }
            ],
            [
              'R2.V_in',
              'inwards',
              {
                V: 'n1_V'
              }
            ],
            [
              'R2.V_out',
              'inwards',
              {
                V: 'n2_V'
              }
            ],
            [
              'n2.inwards',
              'inwards',
              {
                V: 'n2_V'
              }
            ],
            ['n2.I_in0', 'R2.I'],
            ['n2.I_out0', 'R3.I']
          ]
        },
        'model.circuit.n1': {
          inPort: ['inwards', 'I_in0', 'I_out0', 'I_out1'],
          outPort: ['outwards'],
          connections: []
        },
        'model.circuit.n2': {
          inPort: ['inwards', 'I_in0', 'I_out0'],
          outPort: ['outwards'],
          connections: []
        },
        'model.circuit.R1': {
          inPort: ['inwards', 'V_in', 'V_out'],
          outPort: ['outwards', 'I'],
          connections: []
        },
        'model.circuit.R2': {
          inPort: ['inwards', 'V_in', 'V_out'],
          outPort: ['outwards', 'I'],
          connections: []
        },
        'model.circuit.R3': {
          inPort: ['inwards', 'V_in', 'V_out'],
          outPort: ['outwards', 'I'],
          connections: []
        }
      },
      systemList: [
        'model',
        'model.source',
        'model.engine',
        'model.circuit',
        'model.circuit.n1',
        'model.circuit.n2',
        'model.circuit.R1',
        'model.circuit.R2',
        'model.circuit.R3'
      ],
      graphJsonData: {},
      updateData: {}
    },
    systemPBS: {
      __$graph_style$__: {
        visible: false,
        position: [0, 0]
      },
      model: {
        visible: true,
        position: [-88, -88]
      },
      'model.source': {
        visible: true,
        position: [-184, 8]
      },
      'model.engine': {
        visible: true,
        position: [-88, 8]
      },
      'model.circuit': {
        visible: true,
        position: [8, 8]
      },
      'model.circuit.n1': {
        visible: true,
        position: [-184, 104]
      },
      'model.circuit.n2': {
        visible: true,
        position: [-88, 104]
      },
      'model.circuit.R1': {
        visible: true,
        position: [8, 104]
      },
      'model.circuit.R2': {
        visible: true,
        position: [104, 104]
      },
      'model.circuit.R3': {
        visible: true,
        position: [200, 104]
      }
    },
    systemPBSUpdated: 1
  },
  dashboardState: {
    computing: false,
    timeStepList: ['None'],
    data3D: {},
    variableData: {
      'model.source.inwards.I': {
        value: 0.1,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.source.I_out.I': {
        value: 0.1,
        valid_range: [0, 'inf'],
        invalid_comment: '',
        limits: [0, 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.engine.inwards.V': {
        value: 0,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.engine.V_out.V': {
        value: 0,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.inwards.n1_V': {
        value: 1,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.inwards.n2_V': {
        value: 1,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.I_in.I': {
        value: 1,
        valid_range: [0, 'inf'],
        invalid_comment: '',
        limits: [0, 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.Vg.V': {
        value: 1,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.n1.inwards.n_in': {
        value: 1,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.n1.inwards.n_out': {
        value: 2,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.n1.inwards.V': {
        value: 1,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.n1.I_in0.I': {
        value: 1,
        valid_range: [0, 'inf'],
        invalid_comment: '',
        limits: [0, 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.n1.I_out0.I': {
        value: 1,
        valid_range: [0, 'inf'],
        invalid_comment: '',
        limits: [0, 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.n1.I_out1.I': {
        value: 1,
        valid_range: [0, 'inf'],
        invalid_comment: '',
        limits: [0, 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.n1.outwards.sum_I_in': {
        value: 0,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.n1.outwards.sum_I_out': {
        value: 0,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.n2.inwards.n_in': {
        value: 1,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.n2.inwards.n_out': {
        value: 1,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.n2.inwards.V': {
        value: 1,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.n2.I_in0.I': {
        value: 1,
        valid_range: [0, 'inf'],
        invalid_comment: '',
        limits: [0, 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.n2.I_out0.I': {
        value: 1,
        valid_range: [0, 'inf'],
        invalid_comment: '',
        limits: [0, 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.n2.outwards.sum_I_in': {
        value: 0,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.n2.outwards.sum_I_out': {
        value: 0,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.R1.inwards.R': {
        value: 1000,
        valid_range: [0, 'inf'],
        invalid_comment: '',
        limits: [0, 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.R1.V_in.V': {
        value: 1,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.R1.V_out.V': {
        value: 1,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.R1.outwards.deltaV': {
        value: 1,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.R1.I.I': {
        value: 1,
        valid_range: [0, 'inf'],
        invalid_comment: '',
        limits: [0, 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.R2.inwards.R': {
        value: 500,
        valid_range: [0, 'inf'],
        invalid_comment: '',
        limits: [0, 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.R2.V_in.V': {
        value: 1,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.R2.V_out.V': {
        value: 1,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.R2.outwards.deltaV': {
        value: 1,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.R2.I.I': {
        value: 1,
        valid_range: [0, 'inf'],
        invalid_comment: '',
        limits: [0, 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.R3.inwards.R': {
        value: 250,
        valid_range: [0, 'inf'],
        invalid_comment: '',
        limits: [0, 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.R3.V_in.V': {
        value: 1,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.R3.V_out.V': {
        value: 1,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.R3.outwards.deltaV': {
        value: 1,
        valid_range: ['-inf', 'inf'],
        invalid_comment: '',
        limits: ['-inf', 'inf'],
        out_of_limits_comment: '',
        distribution: null
      },
      'model.circuit.R3.I.I': {
        value: 1,
        valid_range: [0, 'inf'],
        invalid_comment: '',
        limits: [0, 'inf'],
        out_of_limits_comment: '',
        distribution: null
      }
    },
    portMetaData: {},
    selectedVariable: {},
    computedResult: {},
    recorderData: {},
    driverData: {}
  }
};
