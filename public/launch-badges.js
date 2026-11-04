/* ============================================================
   The "Hidden at launch" badges, for signed-in editors
   ------------------------------------------------------------
   src/lib/launch-editor.ts adds this file to a signed-in editor's pages
   and to nobody else's. A signed-in editor is drawn the whole site, so it
   asks the server for this same page as launch mode would leave it, and
   marks whatever is not in that answer. Nothing here knows the rules, so
   it cannot disagree with them. The peek header is honoured only with a
   valid session; without one the answer is the page as the visitor has it,
   and no badge is drawn.

   In public/ like editor-ui.css, not a bundled script: a bundled one would
   change the hashed names in the public's HTML.
   ============================================================ */
(function () {
  var BADGE = "Hidden at launch";

  function badge(cls) {
    var el = document.createElement("span");
    el.className = cls;
    el.setAttribute("data-nt-ui", "");
    el.textContent = BADGE;
    return el;
  }

  function keysOf(root) {
    var keys = {};
    root.querySelectorAll("[data-edit]").forEach(function (el) {
      keys[el.getAttribute("data-edit")] = true;
    });
    return keys;
  }

  function mark(staying) {
    var doneSections = [];
    document.querySelectorAll("[data-edit]").forEach(function (el) {
      if (staying[el.getAttribute("data-edit")]) return;

      var unit = el.closest("[data-pending]");
      if (unit) {
        if (unit.querySelector(":scope > .nt-launch-badge")) return;
        var inside = unit.querySelectorAll("[data-edit]");
        var all = true;
        inside.forEach(function (k) {
          if (staying[k.getAttribute("data-edit")]) all = false;
        });
        /* The whole card goes, or only this one fact on a card that stays. */
        if (all) unit.insertBefore(badge("nt-launch-badge"), unit.firstChild);
        else el.parentNode.insertBefore(badge("nt-launch-badge"), el);
        return;
      }

      /* A heading that goes with its section: one badge per section. */
      var section = el.closest("section") || el.parentNode;
      if (doneSections.indexOf(section) !== -1) return;
      doneSections.push(section);
      el.parentNode.insertBefore(badge("nt-launch-badge"), el);
    });
  }

  fetch(location.pathname + location.search, {
    credentials: "same-origin",
    cache: "no-store",
    headers: { "X-KD-Launch-Peek": "1" },
  })
    .then(function (res) {
      if (res.status === 404) {
        var note = badge("nt-launch-page");
        note.textContent = "Hidden at launch: with launch mode on, this whole page answers 404 for the public.";
        document.body.appendChild(note);
        return null;
      }
      return res.ok ? res.text() : null;
    })
    .then(function (html) {
      if (html) mark(keysOf(new DOMParser().parseFromString(html, "text/html")));
    })
    .catch(function () {
      /* No badges this time: the page itself is unaffected. */
    });
})();
