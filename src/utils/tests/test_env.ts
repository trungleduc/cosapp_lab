import * as jQuery from 'jquery';
declare let window: any;
declare let global: any;
window.$ = window.jQuery = jQuery;
global.$ = global.jQuery = jQuery;
jest.mock('jquery-ui/ui/widgets/slider.js', () => 'jquery-ui/ui/widgets/slider.js')
jest.mock('@jupyterlab/apputils', () => '@jupyterlab/apputils')
import React from 'react' 
React.useLayoutEffect = React.useEffect 