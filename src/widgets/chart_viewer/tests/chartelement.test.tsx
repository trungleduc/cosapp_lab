//@ts-ignore
global.URL.createObjectURL = jest.fn();
HTMLCanvasElement.prototype.getContext = jest.fn();
import { Provider } from 'react-redux';
import { initialState } from '../../redux/reducers';
import React from 'react';
import { configure, mount, ReactWrapper } from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';
import ChartElement, {
  ChartElement as PureChartElement
} from '../chart_element/chartelement';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import {
  MockModel,
  recorderData,
  computedResult,
  driverData
} from '../../../utils/tests/utils';
import { StateInterface } from '../../redux/types';
configure({ adapter: new Adapter() });

const mockStore = configureMockStore([thunk]);

describe('Test <ChartElement/>', () => {
  let wrapper: ReactWrapper;
  let btnHandle;
  let divRef;

  beforeEach(() => {
    const newState: StateInterface = {
      ...initialState,
      dashboardState: {
        ...initialState.dashboardState,
        computedResult,
        recorderData,
        driverData
      }
    };
    const store = mockStore(newState);
    btnHandle = jest.fn(() => {});
    divRef = React.createRef<any>();
    wrapper = mount(
      <Provider store={store}>
        <ChartElement
          ref={divRef}
          model={new MockModel() as any}
          send_msg={jest.fn()}
          id={'id'}
          initialState={null}
        />
      </Provider>
    );
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('Should render correctly component', () => {
    const component = wrapper.find(ChartElement);
    expect(component).toHaveLength(1);
  });

  it('Should match snapshot', () => {
    const component = wrapper.find(ChartElement);
    expect(component.html()).toMatchSnapshot();
  });

  it('Should create state correctly ', () => {
    const component = wrapper.find(PureChartElement);
    expect(component.state('plotLayoutConfig')).toEqual({
      title: '',
      xAxis: '',
      xAxisMax: '',
      xAxisMin: '',
      yAxis: '',
      yAxisMax: '',
      yAxisMin: '',
      zAxis: '',
      zAxisMax: '',
      zAxisMin: ''
    });
    expect(component.state('systemNameX')).toEqual('model.source');
    expect(component.state('xData')).toEqual('inwards.I');
    expect(component.state('listSystem')).toEqual([
      'model.source',
      'model.ground',
      'model.circuit',
      'model.circuit.n1',
      'model.circuit.n2',
      'model.circuit.R1',
      'model.circuit.R2',
      'model.circuit.R3'
    ]);
    expect(component.state('dictSystemVariable')).toEqual({
      'model.circuit': ['inwards.n1_V', 'inwards.n2_V', 'I_in.I', 'Vg.V'],
      'model.circuit.R1': [
        'inwards.R',
        'V_in.V',
        'V_out.V',
        'outwards.deltaV',
        'I.I'
      ],
      'model.circuit.R2': [
        'inwards.R',
        'V_in.V',
        'V_out.V',
        'outwards.deltaV',
        'I.I'
      ],
      'model.circuit.R3': [
        'inwards.R',
        'V_in.V',
        'V_out.V',
        'outwards.deltaV',
        'I.I'
      ],
      'model.circuit.n1': [
        'inwards.n_in',
        'inwards.n_out',
        'inwards.V',
        'I_in0.I',
        'I_out0.I',
        'I_out1.I',
        'outwards.sum_I_in',
        'outwards.sum_I_out'
      ],
      'model.circuit.n2': [
        'inwards.n_in',
        'inwards.n_out',
        'inwards.V',
        'I_in0.I',
        'I_out0.I',
        'outwards.sum_I_in',
        'outwards.sum_I_out'
      ],
      'model.ground': ['inwards.V', 'V_out.V'],
      'model.source': ['inwards.I', 'I_out.I']
    });
    expect(component.state('dictSystemVariableLength')).toEqual({
      'model.circuit': {
        'I_in.I': ['All'],
        'Vg.V': ['All'],
        'inwards.n1_V': ['All'],
        'inwards.n2_V': ['All']
      },
      'model.circuit.R1': {
        'I.I': ['All'],
        'V_in.V': ['All'],
        'V_out.V': ['All'],
        'inwards.R': ['All'],
        'outwards.deltaV': ['All']
      },
      'model.circuit.R2': {
        'I.I': ['All'],
        'V_in.V': ['All'],
        'V_out.V': ['All'],
        'inwards.R': ['All'],
        'outwards.deltaV': ['All']
      },
      'model.circuit.R3': {
        'I.I': ['All'],
        'V_in.V': ['All'],
        'V_out.V': ['All'],
        'inwards.R': ['All'],
        'outwards.deltaV': ['All']
      },
      'model.circuit.n1': {
        'I_in0.I': ['All'],
        'I_out0.I': ['All'],
        'I_out1.I': ['All'],
        'inwards.V': ['All'],
        'inwards.n_in': ['All'],
        'inwards.n_out': ['All'],
        'outwards.sum_I_in': ['All'],
        'outwards.sum_I_out': ['All']
      },
      'model.circuit.n2': {
        'I_in0.I': ['All'],
        'I_out0.I': ['All'],
        'inwards.V': ['All'],
        'inwards.n_in': ['All'],
        'inwards.n_out': ['All'],
        'outwards.sum_I_in': ['All'],
        'outwards.sum_I_out': ['All']
      },
      'model.ground': { 'V_out.V': ['All'], 'inwards.V': ['All'] },
      'model.source': { 'I_out.I': ['All'], 'inwards.I': ['All'] }
    });
    expect(component.state('listRecorder')).toEqual(['model.design']);
    expect(component.state('dictRecorderVariable')).toEqual({
      'model.design': [
        'circuit.R1.R',
        'circuit.R2.R',
        'circuit.n1.V',
        'circuit.n2.V',
        'ground.V',
        'source.I'
      ]
    });
    expect(component.state('dictRecorderVariableLength')).toEqual({
      'model.design': {
        'circuit.R1.R': ['All'],
        'circuit.R2.R': ['All'],
        'circuit.n1.V': ['All'],
        'circuit.n2.V': ['All'],
        'ground.V': ['All'],
        'source.I': ['All']
      }
    });
    expect(component.state('dictRecorderRef')).toEqual({
      'model.design': ['All', 'pt1', 'pt2']
    });
    expect(component.state('listDriverWithTrace')).toEqual(['model.design']);
    expect(component.state('dictDriverVariable')).toEqual({
      'model.design': ['Residue']
    });
  });
  it('Should open setting dialog', () => {
    const component = wrapper.find(PureChartElement);
    const instance = component.instance() as PureChartElement;
    instance.openSetting();
    expect(component.state('openSetting')).toEqual(true);
    expect(component.state('dialogType')).toEqual('new');
  });
  it('Should close setting dialog', () => {
    const component = wrapper.find(PureChartElement);
    const instance = component.instance() as PureChartElement;
    instance.closeDialog();
    expect(component.state('openSetting')).toEqual(false);
  });
  it('Should open layout setting dialog', () => {
    const component = wrapper.find(PureChartElement);
    const instance = component.instance() as PureChartElement;
    instance.openLayoutSetting();
    expect(component.state('layoutSettingDialog')).toEqual(true);
  });
  it('Should update store after changing data source to Variables', () => {
    const component = wrapper.find(PureChartElement);
    const instance = component.instance() as PureChartElement;
    instance.handleDatasourceChange({ target: { value: 'Variables' } });
    expect(component.state('dataSource')).toEqual('Variables');
    expect(component.state('listSelector')).toEqual([
      'model.source',
      'model.ground',
      'model.circuit',
      'model.circuit.n1',
      'model.circuit.n2',
      'model.circuit.R1',
      'model.circuit.R2',
      'model.circuit.R3'
    ]);
    expect(component.state('dictSelector')).toEqual({
      'model.circuit': ['inwards.n1_V', 'inwards.n2_V', 'I_in.I', 'Vg.V'],
      'model.circuit.R1': [
        'inwards.R',
        'V_in.V',
        'V_out.V',
        'outwards.deltaV',
        'I.I'
      ],
      'model.circuit.R2': [
        'inwards.R',
        'V_in.V',
        'V_out.V',
        'outwards.deltaV',
        'I.I'
      ],
      'model.circuit.R3': [
        'inwards.R',
        'V_in.V',
        'V_out.V',
        'outwards.deltaV',
        'I.I'
      ],
      'model.circuit.n1': [
        'inwards.n_in',
        'inwards.n_out',
        'inwards.V',
        'I_in0.I',
        'I_out0.I',
        'I_out1.I',
        'outwards.sum_I_in',
        'outwards.sum_I_out'
      ],
      'model.circuit.n2': [
        'inwards.n_in',
        'inwards.n_out',
        'inwards.V',
        'I_in0.I',
        'I_out0.I',
        'outwards.sum_I_in',
        'outwards.sum_I_out'
      ],
      'model.ground': ['inwards.V', 'V_out.V'],
      'model.source': ['inwards.I', 'I_out.I']
    });
    expect(component.state('systemNameX')).toEqual('model.source');
    expect(component.state('xData')).toEqual('inwards.I');
    expect(component.state('xDataIndex')).toEqual('All');
  });
  it('Should update store after changing data source to Recorders', () => {
    const component = wrapper.find(PureChartElement);
    const instance = component.instance() as PureChartElement;
    instance.handleDatasourceChange({ target: { value: 'Recorders' } });
    expect(component.state('dataSource')).toEqual('Recorders');
    expect(component.state('listSelector')).toEqual(['model.design']);
    expect(component.state('dictSelector')).toEqual({
      'model.design': [
        'circuit.R1.R',
        'circuit.R2.R',
        'circuit.n1.V',
        'circuit.n2.V',
        'ground.V',
        'source.I'
      ]
    });
    expect(component.state('systemNameX')).toEqual('model.design');
    expect(component.state('xData')).toEqual('circuit.R1.R');
    expect(component.state('xDataIndex')).toEqual('All');
  });
});
