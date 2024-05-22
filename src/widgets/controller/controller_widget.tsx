// Copyright (c) CoSApp Team

import Controller from './controller_element/controller';
import { BaseWidgetView, BaseWidgetModel } from '../base/base_widget';

export class ControllerWidgetModel extends BaseWidgetModel {
  model_name = 'ControllerWidgetModel';
  view_name = 'ControllerWidgetView';
}

export class ControllerWidgetView extends BaseWidgetView {
  initialize(parameters: any): void {
    super.initialize(parameters);
    this._initialize(ControllerWidgetView);
  }

  /**
   * Render this view
   */
  render() {
    super.render();
    this._render(ControllerWidgetView, Controller);
  }
}
