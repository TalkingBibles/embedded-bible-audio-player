/*global jQuery, window*/
(function (window, $) {
  "use strict";

  // Create a namespace so that we're not polluting window
  var TBPlayer = window.TBPlayer || {};

  // Set configuration variables with defaults
  TBPlayer.config = {
    requestTarget: "http://talkingbibles.net/api/v1"
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
      .done(function (response) {
        try {
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
          }
        } catch (e) {
          $(player).append(
            $("<p class=\"tbplayer-failure\">The requested chapter cannot be played.</p>")
          );
        }
      })
      .fail(function () {
        $(player).append(
          $("<p class=\"tbplayer-failure\">The requested chapter did not load.</p>")
        );
      });
    });

  };

  // Create the players once the document is ready
  $(TBPlayer.createAll());
})(window, jQuery);
