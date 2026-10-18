/* ==========================================================================
   10 — NAV MENU
   Opens and closes a nav dropdown:

     <div class="sw-nav-menu">
       <button class="sw-nav-menu-btn" aria-expanded="false"
               aria-controls="sw-classes-menu">Classes …</button>
       <div class="sw-nav-menu-panel" id="sw-classes-menu"></div>
     </div>

   The button toggles `is-open` on .sw-nav-menu. A click anywhere else or
   Escape closes it. Delegated from document, so a header block Kajabi
   mounts late still works. Inert on pages without the markup.
   ========================================================================== */

(function () {
  "use strict";

  function setOpen(menu, open) {
    menu.classList.toggle("is-open", open);
    var btn = menu.querySelector(".sw-nav-menu-btn");
    if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function closeAll(except) {
    var open = document.querySelectorAll(".sw-nav-menu.is-open");
    for (var i = 0; i < open.length; i++) {
      if (open[i] !== except) setOpen(open[i], false);
    }
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".sw-nav-menu-btn");
    if (btn) {
      var menu = btn.closest(".sw-nav-menu");
      closeAll(menu);
      setOpen(menu, !menu.classList.contains("is-open"));
      return;
    }
    // Clicks inside an open panel keep it open.
    closeAll(e.target.closest(".sw-nav-menu"));
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var menu = document.querySelector(".sw-nav-menu.is-open");
    if (!menu) return;
    setOpen(menu, false);
    var btn = menu.querySelector(".sw-nav-menu-btn");
    if (btn) btn.focus();
  });
})();
