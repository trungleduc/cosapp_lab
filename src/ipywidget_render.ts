// Copyright (c) CoSApp Team
import { VBoxModel, VBoxView } from '@jupyter-widgets/controls';
import { UUID } from '@lumino/coreutils';
import { Widget } from '@lumino/widgets';

import '../style/sidecar.css';
import { MODULE_NAME, MODULE_VERSION } from './version';

export class IpyWidgetRenderModel extends VBoxModel {
  /**
   * Default properties
   */
  defaults() {
    return {
      ...super.defaults(),
      _model_name: IpyWidgetRenderModel.model_name,
      _model_module: IpyWidgetRenderModel.model_module,
      _model_module_version: IpyWidgetRenderModel.model_module_version,
      _view_name: IpyWidgetRenderModel.view_name,
      _view_module: IpyWidgetRenderModel.view_module,
      _view_module_version: IpyWidgetRenderModel.view_module_version,
      title: ''
    };
  }

  /**
   * Public constructor
   */
  initialize(
    attributes: any,
    options: {
      model_id: string;
      comm?: any;
      widget_manager: any;
    }
  ) {
    super.initialize(attributes, options);
    this.widget_manager.create_view(this, {});
  }

  static model_name = 'IpyWidgetRenderModel';
  static model_module = MODULE_NAME;
  static model_module_version = MODULE_VERSION;
  static view_name = 'IpyWidgetRenderView';
  static view_module = MODULE_NAME;
  static view_module_version = MODULE_VERSION;
}

export class IpyWidgetRenderView extends VBoxView {
  class_name = 'cosapp-ipywidget-render';

  initialize(parameters: any): void {
    super.initialize(parameters);
  }

  render() {
    super.render();
    const w = this.pWidget;
    const title = this.model.get('title');
    w.id = UUID.uuid4();
    const el = document.getElementById(title);
    if (el) {
      el.innerHTML = '';
      Widget.attach(w, el);
    }
  }
}
