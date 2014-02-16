/*global jQuery*/
(function ($) {
  "use strict";

  function TBPlayerPlugin(elem, options) {
    var self, defaults;

    // Remember this object as self
    self = this;

    // Remember the DOM element that this object is bound to
    self.$elem = $(elem);

    // Set default options
    defaults = {
      requestTarget: "http://talkingbibles.net/api/v1/",
      showFailures: true
    };

    // Merge passed-in options with default options
    self.options = $.extend({}, defaults, options);

    // Get the player party started
    init();

    function init() {
      var languageBook = self.$elem.data("book"),
          requestUrl = self.options.requestTarget + languageBook  + ".json";

      $.ajax({url: requestUrl, dataType: "json"})
        .done(createPlayer)
        .fail(failGracefully);
    }

    function createPlayer(data) {
      var chapterNumber = self.$elem.data("chapter");
      // Check whether the chapter exists and has a private url
      if (typeof data.chapters === "object" &&
          typeof data.chapters[chapterNumber] === "object" &&
          typeof data.chapters[chapterNumber].href === "string") {
        self.$elem.append(
          $("<audio></audio>").attr({
            "class": "tbplayer-controls",
            "controls": "controls",
            "preload": "metadata",
            src: data.chapters[chapterNumber].href
          })
        );
      } else {
        self.$elem.append(
          $("<span class=\"tbplayer-error\">The requested chapter was not found.</span>")
        );
      }
    }

    function failGracefully() {
      self.$elem.append(
        $("<span class=\"tbplayer-error\">The requested chapter was not found.</span>")
      );
    }

  }

  $.fn.tbplayer = function (options) {
    return this.each(function () {
      if (!$(this).data("tbplayer")) {
        $(this).data("tbplayer", new TBPlayerPlugin(this, options));
      }
    });
  };

})(jQuery);
