var uTube = {
 LoadListener: function()
 {
  window.removeEventListener('load', uTube.LoadListener, false);
  gBrowser.addTabsProgressListener(uTube.ProgressListener, Components.interfaces.nsIWebProgress.NOTIFY_PROGRESS);
  /*
  let observerService = Components.classes['@mozilla.org/observer-service;1'].getService(Components.interfaces.nsIObserverService);
  observerService.addObserver(zzbigz_grabber.ResponseObserver, 'http-on-examine-response', false);
  zzbigz_network.session = null;
  let cookieManager = Components.classes['@mozilla.org/cookiemanager;1'].getService(Components.interfaces.nsICookieManager2);
  let eCookies = cookieManager.getCookiesFromHost('zbigz.com', {});
  while (eCookies.hasMoreElements())
  {
   let cookie = eCookies.getNext().QueryInterface(Components.interfaces.nsICookie2); 
   if(cookie.name !== 'session')
    continue;
   zzbigz_network.session = cookie.value;
  }
  */
 },
 ProgressListener:
 {
  QueryInterface: function(aIID)
  {
   if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
       aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
       aIID.equals(Components.interfaces.nsISupports))
    return this;
   throw Components.results.NS_NOINTERFACE;
  },
  onLocationChange: async function(aBrowser, aProgress, aRequest, aURI, aFlags) {
   if (aURI.asciiHost !== 'www.youtube.com')
    return;
   let result = {};
   aURI.query.split('&').forEach(
    function(part)
    {
     let item = part.split('=');
     result[item[0]] = decodeURIComponent(item[1]);
    }
   );
   if (aURI.filePath === '/watch')
   {
    if (!result.hasOwnProperty('v'))
     return;
    if (aRequest)
     aRequest.cancel(Components.results.NS_BINDING_ABORTED);
    if (result.hasOwnProperty('list'))
     aProgress.DOMWindow.location.href = 'https://realityripple.com/Software/Mozilla-Extensions/uTube/play.html#' + result.v + '$' + result.list;
    else
     aProgress.DOMWindow.location.href = 'https://realityripple.com/Software/Mozilla-Extensions/uTube/play.html#' + result.v;
    return;
   }
   if (aURI.filePath === '/playlist')
   {
    if (!result.hasOwnProperty('list'))
     return;
    if (aRequest)
     aRequest.cancel(Components.results.NS_BINDING_ABORTED);
    aProgress.DOMWindow.location.href = 'https://realityripple.com/Software/Mozilla-Extensions/uTube/play.html#' + result.list;
    return;
   }
  },
  onStateChange: function() {},
  onProgressChange: function() {},
  onStatusChange: function() {},
  onSecurityChange: function() {},
  onLinkIconAvailable: function() {}
 }
};
window.addEventListener('load', uTube.LoadListener, false);
