/* Fieldwork Festival - day switch, speaker/schedule links, pass matrix with previews,
   demo confirmation, mobile pass bar, rearrangeable hero collage. No dependencies. */
(function () {
  "use strict";

  function $(id) { return document.getElementById(id); }
  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(v) {
    return String(v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  var desktop = window.matchMedia("(min-width: 960px)");

  // ---------- Day switch (phones and tablets) ----------
  var dayBtns = all(".day-btn");
  function activateDay(dayId) {
    dayBtns.forEach(function (b) {
      var on = b.getAttribute("aria-controls") === dayId;
      b.setAttribute("aria-pressed", String(on));
      $(b.getAttribute("aria-controls")).classList.toggle("is-active", on);
    });
  }
  dayBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("aria-controls");
      activateDay(id);
      var sw = document.querySelector(".day-switch");
      if (sw && sw.getBoundingClientRect().top <= 1) {
        var y = $(id).getBoundingClientRect().top + window.pageYOffset - sw.offsetHeight - 8;
        window.scrollTo({ top: y });
      }
    });
  });

  // Links from speakers to a schedule slot: show that slot's day first.
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#sat-"], a[href^="#sun-"]');
    if (!a) return;
    var slot = document.getElementById(a.getAttribute("href").slice(1));
    var day = slot && slot.closest(".day");
    if (day) activateDay(day.id);
  });

  // ---------- Pass matrix ----------
  var form = $("pass-form");
  var matrix = $("matrix");
  var PASSES = {
    weekend: { name: "Weekend", price: "$80", days: "Saturday, December 5 and Sunday, December 6", btn: "Reserve a weekend pass, $80" },
    sat: { name: "Saturday", price: "$45", days: "Saturday, December 5", btn: "Reserve a Saturday pass, $45" },
    sun: { name: "Sunday", price: "$45", days: "Sunday, December 6", btn: "Reserve a Sunday pass, $45" }
  };

  function currentPass() {
    var el = form.querySelector('input[name="pass"]:checked');
    return el ? el.value : "weekend";
  }
  function syncPass() {
    var p = currentPass();
    matrix.setAttribute("data-sel", p);
    $("pass-submit").textContent = PASSES[p].btn;
  }

  // Previews: side pane on desktop (hover, focus, click), inline row on phones (tap).
  var pane = $("preview");
  var rows = all(".m-row[data-row]");
  rows.forEach(function (r) { $("pv-" + r.getAttribute("data-row")).hidden = true; });

  function showInPane(row) {
    if (!pane) return;
    var src = $("pv-" + row.getAttribute("data-row")).querySelector(".pv");
    pane.innerHTML = src.outerHTML;
    rows.forEach(function (r) { r.classList.toggle("is-previewed", r === row); });
  }
  rows.forEach(function (row) {
    var btn = row.querySelector(".m-label");
    var pv = $("pv-" + row.getAttribute("data-row"));
    row.addEventListener("mouseenter", function () { if (desktop.matches) showInPane(row); });
    // Keep the pane filled if the window is widened past the desktop breakpoint.
    btn.addEventListener("focus", function () { if (desktop.matches) showInPane(row); });
    btn.addEventListener("click", function () {
      if (desktop.matches) { showInPane(row); return; }
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      pv.hidden = open;
    });
  });
  if (rows.length && desktop.matches) showInPane(rows[0]);

  desktop.addEventListener && desktop.addEventListener("change", function (e) { if (e.matches && rows.length) showInPane(rows[0]); });

  function setError(field, msgEl, msg) {
    if (field) field.setAttribute("aria-invalid", msg ? "true" : "false");
    msgEl.textContent = msg || "";
  }

  if (form) {
    form.addEventListener("change", function (e) { if (e.target.name === "pass") syncPass(); });
    syncPass();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var p = PASSES[currentPass()];
      var name = form.elements.name;
      var email = form.elements.email;
      var first = null;

      var nMsg = name.value.trim() ? "" : "Enter your name.";
      setError(name, $("e-name"), nMsg);
      if (nMsg) first = name;

      var ev = email.value.trim();
      var eMsg = !ev ? "Enter your email." : (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ev) ? "" : "Check the email, for example name@example.com.");
      setError(email, $("e-email"), eMsg);
      if (eMsg && !first) first = email;

      if (first) { first.focus(); return; }

      $("pass-output").innerHTML =
        '<div class="confirm" role="status" tabindex="-1" id="confirm">' +
          '<div class="confirm-head"><p>Demo confirmation</p><h3>See you at Foundry Yard.</h3></div>' +
          '<div class="confirm-body">' +
            "<dl>" +
              "<dt>Name</dt><dd>" + esc(name.value.trim()) + "</dd>" +
              "<dt>Pass</dt><dd>" + p.name + ", " + p.price + "</dd>" +
              "<dt>Days</dt><dd>" + p.days + "</dd>" +
              "<dt>Hours</dt><dd>10:00 AM to 5:00 PM Pacific</dd>" +
            "</dl>" +
            "<p>Workshops are first come, first served. Food is sold separately.</p>" +
            "<p><strong>Demo only.</strong> Nothing was sent or saved.</p>" +
            '<button type="button" class="btn btn-forest btn-sm" id="again">Start over</button>' +
          "</div>" +
        "</div>";
      $("confirm").focus();
      $("again").addEventListener("click", function () { window.location.reload(); });
    });
  }

  // ---------- Mobile pass bar: hidden over the hero and the passes section ----------
  var bar = $("pass-bar");
  var hero = document.querySelector(".hero");
  var passes = $("passes");
  if (bar && "IntersectionObserver" in window && hero && passes) {
    var heroVisible = true, passesVisible = false;
    var update = function () { bar.classList.toggle("is-shown", !heroVisible && !passesVisible); };
    new IntersectionObserver(function (es) { heroVisible = es[0].isIntersecting; update(); }).observe(hero);
    new IntersectionObserver(function (es) { passesVisible = es[0].isIntersecting; update(); }, { rootMargin: "0px 0px -20% 0px" }).observe(passes);
  }

  // ---------- Hero collage: drag the cut-paper shapes (mouse and trackpad) ----------
  var art = document.querySelector(".hero-art");
  if (art && window.matchMedia("(pointer: fine)").matches) {
    var drag = null;
    var toSvg = function (e) {
      var pt = art.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      return pt.matrixTransform(art.getScreenCTM().inverse());
    };
    art.addEventListener("pointerdown", function (e) {
      var el = e.target.closest(".paste");
      if (!el || !desktop.matches) return;
      var group = (el.getAttribute("class").match(/\bp\d\b/) || [])[0];
      var parts = all("." + group, art);
      var p = toSvg(e);
      drag = {
        parts: parts, x: p.x, y: p.y,
        dx: parseFloat(parts[0].getAttribute("data-dx") || 0),
        dy: parseFloat(parts[0].getAttribute("data-dy") || 0)
      };
      parts.forEach(function (n) { art.appendChild(n); n.classList.add("is-dragging"); n.style.animation = "none"; });
      art.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    art.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var p = toSvg(e);
      var dx = Math.max(-260, Math.min(260, drag.dx + p.x - drag.x));
      var dy = Math.max(-200, Math.min(200, drag.dy + p.y - drag.y));
      drag.parts.forEach(function (n) {
        n.style.translate = dx + "px " + dy + "px";
        n.setAttribute("data-dx", dx); n.setAttribute("data-dy", dy);
      });
    });
    var end = function () {
      if (!drag) return;
      drag.parts.forEach(function (n) { n.classList.remove("is-dragging"); });
      drag = null;
    };
    art.addEventListener("pointerup", end);
    art.addEventListener("pointercancel", end);
  }
})();
