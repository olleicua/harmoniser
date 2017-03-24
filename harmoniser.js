(function() {

  var audio = new (window.AudioContext || window.webkitAudioContext)();

  var isBlack = function(pitch) {
    var p = pitch;
    while (p < 0) p += 12;
    return [1, 4, 6, 9, 11].indexOf(p % 12) !== -1;
  };

  var initCursor = function($box, loopSize) {
    return $('<div>')
      .addClass('cursor')
      .css({
        left: '1px',
        width: (($box.innerWidth() - 1) / loopSize) - 1
      })
      .appendTo($box);
  };

  var initGrid = function($box, minPitch, maxPitch, whiteNotesOnly, loopSize) {
    var gridHeight = (maxPitch - minPitch);
    var noteHeight = (($box.innerHeight() - 6) / gridHeight) - 1;
    var noteWidth = (($box.innerWidth() - 1) / loopSize) - 1;

    var grid = [];
    for (var pitch = minPitch; pitch <= maxPitch; pitch++) {
      var row = [];
      for (var position = 0; position < loopSize; position++) {
        var note = $('<div>')
            .addClass('note')
            .css({
              width: (noteWidth - 8) + 'px',
              height: (noteHeight - 8) + 'px',
              left: ((position * (noteWidth + 1)) + 1) + 'px',
              top: ($box.innerHeight() - (((pitch - minPitch) * (noteHeight + 1)))) + 'px'
            })
            .click(function() { $(this).toggleClass('active'); });

        note.frequency = 440 * Math.pow(1.059463094359, pitch);
        note.appendTo($box);

        if (isBlack(pitch)) {
          note.addClass('black');
          if (!whiteNotesOnly) row.push(note);
        } else {
          row.push(note);
        }
      }
      grid.push(row);
    }
    return grid;
  };

  var startLoop = function(grid, cursor, loopSize, noteLength, position) {
    position = position || 0;

    cursor.css({left: (position * (cursor.outerWidth() + 1)) + 1});

    for (var i = 0; i < grid.length; i++) {
      var note = grid[i][position];
      if (note.hasClass('active')) {
        (function(note) {
          var osc = audio.createOscillator();
          osc.type = 'sine';
          osc.frequency.value = note.frequency;
          osc.connect(audio.destination);
          osc.start();
          note.addClass('pressed');

          setTimeout(function() {
            osc.stop();
            note.removeClass('pressed');
          }, noteLength);
        })(note);
      }
    }

    setTimeout(function() {
      startLoop(grid, cursor, loopSize, noteLength, (position + 1) % loopSize);
    }, noteLength);
  };

  window.Harmoniser = {
    initialize: function(options) {
      var $box = $(options.box);
      options = $.extend({
        minPitch: 0,
        maxPitch: 12,
        whiteNotesOnly: false,
        loopSize: 16,
        noteLength: 500
      }, options);

      var cursor = initCursor($box, options.loopSize);

      var grid = initGrid(
        $box,
        options.minPitch,
        options.maxPitch,
        options.whiteNotesOnly,
        options.loopSize
      );

      startLoop(grid, cursor, options.loopSize, options.noteLength);
    }
  };

})()