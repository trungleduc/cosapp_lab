// Copyright (c) CoSApp Team
import * as React from 'react';
import { VBoxView } from '@jupyter-widgets/controls';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import '../../style/sys_exp.css';
import { createInitialStore, getEnhancers } from '../widgets/base/base_widget';
import { initialState, rootReducer } from '../widgets/redux/reducers';
import { StateInterface } from '../widgets/redux/types';
import SysExplorerElement from '../widgets/sysexplorer/sysexplorer_element/sysexplorer_element';

export class SysExplorerAppView extends VBoxView {
  class_name = 'cosapp-chart-viewer';

  initialize(parameters: any): void {
    super.initialize(parameters);
  }

  getStore(): StateInterface {
    const store = { ...initialState };
    const graphData = this.model.get('system_data');

    const newStore: StateInterface = createInitialStore(store, graphData);

    const savedStore = this.model.get('initial_store');

    for (const key in savedStore) {
      if (key in newStore) {
        newStore[key] = savedStore[key];
      }
    }
    newStore.systemConfig['enableEdit'] = false;
    return newStore;
  }

  setupReact(model: any, send_msg: any): JSX.Element {
    const store = createStore(rootReducer, this.getStore(), getEnhancers());
    return (
      <Provider store={store}>
        <SysExplorerElement send_msg={send_msg} model={model} />
      </Provider>
    );
  }

  /**
   * Render this view
   */

  render() {
    const comp = this.setupReact(this.model, this.send.bind(this));
    const root = createRoot(document.getElementById('main'));
    root.render(comp);
  }
}
