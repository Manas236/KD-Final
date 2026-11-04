/* ============================================================
   Launch views, for signed-in editors: the "Hidden at launch" badges, the
   yellow marking, and the two buttons in the floating editor bar
   ------------------------------------------------------------
   src/lib/launch-editor.ts adds this file to a signed-in editor's pages
   and to nobody else's. The tag says which view the page is in: no
   data-view is the ordinary signed-in page.

     all       every item, with a badge on what launch mode would take off
     removed   every item, with what it would take off marked in yellow
     preview   the page as launch mode leaves it, nothing marked

   To mark, it asks the server for this same page as launch mode would leave
   it, and marks whatever is not in that answer. Nothing here knows the rules,
   so it cannot disagree with them. The peek header is honoured only with a
   valid session; without one the answer is the page as the visitor has it,
   and nothing is marked.

   In public/ like editor-ui.css, not a bundled script: a bundled one would
   change the hashed names in the public's HTML.
   ============================================================ */
(function () {
  var script = document.currentScript;
  var VIEW = script.getAttribute("data-view") || "all";
  var IS_404 = script.getAttribute("data-status") === "404";
  var TOTALS = script.getAttribute("data-totals") || "";

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

  /* ---- This is what was removed ----
     A class and nothing else: its rules (public/editor-ui.css) draw with
     outline and box-shadow, so nothing on the page moves. */
  function highlight(el) {
    el.classList.add("nt-launch-gone");
  }

  function markRemoved(answer) {
    var staying = keysOf(answer);
    var links = {};
    answer.querySelectorAll("a[href]").forEach(function (a) {
      links[a.getAttribute("href")] = true;
    });

    function allGone(el) {
      var inside = el.querySelectorAll("[data-edit]");
      for (var i = 0; i < inside.length; i++) {
        if (staying[inside[i].getAttribute("data-edit")]) return false;
      }
      return true;
    }

    /* The largest thing that goes whole: a tile with its list item, a list
       with its heading, a section with its kicker. */
    document.body.querySelectorAll("[data-edit]").forEach(function (el) {
      if (staying[el.getAttribute("data-edit")] || el.closest("[data-nt-ui]")) return;
      var top = el;
      while (top.parentElement !== document.body && top.parentElement.tagName !== "MAIN" && allGone(top.parentElement)) {
        top = top.parentElement;
      }
      highlight(top);
    });
    /* Each card inside it keeps its own outline. */
    document.querySelectorAll(".nt-launch-gone [data-pending]").forEach(highlight);

    /* A link that launch mode leaves out, in the nav or the footer too. */
    document.body.querySelectorAll("a[href]").forEach(function (a) {
      if (links[a.getAttribute("href")] || a.closest(".nt-launch-gone, [data-nt-ui]")) return;
      highlight(a);
    });
  }

  function markWholePage() {
    var strip = document.createElement("div");
    strip.className = "nt-launch-strip";
    strip.setAttribute("data-nt-ui", "");
    strip.textContent = "This whole page is removed at launch";
    document.body.appendChild(strip);
    document.querySelectorAll("[data-pending]").forEach(highlight);
  }

  if (VIEW !== "preview" && !IS_404) {
    fetch(location.pathname + location.search, {
      credentials: "same-origin",
      cache: "no-store",
      headers: { "X-KD-Launch-Peek": "1" },
    })
      .then(function (res) {
        if (res.status === 404) {
          if (res.body) res.body.cancel();
          if (VIEW === "removed") {
            markWholePage();
          } else {
            var note = badge("nt-launch-page");
            note.textContent = "Hidden at launch: with launch mode on, this whole page answers 404 for the public.";
            document.body.appendChild(note);
          }
          return null;
        }
        return res.ok ? res.text() : null;
      })
      .then(function (html) {
        if (!html) return;
        var answer = new DOMParser().parseFromString(html, "text/html");
        if (VIEW === "removed") markRemoved(answer);
        else mark(keysOf(answer));
      })
      .catch(function () {
        /* Nothing marked this time: the page itself is unaffected. */
      });
  }

  /* ---- The two buttons ----
     They go in the editor's own bar, beside "Edit text". That bar is drawn
     by src/scripts/inline-edit.js once the page's edits have been read, so
     until then, and for a browser without the kd_edit_ui hint, they sit in a
     bar of their own. */
  var LABEL = {
    preview: "Launch preview: the public's view with launch mode ON. Only you see this.",
    removed: "Removed at launch: " + (TOTALS || "see /studio/launch") + ". Only you see this.",
  };
  var FOLDED = { all: "Launch views", preview: "Launch preview on", removed: "Removed view on" };

  function button(cls, text) {
    var el = document.createElement("button");
    el.type = "button";
    el.className = cls;
    el.textContent = text;
    return el;
  }

  function buildViews() {
    var root = document.createElement("div");
    root.className = "nt-lv";
    root.setAttribute("role", "group");
    root.setAttribute("aria-label", "Launch views");

    var panel = document.createElement("div");
    panel.className = "nt-lv-panel";
    panel.id = "nt-lv-panel";

    var say = document.createElement("p");
    say.className = "nt-lv-say";
    say.setAttribute("role", "status");
    say.textContent = LABEL[VIEW] || "";
    say.hidden = !LABEL[VIEW];
    panel.appendChild(say);

    var controls = [];
    function go(view) {
      /* Out of edit mode first, which saves whatever is open. */
      var mode = document.querySelector(".nt-pill-mode");
      if (mode && mode.getAttribute("aria-pressed") === "true") mode.click();
      controls.forEach(function (c) {
        c.disabled = true;
      });
      fetch("/api/launch", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "view", view: view }),
      })
        .then(function (res) {
          if (res.ok) {
            location.reload();
            return;
          }
          return res.json().then(function (data) {
            throw new Error(data.error);
          });
        })
        .catch(function (err) {
          say.textContent = (err && err.message) || "Could not switch. Nothing changed.";
          say.hidden = false;
          root.classList.add("is-open");
          controls.forEach(function (c) {
            c.disabled = false;
          });
        });
    }

    [
      ["removed", "This is what was removed"],
      ["preview", "Launch preview"],
    ].forEach(function (b) {
      var on = VIEW === b[0];
      var el = button("nt-lv-btn", b[1]);
      el.setAttribute("data-view", b[0]);
      el.setAttribute("aria-pressed", String(on));
      el.addEventListener("click", function () {
        go(on ? "off" : b[0]);
      });
      panel.appendChild(el);
      controls.push(el);
    });

    if (VIEW !== "all") {
      var back = button("nt-lv-btn nt-lv-back", "Back to normal");
      back.addEventListener("click", function () {
        go("off");
      });
      panel.appendChild(back);
      controls.push(back);
    }

    /* Phones and small tablets: one button, which opens the rest. */
    var fold = button("nt-lv-fold", FOLDED[VIEW]);
    fold.setAttribute("aria-expanded", "false");
    fold.setAttribute("aria-controls", panel.id);
    fold.addEventListener("click", function () {
      fold.setAttribute("aria-expanded", String(root.classList.toggle("is-open")));
    });

    root.appendChild(panel);
    root.appendChild(fold);
    return root;
  }

  function lockEditText(bar) {
    if (VIEW === "all") return;
    var mode = bar.querySelector(".nt-pill-mode");
    if (mode) {
      mode.disabled = true;
      mode.title = "Go back to normal to edit";
    }
  }

  var views = buildViews();
  var own = null;
  var editors = document.querySelector(".nt-bar");

  if (editors) {
    lockEditText(editors);
    editors.appendChild(views);
  } else {
    own = document.createElement("div");
    own.className = "nt-bar";
    own.setAttribute("data-nt-ui", "");
    own.appendChild(views);
    document.body.appendChild(own);

    new MutationObserver(function (records, observer) {
      records.forEach(function (record) {
        record.addedNodes.forEach(function (node) {
          if (node === own || !node.classList || !node.classList.contains("nt-bar")) return;
          lockEditText(node);
          node.appendChild(views);
          own.remove();
          observer.disconnect();
        });
      });
    }).observe(document.body, { childList: true });
  }
})();
