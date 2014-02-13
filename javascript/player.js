/*global $, window*/
(function (window) {
  "use strict";

  // Create a namespace so that we're not polluting window
  var TBPlayer = window.TBPlayer || {};

  // Set configuration variables with defaults
  TBPlayer.config = $.extend({}, {
    requestTarget: "http://talkingbibles.net/api/v1"
  }, TBPlayer.config || {});

  // Verify and process the configuration
  TBPlayer.players = $.map($.makeArray(TBPlayer.players), function (player) {
    if ("id" in player && "language" in player && "book" in player && "chapter" in player) {
      return {
        id: player.id,
        reqUrl: TBPlayer.config.requestTarget + "/" + player.language + "/" + player.book + ".json",
        chapter: player.chapter - 1
      };
    } else {
      return null;
    }
  });

  // Expected API return format
  TBPlayer.expectedResponse = {
    status: "",
    data: {
      language: {},
      book: {
        chapters: []
      }
    }
  };

  TBPlayer.failNicely = function (id) {
    $(id).append(
      $("<p class=\"tbplayer-failure\">The requested chapter was not found.</p>")
    );
  };

  // Do the heavy lifting
  TBPlayer.createAll = function () {
    var t = TBPlayer;

    // Iterate through chapter array creating audio players for each
    $.each(t.players, function (i, player) {

      // Create a player wrapper in place of each script tag
      $(player.id).each(function () {
        $(this).replaceWith("<div id=\"" + $(this).attr("id") + "\" class=\"tbplayer\"></div>");
      });

      // Fetch the chapter information and create an audio file
      $.ajax({
        url: player.reqUrl,
        context: player,
        dataType: "json"
      })
        .done(function (unsafeResponse) {
          // Make the response fit the expected format
          var response = $.extend({}, t.expectedResponse, unsafeResponse || {});

          // Check for successful response and check to make sure the chapter exists
          if (response.status === "success" && response.data.book.chapters.length > this.chapter) {

            // Append a player to the player wrapper created above
            $(this.id).append(
              $("<audio></audio>").attr({
                "class": "tbplayer-controls",
                "controls": "controls",
                "preload": "metadata",
                src: response.data.book.chapters[this.chapter].href
              })
            );
          } else {
            t.failNicely(this.id);
          }
        })
        .fail(function () {
          t.failNicely(player.id);
        });
    });

  };

  // Create the players once the document is ready
  $(TBPlayer.createAll());
})(window);
