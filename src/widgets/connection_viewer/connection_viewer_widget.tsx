// Copyright (c) CoSApp Team

import GraphPanel from './connection_element/graph_view';
import { BaseWidgetView, BaseWidgetModel } from '../base/base_widget';

export class ConnectionWidgetModel extends BaseWidgetModel {
  model_name = 'ConnectionWidgetModel';
  view_name = 'ConnectionWidgetView';
}

export class ConnectionWidgetView extends BaseWidgetView {
  initialize(parameters: any): void {
    super.initialize(parameters);
    this._initialize(ConnectionWidgetView);
  }

  render() {
    super.render();
    this._render(ConnectionWidgetView, GraphPanel);
  }
}
