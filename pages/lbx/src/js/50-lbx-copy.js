/* ==========================================================================
   50 — TAP TO COPY (LightBox Expo)
   Any button with data-sw-copy="CODE" copies CODE to the clipboard and
   swaps its hint to "Copied!" for two seconds. Used by the show special
   and the partner perk codes. Delegated from document, so a block Kajabi
   mounts late still works. If the clipboard is blocked, the code is
   selected instead so it can be copied by hand.
   ========================================================================== */

(function () {
  "use strict";

  function flash(btn, text) {
    var hint = btn.querySelector(".sw-lbx-code-hint");
    if (!hint) return;
    if (!btn.dataset.swHint) btn.dataset.swHint = hint.textContent;
    hint.textContent = text;
    btn.classList.add("is-copied");
    clearTimeout(btn._swTimer);
    btn._swTimer = setTimeout(function () {
      hint.textContent = btn.dataset.swHint;
      btn.classList.remove("is-copied");
    }, 2000);
  }

  function selectText(btn) {
    var value = btn.querySelector(".sw-lbx-code-value");
    if (!value || !window.getSelection) return;
    var range = document.createRange();
    range.selectNodeContents(value);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest("[data-sw-copy]");
    if (!btn) return;
    var code = btn.getAttribute("data-sw-copy");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(
        function () { flash(btn, "Copied!"); },
        function () { selectText(btn); flash(btn, "Code selected"); },
      );
    } else {
      selectText(btn);
      flash(btn, "Code selected");
    }
  });
})();
