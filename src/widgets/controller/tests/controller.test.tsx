import { Provider } from 'react-redux';
import { initialState } from '../../redux/reducers';
import React from 'react';
import { configure, mount, ReactWrapper } from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';
import Controller from '../controller_element/controller';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import Fab from '@material-ui/core/Fab';
import { MockModel } from '../../../utils/tests/utils';
configure({ adapter: new Adapter() });

const mockStore = configureMockStore([thunk]);

describe('Test <Controller/>', () => {
  let wrapper: ReactWrapper;
  const send_msg = jest.fn(({
    action: string,
    payload: any,
  })=> {})
  beforeEach(() => {
    const store = mockStore({
      ...initialState,
    });
    
    wrapper = mount(
      <Provider store={store}>
        <Controller model={new MockModel() as any} send_msg={send_msg} />
      </Provider>
    );
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('Should render correctly component', () => {
    const component = wrapper.find(Controller);
    expect(component).toHaveLength(1);
  });

  it('Should open add controller dialog when add button clicked', () => {
    const component = wrapper.find(Controller).childAt(0).childAt(0);
    const addButton = component.find(Fab).at(0);
    expect(component.state('addVariableDialog')).toEqual(false);
    addButton.simulate('click');
    expect(component.state('addVariableDialog')).toEqual(true);
  });

  it('Should call run function when run button clicked', () => {
    const component = wrapper.find(Controller).childAt(0).childAt(0) as any;
    const runButton = component.find(Fab).at(1);
    runButton.simulate('click');
    expect(send_msg).toBeCalled();
  });
});
