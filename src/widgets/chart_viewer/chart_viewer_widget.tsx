// Copyright (c) CoSApp Team
import { BaseWidgetModel, BaseWidgetView } from '../base/base_widget';
// import '../../../style/sys_exp.css';
import ChartElement from './chart_element/chartelement';

export class ChartWidgetModel extends BaseWidgetModel {
  model_name = 'ChartWidgetModel';
  view_name = 'ChartWidgetView';
}

export class ChartWidgetView extends BaseWidgetView {
  initialize(parameters: any): void {
    super.initialize(parameters);
    this._initialize(ChartWidgetView);
  }

  /**
   * Render this view
   */
  render() {
    super.render();
    this._render(ChartWidgetView, ChartElement);
  }
}
