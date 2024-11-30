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
  onLocationChange: function(aBrowser, aProgress, aRequest, aURI, aFlags)
  {
   const defU = 'https://utube.realityripple.com/';
   if (aURI.asciiSpec.slice(0, defU.length) === defU)
   {
    if (aProgress.DOMWindow.uTubeErrorChecker)
     aProgress.DOMWindow.clearInterval(aProgress.DOMWindow.uTubeErrorChecker);
    aProgress.DOMWindow.uTubeErrorChecker = aProgress.DOMWindow.setInterval(uTube.checkForError, 500);
   }
   else
   {
    if (aProgress.DOMWindow.uTubeErrorChecker)
     aProgress.DOMWindow.clearInterval(aProgress.DOMWindow.uTubeErrorChecker);
   }
   if (aURI.asciiHost !== 'www.youtube.com' && aURI.asciiHost !== 'm.youtube.com')
   {
    if (aBrowser.hasAttribute('skipV'))
     aBrowser.removeAttribute('skipV');
    if (aBrowser.hasAttribute('skipPL'))
     aBrowser.removeAttribute('skipPL');
    return;
   }
   let result = {};
   aURI.query.split('&').forEach(
    function(part)
    {
     let item = part.split('=');
     result[item[0]] = decodeURIComponent(item[1]);
    }
   );
   if (aURI.ref === 'skipU')
   {
    if (result.hasOwnProperty('list'))
     aBrowser.setAttribute('skipPL', result.list);
    else if (result.hasOwnProperty('v'))
     aBrowser.setAttribute('skipV', result.v);
   }
   if (result.hasOwnProperty('embeds_referring_origin'))
   {
    if (result.hasOwnProperty('list'))
     aBrowser.setAttribute('skipPL', result.list);
    else if (result.hasOwnProperty('v'))
     aBrowser.setAttribute('skipV', result.v);
   }
   if (aBrowser.hasAttribute('skipPL'))
   {
    if (result.hasOwnProperty('list'))
    {
     if (aBrowser.getAttribute('skipPL') === result.list)
      return;
    }
    aBrowser.removeAttribute('skipPL');
   }
   if (aBrowser.hasAttribute('skipV'))
   {
    if (result.hasOwnProperty('v'))
    {
     if (aBrowser.getAttribute('skipV') === result.v)
      return;
    }
    aBrowser.removeAttribute('skipV');
   }
   let time = false;
   if (result.hasOwnProperty('t'))
    time = result.t;
   let a = uTube.useAutoplay();
   let c = uTube.useNoCookie();
   if (aURI.filePath === '/watch')
   {
    if (!result.hasOwnProperty('v'))
     return;
    if (aRequest)
     aRequest.cancel(Components.results.NS_BINDING_ABORTED);
    let u = defU + '#' + result.v;
    if (result.hasOwnProperty('list'))
     u += '$' + result.list;
    if (time)
     u += '~' + time;
    if (a)
     u += '!';
    if (!c)
     u += '@';
    aProgress.DOMWindow.location.replace(u);
    return;
   }
   if (aURI.filePath === '/playlist')
   {
    if (!result.hasOwnProperty('list'))
     return;
    if (aRequest)
     aRequest.cancel(Components.results.NS_BINDING_ABORTED);
    let pu = defU + '#' + result.list;
    if (time)
     pu += '~' + time;
    if (a)
     pu += '!';
    if (!c)
     pu += '@';
    aProgress.DOMWindow.location.replace(pu);
    return;
   }
  },
  onStateChange: function() {},
  onProgressChange: function() {},
  onStatusChange: function() {},
  onSecurityChange: function() {},
  onLinkIconAvailable: function() {}
 },
 checkForError: function()
 {
  let mp = null;
  for (let f = 0; f < this.frames.length; f++)
  {
   if (this.frames[f].document === null)
    continue;
   mp = this.frames[f].document.getElementById('movie_player');
   if (mp !== null)
    break;
  }
  if (mp === null)
   mp = this.document.getElementById('movie_player');
  if (mp === null)
   return;
  if (this.location.host === 'www.youtube.com' || this.location.host === 'm.youtube.com')
  {
   if (mp.classList.contains('playing-mode'))
   {
    this.clearInterval(this.uTubeErrorChecker);
    return;
   }
   return;
  }
  if (mp.classList.contains('ytp-embed-error'))
  {
   this.clearInterval(this.uTubeErrorChecker);
   if (this.location.hash)
   {
    let h = this.location.hash.slice(1);
    if (h.indexOf('$') === -1)
    {
     if (h.slice(0, 2) === 'PL' && h.length > 12)
      this.location.replace('https://www.youtube.com/playlist?list=' + h + '&embeds_referring_origin=');
     else
      this.location.replace('https://www.youtube.com/watch?v=' + h + '&embeds_referring_origin=');
    }
    else
    {
     let v = h.slice(0, h.indexOf('$'));
     let p = h.slice(h.indexOf('$') + 1);
     this.location.replace('https://www.youtube.com/watch?v=' + v + '&list=' + p + '&embeds_referring_origin=');
    }
   }
   return;
  }
  if (mp.classList.contains('playing-mode'))
  {
   this.clearInterval(this.uTubeErrorChecker);
   return;
  }
 },
 useAutoplay: function()
 {
  let prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);
  if (!prefs.prefHasUserValue('extensions.utube.autoplay'))
   return false;
  return prefs.getBoolPref('extensions.utube.autoplay');
 },
 useNoCookie: function()
 {
  let prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);
  if (!prefs.prefHasUserValue('extensions.utube.nocookie'))
   return true;
  return prefs.getBoolPref('extensions.utube.nocookie');
 }
};
window.addEventListener('load', uTube.LoadListener, false);
