/* The map panel in section 02: a loop of a map being built, one keystroke at a
   time, drawn with the app's own dark palette and hand-drawn node style.
   The keys are the app's real ones, from the help table in src/app.html:
     Cmd + arrow  fork a branch that way; the same direction again goes deeper
     Enter        another node beside this one, same level, same branch
     Shift Enter  same level, in the next branch along
   prefers-reduced-motion gets the finished map as a still, with no timer.
   Edit SCRIPT below to change the words, the keys or the timing; the layout is
   computed, so the map re-tidies itself around whatever you put in. */

(function(){
  "use strict";

  var svg    = document.getElementById("mdSvg");
  var cam    = document.getElementById("mdCam");
  var gEdges = document.getElementById("mdEdges");
  var gNodes = document.getElementById("mdNodes");
  var root   = document.getElementById("mapprDemo");
  var countEl = document.getElementById("mdCount");
  var chips  = {};
  Array.prototype.forEach.call(root.querySelectorAll("[data-chip]"), function(c){
    chips[c.getAttribute("data-chip")] = c;
  });

  /* ---------- Mappr's dark branch palette (app.html) ---------- */
  var BRANCH = [
    {fill:"#232323", line:"#e3e3e3"},   /* 0 the centre  */
    {fill:"#16293d", line:"#74c0fc"},   /* 1 blue        */
    {fill:"#332c17", line:"#ffd43b"}    /* 2 yellow      */
  ];
  var INK = "#e3e3e3";

  /* ---------- the script ----------
     Keys are the app's real ones: ⌘+arrow forks a branch (again, deeper),
     ⏎ lays another node beside one at the same level in the same branch,
     ⇧⏎ puts one at the same level in the next branch along.            */
  var FONT_SIZE = 17, NODE_H = 44, GAP_Y = 26, GAP_X = 66, PAD_X = 30, MIN_W = 96;

  var SCRIPT = [
    {t:0.50, id:"root", parent:null,   text:"Thesis",     color:0, chip:null},
    {t:1.90, id:"ev",   parent:"root", text:"Evidence",   color:1, chip:"fork"},
    {t:3.50, id:"ct",   parent:"root", text:"Counter",    color:2, chip:"sib"},
    {t:5.10, id:"e1",   parent:"ev",   text:"Two trials", color:1, chip:"fork"},
    {t:6.25, id:"e2",   parent:"ev",   text:"Field data", color:1, chip:"enter"},
    {t:7.35, id:"c1",   parent:"ct",   text:"Cost",       color:2, chip:"fork"},
    {t:8.15, id:"c2",   parent:"ct",   text:"Timing",     color:2, chip:"enter"},
    {t:8.95, id:"e3",   parent:"e1",   text:"2019–24",    color:1, chip:"fork"}
  ];
  var TYPE_PER_CHAR = 0.055, TYPE_LEAD = 0.10;
  var HOLD_UNTIL = 11.0, FADE = 0.8, LOOP = 12.1;

  /* ---------- measuring ---------- */
  var mctx = document.createElement("canvas").getContext("2d");
  function measure(s){
    mctx.font = FONT_SIZE + 'px Excalifont, cursive';
    return mctx.measureText(s || "").width;
  }
  function widthFor(s){ return Math.max(MIN_W, Math.round(measure(s) + PAD_X * 2)); }

  /* ---------- seeded wobble, same trick the app uses ---------- */
  function seedOf(s){
    var h = 2166136261;
    for (var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rngFrom(seed){
    var a = seed >>> 0;
    return function(){
      a += 0x6D2B79F5; var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function rrPoints(x, y, w, h, R, step){
    var pts = [];
    function arc(cx, cy, a0, a1){
      for (var i = 0; i <= 4; i++){
        var a = a0 + (a1 - a0) * i / 4;
        pts.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R]);
      }
    }
    function line(x0, y0, x1, y1){
      var d = Math.hypot(x1 - x0, y1 - y0), n = Math.max(2, Math.round(d / step));
      for (var i = 0; i <= n; i++) pts.push([x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n]);
    }
    line(x + R, y, x + w - R, y);            arc(x + w - R, y + R,     -Math.PI / 2, 0);
    line(x + w, y + R, x + w, y + h - R);    arc(x + w - R, y + h - R,  0, Math.PI / 2);
    line(x + w - R, y + h, x + R, y + h);    arc(x + R,     y + h - R,  Math.PI / 2, Math.PI);
    line(x, y + h - R, x, y + R);            arc(x + R,     y + R,      Math.PI, Math.PI * 1.5);
    return pts;
  }
  function smooth(pts){
    var d = "M" + pts[0][0].toFixed(2) + "," + pts[0][1].toFixed(2);
    for (var i = 1; i <= pts.length; i++){
      var p = pts[i % pts.length], q = pts[(i + 1) % pts.length];
      d += " Q" + p[0].toFixed(2) + "," + p[1].toFixed(2) + " " +
           ((p[0] + q[0]) / 2).toFixed(2) + "," + ((p[1] + q[1]) / 2).toFixed(2);
    }
    return d + " Z";
  }
  function roughRect(x, y, w, h, R, seed, amp){
    var rnd = rngFrom(seed), pts = rrPoints(x, y, w, h, R, 16), out = [];
    for (var i = 0; i < pts.length; i++)
      out.push([pts[i][0] + (rnd() - .5) * amp, pts[i][1] + (rnd() - .5) * amp]);
    return smooth(out);
  }

  /* ---------- the tree ---------- */
  var nodes, order, elapsed = 0, lastTs = 0, camS = 1, camX = 0, camY = 0, camInit = false;

  function reset(){
    nodes = {}; order = [];
    camInit = false;
    svg.style.opacity = 1;
  }

  function addNode(step){
    var p = step.parent ? nodes[step.parent] : null;
    nodes[step.id] = {
      id: step.id, parent: step.parent, full: step.text, color: step.color,
      born: step.t, typed: "",
      w: MIN_W, h: NODE_H,
      x: p ? p.x : 0, y: p ? p.y : 0, tx: 0, ty: 0,
      kids: []
    };
    if (p) p.kids.push(step.id);
    order.push(step.id);
  }

  /* leaf packing, parents centred on their children; the tidy-itself beat */
  function layout(){
    if (!order.length) return;
    var maxW = {}, i, n;
    for (i = 0; i < order.length; i++){
      n = nodes[order[i]];
      n.depth = n.parent ? nodes[n.parent].depth + 1 : 0;
      maxW[n.depth] = Math.max(maxW[n.depth] || 0, n.w);
    }
    var colX = {0: 0}, d = 1;
    while (maxW[d] !== undefined){
      colX[d] = colX[d - 1] + maxW[d - 1] / 2 + GAP_X + maxW[d] / 2;
      d++;
    }
    var cursor = 0;
    function place(id){
      var n = nodes[id];
      if (!n.kids.length){ n.ly = cursor + n.h / 2; cursor += n.h + GAP_Y; }
      else {
        var ys = n.kids.map(place);
        n.ly = (ys[0] + ys[ys.length - 1]) / 2;
      }
      return n.ly;
    }
    place(order[0]);
    var y0 = nodes[order[0]].ly;
    for (i = 0; i < order.length; i++){
      n = nodes[order[i]];
      n.tx = colX[n.depth];
      n.ty = n.ly - y0;
    }
  }

  /* ---------- drawing ---------- */
  function edgePath(p, n){
    var x0 = p.x + p.w / 2, y0 = p.y, x1 = n.x - n.w / 2, y1 = n.y, dx = (x1 - x0);
    var c0x = x0 + dx * .55, c0y = y0, c1x = x1 - dx * .55, c1y = y1;
    /* sampled and wobbled, so the line is drawn by the same hand as the boxes */
    var rnd = rngFrom(seedOf(n.id + "e")), N = 14, pts = [], i, t, u, amp = 1.15;
    for (i = 0; i <= N; i++){
      t = i / N; u = 1 - t;
      var bx = u*u*u*x0 + 3*u*u*t*c0x + 3*u*t*t*c1x + t*t*t*x1;
      var by = u*u*u*y0 + 3*u*u*t*c0y + 3*u*t*t*c1y + t*t*t*y1;
      var e = (i === 0 || i === N) ? 0 : amp;   /* ends stay put */
      pts.push([bx + (rnd() - .5) * e, by + (rnd() - .5) * e]);
    }
    var d = "M" + pts[0][0].toFixed(2) + "," + pts[0][1].toFixed(2);
    for (i = 1; i < pts.length - 1; i++){
      d += " Q" + pts[i][0].toFixed(2) + "," + pts[i][1].toFixed(2) + " " +
           ((pts[i][0] + pts[i+1][0]) / 2).toFixed(2) + "," +
           ((pts[i][1] + pts[i+1][1]) / 2).toFixed(2);
    }
    return d + " L" + pts[pts.length-1][0].toFixed(2) + "," + pts[pts.length-1][1].toFixed(2);
  }

  function draw(t, still){
    var eOut = [], nOut = [], i, n, p, pal, age, drawn, fillIn, seed;

    for (i = 0; i < order.length; i++){
      n = nodes[order[i]];
      if (!n.parent) continue;
      p = nodes[n.parent];
      pal = BRANCH[n.color];
      age = still ? 9 : t - n.born;
      if (age < 0) continue;
      drawn = still ? 1 : Math.min(1, age / 0.34);
      eOut.push('<path d="' + edgePath(p, n) + '" stroke="' + pal.line +
                '" stroke-width="1.7" opacity="' + (0.9).toFixed(2) +
                '" pathLength="1" stroke-dasharray="1" stroke-dashoffset="' +
                (1 - drawn).toFixed(3) + '"/>');
    }

    for (i = 0; i < order.length; i++){
      n = nodes[order[i]];
      pal = BRANCH[n.color];
      age = still ? 9 : t - n.born;
      if (age < 0) continue;
      drawn = still ? 1 : Math.min(1, Math.max(0, (age - 0.10) / 0.40));
      fillIn = still ? 1 : Math.min(1, Math.max(0, (age - 0.30) / 0.35));
      var x = n.x - n.w / 2, y = n.y - n.h / 2;
      seed = seedOf(n.id);
      nOut.push('<g>');
      nOut.push('<path d="' + roughRect(x, y, n.w, n.h, 9, seed, 1.1) +
                '" fill="' + pal.fill + '" opacity="' + fillIn.toFixed(2) + '" stroke="none"/>');
      nOut.push('<path d="' + roughRect(x, y, n.w, n.h, 9, seed, 1.1) +
                '" fill="none" stroke="' + pal.line + '" stroke-width="1.6" stroke-linejoin="round"' +
                ' pathLength="1" stroke-dasharray="1" stroke-dashoffset="' + (1 - drawn).toFixed(3) + '"/>');
      nOut.push('<path d="' + roughRect(x + 0.6, y + 0.6, n.w, n.h, 9, seed ^ 0x9e37, 1.5) +
                '" fill="none" stroke="' + pal.line + '" stroke-width="1.1" opacity="' +
                (0.5 * drawn).toFixed(2) + '" stroke-linejoin="round"' +
                ' pathLength="1" stroke-dasharray="1" stroke-dashoffset="' + (1 - drawn).toFixed(3) + '"/>');
      if (n.typed){
        nOut.push('<text x="' + n.x.toFixed(1) + '" y="' + (n.y + 6).toFixed(1) +
                  '" text-anchor="middle" font-family="Excalifont, cursive" font-size="' + FONT_SIZE +
                  '" fill="' + INK + '">' + esc(n.typed) + '</text>');
      }
      if (!still && n.typed.length && n.typed.length < n.full.length && Math.floor(t * 2.4) % 2 === 0){
        var cx = n.x + measure(n.typed) / 2 + 3;
        nOut.push('<rect x="' + cx.toFixed(1) + '" y="' + (n.y - 9).toFixed(1) +
                  '" width="1.6" height="18" fill="' + INK + '" opacity=".8"/>');
      }
      nOut.push('</g>');
    }

    if (!still && t < SCRIPT[0].t && Math.floor(t * 2.4) % 2 === 0){
      nOut.push('<rect x="-1" y="-10" width="1.8" height="20" fill="' + INK + '" opacity=".65"/>');
    }

    gEdges.innerHTML = eOut.join("");
    gNodes.innerHTML = nOut.join("");
  }

  function esc(s){
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* ---------- camera: fit the map, lean toward the newest node ---------- */
  function clamp(v, lo, hi){
    if (lo > hi){ return (lo + hi) / 2; }
    return v < lo ? lo : (v > hi ? hi : v);
  }

  function fit(active, dt, snap){
    var r = svg.getBoundingClientRect(), vw = r.width, vh = r.height;
    if (!vw || !vh) return;
    svg.setAttribute("viewBox", "0 0 " + vw + " " + vh);

    var minX = -60, maxX = 60, minY = -40, maxY = 40, i, n;
    for (i = 0; i < order.length; i++){
      n = nodes[order[i]];
      if (n.born > elapsed) continue;
      minX = Math.min(minX, n.x - n.w / 2); maxX = Math.max(maxX, n.x + n.w / 2);
      minY = Math.min(minY, n.y - n.h / 2); maxY = Math.max(maxY, n.y + n.h / 2);
    }
    var pad = 54;
    var bw = (maxX - minX) + pad * 2, bh = (maxY - minY) + pad * 2;
    var s = Math.min(vw / bw, vh / bh, 1);
    var cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    if (active){ cx = cx * 0.78 + active.x * 0.22; cy = cy * 0.78 + active.y * 0.22; }

    var tS = s, tX = vw / 2 - cx * s, tY = vh / 2 - cy * s;
    /* the lean toward the newest node never pushes the map off screen */
    tX = clamp(tX, vw - (maxX + pad) * s, -(minX - pad) * s);
    tY = clamp(tY, vh - (maxY + pad) * s, -(minY - pad) * s);
    if (snap || !camInit){ camS = tS; camX = tX; camY = tY; camInit = true; }
    else {
      var k = 1 - Math.exp(-dt * 3.4);
      camS += (tS - camS) * k; camX += (tX - camX) * k; camY += (tY - camY) * k;
    }
    cam.setAttribute("transform", "translate(" + camX.toFixed(2) + "," + camY.toFixed(2) +
                                  ") scale(" + camS.toFixed(4) + ")");
  }

  /* ---------- the loop ---------- */
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function still(){
    reset();
    for (var i = 0; i < SCRIPT.length; i++){
      addNode(SCRIPT[i]);
      var n = nodes[SCRIPT[i].id];
      n.typed = n.full; n.w = widthFor(n.full);
    }
    layout();
    for (var j = 0; j < order.length; j++){ var m = nodes[order[j]]; m.x = m.tx; m.y = m.ty; }
    elapsed = 99;
    fit(null, 0, true);
    draw(99, true);
    for (var c in chips) chips[c].classList.remove("hot");
    if (countEl) countEl.textContent = order.length + " nodes";
  }

  function frame(ts){
    var dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0.016;
    lastTs = ts;
    elapsed += dt;

    if (elapsed >= LOOP){ elapsed = 0; reset(); }

    var i, s, n, active = null;
    for (i = 0; i < SCRIPT.length; i++){
      s = SCRIPT[i];
      if (elapsed >= s.t && !nodes[s.id]) addNode(s);
      if (elapsed >= s.t) active = nodes[s.id];
    }

    for (i = 0; i < order.length; i++){
      n = nodes[order[i]];
      var done = Math.min(1, Math.max(0, (elapsed - n.born - TYPE_LEAD) / (n.full.length * TYPE_PER_CHAR)));
      var cut = Math.round(done * n.full.length);
      n.typed = n.full.slice(0, cut);
      n.w += (widthFor(n.typed || n.full.slice(0, 1)) - n.w) * (1 - Math.exp(-dt * 14));
    }

    layout();
    var k = 1 - Math.exp(-dt * 7.5);
    for (i = 0; i < order.length; i++){
      n = nodes[order[i]];
      n.x += (n.tx - n.x) * k;
      n.y += (n.ty - n.y) * k;
    }

    for (var c in chips){
      var on = false;
      for (i = 0; i < SCRIPT.length; i++){
        s = SCRIPT[i];
        if (s.chip === c && elapsed >= s.t - 0.14 && elapsed < s.t + 0.46) on = true;
      }
      chips[c].classList.toggle("hot", on);
    }

    svg.style.opacity = elapsed > HOLD_UNTIL
      ? Math.max(0, 1 - (elapsed - HOLD_UNTIL) / FADE).toFixed(3)
      : 1;

    if (countEl){
      var live = 0;
      for (i = 0; i < order.length; i++) if (nodes[order[i]].born <= elapsed) live++;
      var want = live + (live === 1 ? " node" : " nodes");
      if (countEl.textContent !== want) countEl.textContent = want;
    }

    fit(active, dt, false);
    draw(elapsed, false);
    requestAnimationFrame(frame);
  }

  function start(){
    if (reduced){ still(); window.addEventListener("resize", still); return; }
    reset();
    requestAnimationFrame(frame);
  }

  if (document.fonts && document.fonts.load){
    document.fonts.load('17px Excalifont').then(start, start);
  } else start();
})();
