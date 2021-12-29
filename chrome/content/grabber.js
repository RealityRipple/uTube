var muTube = {
 LoadListener: function()
 {
  window.removeEventListener('load', muTube.LoadListener, false);
  gBrowser.addTabsProgressListener(muTube.ProgressListener, Components.interfaces.nsIWebProgress.NOTIFY_PROGRESS);
  Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch).addObserver('extensions.xpiState', muTube.PrefObserver, false);
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
 },
 PrefObserver:
 {
  observe: function(aSubject, aTopic, aData)
  {
   try
   {
    let prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);
    let states = JSON.parse(prefs.getCharPref(aData));
    if (states['app-profile'] !== undefined)
    {
     if (states['app-profile']['{35FF1267-2C7D-5FA8-876D-4EDFC0CB89FB}'] !== undefined)
     {
      if (states['app-profile']['{35FF1267-2C7D-5FA8-876D-4EDFC0CB89FB}'].e === false)
       muTube.RemoveMobileCookie();
     }
    }
    if (states['app-global'] !== undefined)
    {
     if (states['app-global']['{35FF1267-2C7D-5FA8-876D-4EDFC0CB89FB}'] !== undefined)
     {
      if (states['app-global']['{35FF1267-2C7D-5FA8-876D-4EDFC0CB89FB}'].e === false)
       muTube.RemoveMobileCookie();
     }
    }
   }
   catch (ex) {}
  }
 },
 RemoveMobileCookie: function()
 {
  let cMgr = Components.classes['@mozilla.org/cookiemanager;1'].getService(Components.interfaces.nsICookieManager2);
  let cookies = cMgr.getCookiesFromHost('.youtube.com', {});
  while (cookies.hasMoreElements())
  {
   let c = cookies.getNext();
   c.QueryInterface(Components.interfaces.nsICookie2);
   if (c.name !== 'PREF')
    continue;
   let p = new URLSearchParams(c.value);
   if (!p.has('app'))
    continue;
   if (p.get('app') !== 'm')
    continue;
   p.delete('app');
   let v = p.toString();
   if (v === '')
    cMgr.remove(c.host, c.name, c.path, false, c.originAttributes);
   else
    cMgr.add(c.host, c.path, c.name, v, c.isSecure, c.isHttpOnly, c.isSession, c.expiry, c.originAttributes);
  }
 }
};
window.addEventListener('load', muTube.LoadListener, false);
