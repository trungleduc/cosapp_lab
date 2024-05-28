import {
  Kernel,
  KernelManager,
  KernelMessage,
  ServerConnection
} from '@jupyterlab/services';

import { IDict } from './../widgets/redux/types';
import CoSAppGetUrl from './cosapp_url';
import { WidgetManager } from './manager';

export * as base from '@jupyter-widgets/base';
export * as controls from '@jupyter-widgets/controls';

class CosappMain {
  private _baseUrl: string;
  private _wsUrl: string;
  private _cosappModule: string;
  private _kernel: Kernel.IKernelConnection;
  private _kernelManager: KernelManager;
  private _widgetManager: WidgetManager;
  private _kernelModel: Kernel.IModel;
  private _statusElement: HTMLElement;
  constructor(baseUrl: string, wsUrl: string, cosappModule: string) {
    this._baseUrl = baseUrl;
    this._wsUrl = wsUrl;
    this._cosappModule = cosappModule;
    this._statusElement = document.getElementById('cosapp_loading_status');
    this._kernelModel = {
      name: window.sessionStorage.getItem('adso_kernel_name'),
      id: window.sessionStorage.getItem('adso_kernel_id')
    };
  }

  async getCode(module: string): Promise<{ code: string; title: string }> {
    const url = `${this._baseUrl}cosapp/code`;
    const setting = ServerConnection.makeSettings();
    const dataToSend = { module };
    const init = {
      body: JSON.stringify(dataToSend),
      method: 'POST'
    };
    let response: Response;
    try {
      response = await ServerConnection.makeRequest(url, init, setting);
    } catch (error) {
      console.log('error', error);

      return;
    }
    const data = await response.json();
    return data;
  }
  async checkKernelAlive(id: string): Promise<boolean> {
    const url = `${this._baseUrl}api/kernels/${id}`;

    const setting = ServerConnection.makeSettings();
    const init = {};

    let response: Response;
    try {
      response = await ServerConnection.makeRequest(url, init, setting);
    } catch (error) {
      return false;
    }

    const data = await response.json();

    if (
      'message' in data &&
      (data['message'] as string).includes('Kernel does not exist')
    ) {
      return false;
    } else {
      return true;
    }
  }
  async connectKernel() {
    const connectionInfo = ServerConnection.makeSettings({
      baseUrl: this._baseUrl,
      wsUrl: this._wsUrl
    });

    this._kernelManager = new KernelManager({
      serverSettings: connectionInfo
    });
    let kernelStatus = false;
    if (this._kernelModel.id && this._kernelModel.name) {
      this._statusElement.innerText = 'Checking existing kernel';
      kernelStatus = await this.checkKernelAlive(this._kernelModel.id);
    }

    if (kernelStatus) {
      this._statusElement.innerText = 'Connecting to existing kernel';
      this._kernel = await this._kernelManager.connectTo({
        model: this._kernelModel
      });
    } else {
      this._statusElement.innerText = 'Starting new kernel';
      let configData: IDict<string> = {};
      const el = document.getElementById('cosapp-lab-config-data');
      if (el) {
        configData = JSON.parse(el.textContent || '{}');
      }
      const kernelConfig = {};
      if ('kernel' in configData && configData.kernel) {
        kernelConfig['name'] = configData.kernel;
      }
      this._kernel = await this._kernelManager.startNew(kernelConfig);

      window.sessionStorage.setItem(
        'adso_kernel_name',
        this._kernel.model.name
      );
      window.sessionStorage.setItem('adso_kernel_id', this._kernel.model.id);
    }
    this._kernel.connectionStatusChanged.connect((signal, status) => {
      const status_indicator_on = document.getElementById(
        'app_kernel_status_on'
      ) as HTMLImageElement;
      const status_indicator_off = document.getElementById(
        'app_kernel_status_off'
      ) as HTMLImageElement;
      if (status === 'disconnected') {
        status_indicator_on.style.display = 'none';
        status_indicator_off.style.display = '';
      } else if (status === 'connected') {
        status_indicator_on.style.display = '';
        status_indicator_off.style.display = 'none';
      }
    });
    this._statusElement.innerText = 'Getting bootstrap code';
    const remoteData = await this.getCode(this._cosappModule);

    const { title, code } = remoteData;
    const topBar = document.getElementById('app_title');
    if (topBar) {
      topBar.innerText = title.replace(/(\r\n|\n|\r)/gm, '');
    }

    this._widgetManager = new WidgetManager(this._kernel);
    this._statusElement.innerText = 'Executing bootstrap code';
    const execution = this._kernel.requestExecute({ code });

    execution.onIOPub = async msg => {
      console.log('msg', msg.content);
      if (
        KernelMessage.isStreamMsg(msg) ||
        KernelMessage.isExecuteInputMsg(msg)
      ) {
        console.log('result', msg.content);
      }
      if (KernelMessage.isDisplayDataMsg(msg)) {
        const widgetData: any =
          msg.content.data['application/vnd.jupyter.widget-view+json'];
        this._statusElement.innerText = 'Done, starting interface';
        if (widgetData !== undefined && widgetData.version_major === 2) {
          const model = this._widgetManager.get_model(widgetData.model_id);
          if (model !== undefined) {
            model.then(model => {
              this._widgetManager.create_view(model).then(view => {
                this._widgetManager.display_view(view, {});
              });
            });
          }
        }
      } else if (KernelMessage.isErrorMsg(msg)) {
        let errorText = msg.content.ename + '\n';
        errorText += msg.content.evalue + '\n';
        console.log('error', msg.content);
        this._statusElement.style.width = '90%';
        this._statusElement.style.color = 'red';
        this._statusElement.innerText = errorText;
      }
    };
  }

  async shutdownKernel() {
    // terminate kernel process
    // this._kernel.shutdown();
    console.log('do nothing');
  }
}

function main() {
  const { BASEURL, COSAPP_MODULE } = CoSAppGetUrl();
  console.log('BASEURL', BASEURL, 'COSAPP_MODULE', COSAPP_MODULE);

  let WSURL;
  if (BASEURL.startsWith('https://')) {
    WSURL = BASEURL.replace('https://', 'wss://');
  } else {
    WSURL = BASEURL.replace('http://', 'ws://');
  }

  const app = new CosappMain(BASEURL, WSURL, COSAPP_MODULE);
  window.addEventListener('beforeunload', e => {
    app.shutdownKernel();
  });

  if (document.readyState === 'complete') {
    app.connectKernel();
  } else {
    app.connectKernel();
  }
}

main();
