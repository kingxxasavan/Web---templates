/* Noor Haddad — portfolio behaviour. No dependencies. */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  /* Your time zone and city, for the local clock in the hero. */
  var TIMEZONE = "Europe/Lisbon";
  var CITY = "Lisbon";
  /* The first day you can start something new. Once it passes, the hero
     says "Available now". */
  var AVAILABLE_FROM = new Date("2026-11-02T09:00:00Z");

  /* ---------------------------------------------------------------- theme */
  var root = document.documentElement;
  var themeBtn = $(".theme-toggle");
  var paintTheme = function () {
    var dark = root.getAttribute("data-theme") === "dark";
    themeBtn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  };
  if (themeBtn) {
    paintTheme();
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("noor-theme", next); } catch (e) { /* private mode */ }
      paintTheme();
    });
  }

  /* ----------------------------------------------------------- header/nav */
  var header = $(".header");
  var onScroll = function () { header.classList.toggle("is-stuck", window.scrollY > 8); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  var toggle = $(".nav-toggle"), nav = $("#nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () { toggle.setAttribute("aria-expanded", String(nav.classList.toggle("is-open"))); });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { nav.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); }); });
  }

  /* -------------------------------------------------------------- reveals */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add("is-in"); });

  /* ---------------------------------------------------------- availability */
  var avail = $("[data-availability]");
  if (avail) {
    var now = new Date();
    if (now >= AVAILABLE_FROM) avail.textContent = "Available now";
    else {
      var opts = { month: "long" };
      if (AVAILABLE_FROM.getFullYear() !== now.getFullYear()) opts.year = "numeric";
      avail.textContent = "Booking from " + AVAILABLE_FROM.toLocaleDateString("en-GB", opts);
    }
  }

  /* ----------------------------------------------------------------- clock */
  /* Minutes ahead of UTC in a named time zone, right now. */
  var offsetOf = function (tz, d) {
    var p = {};
    new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" })
      .formatToParts(d).forEach(function (x) { p[x.type] = Number(x.value); });
    var asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
    return Math.round((asUtc - d.getTime()) / 6e4 / 15) * 15;
  };
  var clock = $("[data-clock]"), diff = $("[data-clock-diff]");
  if (clock) {
    var tick = function () {
      var d = new Date();
      try {
        clock.textContent = d.toLocaleTimeString("en-GB", { timeZone: TIMEZONE, hour: "2-digit", minute: "2-digit" }) + " in " + CITY;
        var mins = offsetOf(TIMEZONE, d) + d.getTimezoneOffset();
        var h = Math.abs(mins) / 60;
        var hrs = (h % 1 ? h.toFixed(1) : h) + (h === 1 ? " hour " : " hours ");
        diff.textContent = mins === 0 ? "Same time as you" : hrs + (mins > 0 ? "ahead of you" : "behind you");
      } catch (e) { clock.textContent = CITY; }
    };
    tick();
    setInterval(tick, 15000);
  }

  /* ---------------------------------------------------------- work filter */
  var chips = $$("[data-filter]");
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      var f = c.getAttribute("data-filter");
      chips.forEach(function (x) { x.setAttribute("aria-pressed", String(x === c)); });
      $$(".work-card").forEach(function (card) {
        card.hidden = f !== "all" && card.getAttribute("data-cat") !== f;
        if (!card.hidden) card.classList.add("is-in");
      });
    });
  });

  /* -------------------------------------------------------- project detail */
  var dialog = $("#detail");
  if (dialog && dialog.showModal) {
    var body = $("[data-dialog-body]", dialog);
    $$("[data-detail]").forEach(function (card) {
      card.addEventListener("click", function (e) {
        var tpl = document.getElementById("detail-" + card.getAttribute("data-detail"));
        if (!tpl) return;
        e.preventDefault();
        body.innerHTML = "";
        body.appendChild(tpl.content.cloneNode(true));
        dialog.showModal();
      });
    });
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog || e.target.closest("[data-close]")) dialog.close();
    });
  }

  /* ------------------------------------------------------------ copy email */
  var copy = $("[data-copy]");
  if (copy) copy.addEventListener("click", function () {
    var email = $("[data-email]").textContent;
    var done = function () { copy.textContent = "Copied"; setTimeout(function () { copy.textContent = "Copy"; }, 1800); };
    if (navigator.clipboard) navigator.clipboard.writeText(email).then(done, function () { location.href = "mailto:" + email; });
    else location.href = "mailto:" + email;
  });

  /* --------------------------------------------------------- enquiry form */
  var form = $("#enquiry");
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    var needs = $$('input[name="need"]:checked', form).map(function (i) { return i.value; });
    $('[data-error="need"]', form).textContent = needs.length ? "" : "Pick at least one, even if it’s “Something else”.";
    if (!needs.length) ok = false;
    $$("[required]", form).forEach(function (input) {
      var v = input.value.trim();
      var bad = !v || (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v));
      input.setAttribute("aria-invalid", String(bad));
      $('[data-error="' + input.name + '"]', form).textContent = bad ? input.getAttribute("data-message") : "";
      if (bad) ok = false;
    });
    if (!ok) { var first = $('[aria-invalid="true"]', form) || $('input[name="need"]', form); first.focus(); return; }
    var name = $("#f-name").value.trim().split(" ")[0];
    $("[data-sent-text]").textContent = "Thanks " + name + ". I’ll reply about your " + needs.join(" and ").toLowerCase() + " project within two working days.";
    form.hidden = true;
    var sent = $("#sent");
    sent.hidden = false;
    sent.focus();
  });

  /* ------------------------------------------------------- metric counters */
  var counters = $$("[data-count]");
  var run = function (el) {
    var to = Number(el.getAttribute("data-count")), dec = Number(el.getAttribute("data-decimals") || 0);
    var pre = el.getAttribute("data-prefix") || "", suf = el.getAttribute("data-suffix") || "";
    var start = null;
    var step = function (t) {
      if (!start) start = t;
      var k = Math.min(1, (t - start) / 1400);
      var eased = 1 - Math.pow(1 - k, 3);
      el.textContent = pre + (to * eased).toFixed(dec) + suf;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (counters.length && "IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { run(e.target); co.unobserve(e.target); } });
    }, { threshold: .6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* ----------------------------------------------------- before and after */
  $$("[data-compare]").forEach(function (input) {
    var box = input.closest(".compare");
    var set = function () { box.style.setProperty("--split", input.value + "%"); };
    input.addEventListener("input", set);
    set();
  });

  /* ------------------------------------------------------------------ CV */
  $$("[data-print]").forEach(function (b) { b.addEventListener("click", function () { window.print(); }); });
})();
