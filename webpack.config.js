var path = require('path');
var webpack = require('webpack');

const externals = [
  'react',
  'react-dom',
  /^@lumino\/.+$/,
  /^@jupyterlab\/.+$/,
  '@jupyter-widgets/base',
  'codemirror'
];

const rules = [
  {
    test: /\.js$/,
    loader: 'source-map-loader',
    exclude: path.resolve(__dirname, 'node_modules')
  },
  { test: /\.css$/, use: ['style-loader', 'css-loader'] },
  { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader' },
  {
    test: /node_modules/,
    loader: 'ify-loader',
    exclude: /flexlayout-react/
  }
];

const labTarget = {
  entry: './buildjs/index.js',
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'index.js',
    libraryTarget: 'amd'
  },
  module: {
    rules: rules
  },
  externals
};

const distRoot = path.resolve(
  __dirname,
  'cosapp_lab',
  'app_static',
  'static',
  'dist'
);

const app_ext = [/^font-awesome\/.+$/];
const appTarget = {
  entry: './buildjs/cosapp_app/cosapp.js',
  mode: 'development',
  output: {
    path: distRoot,
    filename: 'index.js',
    libraryTarget: 'amd'
  },
  module: {
    rules: rules
  },
  // resolve,
  externals: app_ext
};

const libraryTarget = {
  entry: './buildjs/cosapp_app/library.js',
  mode: 'development',
  output: {
    path: distRoot,
    filename: 'library.js',
    libraryTarget: 'amd'
  },
  module: {
    rules: rules
  }
};

module.exports = env => {
  let mode = 'development';
  if (env.MODE === 'prod') {
    labTarget.mode = 'production';
    appTarget.mode = 'production';
    libraryTarget.mode = 'production';
  }
  if (env.TARGET === 'lab') {
    return [labTarget];
  } else if (env.TARGET === 'app') {
    return [appTarget, libraryTarget];
  }
  return [labTarget, appTarget, libraryTarget];
};
