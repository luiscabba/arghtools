/* The bar in the band (book board 20). The run of tiles between the wordmark
 * and the keys is trimmed to a whole number of tiles, and the keys take the
 * few pixels left over, so no tile is cut against a key and no gap opens. CSS
 * alone already keeps the tiles whole; this only hands the leftover to the
 * keys. Re-measured on resize. */
(function () {
  'use strict';
  var bar = document.querySelector('.navband');
  if (!bar) return;
  var mid = bar.querySelector('.nb-mid');
  var raf = 0;
  function fit() {
    raf = 0;
    bar.classList.remove('fitted');
    mid.style.width = '';
    var tile = mid.querySelector('.bt');
    if (!tile || mid.offsetParent === null) return;
    var m = tile.getBoundingClientRect().width;
    var w = mid.getBoundingClientRect().width;
    if (!m || !w) return;
    mid.style.width = (Math.floor(w / m) * m) + 'px';
    bar.classList.add('fitted');
  }
  fit();
  window.addEventListener('resize', function () { if (!raf) raf = requestAnimationFrame(fit); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
})();
