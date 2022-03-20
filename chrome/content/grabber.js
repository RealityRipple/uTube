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
   let defU = uTube.hostedURL();
   if (defU)
   {
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
   }
   else
   {
    if (aURI.asciiSpec.slice(0, 39) === 'https://www.youtube-nocookie.com/embed/')
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
   if (result.hasOwnProperty('feature') && result.feature === 'emb_imp_woyt')
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
   let a = uTube.useAutoplay();
   if (aURI.filePath === '/watch')
   {
    if (!result.hasOwnProperty('v'))
     return;
    if (aRequest)
     aRequest.cancel(Components.results.NS_BINDING_ABORTED);
    let u = false;
    if (!defU)
    {
     if (result.hasOwnProperty('list'))
     {
      u = 'https://www.youtube-nocookie.com/embed/' + result.v + '?list=' + result.list;
      if (a)
       u += '&autoplay=1';
     }
     else
     {
      u = 'https://www.youtube-nocookie.com/embed/' + result.v;
      if (a)
       u += '?autoplay=1';
     }
    }
    else
    {
     if (result.hasOwnProperty('list'))
      u = defU + '#' + result.v + '$' + result.list;
     else
      u = defU + '#' + result.v;
     if (a)
      u += '!';
    }
    if (!u)
     return;
    aProgress.DOMWindow.location.replace(u);
    return;
   }
   if (aURI.filePath === '/playlist')
   {
    if (!result.hasOwnProperty('list'))
     return;
    if (aRequest)
     aRequest.cancel(Components.results.NS_BINDING_ABORTED);
    let pu = false;
    if (!defU)
    {
     pu = 'https://www.youtube-nocookie.com/embed/videoseries?list=' + result.list;
     if (a)
      pu += '&autoplay=1';
    }
    else
    {
     pu = defU + '#' + result.list;
     if (a)
      pu += '!';
    }
    if (!pu)
     return;
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
      this.location.replace('https://www.youtube.com/playlist?list=' + h + '&feature=emb_imp_woyt');
     else
      this.location.replace('https://www.youtube.com/watch?v=' + h + '&feature=emb_imp_woyt');
    }
    else
    {
     let v = h.slice(0, h.indexOf('$'));
     let p = h.slice(h.indexOf('$') + 1);
     this.location.replace('https://www.youtube.com/watch?v=' + v + '&list=' + p + '&feature=emb_imp_woyt');
    }
   }
   else if (this.location.pathname.slice(0, 7) === '/embed/')
   {
    let v = this.location.pathname.slice(7);
    let result = {};
    if (this.location.search)
    {
     this.location.search.slice(1).split('&').forEach(
      function(part)
      {
       let item = part.split('=');
       result[item[0]] = decodeURIComponent(item[1]);
      }
     );
    }
    let p = null;
    if (result.hasOwnProperty('list'))
     p = result.list;
    if (v === 'videoseries')
     this.location.replace('https://www.youtube.com/playlist?list=' + p + '&feature=emb_imp_woyt');
    else if (p === null)
     this.location.replace('https://www.youtube.com/watch?v=' + v + '&feature=emb_imp_woyt');
    else
     this.location.replace('https://www.youtube.com/watch?v=' + v + '&list=' + p + '&feature=emb_imp_woyt');
   }
   return;
  }
  if (mp.classList.contains('playing-mode'))
  {
   this.clearInterval(this.uTubeErrorChecker);
   return;
  }
 },
 hostedURL: function()
 {
  let prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);
  if (prefs.prefHasUserValue('extensions.utube.hosted') && prefs.getBoolPref('extensions.utube.hosted') === false)
   return false;
  if (prefs.prefHasUserValue('extensions.utube.hostedURL'))
   return prefs.getCharPref('extensions.utube.hostedURL');
  return 'https://realityripple.com/Software/XUL/uTube/play.htm';
 },
 useAutoplay: function()
 {
  let prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);
  if (!prefs.prefHasUserValue('extensions.utube.autoplay'))
   return false;
  return prefs.getBoolPref('extensions.utube.autoplay');
 }
};
window.addEventListener('load', uTube.LoadListener, false);
