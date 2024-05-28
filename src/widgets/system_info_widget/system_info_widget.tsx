// Copyright (c) CoSApp Team
import { BaseWidgetModel, BaseWidgetView } from '../base/base_widget';
import SystemInfoElement from './system_info_element/system_info_element';

export class SystemInfoWidgetModel extends BaseWidgetModel {
  model_name = 'SystemInfoWidgetModel';
  view_name = 'SystemInfoWidgetView';
}

export class SystemInfoWidgetView extends BaseWidgetView {
  initialize(parameters: any): void {
    super.initialize(parameters);
    this._initialize(SystemInfoWidgetView);
  }

  render() {
    super.render();
    this._render(SystemInfoWidgetView, SystemInfoElement);
  }
}
