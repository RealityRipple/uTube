var muTube = {
 LoadListener: function()
 {
  window.removeEventListener('load', muTube.LoadListener, false);
  gBrowser.addTabsProgressListener(muTube.ProgressListener, Components.interfaces.nsIWebProgress.NOTIFY_PROGRESS);
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
  onLocationChange: function(aBrowser, aProgress, aRequest, aURI, aFlags) {
   if (aURI.asciiHost !== 'www.youtube.com')
    return;
   let u = aURI.scheme + '://m.youtube.com' + aURI.filePath;
   u+= '?persist_app=1&app=m';
   if (aURI.query.length > 0)
   {
    if (aURI.query.indexOf('app=m') > -1)
     return;
    u+= '&' + aURI.query;
   }
   if (aURI.ref.length > 0)
    u+= '#' + aURI.ref;
   if (aRequest)
    aRequest.cancel(Components.results.NS_BINDING_ABORTED);
   aProgress.DOMWindow.location.replace(u);
  },
  onStateChange: function() {},
  onProgressChange: function() {},
  onStatusChange: function() {},
  onSecurityChange: function() {},
  onLinkIconAvailable: function() {}
 }
};
window.addEventListener('load', muTube.LoadListener, false);
