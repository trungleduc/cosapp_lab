// Copyright (c) CoSApp Team

import SysExplorerElement from './sysexplorer_element/sysexplorer_element';
import {
  BaseWidgetView,
  BaseWidgetModel,
  WidgetWrapper
} from '../base/base_widget';
import { UUID } from '@lumino/coreutils';
export class SysExplorerModel extends BaseWidgetModel {
  model_name = 'SysExplorerModel';
  view_name = 'SysExplorerView';
}
import * as React from 'react';
import { Panel } from '@lumino/widgets';

export class SysExplorerView extends BaseWidgetView {
  initialize(parameters: any): void {
    super.initialize(parameters);
    this._initialize(SysExplorerView);
  }

  render() {
    super.render();
    if (SysExplorerView.shell) {
      const w = new Panel();
      console.log('wwww', w)
      const content = new WidgetWrapper(
        this.store,
        (
          <SysExplorerElement
            send_msg={this.send.bind(this)}
            model={this.model}
          />
        )
      );

      w.addWidget(content);
      w.addClass(this.class_name);
      w.addClass('cosapp-geometry-viewer');
      console.log('www', w);
      w.title.label = this.model.get('title');
      w.title.closable = true;

      SysExplorerView.shell['_rightHandler'].sideBar.tabCloseRequested.connect(
        (sender: any, tab: any) => {
          tab.title.owner.dispose();
        }
      );
      w.id = UUID.uuid4();
      const anchor = this.model.get('anchor');
      console.log('model', this.model.get('system_data'));
      if (anchor === 'right') {
        console.log('SysExplorerView.shell', SysExplorerView.shell);
        SysExplorerView.shell.add(w, 'right');
        SysExplorerView.shell.expandRight();
      } else {
        console.log(
          'SysExplorerView.shell main',
          SysExplorerView.shell,
          w,
          anchor
        );
        SysExplorerView.shell.add(w, 'main', { mode: anchor });
      }
    }
  }
}
