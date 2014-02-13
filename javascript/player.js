/*global jQuery, window*/
(function (window, $) {
  "use strict";

  // Create a namespace so that we're not polluting window
  var TBPlayer = window.TBPlayer || {};

  // Set configuration variables
  TBPlayer.config = {
    requestTarget: "http://talkingbibles.net/api/v1/",
    showFailures: true
  };

  TBPlayer.failNicely = function (parentElement, failureMessage) {
    if (TBPlayer.config.showFailures) {
      $(parentElement).append(
        $("<p class=\"tbplayer-failure\">" + failureMessage + "</p>")
      );
    }
  };

  // Do the heavy lifting
  TBPlayer.createAll = function () {
    var t = TBPlayer;

    // Iterate through chapter array creating audio players for each
    $(".tbplayer").each(function (i, player) {
      var bookPath = $(player).data("book"),
          chapterNumber = ($(player).data("chapter") || 1),
          requestUrl;

      // Skip this one if the data attributes are not defined
      if (typeof chapterNumber === "undefined") { return; }
      else { requestUrl = t.config.requestTarget + bookPath  + ".json"; }

      // Fetch the chapter information and create an audio file
      $.ajax({
        url: requestUrl,
        dataType: "json"
      })
      .done(function (response) {
        // Check whether the array is long enough to contain the chapter
        if (chapterNumber in (((response.data || {}).chapters || []))) {
          //Check whether the chapter has a link
          if ("href" in response.data.chapters[chapterNumber]) {
            // Append a player to the player wrapper created above
            $(player).append(
              $("<audio></audio>").attr({
                "class": "tbplayer-controls",
                "controls": "controls",
                "preload": "metadata",
                src: response.data.chapters[chapterNumber].href
              })
            );
          }
        } else {
          TBPlayer.failNicely(player, "The requested chapter was not found.");
        }
      })
      .fail(function () {
        TBPlayer.failNicely(player, "The requested chapter was not loaded.");
      });
    });

  };

  // Create the players once the document is ready
  $(TBPlayer.createAll());
})(window, jQuery);
