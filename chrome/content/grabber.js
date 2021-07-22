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
   if (aURI.asciiHost !== 'www.youtube.com')
    return;
   if (aURI.ref === 'skipU')
    return;
   let result = {};
   aURI.query.split('&').forEach(
    function(part)
    {
     let item = part.split('=');
     result[item[0]] = decodeURIComponent(item[1]);
    }
   );
   if (result.hasOwnProperty('feature') && result.feature === 'emb_imp_woyt')
   {
    let yU = aProgress.DOMWindow.location.href;
    if (aRequest)
     aRequest.cancel(Components.results.NS_BINDING_ABORTED);
    yU = yU.replace('&feature=emb_imp_woyt', '');
    yU = yU.replace('?feature=emb_imp_woyt', '');
    yU += '#skipU';
    aProgress.DOMWindow.location.href = yU;
    return;
   }
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
 checkForError: function()
 {
  if (this.location.host === 'www.youtube.com')
  {
   if (mp.classList.contains('playing-mode'))
   {
    this.clearInterval(this.uTubeErrorChecker);
    return;
   }
   return;
  }
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
  if (mp.classList.contains('ytp-embed-error'))
  {
   this.clearInterval(this.uTubeErrorChecker);
   if (this.location.hash)
   {
    let h = this.location.hash.slice(1);
    if (h.indexOf('$') === -1)
    {
     if (h.slice(0, 2) === 'PL' && h.length > 12)
      this.location.href = 'https://www.youtube.com/playlist?list=' + h + '#skipU';
     else
      this.location.href = 'https://www.youtube.com/watch?v=' + h + '#skipU';
    }
    else
    {
     let v = h.slice(0, h.indexOf('$'));
     let p = h.slice(h.indexOf('$') + 1);
     this.location.href = 'https://www.youtube.com/watch?v=' + v + '&list=' + p + '#skipU';
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
     this.location.href = 'https://www.youtube.com/playlist?list=' + p + '#skipU';
    else if (p === null)
     this.location.href = 'https://www.youtube.com/watch?v=' + v + '#skipU';
    else
     this.location.href = 'https://www.youtube.com/watch?v=' + v + '&list=' + p + '#skipU';
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
  return 'https://realityripple.com/Software/Mozilla-Extensions/uTube/play.htm';
 }
};
window.addEventListener('load', uTube.LoadListener, false);
