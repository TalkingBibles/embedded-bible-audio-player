/*global $, window*/
(function (window) {
  "use strict";

  // Create a namespace so that we're not polluting window
  var TBPlayer = window.TBPlayer || {};

  // Set configuration variables with defaults
  TBPlayer.config = {
    requestTarget: "http://talkingbibles.net/api/v1"
  };

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

  // Just fail gracefully, dang it!
  TBPlayer.failNicely = function (id) {
    $(id).append(
      $("<p class=\"tbplayer-failure\">The requested chapter was not found.</p>")
    );
  };

  // Do the heavy lifting
  TBPlayer.createAll = function () {
    var t = TBPlayer;

    // Iterate through chapter array creating audio players for each
    $(".tbplayer").each(function (i, player) {
      var rawData = $(player).data("chapter").split("/"),
          chapter = rawData[2],
          reqUrl = t.config.requestTarget + "/" + rawData[0] + "/" + rawData[1] + ".json";

      // Fetch the chapter information and create an audio file
      $.ajax({
        url: reqUrl,
        dataType: "json"
      })
      .done(function (unsafeResponse) {
        // Make the response fit the expected format
        var response = $.extend({}, t.expectedResponse, unsafeResponse || {});

        // Check for successful response and check to make sure the chapter exists
        if (response.status === "success" && response.data.book.chapters.length > chapter) {

          // Append a player to the player wrapper created above
          $(player).append(
            $("<audio></audio>").attr({
              "class": "tbplayer-controls",
              "controls": "controls",
              "preload": "metadata",
              src: response.data.book.chapters[chapter].href
            })
          );
        } else {
          t.failNicely(player);
        }
      })
      .fail(function () {
        t.failNicely(player);
      });
    });

  };

  // Create the players once the document is ready
  $(TBPlayer.createAll());
})(window);
