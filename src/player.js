(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root.player = factory();
    }
}(this, function () {
    var jsonp = require('./jsonp');
    var crel = require('crel');

    // Set configuration variables
    var config = {
        requestTarget: 'http://listen.talkingbibles.org/api/v1'
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

        crel(holder,
            crel('style', '.tbplayer-info, .tbplayer-attribution { font-family: "HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif; } .tbplayer-info { margin-bottom: 4px; font-size: 16px; font-weight: 500; } .tbplayer-attribution { margin-top: 4px; font-size: 12px; font-weight: 300; font-style: italic; }'),
            crel('p', {class: 'tbplayer-info'},
                crel('span', {class: 'tbplayer-info__book'}, data.title),
                crel('span', {class: 'tbplayer-info__divider'}, ' - '),
                crel('span', {class: 'tbplayer-info__chapter'}, data.chapters[cIndex].title)
            ),
            crel('audio', {class: 'tbplayer-controls', controls: 'controls', preload: 'metadata', src: data.chapters[cIndex].href}),
            crel('p', {class: 'tbplayer-attribution'},
                crel('a', {href: 'http://listen.talkingbibles.org/'}, 'Recording courtesy of Talking Bibles International')
            )
        );

        addClass(holder, 'tbplayer-success');
    };

    var failGracefully = function(holder, message) {
        holder.setAttribute('data-error', message);

        addClass(holder, 'tbplayer-error');
    };

    var player = function () {
        var holders = document.querySelectorAll('.tbplayer');

        Array.prototype.forEach.call(holders, function (holder, i) {
            var holder = holders[i];
            var location = holder.getAttribute('data-location').split(':');

            if (!(location instanceof Array) || !location[1] || !location[2]) {
                return failGracefully(holder, 'The audio player is not configured.');
            }

            var requestURL = config.requestTarget + '/languages/' + location[0] + '/books/' + location[1] + '.json';

            jsonp({
                url: requestURL,
                success: function(data) {
                    console.log('data', data);
                    if (data.status && data.status === 'fail') {
                        return failGracefully(holder, 'The requested language could not be found.');
                    }

                    createPlayer(holder, location, data);
                },
                error: function () {
                    return failGracefully(holder, 'The language server responded with an error.');
                }
            });
        });
    };

    return player;
}));