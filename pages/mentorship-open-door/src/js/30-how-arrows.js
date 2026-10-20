/* ==========================================================================
   30 — HOW IT WORKS: TRAVELLING CHEVRONS

   The chevrons on each How-it-works arrow slide along its band, from one
   card into the next, and loop.

   ONE SPEED FOR EVERY ARROW
   The arrows differ in length, so each gets a duration of its own length
   divided by SPEED. All three bands are drawn in the same SVG coordinates,
   so the same SPEED in those units means the same on-screen speed. Each
   band carries as many chevrons as fit at about SPACING apart, evenly
   staggered, so the loop has no visible seam: when one chevron reaches
   the end, the next is exactly one spacing behind it.

   The bands start and end under the cards (which sit above the SVG), so
   a chevron appears out of one card and disappears into the next.

   SMIL <animateMotion> rather than CSS offset-path: it moves the chevron
   along the band in the band's own coordinates, and rotate="auto" turns
   it with the curve. With reduced motion — or without this script — the
   chevrons stay where the markup draws them.
   ========================================================================== */

(function () {
  "use strict";

  var SPEED = 260; /* SVG units per second (the mockup's 2566-wide pixels) */
  var SPACING = 340; /* SVG units between chevrons on a band, roughly */
  var NS = "http://www.w3.org/2000/svg";
  var uid = 0;

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function animate(arrow) {
    var band = arrow.querySelector(".sw-how-band");
    var chevrons = arrow.querySelectorAll(".sw-how-chevron");
    if (!band || !chevrons.length || !band.getTotalLength) return;

    var length;
    try {
      length = band.getTotalLength(); /* geometry only, so fine while hidden on phones */
    } catch (e) {
      return;
    }
    if (!length) return;
    if (!band.id) band.id = "sw-how-band-" + ++uid;

    var count = Math.max(1, Math.round(length / SPACING));
    var duration = length / SPEED;
    var template = chevrons[0];

    for (var i = 0; i < chevrons.length; i++) {
      chevrons[i].parentNode.removeChild(chevrons[i]);
    }

    for (var n = 0; n < count; n++) {
      var chevron = template.cloneNode(false);
      chevron.removeAttribute("transform");

      var motion = document.createElementNS(NS, "animateMotion");
      motion.setAttribute("dur", duration.toFixed(3) + "s");
      motion.setAttribute("repeatCount", "indefinite");
      motion.setAttribute("rotate", "auto");
      /* Negative begin = already part-way along when the page loads. */
      motion.setAttribute("begin", (-(n * duration) / count).toFixed(3) + "s");

      var mpath = document.createElementNS(NS, "mpath");
      mpath.setAttribute("href", "#" + band.id);
      mpath.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#" + band.id);

      motion.appendChild(mpath);
      chevron.appendChild(motion);
      arrow.appendChild(chevron);
    }
    arrow.setAttribute("data-sw-moving", "");
  }

  function boot() {
    if (reduceMotion) return;
    var arrows = document.querySelectorAll(".sw-how-arrow:not([data-sw-moving])");
    for (var i = 0; i < arrows.length; i++) animate(arrows[i]);
  }

  /* Kajabi can mount a custom code block after this script runs, so try
     again once everything has loaded. */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  window.addEventListener("load", boot);
})();
