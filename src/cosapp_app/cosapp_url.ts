export default function CoSAppGetUrl(): {
  BASEURL: string;
  COSAPP_MODULE: string;
} {
  const urlList = window.location.href.split('?')[0].split('/module/');
  let BASEURL = urlList[0];
  let COSAPP_MODULE = null;
  if (urlList.length > 1) {
    COSAPP_MODULE = urlList[1].replace('/', '');
  }
  if (!BASEURL.endsWith('/')) {
    BASEURL = BASEURL + '/';
  }
  return { BASEURL, COSAPP_MODULE };
}
