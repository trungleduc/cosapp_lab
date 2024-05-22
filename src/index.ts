import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the cosapp_lab extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'cosapp_lab:plugin',
  description: 'Toolbox for managing and deploying CoSApp powered dashboards.',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension cosapp_lab is activated!');
  }
};

export default plugin;
