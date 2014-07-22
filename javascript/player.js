(function (window) {
  "use strict";

 // Create a namespace so that we're not polluting window
  var TBPlayer = window.TBPlayer || {};

  // Set configuration variables
  TBPlayer.config = {
    requestTarget: 'http://listen.talkingbibles.org/api/v1',
    showFailures: true
  };

  TBPlayer.domReady = function () {

    var fns = [], listener
    , doc = document
    , domContentLoaded = 'DOMContentLoaded'
    , loaded = /^loaded|^i|^c/.test(doc.readyState)

    if (!loaded)
      doc.addEventListener(domContentLoaded, listener = function () {
        doc.removeEventListener(domContentLoaded, listener)
        loaded = 1
        while (listener = fns.shift()) listener()
      })

    return function (fn) {
      loaded ? fn() : fns.push(fn)
    }

  };

  TBPlayer.createPlayer = function (holder, location, data) {
    var cIndex = Number(location[2]);

    if (!data.chapters || !data.chapters[cIndex] || !data.chapters[cIndex].href) {
        console.log('data error');
        console.log(holder);
        TBPlayer.failGracefully(holder, 'The requested chapter could not be found.');
    }

    var audioElement = document.createElement('audio');

    if (audioElement.classList)
      audioElement.classList.add('tbplayer-controls');
    else
      audioElement.className += ' ' + 'tbplayer-controls';

    audioElement.setAttribute('controls', 'controls');
    audioElement.setAttribute('preload', 'metadata');
    audioElement.setAttribute('src', data.chapters[cIndex].href);

    holder.appendChild(audioElement);
  };

  TBPlayer.failGracefully = function(holder, message) {
    var errorElement = document.createElement('span');

    if (errorElement.classList)
      errorElement.classList.add('tbplayer-error');
    else
      errorElement.className += ' ' + 'tbplayer-error';

    errorElement.textContent = message;
    holder.appendChild(errorElement);
  };

  // Do the heavy lifting
  TBPlayer.createAll = function () {
    // Iterate through chapter array creating audio players for each
    var holders = document.querySelectorAll('.tbplayer');

    Array.prototype.forEach.call(holders, function (holder, i) {
      var holder = holders[i];
      var location = holder.getAttribute('data-location').split(':');

      if (!(location instanceof Array) || !location[1] || !location[2]) {
          TBPlayer.failGracefully(holder, 'The audio player is not configured correctly.');
          return;
      }

      var requestURL = TBPlayer.config.requestTarget + '/languages/' + location[0] + '/books/' + location[1] + '.json';
      
      var request = new XMLHttpRequest();
      request.open('GET', requestURL, true);

      request.onload = function() {
        if (request.status >= 200 && request.status < 400){
          // Success!
          TBPlayer.createPlayer(holder, location, JSON.parse(request.responseText));
        } else {
          // We reached our target server, but it returned an error
          TBPlayer.failGracefully(holder, 'The requested language could not be found.');
        }
      };

      request.onerror = function() {
        // There was a connection error of some sort
        TBPlayer.failGracefully(holder, 'The language server is not responding.');
      };

      request.send();
    });
};

  // Create the players once the document is ready
  TBPlayer.domReady(TBPlayer.createAll());
})(window);
