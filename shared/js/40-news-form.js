/* ==========================================================================
   40 — STAY IN THE LOOP FORM
   Every "Stay in the loop" form (.sw-news-form) submits without leaving
   the page:

     1. Checks the fields. Name: letters, spaces, hyphens, apostrophes and
        full stops only. Email: name@domain.tld. A bad field gets a red box
        and a line saying what's wrong; typing in it clears that.
     2. Posts in the background to the Kajabi form named by the form's
        data-sw-form key (default `forms.newsletter`; 00-assets.js or the
        head snippet), with the same fields Kajabi's own form sends:
        form_submission[name] / [email], the page's CSRF token, and the
        empty anti-spam fields.
     3. Swaps the form for "You're signed up!" in fern green, but only
        once Kajabi has accepted it.

   Same-origin form URLs (a path like /forms/123/form_submissions, the
   safest choice since the pages live on the same Kajabi site) get a real
   answer, so a refused sign-up shows an error. A full URL on another
   domain can only be sent blind (no-cors). With no form set at all, the
   form says sign-up isn't open yet rather than pretending it worked.
   If the post fails, the form stays and says so. The error lines and the
   success message are built here, so the form blocks need no extra markup.
   Delegated from document, so a block Kajabi mounts late still works.
   ========================================================================== */

(function () {
  "use strict";

  var NAME_RE = /^[\p{L}\p{M}]+(?:[ '’.\-][\p{L}\p{M}]*)*$/u;
  var EMAIL_RE = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9](?:[A-Za-z0-9\-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9\-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;

  function check(input) {
    var v = input.value.trim();
    if (input.name === "name") {
      if (!v) return "Please enter your name.";
      if (!NAME_RE.test(v)) return "Names can only use letters, spaces, hyphens and apostrophes.";
    }
    if (input.name === "email") {
      if (!v) return "Please enter your email.";
      if (!EMAIL_RE.test(v)) return "Please enter a valid email, like name@example.com.";
    }
    return "";
  }

  function setError(input, message) {
    var id = input.id + "-error";
    var note = document.getElementById(id);
    if (!message) {
      input.classList.remove("is-invalid");
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
      if (note) note.parentNode.removeChild(note);
      return;
    }
    input.classList.add("is-invalid");
    input.setAttribute("aria-invalid", "true");
    if (!note) {
      note = document.createElement("p");
      note.className = "sw-news-error";
      note.id = id;
      input.insertAdjacentElement("afterend", note);
    }
    note.textContent = message;
    input.setAttribute("aria-describedby", id);
  }

  function formError(form, message) {
    var note = form.querySelector(".sw-news-error.is-form");
    if (!message) {
      if (note) note.parentNode.removeChild(note);
      return;
    }
    if (!note) {
      note = document.createElement("p");
      note.className = "sw-news-error is-form";
      note.setAttribute("role", "alert");
      form.appendChild(note);
    }
    note.textContent = message;
  }

  function userError(message) {
    var err = new Error(message);
    err.swUser = true;
    return err;
  }

  function send(form) {
    var key = form.getAttribute("data-sw-form") || "forms.newsletter";
    var action = (window.SWAssets && window.SWAssets.get(key)) || "";
    if (!action || !window.fetch) {
      return Promise.reject(userError("Sign-up isn't open yet. Please check back soon."));
    }

    var body = new FormData();
    var name = form.querySelector('input[name="name"]');
    var email = form.querySelector('input[name="email"]');
    var csrf = document.querySelector('meta[name="csrf-token"]');
    if (csrf) body.append("authenticity_token", csrf.getAttribute("content"));
    body.append("website_url", ""); // Kajabi's honeypot: must stay empty
    body.append("kjb_fk_checksum", "");
    try {
      body.append("kjb_visitor_time_zone", Intl.DateTimeFormat().resolvedOptions().timeZone || "");
    } catch (e) {}
    body.append("form_submission[name]", name ? name.value.trim() : "");
    body.append("form_submission[email]", email ? email.value.trim() : "");

    var url;
    try {
      url = new URL(action, location.href);
    } catch (e) {
      return Promise.reject(userError("Something went wrong. Please try again."));
    }
    /* Cross-origin: Kajabi sends no CORS headers, so the answer is opaque.
       A network failure still rejects. */
    if (url.origin !== location.origin) {
      return fetch(url.href, { method: "POST", body: body, mode: "no-cors" });
    }
    return fetch(url.href, { method: "POST", body: body, credentials: "same-origin" }).then(function (res) {
      if (!res.ok) throw userError("Something went wrong. Please try again.");
      return res;
    });
  }

  function done(form) {
    var msg = document.createElement("p");
    msg.className = "sw-news-done";
    msg.setAttribute("role", "status");
    msg.setAttribute("tabindex", "-1");
    msg.textContent = "You’re signed up!";
    form.hidden = true;
    form.insertAdjacentElement("afterend", msg);
    msg.focus({ preventScroll: true });
  }

  /* Our own messages replace the browser's bubbles. */
  function prepare(root) {
    var forms = (root || document).querySelectorAll(".sw-news-form");
    for (var i = 0; i < forms.length; i++) forms[i].setAttribute("novalidate", "");
  }
  prepare();
  document.addEventListener("DOMContentLoaded", function () { prepare(); });

  document.addEventListener("submit", function (e) {
    var form = e.target.closest && e.target.closest(".sw-news-form");
    if (!form) return;
    e.preventDefault();
    formError(form, "");

    var inputs = form.querySelectorAll('input[name="name"], input[name="email"]');
    var first = null;
    for (var i = 0; i < inputs.length; i++) {
      var msg = check(inputs[i]);
      setError(inputs[i], msg);
      if (msg && !first) first = inputs[i];
    }
    if (first) {
      first.focus();
      return;
    }

    var button = form.querySelector('button[type="submit"], button:not([type])');
    if (button) button.disabled = true;
    send(form).then(
      function () {
        done(form);
      },
      function (err) {
        if (button) button.disabled = false;
        formError(form, err && err.swUser ? err.message : "Something went wrong. Please try again.");
      },
    );
  });

  // Typing in a flagged field re-checks it, so the red clears as soon as
  // it's right (and doesn't appear while someone is still typing).
  document.addEventListener("input", function (e) {
    var input = e.target;
    if (!input.closest || !input.closest(".sw-news-form")) return;
    if (input.classList.contains("is-invalid")) setError(input, check(input));
  });
})();
