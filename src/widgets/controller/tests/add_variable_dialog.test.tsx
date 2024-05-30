import Button from '@material-ui/core/Button';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { ReactWrapper, configure, mount } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { mockState } from '../../../utils/tests/store_mock';
import AddVariableDialog from '../controller_element/add_variable_dialog';

configure({ adapter: new Adapter() });

const mockStore = configureMockStore([thunk]);

describe('Test <AddVariableDialog/>', () => {
  let wrapper: ReactWrapper;
  let btnHandle;

  beforeEach(() => {
    const store = mockStore({
      ...mockState
    });
    btnHandle = jest.fn(() => {});
    wrapper = mount(
      <Provider store={store}>
        <AddVariableDialog open={true} closeHandle={btnHandle} />
      </Provider>
    );
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('Should render correctly component', () => {
    const component = wrapper.find(AddVariableDialog);
    expect(component).toHaveLength(1);
  });

  it('Should render correctly variable list', () => {
    const component = wrapper.find(AddVariableDialog).childAt(0).childAt(0);
    const dropList = component.find(Autocomplete).at(0);
    expect(dropList.prop('options')).toHaveLength(38);
    expect(dropList.prop('options')[0]).toEqual('model.source.inwards.I');
  });

  it('Should close dialog when close button clicked', () => {
    const component = wrapper.find(AddVariableDialog).childAt(0).childAt(0);
    const closeButton = component.find(Button).at(0);
    expect(closeButton.text()).toEqual('close');
    closeButton.simulate('click');
    expect(btnHandle).toBeCalled();
  });
});
