// Copyright (c) CoSApp Team
import { BaseWidgetModel, BaseWidgetView } from '../base/base_widget';
import DataViewer from './data_element/data_viewer';

// import '../../../style/sys_exp.css';

export class DataWidgetModel extends BaseWidgetModel {
  model_name = 'DataWidgetModel';
  view_name = 'DataWidgetView';
}

export class DataWidgetView extends BaseWidgetView {
  initialize(parameters: any): void {
    super.initialize(parameters);
    this._initialize(DataWidgetView);
  }

  /**
   * Render this view
   */
  render() {
    super.render();
    this._render(DataWidgetView, DataViewer);
  }
}
