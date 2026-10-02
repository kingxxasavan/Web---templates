/* Copperfield — plumbing & heating site behaviour. No dependencies. */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  /* ------------------------------------------------------------ settings */
  /* Postcode districts you cover (the part before the space). */
  var COVERED = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "S11", "S12", "S13", "S14", "S17", "S20", "S35", "S60"];
  var TOWNS = ["Sheffield", "Rotherham", "Hillsborough", "Crookes", "Ecclesall", "Dore", "Norton", "Handsworth", "Meadowhall", "Stocksbridge"];
  /* Arrival windows, and which days you book (0 is Sunday). */
  var WINDOWS = [["am", "Morning", "8am – 12pm", 0], ["pm", "Afternoon", "12pm – 5pm", 0], ["eve", "Evening", "5pm – 8pm (+£30)", 3000]];
  var WORK_DAYS = [1, 2, 3, 4, 5, 6];
  var DAYS_AHEAD = 10;
  var ENGINEERS = ["Jas", "Becky", "Tom", "Marek"];
  /* Price ranges for new boilers, fitted, in pounds. */
  var BOILERS = {
    24: [2195, 2595], 30: [2395, 2895], 35: [2695, 3195],
    system: [3600, 4600]
  };
  var CONVERSION = [450, 750];  /* extra when replacing tanks with a combi */
  var APR = 0.099, LONG_TERM = 60; /* finance example */

  var DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var DAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var gbp = function (n) { return "£" + Math.round(n).toLocaleString("en-GB"); };
  var params = new URLSearchParams(location.search);
  var toastEl = $(".toast"), toastT;
  var toast = function (m) { if (!toastEl) return; toastEl.textContent = m; toastEl.classList.add("is-on"); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove("is-on"); }, 2400); };

  var toggle = $(".nav-toggle"), nav = $("#nav");
  if (toggle && nav) toggle.addEventListener("click", function () { toggle.setAttribute("aria-expanded", String(nav.classList.toggle("is-open"))); });
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add("is-in"); });

  var district = function (pc) {
    var v = pc.toUpperCase().replace(/\s+/g, " ").trim();
    return v.indexOf(" ") > 0 ? v.split(" ")[0] : v.slice(0, Math.max(2, v.length - 3));
  };
  var covered = function (pc) { return COVERED.indexOf(district(pc)) !== -1; };

  /* A repeatable "is this slot booked?" so the diary looks real. */
  var busy = function (key) { var h = 0; for (var i = 0; i < key.length; i++) h = (h * 33 + key.charCodeAt(i)) | 0; return Math.abs(h) % 7 < 2; };
  var upcoming = function () {
    var out = [], d = new Date(); d.setHours(0, 0, 0, 0);
    for (var i = 1; out.length < DAYS_AHEAD && i < 30; i++) {
      var x = new Date(d.getTime() + i * 864e5);
      out.push({ date: x, open: WORK_DAYS.indexOf(x.getDay()) !== -1 });
    }
    return out;
  };
  var slotKey = function (day, w) { return day.date.toISOString().slice(0, 10) + w; };
  var firstFree = function () {
    var days = upcoming();
    for (var i = 0; i < days.length; i++) {
      if (!days[i].open) continue;
      for (var j = 0; j < WINDOWS.length - 1; j++) if (!busy(slotKey(days[i], WINDOWS[j][0]))) return { day: days[i], w: WINDOWS[j], i: i };
    }
  };
  var dayLabel = function (day, i) { return i === 0 ? "tomorrow" : DAY_LONG[day.date.getDay()]; };

  /* --------------------------------------------------------- quick quote */
  var quick = $("[data-quick]");
  if (quick) {
    var paintQuick = function () {
      var r = $('input[name="job"]:checked', quick);
      $("[data-quick-note]").textContent = r.getAttribute("data-price-text") + " · " + r.getAttribute("data-note");
      var f = firstFree();
      $("[data-quick-slot]").textContent = f ? "Next free: " + dayLabel(f.day, f.i) + " " + f.w[1].toLowerCase() : "Call us for the next slot";
    };
    quick.addEventListener("change", paintQuick);
    quick.addEventListener("submit", function (e) { e.preventDefault(); location.href = "book.html?job=" + $('input[name="job"]:checked', quick).value; });
    paintQuick();
  }

  /* ----------------------------------------------------------- coverage */
  var townBox = $("[data-towns]");
  if (townBox) townBox.innerHTML = TOWNS.map(function (t) { return "<span>" + t + "</span>"; }).join("");
  var cover = $("[data-cover]");
  if (cover) cover.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = $("input", cover).value.trim(), out = $("[data-cover-result]");
    out.hidden = false;
    if (!/^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d?[A-Za-z]{0,2}$/.test(v)) { out.className = "result is-no"; out.textContent = "That doesn’t look like a postcode. Try one like S10 2XX."; return; }
    var ok = covered(v), f = firstFree();
    out.className = "result " + (ok ? "is-ok" : "is-no");
    out.textContent = ok ? "Yes, we cover " + district(v) + ". Our next free slot is " + (f ? dayLabel(f.day, f.i) + " " + f.w[1].toLowerCase() : "this week") + "." : "Sorry, " + district(v) + " is outside our area. Call us and we’ll recommend someone local.";
  });
  var oncall = $("[data-oncall]");
  if (oncall) {
    var h = new Date().getHours();
    if (h >= 8 && h < 18 && new Date().getDay() !== 0) oncall.innerHTML = '<span class="pulse"></span><b>Office open</b> · 6 engineers out today, average arrival in 47 minutes for emergencies';
  }

  /* ---------------------------------------------------------------- tabs */
  var tabs = $$('[role="tab"]');
  var pick = function (t) {
    tabs.forEach(function (x) { var on = x === t; x.setAttribute("aria-selected", String(on)); x.tabIndex = on ? 0 : -1; $("#" + x.getAttribute("aria-controls")).hidden = !on; });
  };
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { pick(t); });
    t.addEventListener("keydown", function (e) {
      var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      var n = tabs[(i + d + tabs.length) % tabs.length]; pick(n); n.focus();
    });
  });

  /* ---------------------------------------------------- boiler calculator */
  var calc = $("[data-calc]");
  if (calc) {
    var vals = { beds: 3, baths: 1, showers: 1 };
    var LIMITS = { beds: [1, 7], baths: [1, 5], showers: [1, 4] };
    $$("[data-stepper]", calc).forEach(function (s) {
      var key = s.getAttribute("data-stepper");
      $$("button", s).forEach(function (b) {
        b.addEventListener("click", function () {
          vals[key] = Math.max(LIMITS[key][0], Math.min(LIMITS[key][1], vals[key] + Number(b.getAttribute("data-d"))));
          $("output", s).textContent = vals[key] + (vals[key] === LIMITS[key][1] ? "+" : "");
          paintCalc();
        });
      });
    });
    $("#current").addEventListener("change", function () { paintCalc(); });
    var monthly = function (amount, months, apr) {
      if (!apr) return amount / months;
      var r = Math.pow(1 + apr, 1 / 12) - 1;
      return amount * r / (1 - Math.pow(1 + r, -months));
    };
    var paintCalc = function () {
      var current = $("#current").value, title, why, range, points = [];
      var system = vals.baths >= 3 || vals.showers >= 3;
      if (system) {
        title = "System boiler with a hot water cylinder";
        why = "With " + vals.baths + " bathrooms or " + vals.showers + " showers running at once, a combi can’t keep up. A cylinder stores hot water so everyone gets a strong shower.";
        range = BOILERS.system.slice();
        points = ["Unvented cylinder, mains-pressure hot water", "Space needed for a cylinder, usually an airing cupboard", "10-year boiler warranty"];
      } else {
        var kw = vals.beds <= 2 && vals.baths === 1 ? 24 : vals.beds <= 4 && vals.baths <= 2 && vals.showers < 2 ? 30 : 35;
        title = kw + "kW combi boiler";
        why = "Hot water on demand for a " + vals.beds + "-bedroom home with " + vals.baths + (vals.baths === 1 ? " bathroom" : " bathrooms") + (vals.showers > 1 ? ", sized for two showers at once." : ".");
        range = BOILERS[kw].slice();
        points = ["No tanks: frees up the airing cupboard or loft", "Smart thermostat included", "10-year warranty when serviced yearly"];
        if (current === "regular" || current === "system") {
          range[0] += CONVERSION[0]; range[1] += CONVERSION[1];
          points.unshift("Includes removing your old tanks and cylinder");
        }
      }
      $("[data-reco-title]").textContent = title;
      $("[data-reco-why]").textContent = why;
      $("[data-reco-list]").innerHTML = points.map(function (p) { return "<li>" + p + "</li>"; }).join("");
      $("[data-reco-price]").textContent = gbp(range[0]) + "–" + gbp(range[1]);
      var useLong = range[0] > 3000;
      $("[data-reco-month]").textContent = gbp(useLong ? monthly(range[0], LONG_TERM, APR) : monthly(range[0], 12, 0)) + "/mo";
      $("[data-reco-month-note]").textContent = useLong ? "over 5 years at " + (APR * 100).toFixed(1) + "% APR" : "over 12 months at 0%";
    };
    paintCalc();
  }

  /* -------------------------------------------------------------- booking */
  var wiz = $("#wizard");
  if (wiz) {
    var QUESTIONS = {
      service: [["pills", "type", "What kind of boiler?", ["Combi", "System", "Regular", "Not sure"]], ["pills", "last", "When was it last serviced?", ["Within a year", "1–2 years ago", "Longer", "Never"]]],
      repair: [["multi", "symptoms", "What’s happening?", ["No heating", "No hot water", "Leaking", "Making noises", "Losing pressure", "Showing an error code"]], ["text", "code", "Error code on the display (if any)", "e.g. F28"]],
      leak: [["pills", "where", "Where is the leak?", ["Kitchen", "Bathroom", "Ceiling", "Outside", "Not sure"]], ["pills", "off", "Have you turned the water off?", ["Yes", "No", "Can’t find the stopcock"]]],
      boiler: [["pills", "beds", "Bedrooms", ["1–2", "3", "4", "5+"]], ["pills", "current", "What do you have now?", ["Combi", "System", "Regular with tanks", "No boiler"]]],
      radiator: [["pills", "count", "How many radiators?", ["1", "2", "3", "4+"]], ["pills", "kind", "What would you like?", ["Replace existing", "New position", "Towel rail"]]],
      bathroom: [["pills", "scope", "What are you planning?", ["Full refit", "Shower only", "Wet room"]], ["pills", "when", "When would you like to start?", ["As soon as possible", "In 1–3 months", "Just planning"]]],
      other: [["area", "what", "Tell us what you need", "A dripping tap, a new outside tap, moving a radiator…"]]
    };
    var state = { step: 1, day: null, win: null };
    var job = function () { return $('input[name="job"]:checked', wiz); };
    if (params.get("job")) { var pre = $('input[name="job"][value="' + params.get("job") + '"]', wiz); if (pre) pre.checked = true; }

    var buildQuestions = function () {
      var box = $("[data-questions]");
      box.innerHTML = "";
      (QUESTIONS[job().value] || []).forEach(function (q, qi) {
        var wrap = document.createElement("fieldset");
        wrap.className = "field";
        var legend = document.createElement("legend"); legend.textContent = q[2]; wrap.appendChild(legend);
        if (q[0] === "pills" || q[0] === "multi") {
          var pills = document.createElement("div"); pills.className = "pills";
          q[3].forEach(function (opt, oi) {
            var l = document.createElement("label"); l.className = "pill";
            l.innerHTML = '<input type="' + (q[0] === "multi" ? "checkbox" : "radio") + '" name="q-' + q[1] + '"><span></span>';
            $("input", l).value = opt; $("span", l).textContent = opt;
            if (q[0] === "pills" && oi === 0) $("input", l).checked = true;
            pills.appendChild(l);
          });
          wrap.appendChild(pills);
        } else {
          var input = document.createElement(q[0] === "area" ? "textarea" : "input");
          input.name = "q-" + q[1]; input.placeholder = q[3]; input.id = "q-" + qi;
          if (q[0] === "area") input.rows = 4;
          legend.outerHTML = '<label for="q-' + qi + '" style="font-weight:800;font-size:.92rem">' + q[2] + "</label>";
          wrap.appendChild(input);
        }
        box.appendChild(wrap);
      });
      var warn = document.createElement("div");
      warn.className = "result is-no"; warn.hidden = true; warn.setAttribute("data-urgent", "");
      warn.innerHTML = "<b>Turn off your water now.</b> The stopcock is usually under the kitchen sink. For a leak you can’t stop, call our 24/7 line instead of booking.";
      box.appendChild(warn);
      box.addEventListener("change", paintSummary);
    };
    var details = function () {
      var out = [];
      $$("[data-questions] fieldset").forEach(function (f) {
        var picked = $$("input:checked", f).map(function (i) { return i.value; });
        var text = $("input:not([type]), textarea", f);
        if (picked.length) out.push(picked.join(", "));
        else if (text && text.value.trim()) out.push(text.value.trim());
      });
      return out.join(" · ");
    };
    var buildDays = function () {
      var box = $("[data-days]"); box.innerHTML = "";
      upcoming().forEach(function (d, i) {
        var free = d.open ? WINDOWS.filter(function (w) { return !busy(slotKey(d, w[0])); }).length : 0;
        var b = document.createElement("button");
        b.type = "button"; b.className = "day"; b.disabled = !free;
        b.innerHTML = "<small></small><b></b><span></span>";
        b.children[0].textContent = i === 0 ? "Tomorrow" : DAY[d.date.getDay()];
        b.children[1].textContent = d.date.getDate();
        b.children[2].textContent = !d.open ? "Closed" : free ? free + " free" : "Full";
        b.setAttribute("aria-pressed", String(state.day === d));
        b.setAttribute("aria-label", DAY_LONG[d.date.getDay()] + " " + d.date.getDate() + " " + MONTH[d.date.getMonth()] + (free ? ", " + free + " windows free" : ", unavailable"));
        b.addEventListener("click", function () { state.day = d; state.win = null; buildDays(); buildWindows(); paintSummary(); });
        box.appendChild(b);
      });
    };
    var buildWindows = function () {
      var box = $("[data-windows]"); box.innerHTML = "";
      if (!state.day) { box.innerHTML = '<p style="color:var(--ink-3)">Pick a day first.</p>'; return; }
      WINDOWS.forEach(function (w) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "window"; b.disabled = busy(slotKey(state.day, w[0]));
        b.innerHTML = w[1] + "<small></small>"; $("small", b).textContent = b.disabled ? "Booked up" : w[2];
        b.setAttribute("aria-pressed", String(state.win === w));
        b.addEventListener("click", function () { state.win = w; $('[data-error="slot"]', wiz).textContent = ""; buildWindows(); paintSummary(); });
        box.appendChild(b);
      });
    };
    var paintSummary = function () {
      var j = job();
      $("[data-s-job]").textContent = $("span", j.parentNode).childNodes[1].textContent.trim();
      $("[data-s-details]").textContent = details() || "—";
      $("[data-s-when]").textContent = state.day && state.win ? DAY_LONG[state.day.date.getDay()] + " " + state.day.date.getDate() + " " + MONTH[state.day.date.getMonth()] + ", " + state.win[2].replace(" (+£30)", "") : "Choose a slot";
      var priceText = j.value === "other" ? "Quote on the day" : $('#wizard input[value="' + j.value + '"]').parentNode.querySelector("small").textContent.split(" · ")[0];
      $("[data-s-price]").textContent = priceText + (state.win && state.win[3] ? " + £30" : "");
      $("[data-s-price-note]").textContent = j.value === "other" ? "We’ll confirm the price before starting" : $("small", j.parentNode).textContent.split(" · ")[1];
      var off = $('input[name="q-off"]:checked', wiz);
      var warn = $("[data-urgent]", wiz); if (warn) warn.hidden = !(off && off.value !== "Yes");
    };
    var show = function (n) {
      state.step = n;
      $$("[data-step]", wiz).forEach(function (s) { s.hidden = Number(s.getAttribute("data-step")) !== n; });
      $$(".progress span", wiz).forEach(function (s, i) { s.classList.toggle("is-on", i < n); });
      $("[data-back]", wiz).hidden = n === 1;
      $("[data-next]", wiz).textContent = n === 4 ? "Confirm booking" : "Continue";
      var h = $('[data-step="' + n + '"] h2', wiz); h.setAttribute("tabindex", "-1"); if (n > 1) h.focus();
    };
    wiz.addEventListener("change", function (e) { if (e.target.name === "job") paintSummary(); });
    $("[data-back]", wiz).addEventListener("click", function () { show(state.step - 1); });
    wiz.addEventListener("submit", function (e) {
      e.preventDefault();
      if (state.step === 1) { buildQuestions(); show(2); paintSummary(); return; }
      if (state.step === 2) { if (!state.day) { var f = firstFree(); if (f) { state.day = f.day; } } buildDays(); buildWindows(); show(3); return; }
      if (state.step === 3) {
        if (!state.win) { $('[data-error="slot"]', wiz).textContent = "Choose an arrival window to continue."; return; }
        show(4); return;
      }
      var ok = true;
      $$('[data-step="4"] [required]', wiz).forEach(function (input) {
        var v = input.value.trim();
        var bad = !v || (input.type === "tel" && v.replace(/\D/g, "").length < 10) || (input.name === "postcode" && !covered(v));
        input.setAttribute("aria-invalid", String(bad));
        $('[data-error="' + input.name + '"]', wiz).textContent = bad ? input.getAttribute("data-message") : "";
        if (bad && ok) { input.focus(); ok = false; }
      });
      if (!ok) return;
      var eng = ENGINEERS[state.day.date.getDate() % ENGINEERS.length];
      $("[data-booked-text]").textContent = "Thanks, " + $("#b-name").value.trim().split(" ")[0] + ". " + eng + " will be with you on " + $("[data-s-when]").textContent + ". We’ll text " + $("#b-phone").value.trim() + " the day before with a two-hour window, and again when they’re on the way.";
      $("[data-ref]").textContent = "CF-" + String(Date.now()).slice(-5);
      wiz.hidden = true;
      var d = $("#booked"); d.hidden = false; d.focus();
      toast("Booking confirmed");
    });
    paintSummary();
  }
})();
