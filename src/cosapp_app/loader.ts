/**
 * Helper to load widget module from CDN, the content of this file is heavily inspired
 * from https://github.com/jupyter-widgets/ipywidgets/blob/master/packages/html-manager/src/libembed-amd.ts
 */

const cdn = 'https://cdn.jsdelivr.net/npm/';
declare const window;

/**
 *  Convert module name to CDN url, taken directly from jupyter-widgets/ipywidgets
 *
 * @param {string} moduleName
 * @param {string} moduleVersion
 * @returns {string}
 */
function moduleNameToCDNUrl(moduleName: string, moduleVersion: string): string
{
  const version = moduleVersion.replace('^','')
  let packageName = moduleName;
  let fileName = 'index'; // default filename
  // if a '/' is present, like 'foo/bar', packageName is changed to 'foo', and path to 'bar'
  // We first find the first '/'
  let index = moduleName.indexOf('/');
  if (index !== -1 && moduleName[0] == '@') {
    // if we have a namespace, it's a different story
    // @foo/bar/baz should translate to @foo/bar and baz
    // so we find the 2nd '/'
    index = moduleName.indexOf('/', index + 1);
  }
  if (index !== -1) {
    fileName = moduleName.substr(index + 1);
    packageName = moduleName.substr(0, index);
  }
  return `${cdn}${packageName}@${version}/dist/${fileName}`;
}

/**
 *
 *
 * @export
 * @param {string} moduleName
 * @param {string} moduleVersion
 * @returns {Promise<any>}
 */
export function remoteLoader(
  moduleName: string,
  moduleVersion: string
): Promise<any> {
  const require = window.requirejs;
  const conf = {
    paths: { [moduleName]: moduleNameToCDNUrl(moduleName, moduleVersion) },
  };
  require.config(conf);
  return new Promise((resolve, reject) => {
    require([moduleName], resolve, reject);
  });
}
