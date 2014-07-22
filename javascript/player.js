(function () {
  "use strict";

  // Set configuration variables
  var config = {
    requestTarget: 'http://listen.talkingbibles.org/api/v1'
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

  var addClass = function (el, klass) {
    if (el.classList)
      el.classList.add(klass);
    else
      el.className += ' ' + klass;
  };

  var createPlayer = function (holder, location, data) {
    var cIndex = Number(location[2]);

    if (!data.title || !(data.chapters instanceof Array)) {
      return failGracefully(holder, 'The requested book could not be found.');
    }

    if (!data.chapters[cIndex] || !data.chapters[cIndex].href || !data.chapters[cIndex].title) {
        return failGracefully(holder, 'The requested chapter could not be found.');
    }

    // Audio information
    var bookElement = document.createElement('span');
    bookElement.setAttribute('class', 'tbplayer-info__book');
    bookElement.textContent = data.title;

    var dividerElement = document.createElement('span');
    dividerElement.setAttribute('class', 'tbplayer-info__divider');
    dividerElement.textContent = ' - ';

    var chapterElement = document.createElement('span');
    chapterElement.setAttribute('class', 'tbplayer-info__chapter');
    chapterElement.textContent = data.chapters[cIndex].title;

    var infoElement = document.createElement('p');
    infoElement.setAttribute('class', 'tbplayer-info');

    infoElement.appendChild(bookElement);
    infoElement.appendChild(dividerElement);
    infoElement.appendChild(chapterElement);

    // Audio player
    var audioElement = document.createElement('audio');
    audioElement.setAttribute('class', 'tbplayer-controls');
    audioElement.setAttribute('controls', 'controls');
    audioElement.setAttribute('preload', 'metadata');
    audioElement.setAttribute('src', data.chapters[cIndex].href);

    holder.appendChild(infoElement);
    holder.appendChild(audioElement);

    addClass(holder, 'tbplayer-success');
  };

  var failGracefully = function(holder, message) {
    holder.setAttribute('data-error', message);

    addClass(holder, 'tbplayer-error');
  };

  var createAll = function () {
    var holders = document.querySelectorAll('.tbplayer');

    Array.prototype.forEach.call(holders, function (holder, i) {
      var holder = holders[i];
      var location = holder.getAttribute('data-location').split(':');

      if (!(location instanceof Array) || !location[1] || !location[2]) {
          return failGracefully(holder, 'The audio player is not configured.');
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
          return failGracefully(holder, 'The requested language could not be found.');
        }
      };

      request.onerror = function() {
        // There was a connection error of some sort
        return failGracefully(holder, 'The language server is not responding.');
      };

      request.send();
    });
  };

  // Create the players once the document is ready
  domReady(createAll());
})();
