// Copyright (c) CoSApp Team
import { BaseWidgetModel, BaseWidgetView } from '../base/base_widget';
import SysExplorerElement from './sysexplorer_element/sysexplorer_element';

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
