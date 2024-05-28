// Copyright (c) CoSApp Team
import { IJupyterWidgetRegistry } from '@jupyter-widgets/base';
import {
  ILabShell,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { INotebookTracker } from '@jupyterlab/notebook';

import * as widgetExports from './plugin';
import { MODULE_NAME, MODULE_VERSION } from './version';
import { BaseWidgetView } from './widgets/base/base_widget';

const EXTENSION_ID = 'cosapp_lab:plugin';

/**
 * The sidecar plugin.
 */
const sidecarPlugin: JupyterFrontEndPlugin<void> = {
  id: EXTENSION_ID,
  requires: [IJupyterWidgetRegistry, ILabShell],
  optional: [INotebookTracker],
  activate: activateWidgetExtension,
  autoStart: true
};

export default sidecarPlugin;

/**
 * Activate the widget extension.
 */
function activateWidgetExtension(
  app: JupyterFrontEnd,
  registry: IJupyterWidgetRegistry,
  shell: ILabShell,
  tracker: INotebookTracker
): void {
  for (const Class of Object.values(widgetExports)) {
    if (Class.prototype instanceof BaseWidgetView) {
      Class.shell = shell;
      Class.tracker = tracker;
    }
  }

  registry.registerWidget({
    name: MODULE_NAME,
    version: MODULE_VERSION,
    exports: widgetExports as any
  });
}
