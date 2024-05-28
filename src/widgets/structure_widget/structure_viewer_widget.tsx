// Copyright (c) CoSApp Team
import { BaseWidgetModel, BaseWidgetView } from '../base/base_widget';
import StructureElement from './structure_element/structure_element';

export class StructureWidgetModel extends BaseWidgetModel {
  model_name = 'StructureWidgetModel';
  view_name = 'StructureWidgetView';
}

export class StructureWidgetView extends BaseWidgetView {
  initialize(parameters: any): void {
    super.initialize(parameters);
    this._initialize(StructureWidgetView);
  }

  render() {
    super.render();
    this._render(StructureWidgetView, StructureElement);
  }
}
