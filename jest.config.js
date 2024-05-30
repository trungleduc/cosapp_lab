const jestJupyterLab = require('@jupyterlab/testutils/lib/jest-config');
const esModules = [
  '@codemirror',
  '@microsoft',
  '@jupyter/react-components',
  '@jupyter/web-components',
  '@jupyter/ydoc',
  '@jupyterlab/',
  'exenv-es6',
  'lib0',
  'nanoid',
  'vscode-ws-jsonrpc',
  'y-protocols',
  'y-websocket',
  'yjs',
  'react-dnd',
  'ml-matrix',
  'ml-array-rescale',
  '@antv/*',
  'dnd-core',
  'react-dnd-html5-backend',
  'three',
  '@jupyter-widgets'
].join('|');
const baseConfig = jestJupyterLab(__dirname);
module.exports = {
  ...baseConfig,
  transformIgnorePatterns: [`/node_modules/(?!${esModules}).+`],
  // transformIgnorePatterns: [
  //   "node_modules/(?!(react-dnd|ml-matrix|ml-array-rescale|@antv/*|dnd-core|react-dnd-html5-backend|three|@jupyterlab|@jupyter-widgets|@jupyterlab/.*)/)"
  // ],
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^react-dnd-html5-backend$': 'react-dnd-html5-backend/dist/cjs',
    '^react-dnd-touch-backend$': 'react-dnd-touch-backend/dist/cjs',
    '^react-dnd-test-backend$': 'react-dnd-test-backend/dist/cjs',
    '^react-dnd-test-utils$': 'react-dnd-test-utils/dist/cjs',
    '^react-dnd$': 'react-dnd/dist/ReactDnD.js',
    '^insert-css$': '<rootDir>/src/utils/tests/func_mock.js',
    '^OrbitControls$': 'three/examples/jsm/controls/OrbitControls.js',
    '\\.(css|less|sass|scss)$': '<rootDir>/src/utils/tests/style_mock.js',
    '\\.(gif|ttf|eot|svg)$': '<rootDir>/src/utils/tests/file_mock.js'
  },
  verbose: true,
  coverageReporters: ['text'],
  testRegex: '/tests/.*.test.ts[x]?$'
};
