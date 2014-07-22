(function (window) {
  "use strict";

  // Set configuration variables
  var config = {
    requestTarget: 'http://listen.talkingbibles.org/api/v1',
    showFailures: true
  };

  var domReady = function () {

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

  var createPlayer = function (holder, location, data) {
    var cIndex = Number(location[2]);

    if (!data.chapters || !data.chapters[cIndex] || !data.chapters[cIndex].href) {
        failGracefully(holder, 'The requested chapter could not be found.');
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

  var failGracefully = function(holder, message) {
    var errorElement = document.createElement('span');

    if (errorElement.classList)
      errorElement.classList.add('tbplayer-error');
    else
      errorElement.className += ' ' + 'tbplayer-error';

    errorElement.textContent = message;
    holder.appendChild(errorElement);
  };

  // Do the heavy lifting
  var createAll = function () {
    // Iterate through chapter array creating audio players for each
    var holders = document.querySelectorAll('.tbplayer');

    Array.prototype.forEach.call(holders, function (holder, i) {
      var holder = holders[i];
      var location = holder.getAttribute('data-location').split(':');

      if (!(location instanceof Array) || !location[1] || !location[2]) {
          failGracefully(holder, 'The audio player is not configured correctly.');
          return;
      }

      var requestURL = config.requestTarget + '/languages/' + location[0] + '/books/' + location[1] + '.json';
      
      var request = new XMLHttpRequest();
      request.open('GET', requestURL, true);

      request.onload = function() {
        if (request.status >= 200 && request.status < 400){
          // Success!
          createPlayer(holder, location, JSON.parse(request.responseText));
        } else {
          // We reached our target server, but it returned an error
          failGracefully(holder, 'The requested language could not be found.');
        }
      };

      request.onerror = function() {
        // There was a connection error of some sort
        failGracefully(holder, 'The language server is not responding.');
      };

      request.send();
    });
};

  // Create the players once the document is ready
  domReady(createAll());
})(window);
