// Copyright (c) CoSApp Team

import PBSElement from './pbs_element/pbs_element';
import {
  BaseWidgetView,
  BaseWidgetModel,
} from '../base/base_widget';

export class PbsWidgetModel extends BaseWidgetModel {
  model_name = 'PbsWidgetModel';
  view_name = 'PbsWidgetView';
}

export class PbsWidgetView extends BaseWidgetView {
  initialize(parameters: any): void {
    super.initialize(parameters);
    this._initialize(PbsWidgetView)
  }

  render() {
    super.render();
    this._render(PbsWidgetView, PBSElement)
  }
}
