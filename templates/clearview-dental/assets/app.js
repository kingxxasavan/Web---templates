/* Clearview — dental practice behaviour. No dependencies. */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  /* Opening hours, Sunday first: [open, close] in decimal hours, or null. */
  var HOURS = [null, [8, 18], [8, 20], [8, 18], [8, 20], [8, 17], [9, 13]];
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var fmt = function (h) {
    var hr = Math.floor(h), m = Math.round((h - hr) * 60);
    return (hr % 12 || 12) + (m ? "." + String(m).padStart(2, "0") : "") + (hr >= 12 ? "pm" : "am");
  };
  var now = new Date(), hourNow = now.getHours() + now.getMinutes() / 60;

  var toggle = $(".nav-toggle"), nav = $("#nav");
  if (toggle && nav) toggle.addEventListener("click", function () {
    toggle.setAttribute("aria-expanded", String(nav.classList.toggle("is-open")));
  });

  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add("is-in"); });

  /* ---------------------------------------------------------------- hours */
  $$("[data-hours]").forEach(function (list) {
    list.innerHTML = "";
    [1, 2, 3, 4, 5, 6, 0].forEach(function (d) {
      var li = document.createElement("li");
      li.innerHTML = "<span>" + DAYS[d] + "</span><span>" + (HOURS[d] ? fmt(HOURS[d][0]) + " – " + fmt(HOURS[d][1]) : "Closed") + "</span>";
      if (d === now.getDay()) li.className = "is-today";
      list.appendChild(li);
    });
  });
  $$("[data-status]").forEach(function (el) {
    var t = HOURS[now.getDay()];
    var open = t && hourNow >= t[0] && hourNow < t[1];
    el.classList.toggle("is-open", !!open);
    el.textContent = open ? "Open now · until " + fmt(t[1]) : "Closed now · emergencies: 0161 555 0110";
  });

  /* ----------------------------------------------------------- treatments */
  var tabs = $$("[data-tab]");
  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      tabs.forEach(function (x) { x.setAttribute("aria-selected", String(x === t)); });
      $$("[data-panel]").forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== t.getAttribute("data-tab"); });
    });
  });

  var calc = $("#finance");
  if (calc) {
    var run = function () {
      var cost = Number($("#f-cost").value), months = Number($("#f-months").value), dep = Number($("#f-deposit").value);
      $("[data-cost]").textContent = "£" + cost.toLocaleString("en-GB");
      $("[data-months-out]").textContent = months + " months";
      var left = Math.max(0, cost - dep);
      $("[data-monthly]").textContent = "£" + (left / months).toFixed(2);
      $("[data-finance-note]").textContent = "£" + dep + " deposit, then " + months + " payments. 0% APR: you pay £" + cost.toLocaleString("en-GB") + " in total.";
    };
    calc.addEventListener("input", run);
    calc.addEventListener("submit", function (e) { e.preventDefault(); });
    run();
  }

  /* --------------------------------------------------------------- booking */
  var form = $("#booking");
  if (form) {
    var chosenDate = null, chosenTime = null;
    var dates = $("[data-dates]"), times = $("[data-times]");
    var sum = function (k, v) { var el = $('[data-sum="' + k + '"]'); if (el) el.textContent = v; };
    for (var i = 1, n = 0; n < 12 && i < 21; i++) {
      var d = new Date(now); d.setDate(d.getDate() + i);
      if (!HOURS[d.getDay()]) continue;
      var b = document.createElement("button");
      b.type = "button"; b.className = "date"; b.setAttribute("aria-pressed", "false");
      b.dataset.iso = d.toISOString().slice(0, 10);
      b.innerHTML = "<small>" + d.toLocaleDateString("en-GB", { weekday: "short" }) + "</small><b>" + d.getDate() + "</b><small>" + d.toLocaleDateString("en-GB", { month: "short" }) + "</small>";
      dates.appendChild(b); n++;
    }
    var busy = function (iso, h) {
      var x = 0, s = iso + h;
      for (var j = 0; j < s.length; j++) x = (x * 33 + s.charCodeAt(j)) % 1009;
      return x % 4 === 0;
    };
    var renderTimes = function () {
      times.innerHTML = ""; chosenTime = null; sum("time", "—");
      if (!chosenDate) return;
      var t = HOURS[new Date(chosenDate + "T12:00:00").getDay()];
      var sel = $('input[name="treatment"]:checked', form);
      var len = (sel ? Number(sel.getAttribute("data-mins")) : 30) / 60;
      for (var h = t[0]; h + len <= t[1]; h += 0.5) {
        var btn = document.createElement("button");
        btn.type = "button"; btn.className = "time"; btn.textContent = fmt(h); btn.setAttribute("aria-pressed", "false");
        if (busy(chosenDate, h)) btn.disabled = true;
        times.appendChild(btn);
      }
    };
    dates.addEventListener("click", function (e) {
      var b = e.target.closest(".date"); if (!b) return;
      $$(".date", dates).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      chosenDate = b.dataset.iso;
      sum("date", new Date(chosenDate + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }));
      $('[data-error="slot"]').textContent = "";
      renderTimes();
    });
    times.addEventListener("click", function (e) {
      var b = e.target.closest(".time"); if (!b || b.disabled) return;
      $$(".time", times).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      chosenTime = b.textContent; sum("time", chosenTime);
      $('[data-error="slot"]').textContent = "";
    });
    form.addEventListener("change", function (e) {
      if (e.target.name === "treatment") {
        sum("treatment", e.target.value);
        sum("price", e.target.getAttribute("data-price"));
        renderTimes();
      }
      if (e.target.name === "dentist") sum("dentist", e.target.value);
      if (e.target.name === "patient") sum("patient", e.target.value);
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      if (!chosenDate || !chosenTime) { $('[data-error="slot"]').textContent = "Choose a day and a time."; ok = false; }
      $$("[required]", form).forEach(function (input) {
        var v = input.value.trim();
        var bad = !v || (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) || (input.type === "tel" && v.replace(/\D/g, "").length < 9);
        input.setAttribute("aria-invalid", String(bad));
        $('[data-error="' + input.name + '"]', form).textContent = bad ? input.getAttribute("data-message") : "";
        if (bad) ok = false;
      });
      if (!ok) { var first = $('[aria-invalid="true"]', form); (first || dates).scrollIntoView({ behavior: "smooth", block: "center" }); return; }
      $("[data-done-text]").textContent = $('input[name="treatment"]:checked', form).value + " on " +
        new Date(chosenDate + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) + " at " + chosenTime +
        ". We’ve sent a confirmation and a reminder will follow the day before.";
      form.hidden = true;
      $("#booking-done").hidden = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();
