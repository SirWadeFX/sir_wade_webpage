/* ==========================================================================
   30 — CARD DROP-DOWN
   Opens and closes the Class Library cards, and makes the whole card a
   link to the class:

     <div class="sw-catalog-card is-drop">
       <a class="sw-catalog-thumb-link" href="…">  ← the class; the card's link
       <div class="sw-catalog-body">…</div>
       <div class="sw-catalog-more">               ← bullets + Sign up
         … <button class="sw-catalog-chevron" aria-expanded="false">
       </div>
     </div>

   Only the chevron opens or closes a card. A click anywhere else on it
   goes to the image link's href (a new tab with Ctrl/Cmd/Shift or the
   middle button, as a real link would). Any number of cards can be open;
   a click outside every card, or Escape, closes them all. Delegated from
   document, so a block Kajabi mounts late still works. The look is in
   src/css/35-catalog-drop.css.
   ========================================================================== */

(function () {
  "use strict";

  var CARD = ".sw-catalog-card.is-drop";

  function setOpen(card, open) {
    card.classList.toggle("is-open", open);
    var btn = card.querySelector(".sw-catalog-chevron");
    if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function closeAll() {
    var open = document.querySelectorAll(CARD + ".is-open");
    for (var i = 0; i < open.length; i++) setOpen(open[i], false);
  }

  function hrefOf(card) {
    var link = card.querySelector(".sw-catalog-thumb-link");
    var href = link && link.getAttribute("href");
    return href && href !== "#" ? href : "";
  }

  // Links follow themselves; a click on the card anywhere else follows the
  // card's link. Text being selected is not a click.
  function follow(card, e, newTab) {
    if (e.target.closest("a")) return;
    if (String(window.getSelection ? window.getSelection() : "")) return;
    var href = hrefOf(card);
    if (!href) return;
    if (newTab) window.open(href, "_blank", "noopener");
    else window.location.href = href;
  }

  document.addEventListener("click", function (e) {
    var card = e.target.closest(CARD);
    if (!card) {
      closeAll();
      return;
    }
    if (e.target.closest(".sw-catalog-chevron")) {
      setOpen(card, !card.classList.contains("is-open"));
      return;
    }
    follow(card, e, e.ctrlKey || e.metaKey || e.shiftKey);
  });

  document.addEventListener("auxclick", function (e) {
    if (e.button !== 1) return;
    var card = e.target.closest(CARD);
    if (card && !e.target.closest(".sw-catalog-chevron")) follow(card, e, true);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAll();
  });
})();
