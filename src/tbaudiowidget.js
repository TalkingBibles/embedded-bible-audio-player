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

  TBPlayer.createPlayer = function (data) {
    var chapterNumber = $(this).data("chapter");
    // Check whether the chapter exists and has a private url
    if (typeof data.chapters === "object" &&
        typeof data.chapters[chapterNumber] === "object" &&
        typeof data.chapters[chapterNumber].href === "string") {
      $(this).append(
        $("<audio></audio>").attr({
          "class": "tbplayer-controls",
          "controls": "controls",
          "preload": "metadata",
          src: data.chapters[chapterNumber].href
        })
      );
    } else {
      $(this).append(
        $("<span class=\"tbplayer-error\">The requested chapter was not found.</span>")
      );
    }
  };

  TBPlayer.failGracefully = function() {
    $(this).append(
      $("<span class=\"tbplayer-error\">The requested chapter was not found.</span>")
    );
  };

  // Do the heavy lifting
  TBPlayer.createAll = function () {
    var t = TBPlayer;

    // Iterate through chapter array creating audio players for each
    $(".tbplayer").each(function (i, player) {
      var languageBook = $(player).data("book"),
          requestUrl = TBPlayer.config.requestTarget + languageBook  + ".json";

      $.ajax({url: requestUrl, context: player, dataType: "json"})
        .done(t.createPlayer)
        .fail(t.failGracefully);
    });

  };

  // Create the players once the document is ready
  $(TBPlayer.createAll());
})(window, jQuery);
