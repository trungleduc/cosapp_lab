// Copyright (c) CoSApp Team
import { BaseWidgetModel, BaseWidgetView } from '../base/base_widget';
import PBSElement from './pbs_element/pbs_element';

export class PbsWidgetModel extends BaseWidgetModel {
  model_name = 'PbsWidgetModel';
  view_name = 'PbsWidgetView';
}

export class PbsWidgetView extends BaseWidgetView {
  initialize(parameters: any): void {
    super.initialize(parameters);
    this._initialize(PbsWidgetView);
  }

  render() {
    super.render();
    this._render(PbsWidgetView, PBSElement);
  }
}
