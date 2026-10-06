/* Fieldwork Festival - day switch, pass picker, demo confirmation, mobile pass bar. No dependencies. */
(function () {
  "use strict";

  function $(id) { return document.getElementById(id); }
  function esc(v) {
    return String(v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ---------- Day switch (phones and tablets) ----------
  var dayBtns = Array.prototype.slice.call(document.querySelectorAll(".day-btn"));
  dayBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      dayBtns.forEach(function (b) {
        var on = b === btn;
        b.setAttribute("aria-pressed", String(on));
        $(b.getAttribute("aria-controls")).classList.toggle("is-active", on);
      });
      // Keep the top of the newly shown day in view when the switch is stuck to the top.
      var sched = $("schedule");
      var sw = document.querySelector(".day-switch");
      if (sw && sw.getBoundingClientRect().top <= 1 && sched) {
        var target = $(btn.getAttribute("aria-controls"));
        var y = target.getBoundingClientRect().top + window.pageYOffset - sw.offsetHeight - 8;
        window.scrollTo({ top: y });
      }
    });
  });

  // ---------- Pass picker ----------
  var form = $("pass-form");
  var PRICES = { weekend: "$80", day: "$45" };

  function currentPass() {
    var el = form.querySelector('input[name="pass"]:checked');
    return el ? el.value : "weekend";
  }

  function syncPass() {
    var p = currentPass();
    $("day-pick").hidden = p !== "day";
    $("pass-submit").textContent = p === "weekend"
      ? "Reserve a weekend pass, $80"
      : "Reserve a single-day pass, $45";
  }

  function setError(field, msgEl, msg) {
    if (field) field.setAttribute("aria-invalid", msg ? "true" : "false");
    msgEl.textContent = msg || "";
  }

  if (form) {
    form.addEventListener("change", function (e) {
      if (e.target.name === "pass") syncPass();
      if (e.target.name === "day") setError(null, $("e-day"), "");
    });
    syncPass();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var p = currentPass();
      var name = form.elements.name;
      var email = form.elements.email;
      var first = null;

      var dayEl = form.querySelector('input[name="day"]:checked');
      if (p === "day") {
        var dMsg = dayEl ? "" : "Pick Saturday or Sunday.";
        setError(null, $("e-day"), dMsg);
        if (dMsg) first = form.querySelector('input[name="day"]');
      }

      var nMsg = name.value.trim() ? "" : "Enter your name.";
      setError(name, $("e-name"), nMsg);
      if (nMsg && !first) first = name;

      var ev = email.value.trim();
      var eMsg = !ev ? "Enter your email." : (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ev) ? "" : "Check the email, for example name@example.com.");
      setError(email, $("e-email"), eMsg);
      if (eMsg && !first) first = email;

      if (first) { first.focus(); return; }

      var days = p === "weekend" ? "Saturday, December 5 and Sunday, December 6" : dayEl.value;
      $("pass-output").innerHTML =
        '<div class="confirm" role="status" tabindex="-1" id="confirm">' +
          '<div class="confirm-head"><p>Demo confirmation</p><h3>See you at Foundry Yard.</h3></div>' +
          '<div class="confirm-body">' +
            "<dl>" +
              "<dt>Name</dt><dd>" + esc(name.value.trim()) + "</dd>" +
              "<dt>Pass</dt><dd>" + (p === "weekend" ? "Weekend" : "Single day") + ", " + PRICES[p] + "</dd>" +
              "<dt>Days</dt><dd>" + esc(days) + "</dd>" +
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
})();
