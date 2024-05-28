// Copyright (c) CoSApp Team
import * as React from 'react';
import { BoxModel, VBoxView } from '@jupyter-widgets/controls';
import { ILabShell } from '@jupyterlab/application';
import { ReactWidget } from '@jupyterlab/apputils';
import { INotebookTracker } from '@jupyterlab/notebook';
import { Kernel } from '@jupyterlab/services';
import { UUID } from '@lumino/coreutils';
import { Message } from '@lumino/messaging';
import { Panel } from '@lumino/widgets';
import { Provider } from 'react-redux';
import { applyMiddleware, compose } from 'redux';
import { createStore } from 'redux';
import thunk from 'redux-thunk';

import '../../../style/sys_exp.css';
import { MODULE_NAME, MODULE_VERSION } from '../../version';
import { rootReducer } from '../redux/reducers';
import { initialState } from '../redux/reducers';
import { StateInterface } from '../redux/types';
import ElementWrapper from './element_wrapper';

export const getEnhancers = () => {
  let enhancers = applyMiddleware(thunk) as any;
  if (
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
    process.env.NODE_ENV === 'development'
  ) {
    enhancers = compose(
      enhancers,
      (window as any).__REDUX_DEVTOOLS_EXTENSION__()
    );
  }
  return enhancers;
};
export class BaseWidgetModel extends BoxModel {
  model_name: string = '';
  view_name: string = '';
  defaults() {
    return {
      ...super.defaults(),
      _model_name: this.model_name,
      _model_module: BaseWidgetModel.model_module,
      _model_module_version: BaseWidgetModel.model_module_version,
      _view_name: this.view_name,
      _view_module: BaseWidgetModel.view_module,
      _view_module_version: BaseWidgetModel.view_module_version,
      title: '',
      anchor: 'widget',
      system_data: { key: 'None' },
      geo_data: {},
      computed_data: {},
      recorder_data: {},
      driver_data: {},
      progress_geo_update: {},
      update_signal: 0,
      notification_msg: { update: 0, msg: '', log: '' },
      initial_store: {},
      chart_template: {}
    };
  }

  initialize(
    attributes: any,
    options: {
      model_id: string;
      comm?: any;
      widget_manager: any;
    }
  ) {
    super.initialize(attributes, options);
  }

  static model_module = MODULE_NAME;
  static model_module_version = MODULE_VERSION;
  static view_module = MODULE_NAME;
  static view_module_version = MODULE_VERSION;
}

export class WidgetWrapper extends ReactWidget {
  _store: any;
  _component: any;
  constructor(store: any, Component: any) {
    super();
    this._store = store;
    this._component = Component;
  }

  onResize = (msg: any) => {
    window.dispatchEvent(new Event('resize'));
  };

  onAfterAttach(msg: Message): void {
    super.onAfterAttach(msg);
    window.dispatchEvent(new Event('resize'));
  }
  render() {
    return <Provider store={this._store}>{this._component}</Provider>;
  }
}

export const createInitialStore = (
  store: StateInterface,
  graphData: any
): StateInterface => {
  const { recorderData, driverData } = graphData;
  return {
    ...store,
    systemArch: {
      ...store.systemArch,
      systemGraph: graphData.systemGraph,
      systemTree: {
        ...store.systemArch.systemTree,
        nodeData: graphData.systemTree
      },
      systemPBS: graphData.systemPBS
    },
    dashboardState: {
      ...store.dashboardState,
      variableData: graphData.variableData,
      portMetaData: graphData.portMetaData,
      computedResult: graphData.computedResult,
      recorderData,
      driverData
    }
  };
};

export class BaseWidgetView extends VBoxView {
  /**
   * Notebook tracker to link lifecycle of the view with the related notebook
   */
  static tracker: INotebookTracker;
  /**
   * Application shell to use for inserting the sidecar panel
   */
  static shell: ILabShell;

  getStore(): StateInterface {
    const store = { ...initialState };
    const graphData = this.model.get('system_data');

    const newStore: StateInterface = createInitialStore(store, graphData);

    const savedStore = this.model.get('initial_store');

    for (const key in savedStore) {
      if (key in savedStore && key in newStore) {
        newStore[key as keyof StateInterface] = savedStore[key];
      }
    }
    return newStore;
  }

  store = createStore(rootReducer, this.getStore(), getEnhancers());

  /**
   * Handle dispose of the parent
   */
  protected _handleKernelStatusChanged(
    sender: any,
    status: Kernel.Status
  ): void {
    if (status === 'restarting' || status === 'dead') {
      sender.statusChanged.disconnect(this._handleKernelStatusChanged, this);
      this.remove();
    }
  }

  protected _initialize(Class: any) {
    const nb = Class.tracker.currentWidget;
    if (nb) {
      const session = nb.sessionContext.session;
      if (session) {
        session.statusChanged.connect(this._handleKernelStatusChanged, this);
      }
    }
  }

  protected _render(WidgetClass: any, ElementClass: any) {
    const anchor = this.model.get('anchor');
    console.log('anchor', anchor);

    const content = new WidgetWrapper(
      this.store,
      (
        <ElementWrapper
          send_msg={this.send.bind(this)}
          model={this.model}
          CompClass={ElementClass}
        />
      )
    );

    const w = anchor === 'widget' ? this.luminoWidget : new Panel();
    w.addWidget(content);
    w.addClass('cosapp-base-viewer');
    w.id = UUID.uuid4();
    w.title.label = this.model.get('title');
    w.title.closable = true;

    if (anchor === 'widget') {
      w.addClass('cosapp-widget-viewer');
    } else if (WidgetClass.shell) {
      WidgetClass.shell['_rightHandler'].sideBar.tabCloseRequested.connect(
        (sender: any, tab: any) => {
          tab.title.owner.dispose();
        }
      );

      if (anchor === 'right') {
        WidgetClass.shell.add(w, 'right');
        WidgetClass.shell.expandRight();
      } else {
        WidgetClass.shell.add(w, 'main', { mode: anchor });
      }
    }
  }
}
