import * as base from '@jupyter-widgets/base';
import { HTMLManager } from '@jupyter-widgets/html-manager';

import { IpyWidgetRenderModel, IpyWidgetRenderView } from '../ipywidget_render';
import { SysExplorerModel } from '../widgets/sysexplorer/sysexplorer_widget';
import { remoteLoader } from './loader';
import { SysExplorerAppView } from './sysexplorer_app';

export class WidgetManager extends HTMLManager {
  kernel;
  constructor(kernel) {
    super();
    this.kernel = kernel;

    kernel.registerCommTarget(this.comm_target_name, async (comm, msg) => {
      const oldComm = new base.shims.services.Comm(comm);
      await this.handle_comm_open(oldComm, msg);
    });
  }

  loadClass(className, moduleName, moduleVersion) {
    if (className === 'SysExplorerModel') {
      return Promise.resolve(SysExplorerModel);
    } else if (className === 'SysExplorerView') {
      return Promise.resolve(SysExplorerAppView);
    } else if (className === 'IpyWidgetRenderModel') {
      return Promise.resolve(IpyWidgetRenderModel);
    } else if (className === 'IpyWidgetRenderView') {
      return Promise.resolve(IpyWidgetRenderView);
    } else if (
      moduleName === '@jupyter-widgets/base' ||
      moduleName === '@jupyter-widgets/controls'
    ) {
      return super.loadClass(className, moduleName, moduleVersion);
    } else {
      return remoteLoader(moduleName, moduleVersion).then(module => {
        if (module[className]) {
          return module[className];
        } else {
          return Promise.reject(
            `Can not import ${moduleName}@${moduleVersion}`
          );
        }
      });
    }
  }

  display_view(view, _) {
    if (view instanceof SysExplorerAppView) {
      return Promise.resolve(view).then(view => {
        this.removeSplash();
        view.on('remove', () => {
          console.log('view removed', view);
        });
        return view;
      });
    } else {
      return Promise.resolve(view).then(view => {
        view.on('remove', () => {
          console.log('view removed', view);
        });
        return view;
      });
    }
  }

  /**
   * Create a comm.
   */
  async _create_comm(target_name, model_id, data, metadata) {
    const comm = this.kernel.createComm(target_name, model_id);
    if (data || metadata) {
      comm.open(data, metadata);
    }
    return Promise.resolve(new base.shims.services.Comm(comm));
  }

  /**
   * Get the currently-registered comms.
   */
  _get_comm_info() {
    return this.kernel
      .requestCommInfo({ target_name: this.comm_target_name })
      .then(reply => reply.content.comms);
  }

  removeSplash = (): void => {
    const topBar = document.getElementById('top_bar');
    const splash = document.getElementById('cosapp_splash_screen');
    topBar.style.visibility = 'visible';
    splash.classList.add('splash-fade');
    splash.addEventListener(
      'transitionend',
      ev => {
        if (ev.type === 'transitionend') {
          splash.style.display = 'none';
        }
      },
      false
    );
  };
}
