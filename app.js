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

  // ---------- Poster maker: cut-paper collage in the hero ----------
  var KINDS = { stamp: "fill", scallop: "fill", circle: "fill", half: "fill", arch: "fill", burst: "fill", star: "fill",
    tri: "fill", blob: "fill", strip: "fill", zig: "stroke", wave: "stroke", ring: "stroke" };
  var NAMES = { stamp: "date stamp", scallop: "scallop", circle: "circle", half: "half moon", arch: "arch", burst: "burst",
    star: "star", tri: "triangle", blob: "blob", strip: "paper strip", zig: "zigzag", wave: "wave", ring: "ring" };
  var HEX = { butter: "#F4E8AB", lilac: "#C7AFE8", forest: "#183F35" };
  var CYCLE = ["butter", "lilac", "forest", "butter-line", "lilac-line"];
  var NS = "http://www.w3.org/2000/svg";

  var maker = $("maker");
  var svg = $("maker-svg");
  var layer = $("pieces");
  var live = $("maker-live");
  var tools = maker ? maker.querySelector(".tools") : null;
  var selected = null;
  var initialMarkup = layer ? layer.innerHTML : "";
  var active = false;

  function say(msg) { if (live) { live.textContent = ""; setTimeout(function () { live.textContent = msg; }, 30); } }
  function num(el, k) { return parseFloat(el.getAttribute("data-" + k)); }
  function colorName(c) { return c.replace("-line", " outline"); }
  function label(el) { return colorName(el.getAttribute("data-color")) + " " + NAMES[el.getAttribute("data-shape")]; }

  function paint(use, kind, color) {
    var base = color.split("-")[0], line = /-line$/.test(color), c = HEX[base];
    ["fill", "stroke", "stroke-width", "stroke-dasharray", "stroke-linecap", "stroke-linejoin"].forEach(function (a) { use.removeAttribute(a); });
    if (kind === "fill") {
      if (line) { use.setAttribute("fill", "none"); use.setAttribute("stroke", c); use.setAttribute("stroke-width", "6"); use.setAttribute("stroke-linejoin", "round"); }
      else use.setAttribute("fill", c);
    } else {
      use.setAttribute("fill", "none"); use.setAttribute("stroke", c); use.setAttribute("stroke-width", "7");
      use.setAttribute("stroke-linecap", "round"); use.setAttribute("stroke-linejoin", "round");
      if (line) use.setAttribute("stroke-dasharray", "10 9");
    }
  }
  function place(el) {
    el.setAttribute("transform", "translate(" + num(el, "x") + " " + num(el, "y") + ") rotate(" + num(el, "r") + ") scale(" + num(el, "s") + ")");
  }
  function set(el, k, v) { el.setAttribute("data-" + k, Math.round(v * 100) / 100); place(el); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function prep(el) {
    el.setAttribute("tabindex", active ? "0" : "-1");
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", label(el) + ". Drag or use arrow keys to move. R rotates, plus and minus resize, C recolors, Delete removes.");
  }
  function select(el) {
    if (selected === el) return;
    if (selected) { var old = selected.querySelector(".sel"); if (old) old.parentNode.removeChild(old); selected.classList.remove("is-selected"); }
    selected = el;
    if (tools) tools.classList.toggle("is-on", !!el);
    if (!el) return;
    el.classList.add("is-selected");
    var use = el.querySelector("use");
    var bb = use.getBBox(), pad = 8;
    var r = document.createElementNS(NS, "rect");
    r.setAttribute("class", "sel");
    r.setAttribute("x", bb.x - pad); r.setAttribute("y", bb.y - pad);
    r.setAttribute("width", bb.width + pad * 2); r.setAttribute("height", bb.height + pad * 2);
    r.setAttribute("rx", 6); r.setAttribute("fill", "none"); r.setAttribute("stroke", "#FBF7EA");
    r.setAttribute("stroke-width", "2"); r.setAttribute("stroke-dasharray", "6 5"); r.setAttribute("vector-effect", "non-scaling-stroke");
    el.appendChild(r);
  }
  function toFront(el) { layer.appendChild(el); }

  function addPiece(shape) {
    if (layer.children.length >= 40) { say("That's a full poster. Remove a piece to add more."); return; }
    var colors = ["butter", "lilac", "butter", "lilac", "butter-line", "lilac-line"];
    var color = colors[Math.floor(Math.random() * colors.length)];
    var g = document.createElementNS(NS, "g");
    g.setAttribute("class", "piece");
    g.setAttribute("data-shape", shape); g.setAttribute("data-color", color);
    g.setAttribute("data-x", Math.round(110 + Math.random() * 200));
    g.setAttribute("data-y", Math.round(80 + Math.random() * 160));
    g.setAttribute("data-r", Math.round(Math.random() * 60 - 30));
    g.setAttribute("data-s", (0.7 + Math.random() * 0.6).toFixed(2));
    var inner = document.createElementNS(NS, "g");
    inner.setAttribute("class", "pop is-new");
    var use = document.createElementNS(NS, "use");
    use.setAttribute("href", "#sh-" + shape);
    paint(use, KINDS[shape], color);
    inner.appendChild(use); g.appendChild(inner); layer.appendChild(g);
    place(g); prep(g); select(g);
    say("Added a " + label(g) + ".");
    return g;
  }

  function act(name) {
    var el = selected;
    if (name === "save") return savePoster();
    if (name === "shuffle") {
      Array.prototype.forEach.call(layer.children, function (p) {
        p.setAttribute("data-x", Math.round(60 + Math.random() * 300));
        p.setAttribute("data-y", Math.round(50 + Math.random() * 220));
        p.setAttribute("data-r", Math.round(Math.random() * 90 - 45));
        place(p);
      });
      select(null); say("Shuffled."); return;
    }
    if (name === "reset") { layer.innerHTML = initialMarkup; Array.prototype.forEach.call(layer.children, prep); select(null); say("Back to the original collage."); return; }
    if (!el) { say("Pick a shape first."); return; }
    if (name === "rotate") set(el, "r", (num(el, "r") + 15) % 360);
    if (name === "bigger") set(el, "s", clamp(num(el, "s") * 1.15, 0.3, 3));
    if (name === "smaller") set(el, "s", clamp(num(el, "s") / 1.15, 0.3, 3));
    if (name === "color") {
      var next = CYCLE[(CYCLE.indexOf(el.getAttribute("data-color")) + 1) % CYCLE.length];
      el.setAttribute("data-color", next);
      paint(el.querySelector("use"), KINDS[el.getAttribute("data-shape")], next);
      prep(el); say("Now " + colorName(next) + ".");
    }
    if (name === "front") { toFront(el); el.focus && active && el.focus(); }
    if (name === "remove") {
      var nxt = el.nextElementSibling || el.previousElementSibling;
      select(null); layer.removeChild(el); say("Removed.");
      if (nxt && active) { select(nxt); nxt.focus(); }
      return;
    }
    if (name !== "remove") { var keep = el; select(null); select(keep); }
  }

  function setActive(on) {
    active = on;
    maker.classList.toggle("is-active", on);
    if (on) { svg.removeAttribute("aria-hidden"); svg.setAttribute("role", "group"); svg.setAttribute("aria-label", "Collage canvas"); }
    else { svg.setAttribute("aria-hidden", "true"); svg.removeAttribute("role"); select(null); }
    Array.prototype.forEach.call(layer.children, prep);
  }

  if (maker && svg && layer) {
    Array.prototype.forEach.call(layer.children, prep);
    // The paste-in animation plays once. Strip it after so moving the maker (phone sheet) doesn't replay it.
    var settle = function () { Array.prototype.forEach.call(layer.querySelectorAll(".paste"), function (n) { n.classList.remove("paste", "p1", "p2", "p3", "p4", "p5"); }); };
    setTimeout(settle, 1400);
    layer.addEventListener("animationend", function (e) { e.target.classList.remove("is-new"); });

    maker.querySelector(".tray").addEventListener("click", function (e) {
      var b = e.target.closest("[data-add]"); if (b && active) addPiece(b.getAttribute("data-add"));
    });
    maker.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]"); if (b && active) act(b.getAttribute("data-act"));
    });

    // Drag with mouse, pen or finger
    var drag = null;
    var toSvg = function (e) {
      var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      return pt.matrixTransform(svg.getScreenCTM().inverse());
    };
    svg.addEventListener("pointerdown", function (e) {
      if (!active) return;
      var el = e.target.closest(".piece");
      if (!el) { select(null); return; }
      var p = toSvg(e);
      toFront(el); select(el);
      drag = { el: el, ox: p.x - num(el, "x"), oy: p.y - num(el, "y"), id: e.pointerId, moved: false };
      el.classList.add("is-dragging");
      try { svg.setPointerCapture(e.pointerId); } catch (err) { /* capture is optional */ }
      e.preventDefault();
    });
    svg.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var p = toSvg(e);
      drag.moved = true;
      drag.el.setAttribute("data-x", Math.round(clamp(p.x - drag.ox, -20, 440)));
      drag.el.setAttribute("data-y", Math.round(clamp(p.y - drag.oy, -20, 340)));
      place(drag.el);
    });
    var end = function () { if (drag) { drag.el.classList.remove("is-dragging"); drag = null; } };
    svg.addEventListener("pointerup", end);
    svg.addEventListener("pointercancel", end);
    svg.addEventListener("dblclick", function (e) { if (active && e.target.closest(".piece")) act("color"); });

    // Keyboard on a focused piece
    svg.addEventListener("focusin", function (e) { var el = e.target.closest(".piece"); if (el && active) select(el); });
    svg.addEventListener("keydown", function (e) {
      var el = e.target.closest(".piece"); if (!el || !active) return;
      var step = e.shiftKey ? 20 : 6, k = e.key, used = true;
      if (k === "ArrowLeft") set(el, "x", num(el, "x") - step);
      else if (k === "ArrowRight") set(el, "x", num(el, "x") + step);
      else if (k === "ArrowUp") set(el, "y", num(el, "y") - step);
      else if (k === "ArrowDown") set(el, "y", num(el, "y") + step);
      else if (k === "r" || k === "R") set(el, "r", (num(el, "r") + (e.shiftKey ? -15 : 15)) % 360);
      else if (k === "+" || k === "=") act("bigger");
      else if (k === "-" || k === "_") act("smaller");
      else if (k === "c" || k === "C") act("color");
      else if (k === "Delete" || k === "Backspace") act("remove");
      else if (k === "Escape") { select(null); el.blur(); }
      else used = false;
      if (used) e.preventDefault();
    });

    // Desktop: the maker lives in the hero. Phones: it opens in a full-screen sheet and the result comes back to the hero.
    var home = maker.parentNode, homeNext = maker.nextSibling;
    var dialog = $("maker-dialog"), slot = $("maker-slot");
    var syncMode = function () { if (!dialog || !dialog.open) setActive(desktop.matches); };
    syncMode();
    if (desktop.addEventListener) desktop.addEventListener("change", syncMode);

    var openBtn = $("maker-open");
    if (openBtn && dialog && dialog.showModal) {
      openBtn.addEventListener("click", function () {
        settle();
        slot.appendChild(maker); setActive(true); dialog.showModal(); say("Collage maker open.");
      });
      var close = function () { if (dialog.open) dialog.close(); };
      $("maker-close").addEventListener("click", close);
      dialog.addEventListener("close", function () {
        home.insertBefore(maker, homeNext); setActive(desktop.matches); openBtn.focus();
      });
    } else if (openBtn) { openBtn.hidden = true; }
  }

  // ---------- Save the collage as a poster PNG ----------
  function savePoster() {
    var W = 1080, H = 1350, K = 2.4, OX = 36, OY = 70;
    var canvas = document.createElement("canvas"); canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext("2d");
    var clone = svg.cloneNode(true);
    clone.removeAttribute("class"); clone.setAttribute("width", 420); clone.setAttribute("height", 320);
    Array.prototype.forEach.call(clone.querySelectorAll(".sel, text, .mat"), function (n) { n.parentNode.removeChild(n); });
    var src = new XMLSerializer().serializeToString(clone);
    var img = new Image();
    var url = URL.createObjectURL(new Blob([src], { type: "image/svg+xml;charset=utf-8" }));
    say("Making your poster.");
    var fontsReady = document.fonts && document.fonts.load ? Promise.all([
      document.fonts.load('800 100px "Bricolage"'), document.fonts.load('600 30px "Instrument"')
    ]) : Promise.resolve();
    img.onload = function () {
      fontsReady.then(function () {
        ctx.fillStyle = "#183F35"; ctx.fillRect(0, 0, W, H);
        ctx.drawImage(img, OX, OY, 420 * K, 320 * K);
        URL.revokeObjectURL(url);
        // Stamp text, drawn with the page fonts at each stamp's position
        Array.prototype.forEach.call(layer.querySelectorAll('.piece[data-shape="stamp"]'), function (p) {
          ctx.save();
          ctx.translate(OX + num(p, "x") * K, OY + num(p, "y") * K);
          ctx.rotate(num(p, "r") * Math.PI / 180);
          ctx.scale(num(p, "s") * K, num(p, "s") * K);
          ctx.fillStyle = "#183F35"; ctx.textAlign = "center";
          ctx.font = '700 17px "Bricolage", Arial, sans-serif'; ctx.fillText("FOUNDRY YARD, LA", 0, -22); ctx.fillText("2026", 0, 54);
          ctx.font = 'condensed 800 52px "Bricolage", Arial, sans-serif'; ctx.fillText("DEC 5-6", 0, 26);
          ctx.restore();
        });
        // Wordmark, printed in two passes like the site
        ctx.textAlign = "left";
        var size = 250;
        ctx.font = "condensed 800 " + size + 'px "Bricolage", Arial, sans-serif';
        while (ctx.measureText("FIELDWORK").width > W - 96 && size > 120) { size -= 6; ctx.font = "condensed 800 " + size + 'px "Bricolage", Arial, sans-serif'; }
        var y = 1080;
        ctx.fillStyle = "#C7AFE8"; ctx.fillText("FIELDWORK", 48 + size * 0.03, y + size * 0.026);
        ctx.fillStyle = "#F4E8AB"; ctx.fillText("FIELDWORK", 48, y);
        ctx.fillStyle = "#C7AFE8"; ctx.font = '700 34px "Bricolage", Arial, sans-serif';
        if ("letterSpacing" in ctx) ctx.letterSpacing = "12px";
        ctx.fillText("FESTIVAL", 52, y + 62);
        if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
        ctx.fillStyle = "#F4E8AB"; ctx.font = '600 32px "Instrument", Arial, sans-serif';
        ctx.fillText("December 5 and 6, 2026. Foundry Yard, Los Angeles.", 52, y + 126);
        ctx.fillStyle = "#C7AFE8"; ctx.font = '600 22px "Instrument", Arial, sans-serif';
        ctx.fillText("Fictional event. Concept demo for Arrived.", 52, H - 44);
        canvas.toBlob(function (blob) {
          var a = document.createElement("a");
          a.href = URL.createObjectURL(blob); a.download = "my-fieldwork-poster.png";
          document.body.appendChild(a); a.click();
          setTimeout(function () { URL.revokeObjectURL(a.href); a.parentNode.removeChild(a); }, 1500);
          say("Poster saved.");
        }, "image/png");
      });
    };
    img.src = url;
  }
})();
