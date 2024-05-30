import { createShallow } from '@material-ui/core/test-utils';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { ShallowWrapper, configure, shallow } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { mockState } from '../../../utils/tests/store_mock';
import { MockModel } from '../../../utils/tests/utils';
import Plot3DView from '../geometry_element/3dview';
import { Plot3DView as Plot3DViewStock } from '../geometry_element/3dview';
import { geoData } from './geodata';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore([thunk]);

describe('Test <Plot3DView/>', () => {
  let shallow_: typeof shallow;
  let wrapper: ShallowWrapper;

  beforeAll(() => {
    shallow_ = createShallow();
  });

  beforeEach(() => {
    const store = mockStore({
      ...mockState
    });

    wrapper = shallow_(
      <Provider store={store}>
        <Plot3DView
          model={new MockModel() as any}
          send_msg={jest.fn()}
          displayStatus={true}
          threeData={{}}
          updateSignal={0}
        />
      </Provider>
    );
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('Should render correctly component', () => {
    const component = wrapper.find(Plot3DView);
    expect(component).toHaveLength(1);
  });

  it('Test dataProcessing method with shape data', () => {
    {
      const expected = 24.049999237;
      const { facesGroup, newRefLength } = Plot3DViewStock.dataProcessing(
        '0',
        geoData
      );
      expect(Math.abs(newRefLength - expected)).toBeLessThan(1e-6);
      expect(facesGroup.children).toHaveLength(9);
    }
  });

  it('Test dataProcessing method with misc. data', () => {
    {
      const key = 'misc_0';
      const data = {
        points: [
          {
            position: [2, 2, 3],
            radius: 0.2
          }
        ],
        vectors: [
          {
            position: [0, 0, 0],
            direction: [1, 0, 0],
            color: 16542976
          }
        ]
      };
      const { facesGroup, newRefLength } = Plot3DViewStock.dataProcessing(
        key,
        data
      );
      expect(newRefLength).toEqual(1.5);
      expect(facesGroup.children).toHaveLength(2);
      expect(facesGroup.children[0].position).toEqual({ x: 2, y: 2, z: 3 });
      expect(facesGroup.children[1].position).toEqual({ x: 0, y: 0, z: 0 });
      expect(facesGroup.children[1].quaternion.x).toEqual(0);
      expect(facesGroup.children[1].quaternion.y).toEqual(0);
      expect(facesGroup.children[1].quaternion.z).toEqual(-0.7071067811865475);
      expect(facesGroup.children[1].quaternion.w).toEqual(0.7071067811865476);
    }
  });
});
