/* The house page's keys (book board 15). Everything else about them is CSS;
 * this is here only because a phone does not focus a button it taps, so a
 * tool that is not built could not say so. Pressing one marks its wrapper,
 * and the note under it shows until you press somewhere else. */
(function () {
  'use strict';
  document.addEventListener('click', function (e) {
    var jam = e.target.closest ? e.target.closest('.jam') : null;
    var open = document.querySelectorAll('.kwrap.is-stuck');
    for (var i = 0; i < open.length; i++) {
      if (!jam || open[i] !== jam.parentNode) open[i].classList.remove('is-stuck');
    }
    if (jam) jam.parentNode.classList.add('is-stuck');
  });
})();
