
var reqwest = require('reqwest');
var crel = require('crel');

// Set configuration variables
var config = {
    requestTarget: 'https://s3.amazonaws.com/api.talkingbibles.org/v1'
};

var addClass = function (el, klass) {
    if (el.classList)
        el.classList.add(klass);
    else
        el.className += ' ' + klass;
};

var addEvent = function (el, eventType, handler) {
    if (el.addEventListener) { // DOM Level 2 browsers
        el.addEventListener(eventType, handler, false);
    } else if (el.attachEvent) { // IE <= 8
        el.attachEvent('on' + eventType, handler);
    } else { // ancient browsers
        el['on' + eventType] = handler;
    }
};

var removeEvent = function (e, callee) {
    if (e.target.removeEventListener) { // DOM Level 2 browsers
        e.target.removeEventListener(e.type, callee);
    } else if (e.target.detachEvent) { // IE <= 8
        e.target.detachEvent(e.type, callee);
    } else { // ancient browsers
        e.target.splice(e.target.indexOf(e.type), 1);
    }
};

var getTracker = function () {
    if (typeof ga !== 'undefined') {
        return function (category, action, label, value) {
            console.log('Tracked event');
            ga('send', 'event', category, action, label, {'nonInteraction': 1});
        }
    } else if (typeof _gaq !== 'undefined') {
        return function (category, action, label, value) {
            console.log('Tracked event');
            _gaq.push(['_trackEvent', category, action, label]);
        }
    } else {
        return function () {
            console.log('Did not track event');                
        };
    }
}

var createPlayer = function (holder, location, data) {
    var cIndex = Number(location[2]) - 1;

    if (!data.title || !(data.chapters instanceof Array)) {
        return failGracefully(holder, 'The requested book could not be found.');
    }

    if (!data.chapters[cIndex] || !(data.chapters[cIndex].mp3 || data.chapters[cIndex].ogg) || !data.chapters[cIndex].title) {
        return failGracefully(holder, 'The requested chapter could not be found.');
    }

    var reference;
    var chapterNumber = data.chapters[cIndex].title.match(/\d+/);
    if (chapterNumber) {
        reference = data.title + ' ' + chapterNumber[0];
    } else {
        reference = data.title + ' – ' + data.chapters[cIndex].title;
    }

    crel(holder,
        crel('div', {class: 'tbplayer-inner'},
            crel('style', '.tbplayer-inner { display: inline-block !important; } .tbplayer-info, .tbplayer-attribution { display: block !important; margin: 4px auto !important; font-family: "HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif !important; color: #090909 !important; } .tbplayer-info { font-size: 16px !important; font-weight: 600 !important; } .tbplayer-controls { max-width: 100% !important; width: 100% !important; margin: 8px 10px 4px auto !important; } .tbplayer-attribution { text-align: right; font-size: 12px !important; font-weight: 300 !important; font-style: italic !important; } .tbplayer-attribution a { display: inline !important; } .tbplayer-attribution a:link, .tbplayer-attribution a:visited, .tbplayer-attribution a:hover, .tbplayer-attribution a:active { text-decoration: none !important; border-bottom: 1px solid #666 !important; color: #666 !important; }'),
            crel('p', {class: 'tbplayer-info'},
                crel('span', {class: 'tbplayer-info__language'}, data.language.englishName),
                crel('span', {class: 'tbplayer-info__divider'}, ' – '),
                crel('span', {class: 'tbplayer-info__reference'}, reference)
            ),
            audioElement = crel('audio', {class: 'tbplayer-controls', controls: 'controls', preload: 'metadata'},
                crel('span', {class: 'tbplayer-no_support'}, 'Your browser does not support playing audio files.'),
                crel('source', {src: data.chapters[cIndex].mp3, type: 'audio/mp3'}),
                crel('source', {src: data.chapters[cIndex].ogg, type: 'audio/ogg'})
            ),
            crel('p', {class: 'tbplayer-attribution'},
                crel('a', {href: 'http://listen.talkingbibles.org/language/' + location[0] + '/' + location[1] + '/'}, 'Continue listening at Talking Bibles')
            )
        )
    );

    var playEvent = function (e) {
        var track = getTracker();
        removeEvent(e, arguments.callee);
        track('Embedded Audio Scripture', 'Play', location.join(':'));
    };

    var endEvent = function (e) {
        var track = getTracker();
        removeEvent(e, arguments.callee);
        track('Embedded Audio Scripture', 'End', location.join(':'));
    };

    var errorEvent = function (e) {
        var track = getTracker();
        console.log(e);
        track('Embedded Audio Scripture', 'Playback Error', location.join(':'));
    }

    addEvent(audioElement, 'play', playEvent);
    addEvent(audioElement, 'ended', endEvent);
    addEvent(audioElement, 'error', errorEvent);
    
    addClass(holder, 'tbplayer-success');
};

var failGracefully = function(holder, message) {
    holder.setAttribute('data-error', message);

    addClass(holder, 'tbplayer-error');

    if (typeof _gaq !== 'undefined') {
    }
};

var player = function () {
    var a = document.createElement('audio');
    if (!!(a.canPlayType && (a.canPlayType('audio/mpeg') || a.canPlayType('audio/ogg')))) {
        var holders = document.querySelectorAll('.tbplayer');

        Array.prototype.forEach.call(holders, function (holder, i) {
            var holder = holders[i];
            var location = holder.getAttribute('data-location').split(':');

            if (!(location instanceof Array) || !location[1] || !location[2]) {
                return failGracefully(holder, 'The audio player is not configured.');
            }

            reqwest({
                url: config.requestTarget + '/languages/' + location[0] + '/books/' + location[1] + '.json',
                crossOrigin: true
            })
                .then(function (data) {
                    if (data.status && data.status === 'fail') {
                        return failGracefully(holder, 'The requested language could not be found.');
                    }

                    createPlayer(holder, location, data);
                }, function (error, msg) {
                    return failGracefully(holder, 'The language server responded with an error.');
                });
        });
    } else {
        return;
    }
};

module.exports = player;