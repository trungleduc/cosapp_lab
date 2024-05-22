// import Plotly from 'plotly.js/dist/plotly.min.js'
import Plotly from 'plotly.js/lib/core';
import createPlotlyComponent from 'react-plotly.js/factory';

Plotly.register([
  require('plotly.js/lib/scatter3d'),
  require('plotly.js/lib/mesh3d'),
  require('plotly.js/lib/bar'),
  require('plotly.js/lib/carpet'),
  require('plotly.js/lib/contourcarpet'),
  require('plotly.js/lib/mesh3d')
]);

const Plot = createPlotlyComponent(Plotly);
export default Plot;
