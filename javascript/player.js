// Create a namespace so that we're not polluting window
var TBPlayer = window.TBPlayer || {};

// Verify and process the configuration
TBPlayer.players = $.map( $.makeArray(TBPlayer.players), function ( player, i ) {
  if ( player.hasOwnProperty('id') && player.hasOwnProperty('language') && player.hasOwnProperty('book') && player.hasOwnProperty('chapter') ) {
    return {
      id: player.id,
      reqUrl: '/data/' + player.language + '/' + player.book + '.json',
      chapter: player.chapter - 1
    };
  } else {
    return null;
  }
});

// Expected API return
TBPlayer.defaultData = {
  book: {
    chapters: []
  }
};

TBPlayer.failNicely = function( id ) {
  $(id).replaceWith(
    $('<p class="audio-player-failure">The requested chapter did not load.</p>')
  );
};

// Do the heavy lifting
TBPlayer.createAll = function () {
  var t = TBPlayer,
      players = t.players || [];

  // Iterate through chapter array creating audio players for each
  $.each(players, function( i, player ) {

    // Fetch the chapter information and create an audio file
    $.ajax({
      url: player.reqUrl,
      beforeSend: function( xhr ) {
        xhr.overrideMimeType( 'application/json; charset=utf-8' );
      }
    })
      .done( function( data ) {
        var safeData = $.extend({}, t.defaultData, data || {});
        if (safeData.book.chapters.length > player.chapter) {
          $(player.id).replaceWith(
            $('<audio></audio>').attr({
              class: 'audio-player',
              controls: 'controls',
              preload: 'metadata',
              src: safeData.book.chapters[player.chapter].href
            })
          );
        } else {
          t.failNicely( player.id );
        }
      })
      .fail( function() {
        t.failNicely( player.id );
      });
  });

};

$(function () {
  TBPlayer.audioJs = audiojs.createAll();
  TBPlayer.createAll();
});
