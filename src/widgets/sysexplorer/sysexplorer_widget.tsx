// Copyright (c) CoSApp Team

import SysExplorerElement from './sysexplorer_element/sysexplorer_element';
import { BaseWidgetView, BaseWidgetModel } from '../base/base_widget';

export class SysExplorerModel extends BaseWidgetModel {
  model_name = 'SysExplorerModel';
  view_name = 'SysExplorerView';
}

export class SysExplorerView extends BaseWidgetView {
  initialize(parameters: any): void {
    super.initialize(parameters);
    this._initialize(SysExplorerView);
  }

  render() {
    super.render();
    this._render(SysExplorerView, SysExplorerElement);
  }
}
