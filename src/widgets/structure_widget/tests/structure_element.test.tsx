import { createShallow } from '@material-ui/core/test-utils';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { ShallowWrapper, configure, shallow } from 'enzyme';
import { ReactWrapper, mount } from 'enzyme';
import React from 'react';

import { MockModel } from '../../../utils/tests/utils';
import { StructureElement } from '../structure_element/structure_element';

const MOCK_DATA = {
  type: 'StructureView::structureData',
  payload: {
    title: 'main',
    nodes: [
      {
        label: 'main',
        title: 'main - Main',
        id: 5,
        level: 0,
        hidden: true,
        physics: false,
        group: '.main'
      },
      {
        label: 'NonLinearSolver',
        title: 'solver - NonLinearSolver',
        id: 1,
        level: 0.30000000000000004,
        shape: 'box',
        hidden: true,
        physics: false,
        group: 'main'
      },
      {
        label: 'RunSingleCase',
        title: 'runner - RunSingleCase',
        id: 2,
        level: 0.5,
        shape: 'box',
        hidden: true,
        physics: false,
        group: 'main'
      },
      {
        label: 'geo',
        title: 'main.geo - BeamGeo',
        id: 3,
        group: 'main',
        level: 1
      },
      {
        label: 'meca',
        title: 'main.meca - BeamMeca',
        id: 4,
        group: 'main',
        level: 1
      }
    ],
    edges: [
      {
        from: 1,
        to: 2,
        title: '',
        hidden: true,
        physics: false,
        id: '5db93a07-3564-4953-80ef-31ea1dc7712d'
      },
      {
        from: 3,
        to: 4,
        arrows: 'to',
        title: "['I', 'grid']",
        id: '025de6b0-7fdb-46e9-98b8-bd473e7672f0'
      },
      {
        from: 5,
        to: 3,
        hidden: true,
        physics: false,
        id: '2720b799-273a-4d2a-975e-f40d1cfa05fe'
      },
      {
        from: 5,
        to: 4,
        hidden: true,
        physics: false,
        id: '26bed3e8-848b-43a8-ac80-09175b6a35ec'
      },
      {
        from: 5,
        to: 1,
        dashes: true,
        hidden: true,
        physics: false,
        id: 'cb6e6117-f16d-49d5-85a3-f74d216b3a88'
      }
    ],
    groups: ['main']
  }
};

configure({ adapter: new Adapter() });

describe('Test <StructureElement/>', () => {
  let shallow_: typeof shallow;
  let wrapper: ReactWrapper;

  beforeAll(() => {
    shallow_ = createShallow();
  });

  beforeEach(() => {
    wrapper = mount(
      <StructureElement
        model={new MockModel()}
        send_msg={jest.fn()}
        classes={null}
        initialState={null}
      />
    );
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('Should render correctly component', () => {
    const component = wrapper.find(StructureElement);
    expect(component).toHaveLength(1);
  });
});
