// Create a namespace so that we're not polluting window
var TBAudioPlayer = window.TBAudioPlayer || {};

// Prepare Audio.js to help us with making <audio> tags cross-compatible
audiojs.events.ready(function() { TBAudioPlayer.audioJs = audiojs.createAll(); });

// Shim hasOwnProperty because I like overkill
TBAudioPlayer.hop = function (obj, prop) {
  if (typeof obj == 'undefined' || typeof prop == 'undefined' || typeof obj[prop] == 'undefined') {
    return false;
  } else {
    return obj[prop] !== obj.constructor.prototype[prop];
  }
};

// Do the heavy lifting
TBAudioPlayer.makeNoise = function () {
  var t = TBAudioPlayer,
      players = t.players || [];

  // Iterate through chapter array creating audio players for each
  $.each(players, function( i, player ) {
    // Skip the chapter if configuration is incomplete
    if (!t.hop(player, 'id') || !t.hop(player, 'language') || !t.hop(player, 'book') || !t.hop(player, 'chapter')) return;

    // Fetch the chapter information and create an audio file
    $.ajax({
      url: '/data/' + player.language + '/' + player.book + '.json',
      beforeSend: function( xhr ) {
        xhr.overrideMimeType( 'application/json; charset=utf-8' );
      }
    })
      .done( function( data ) {
        $(player.id).replaceWith(
          $('<audio></audio>').attr({
            class: 'audio-player',
            controls: 'controls',
            preload: 'metadata',
            src: data.book.chapters[player.chapter - 1].href
          })
        );
      })
      .fail( function() {
        console.log('Failed to load audio chapter information.');
      });
  });

};

$(TBAudioPlayer.makeNoise());
