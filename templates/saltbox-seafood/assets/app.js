/* Saltbox — small, dependency-free behaviour for every page. */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  /* ---------------------------------------------------------------- hours
     Decimal hours (17.5 = 5.30pm). `null` means closed. Edit these and the
     open-now line, the hours lists and the booking times all follow. */
  var HOURS = [
    { day: "Sunday", open: 12, close: 17, text: "12 – 5pm" },
    { day: "Monday", open: null, close: null, text: "Closed" },
    { day: "Tuesday", open: null, close: null, text: "Closed" },
    { day: "Wednesday", open: 12, close: 22, text: "12 – 10pm" },
    { day: "Thursday", open: 12, close: 22, text: "12 – 10pm" },
    { day: "Friday", open: 12, close: 23, text: "12 – 11pm" },
    { day: "Saturday", open: 11, close: 23, text: "11am – 11pm" },
  ];

  var fmt = function (h) {
    var hr = Math.floor(h), min = Math.round((h - hr) * 60);
    var suffix = hr >= 12 ? "pm" : "am";
    var twelve = hr % 12 || 12;
    return twelve + (min ? "." + String(min).padStart(2, "0") : "") + suffix;
  };

  var now = new Date();
  var today = HOURS[now.getDay()];
  var hourNow = now.getHours() + now.getMinutes() / 60;

  document.querySelectorAll("[data-open-status]").forEach(function (el) {
    var dot = el.querySelector(".status-dot");
    var text = el.querySelector("[data-open-text]");
    var open = today.open !== null && hourNow >= today.open && hourNow < today.close;
    if (dot) dot.classList.toggle("is-open", open);
    if (!text) return;
    if (open) text.textContent = "Open now · kitchen until " + fmt(today.close - 1);
    else {
      for (var i = 0; i < 7; i++) {
        var d = HOURS[(now.getDay() + i) % 7];
        if (d.open === null) continue;
        if (i === 0 && hourNow >= d.close) continue;
        text.textContent = "Closed now · opens " + (i === 0 ? "today" : i === 1 ? "tomorrow" : d.day) + " at " + fmt(d.open);
        break;
      }
    }
  });

  document.querySelectorAll("[data-hours]").forEach(function (list) {
    list.innerHTML = "";
    [1, 2, 3, 4, 5, 6, 0].forEach(function (i) {
      var li = document.createElement("li");
      li.innerHTML = "<span>" + HOURS[i].day + "</span><span>" + HOURS[i].text + "</span>";
      if (i === now.getDay()) li.className = "is-today";
      list.appendChild(li);
    });
  });

  document.querySelectorAll("[data-today]").forEach(function (el) {
    el.textContent = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  });

  /* ------------------------------------------------------------------ nav */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  /* --------------------------------------------------------------- reveal */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add("is-in"); });

  /* ----------------------------------------------------------------- menu */
  var tabs = document.querySelectorAll("[data-tab]");
  var sections = document.querySelectorAll("[data-section]");
  var filters = document.querySelectorAll("[data-diet]");
  function applyMenu() {
    var active = document.querySelector('[data-tab][aria-selected="true"]');
    var which = active ? active.getAttribute("data-tab") : "all";
    var need = Array.prototype.filter.call(filters, function (f) { return f.checked; }).map(function (f) { return f.value; });
    sections.forEach(function (s) {
      s.hidden = which !== "all" && s.getAttribute("data-section") !== which;
      var shown = 0;
      s.querySelectorAll(".menu-item").forEach(function (item) {
        var tags = (item.getAttribute("data-tags") || "").split(" ");
        var ok = need.every(function (n) { return tags.indexOf(n) !== -1; });
        item.hidden = !ok;
        if (ok) shown++;
      });
      var empty = s.querySelector(".menu-empty");
      if (empty) empty.hidden = shown > 0;
    });
  }
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) { t.setAttribute("aria-selected", String(t === tab)); });
      applyMenu();
    });
  });
  filters.forEach(function (f) { f.addEventListener("change", applyMenu); });
  if (sections.length) applyMenu();

  /* -------------------------------------------------------------- booking */
  var booking = document.getElementById("booking-form");
  if (booking) {
    var dateInput = booking.querySelector("#date");
    var slotsEl = booking.querySelector("[data-slots]");
    var slotsNote = booking.querySelector("[data-slots-note]");
    var guestsOut = booking.querySelector("[data-guests]");
    var guests = 2, chosen = null;
    var iso = function (d) { return d.toISOString().slice(0, 10); };
    var max = new Date(now); max.setDate(max.getDate() + 84);
    dateInput.min = iso(now);
    dateInput.max = iso(max);

    // A steady, repeatable pattern of "fully booked" times, so the demo
    // looks real without a server. Replace with your booking system.
    var taken = function (dateStr, t) {
      var h = 0, s = dateStr + t;
      for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997;
      return h % 5 === 0;
    };

    function renderSlots() {
      slotsEl.innerHTML = "";
      chosen = null;
      var value = dateInput.value;
      if (!value) { slotsNote.textContent = "Choose a date to see available times."; updateSummary(); return; }
      var d = new Date(value + "T12:00:00");
      var day = HOURS[d.getDay()];
      if (day.open === null) { slotsNote.textContent = "We’re closed on " + day.day + "s. Please choose another day."; updateSummary(); return; }
      var any = false;
      for (var t = day.open; t <= day.close - 1.5; t += 0.5) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "slot"; b.textContent = fmt(t); b.setAttribute("aria-pressed", "false");
        b.dataset.time = fmt(t);
        var past = value === iso(now) && t <= hourNow + 1;
        if (past || (guests > 6 && t % 1 !== 0) || taken(value, t)) b.disabled = true; else any = true;
        slotsEl.appendChild(b);
      }
      slotsNote.textContent = any ? "Tables are held for 15 minutes. Larger groups sit on the hour." : "We’re fully booked that day. Try another date, or walk in for the bar.";
      updateSummary();
    }

    slotsEl.addEventListener("click", function (e) {
      var b = e.target.closest(".slot");
      if (!b || b.disabled) return;
      slotsEl.querySelectorAll(".slot").forEach(function (s) { s.setAttribute("aria-pressed", String(s === b)); });
      chosen = b.dataset.time;
      setError("time", "");
      updateSummary();
    });

    booking.querySelectorAll("[data-step]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        guests = Math.min(10, Math.max(1, guests + Number(btn.getAttribute("data-step"))));
        guestsOut.textContent = guests;
        renderSlots();
      });
    });
    dateInput.addEventListener("change", renderSlots);

    function updateSummary() {
      var set = function (k, v) { var el = document.querySelector('[data-sum="' + k + '"]'); if (el) el.textContent = v; };
      set("date", dateInput.value ? new Date(dateInput.value + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) : "—");
      set("time", chosen || "—");
      set("guests", guests + (guests === 1 ? " guest" : " guests"));
      var seat = booking.querySelector('input[name="seating"]:checked');
      set("seat", seat ? seat.value : "—");
    }
    booking.querySelectorAll('input[name="seating"]').forEach(function (r) { r.addEventListener("change", updateSummary); });

    function setError(name, msg) {
      var el = booking.querySelector('[data-error="' + name + '"]');
      if (el) el.textContent = msg;
      var input = booking.querySelector('[name="' + name + '"]');
      if (input) input.setAttribute("aria-invalid", msg ? "true" : "false");
    }

    booking.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      var name = booking.querySelector('[name="name"]').value.trim();
      var email = booking.querySelector('[name="email"]').value.trim();
      var phone = booking.querySelector('[name="phone"]').value.trim();
      setError("date", ""); setError("time", ""); setError("name", ""); setError("email", ""); setError("phone", "");
      if (!dateInput.value) { setError("date", "Choose a date."); ok = false; }
      if (!chosen) { setError("time", "Choose a time."); ok = false; }
      if (name.length < 2) { setError("name", "Tell us who the table is for."); ok = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setError("email", "Enter an email so we can confirm."); ok = false; }
      if (phone.replace(/\D/g, "").length < 9) { setError("phone", "Add a number in case we need to reach you."); ok = false; }
      if (!ok) { var first = booking.querySelector('[aria-invalid="true"]'); if (first) first.focus(); return; }
      var done = document.getElementById("booking-done");
      done.querySelector("[data-done-text]").textContent =
        "A table for " + guests + " on " + new Date(dateInput.value + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) +
        " at " + chosen + ". We’ve sent the details to " + email + ".";
      booking.hidden = true;
      done.hidden = false;
      done.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    renderSlots();
  }

  /* ------------------------------------------------------------- enquiry */
  var enquiry = document.getElementById("enquiry-form");
  if (enquiry) {
    enquiry.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      enquiry.querySelectorAll("[required]").forEach(function (input) {
        var err = enquiry.querySelector('[data-error="' + input.name + '"]');
        var bad = !input.value.trim() || (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim()));
        input.setAttribute("aria-invalid", String(bad));
        if (err) err.textContent = bad ? input.getAttribute("data-message") : "";
        if (bad) ok = false;
      });
      if (!ok) return;
      enquiry.hidden = true;
      document.getElementById("enquiry-done").hidden = false;
    });
  }
})();
