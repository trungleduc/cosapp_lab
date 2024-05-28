// Copyright (c) CoSApp Team
import { BaseWidgetModel, BaseWidgetView } from '../base/base_widget';
import GeometryElement from './geometry_element/geometry_element';

export class GeometryWidgetModel extends BaseWidgetModel {
  model_name = 'GeometryWidgetModel';
  view_name = 'GeometryWidgetView';
}

export class GeometryWidgetView extends BaseWidgetView {
  initialize(parameters: any): void {
    super.initialize(parameters);
    this._initialize(GeometryWidgetView);
  }

  render() {
    super.render();
    this._render(GeometryWidgetView, GeometryElement);
  }
}
