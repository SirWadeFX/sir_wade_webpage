/* ==========================================================================
   20 — SYLLABUS TOGGLE
   The green button under the main syllabus panel drops two more panels
   down: it toggles `is-open` on .sw-ci-syllabus, and the CSS animates the
   height (pages/class-info/src/css/40-ci-syllabus.css). Delegated, so a
   block Kajabi mounts late still works.
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".sw-ci-toggle");
    if (!btn) return;
    var section = btn.closest(".sw-ci-syllabus");
    if (!section) return;

    var open = !section.classList.contains("is-open");
    section.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    var label = btn.querySelector(".sw-sr");
    if (label) {
      label.textContent = open ? "Show less of the syllabus" : "Show more of the syllabus";
    }
  });
})();
