var uTube = {
 LoadListener: function()
 {
  window.removeEventListener('load', uTube.LoadListener, false);
  gBrowser.addTabsProgressListener(uTube.ProgressListener, Components.interfaces.nsIWebProgress.NOTIFY_PROGRESS);
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
    let defU = uTube.hostedURL();
    let u = false;
    if (!defU)
    {
     if (result.hasOwnProperty('list'))
      u = 'https://www.youtube-nocookie.com/embed/' + result.v + '?list=' + result.list;
     else
      u = 'https://www.youtube-nocookie.com/embed/' + result.v;
    }
    else
    {
     if (result.hasOwnProperty('list'))
      u = defU + '#' + result.v + '$' + result.list;
     else
      u = defU + '#' + result.v;
    }
    if (!u)
     return;
    aProgress.DOMWindow.location.href = u;
    return;
   }
   if (aURI.filePath === '/playlist')
   {
    if (!result.hasOwnProperty('list'))
     return;
    if (aRequest)
     aRequest.cancel(Components.results.NS_BINDING_ABORTED);
    let defU = uTube.hostedURL();
    if (!defU)
     aProgress.DOMWindow.location.href = 'https://www.youtube-nocookie.com/embed/videoseries?list=' + result.list;
    else
     aProgress.DOMWindow.location.href = defU + '#' + result.list;
    return;
   }
  },
  onStateChange: function() {},
  onProgressChange: function() {},
  onStatusChange: function() {},
  onSecurityChange: function() {},
  onLinkIconAvailable: function() {}
 },
 hostedURL: function()
 {
  let prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);
  if (prefs.prefHasUserValue('extensions.utube.hosted') && prefs.getBoolPref('extensions.utube.hosted') === false)
   return false;
  if (prefs.prefHasUserValue('extensions.utube.hostedURL'))
   return prefs.getCharPref('extensions.utube.hostedURL');
  return 'https://realityripple.com/Software/Mozilla-Extensions/uTube/play.htm';
 }
};
window.addEventListener('load', uTube.LoadListener, false);
