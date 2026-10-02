/* Window Light — course site behaviour. No dependencies. */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  /* ------------------------------------------------------------ settings */
  /* Instalments: how many, and the extra charged for spreading the cost. */
  var INSTALMENTS = 3, INSTALMENT_FEE = 0.05;
  /* Discount codes: a percentage or a fixed amount in pounds. */
  var CODES = { WINDOW10: { percent: 10, label: "WINDOW10 (10% off)" }, FRIEND20: { amount: 20, label: "FRIEND20 (£20 off)" } };
  /* Cohorts: name shown in the notice bar, enrolment close and seats left.
     These match the cohort options on enrol.html. */
  var COHORTS = [
    { id: "nov", name: "2 November", closes: "2026-10-30T23:59:00+00:00", left: 9, cap: 40 },
    { id: "jan", name: "11 January", closes: "2027-01-08T23:59:00+00:00", left: 23, cap: 40 },
    { id: "mar", name: "8 March", closes: "2027-03-05T23:59:00+00:00", left: 40, cap: 40 }
  ];
  var LIVE_LENGTH_MINS = 60;

  var money = function (n) { return "£" + (Math.round(n * 100) / 100).toFixed(n % 1 ? 2 : 0); };
  var params = new URLSearchParams(location.search);

  var toggle = $(".nav-toggle"), nav = $("#nav");
  if (toggle && nav) toggle.addEventListener("click", function () { toggle.setAttribute("aria-expanded", String(nav.classList.toggle("is-open"))); });
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add("is-in"); });

  /* ------------------------------------------------------ notice countdown */
  var next = COHORTS.filter(function (c) { return new Date(c.closes) > new Date(); })[0];
  var notice = $("[data-notice]"), cd = $("[data-countdown]");
  if (notice && next) {
    notice.innerHTML = "<b>Next cohort starts " + next.name + "</b> · " + next.left + " of " + next.cap + " places left";
    var tick = function () {
      var ms = new Date(next.closes) - new Date();
      if (ms <= 0) { cd.textContent = "Enrolment has closed"; return; }
      var d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60;
      cd.textContent = "Enrolment closes in " + (d ? d + "d " : "") + h + "h " + m + "m";
    };
    tick(); setInterval(tick, 30000);
  } else if (notice) { notice.innerHTML = "<b>Self-paced enrolment is open</b> · start today"; }

  /* ---------------------------------------------------------- free lesson */
  var modal = $("#lesson");
  if (modal && modal.showModal) {
    $$("[data-open-lesson]").forEach(function (b) { b.addEventListener("click", function () { modal.showModal(); }); });
    modal.addEventListener("click", function (e) { if (e.target === modal || e.target.closest("[data-close]")) modal.close(); });
  }

  /* --------------------------------------------------------- before/after */
  $$("[data-compare]").forEach(function (input) {
    var box = input.closest(".compare");
    var set = function () { box.style.setProperty("--split", input.value + "%"); };
    input.addEventListener("input", set); set();
  });

  /* ------------------------------------------------------------- pricing */
  var payRadios = $$('.pay-toggle input[name="pay"]');
  if (payRadios.length) {
    var paintPlans = function () {
      var split = $('.pay-toggle input[name="pay"]:checked').value === "split";
      $$("[data-plan]").forEach(function (p) {
        var price = Number(p.getAttribute("data-price"));
        $("[data-plan-price]", p).innerHTML = split ? money(price * (1 + INSTALMENT_FEE) / INSTALMENTS) + " <small>/ month</small>" : "£" + price;
        $("[data-plan-sub]", p).textContent = split ? INSTALMENTS + " monthly payments" : "One payment";
      });
    };
    payRadios.forEach(function (r) { r.addEventListener("change", paintPlans); });
    paintPlans();
  }
  $$("[data-news]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = $("input", f).value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { $("input", f).focus(); $("input", f).placeholder = "Enter a valid email"; $("input", f).value = ""; return; }
      f.innerHTML = "<p style='margin:0;color:#f3d27a'>Sent! Check your inbox for the cheat sheet.</p>";
    });
  });

  /* ------------------------------------------------------------ syllabus */
  var boxes = $$("[data-lesson]");
  if (boxes.length) {
    var KEY = "windowlight-progress";
    var done;
    try { done = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { done = {}; }
    var ring = $("[data-ring]"), C = 2 * Math.PI * 64;
    var paint = function () {
      var n = 0;
      boxes.forEach(function (b) {
        b.checked = !!done[b.getAttribute("data-lesson")];
        b.closest(".lesson").classList.toggle("is-done", b.checked);
        if (b.checked) n++;
      });
      var pct = Math.round(n / boxes.length * 100);
      $("[data-progress]").textContent = pct + "%";
      ring.setAttribute("stroke-dasharray", (C * pct / 100).toFixed(1) + " " + C.toFixed(1));
      $$(".weektabs button").forEach(function (t) {
        var w = t.getAttribute("data-week");
        var all = boxes.filter(function (b) { return b.getAttribute("data-lesson").split("-")[0] === w; });
        var c = all.filter(function (b) { return b.checked; }).length;
        $("small", t).textContent = c === all.length ? "Done ✓" : c + "/" + all.length;
        t.classList.toggle("is-done", c === all.length);
      });
    };
    boxes.forEach(function (b) {
      b.addEventListener("change", function () {
        done[b.getAttribute("data-lesson")] = b.checked;
        try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) { /* private mode */ }
        paint();
      });
    });
    $("[data-reset]").addEventListener("click", function () { done = {}; try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } paint(); });
    var tabs = $$(".weektabs [role='tab']");
    var pick = function (t) {
      tabs.forEach(function (x) { var on = x === t; x.setAttribute("aria-selected", String(on)); x.tabIndex = on ? 0 : -1; $("#" + x.getAttribute("aria-controls")).hidden = !on; });
    };
    tabs.forEach(function (t, i) {
      t.tabIndex = i === 0 ? 0 : -1;
      t.addEventListener("click", function () { pick(t); });
      t.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var n = tabs[(i + d + tabs.length) % tabs.length]; pick(n); n.focus();
      });
    });
    paint();
  }

  /* --------------------------------------------------------------- enrol */
  var form = $("#enrol");
  if (form) {
    var applied = null;
    if (params.get("plan")) { var pr = $('input[name="plan"][value="' + params.get("plan") + '"]', form); if (pr) pr.checked = true; }
    /* Close cohorts whose enrolment has ended, and pick the first open one. */
    $$('input[name="cohort"]', form).forEach(function (c) {
      var closed = new Date(c.getAttribute("data-close")) < new Date();
      c.disabled = closed;
      if (closed) $(".seats", c.parentNode).textContent = "Enrolment closed";
    });
    var firstOpen = $('input[name="cohort"]:not(:disabled)', form);
    if (firstOpen) firstOpen.checked = true;

    var totals = function () {
      var plan = $('input[name="plan"]:checked', form), price = Number(plan.getAttribute("data-price"));
      var disc = 0;
      if (applied) disc = applied.percent ? price * applied.percent / 100 : Math.min(price, applied.amount);
      var base = price - disc;
      var split = $('input[name="pay"]:checked', form).value === "split";
      var fee = split ? base * INSTALMENT_FEE : 0;
      /* Instalments are rounded to the penny, and the total follows them. */
      var each = Math.round((base + fee) / INSTALMENTS * 100) / 100;
      return { plan: plan, price: price, disc: disc, base: base, fee: fee, split: split, total: split ? each * INSTALMENTS : base, today: split ? each : base };
    };
    var paint2 = function () {
      var t = totals(), self = t.plan.value === "self";
      $("[data-cohorts]").hidden = self;
      $("[data-o-plan]").textContent = $("b", t.plan.parentNode).textContent + " plan";
      $("[data-o-price]").textContent = money(t.price);
      var c = $('input[name="cohort"]:checked', form);
      $("[data-o-start]").textContent = self ? "Today" : c ? c.getAttribute("data-label").split(" – ")[0] : "Choose a cohort";
      $("[data-o-disc-row]").hidden = !applied;
      if (applied) { $("[data-o-disc-label]").textContent = applied.label; $("[data-o-disc]").textContent = "−" + money(t.disc); }
      $("[data-o-fee]").textContent = money(t.fee);
      $("[data-o-today]").textContent = money(t.today);
      $("[data-o-note]").textContent = t.split ? "Then " + money(t.today) + " a month for two more months. Total " + money(t.total) + "." : "Prices include VAT. 30-day money-back guarantee.";
      $("[data-pay-full]").textContent = money(t.base);
      $("[data-pay-split]").textContent = money(t.base * (1 + INSTALMENT_FEE) / INSTALMENTS) + " × " + INSTALMENTS;
    };
    form.addEventListener("change", paint2);
    $("[data-apply]").addEventListener("click", function () {
      var code = $("#e-code").value.trim().toUpperCase(), err = $('[data-error="code"]', form);
      if (!code) { applied = null; err.textContent = ""; paint2(); return; }
      applied = CODES[code] || null;
      err.style.color = applied ? "#2f7a4a" : "";
      err.textContent = applied ? "Code applied." : "That code isn’t valid.";
      paint2();
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      $$("[required]", form).forEach(function (input) {
        var v = input.value.trim();
        var bad = !v || (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v));
        input.setAttribute("aria-invalid", String(bad));
        $('[data-error="' + input.name + '"]', form).textContent = bad ? input.getAttribute("data-message") : "";
        if (bad && ok) { input.focus(); ok = false; }
      });
      var t = totals(), cohort = $('input[name="cohort"]:checked', form);
      if (t.plan.value !== "self" && !cohort) { $('[data-error="cohort"]', form).textContent = "Choose a cohort, or pick the self-paced plan."; ok = false; }
      if (!ok) return;
      var name = $("#e-name").value.trim().split(" ")[0];
      $("[data-done-title]").textContent = "Welcome, " + name + ".";
      $("[data-done-text]").textContent = t.plan.value === "self"
        ? "Your login is on its way to " + $("#e-email").value.trim() + ". Week one is waiting for you now."
        : "You’re in the " + cohort.getAttribute("data-label") + " cohort. Your login is on its way to " + $("#e-email").value.trim() + ", and week one is open now so you can get ahead.";
      var ics = $("[data-ics]");
      ics.hidden = t.plan.value === "self";
      ics.onclick = function () {
        var start = new Date(cohort.getAttribute("data-start")), end = new Date(start.getTime() + LIVE_LENGTH_MINS * 6e4);
        var f = function (d) { return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); };
        var body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Window Light//Course//EN", "BEGIN:VEVENT", "UID:" + Date.now() + "@windowlight", "DTSTAMP:" + f(new Date()),
          "DTSTART:" + f(start), "DTEND:" + f(end), "SUMMARY:Window Light: welcome live session", "DESCRIPTION:Your first live session. The link arrives by email the day before.", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
        var a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
        a.download = "window-light-first-session.ics";
        document.body.appendChild(a); a.click(); a.remove();
      };
      form.hidden = true;
      var d = $("#enrolled"); d.hidden = false; d.focus();
    });
    paint2();
  }
})();
