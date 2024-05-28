import { Provider } from 'react-redux';
import { initialState } from '../../redux/reducers';
import React from 'react';
import { configure, mount } from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';
import ParameterController from '../controller_element/param_controller';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
configure({ adapter: new Adapter() });

const mockStore = configureMockStore([thunk]);

describe('Test <ParameterController/>', () => {
  let wrapper: any;
  beforeEach(() => {
    initialState.dashboardState.portMetaData = {
      sys: {
        port: {
          variable: { desc: null, limits: null, valid_range: null, unit: null }
        }
      }
    };
    const store = mockStore({
      ...initialState
    });
    const varName = 'sys.port.variable';
    wrapper = mount(
      <Provider store={store}>
        <ParameterController variableName={varName} key={varName} value={0} />
      </Provider>
    );
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('Should render correctly component', () => {
    const component = wrapper.find(ParameterController);
    expect(component).toHaveLength(1);
  });

  it('Should match snapshot', () => {
    const component = wrapper.find(ParameterController);
    expect(component.html()).toMatchSnapshot();
  });
});
