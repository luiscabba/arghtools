/* The house page's cards on a phone (book boards 15 and 22).
 *
 * A phone cannot hover, so a card is selected instead: tapping one marks it
 * .is-sel and CSS gives it everything the cursor would, the glazing edge and
 * the icon's one trick. Only one card is selected at a time; tapping anywhere
 * else lets it go. A card that is a link goes on the second tap, so the trick
 * is seen before the page changes. A card that is not a link acts on the
 * first tap as well as lighting up. Buttons and the nav keys are not cards
 * and are left alone. With a mouse none of this runs; hover does it.
 *
 * It also does the one thing it did before: a phone does not focus a button
 * it taps, so a tool that is not built could not say so. Pressing one marks
 * its wrapper, and the note under it shows until you press somewhere else.
 */
(function () {
  'use strict';
  var CARD = '.keycap, .houserules .card, .linkcard';
  var touch = window.matchMedia('(hover: none)');

  function clearSel(except) {
    var on = document.querySelectorAll('.is-sel');
    for (var i = 0; i < on.length; i++) if (on[i] !== except) on[i].classList.remove('is-sel');
  }
  // coming back to the page must not find a card still lit
  window.addEventListener('pageshow', function () { clearSel(null); });

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest) return;

    if (touch.matches) {
      var card = t.closest(CARD);
      // a real link inside a card (the stuck note's Discord link) is not the card
      var inner = t.closest('a, button');
      if (card && inner && inner !== card) card = null;
      if (card) {
        if (!card.classList.contains('is-sel')) {
          if (card.tagName === 'A') e.preventDefault();   // first tap selects; the second one goes
          clearSel(card);
          card.classList.add('is-sel');
        } else if (card.tagName === 'ARTICLE') {
          card.classList.remove('is-sel');               // a rule card toggles
        }
      } else {
        clearSel(null);
      }
    }

    var jam = t.closest('.jam');
    var open = document.querySelectorAll('.kwrap.is-stuck');
    for (var i = 0; i < open.length; i++) {
      if (!jam || open[i] !== jam.parentNode) open[i].classList.remove('is-stuck');
    }
    if (jam) jam.parentNode.classList.add('is-stuck');
  });
})();
