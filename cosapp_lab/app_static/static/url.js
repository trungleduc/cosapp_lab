function CoSAppGetUrl() {
  const urlList = window.location.href.split('?')[0].split('/module/');
  let BASEURL = urlList[0];

  let COSAPP_MODULE = null;
  if (urlList.length > 1 && urlList[1].includes('/module/')) {
    COSAPP_MODULE = urlList[1].replace('/module/', '');
  }
  if (!BASEURL.endsWith('/')) {
    BASEURL = BASEURL + '/';
  }
  return { BASEURL, COSAPP_MODULE };
}
