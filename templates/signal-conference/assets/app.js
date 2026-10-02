/* Signal — conference site behaviour. No dependencies. */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  /* The first session starts here. The countdown and the "days to go" lines
     read this one value. */
  var EVENT_START = new Date("2027-05-13T09:00:00+01:00");

  /* Ticket prices in whole pounds, and the promo codes the checkout accepts. */
  var PRICES = { early: 249, standard: 349, team: 289 };
  var PROMOS = { COMMUNITY15: 0.15, SPEAKERFRIEND: 0.2 };

  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  /* ------------------------------------------------------------------ nav */
  var toggle = $(".nav-toggle"), nav = $("#nav");
  if (toggle && nav) toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  /* ------------------------------------------------------------ countdown */
  var cd = $("[data-countdown]");
  function tick() {
    var ms = Math.max(0, EVENT_START - new Date());
    var parts = { days: Math.floor(ms / 864e5), hours: Math.floor(ms / 36e5) % 24, mins: Math.floor(ms / 6e4) % 60, secs: Math.floor(ms / 1e3) % 60 };
    Object.keys(parts).forEach(function (k) {
      var el = $('[data-cd="' + k + '"]', cd);
      if (el) el.textContent = String(parts[k]).padStart(2, "0");
    });
  }
  if (cd) { tick(); setInterval(tick, 1000); }
  $$("[data-days-to-go]").forEach(function (el) {
    var d = Math.ceil((EVENT_START - new Date()) / 864e5);
    el.textContent = d > 0 ? d + " days to go" : "Happening now";
  });

  /* --------------------------------------------------------------- reveal */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add("is-in"); });

  /* -------------------------------------------------------- my schedule */
  var KEY = "signal-my-schedule";
  var mine;
  try { mine = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { mine = []; }
  function saveMine() {
    try { localStorage.setItem(KEY, JSON.stringify(mine)); } catch (e) { /* private mode */ }
    $$("[data-my-count]").forEach(function (el) { el.textContent = mine.length; el.hidden = mine.length === 0; });
  }
  saveMine();

  /* --------------------------------------------------------- speakers */
  var speakerFilters = $$("[data-speaker-filter]");
  speakerFilters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      speakerFilters.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      var track = btn.getAttribute("data-speaker-filter");
      $$("[data-speaker]").forEach(function (card) {
        card.hidden = track !== "all" && card.getAttribute("data-track") !== track;
      });
    });
  });
  var dialog = $("#speaker-dialog");
  $$("[data-speaker]").forEach(function (card) {
    var open = function () {
      if (!dialog || typeof dialog.showModal !== "function") return;
      var bio = card.querySelector("template");
      $("[data-dialog-content]", dialog).innerHTML = "";
      $("[data-dialog-content]", dialog).appendChild(bio.content.cloneNode(true));
      dialog.showModal();
    };
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", card.querySelector("h3").textContent + ": read bio");
    card.addEventListener("click", open);
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
  });
  if (dialog) {
    $(".dialog__close", dialog).addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
  }

  /* --------------------------------------------------------- schedule */
  var sessions = $$("[data-session]");
  if (sessions.length) {
    var state = { day: "1", track: "all", mineOnly: false };
    var paint = function () {
      var shown = 0;
      sessions.forEach(function (s) {
        var id = s.getAttribute("data-session");
        var ok = s.getAttribute("data-day") === state.day &&
          (state.track === "all" || s.getAttribute("data-track") === state.track || s.classList.contains("session--break")) &&
          (!state.mineOnly || mine.indexOf(id) !== -1);
        if (state.mineOnly && s.classList.contains("session--break")) ok = false;
        s.hidden = !ok;
        if (ok && !s.classList.contains("session--break")) shown++;
        var star = s.querySelector(".star");
        if (star) {
          var on = mine.indexOf(id) !== -1;
          star.setAttribute("aria-pressed", String(on));
          star.querySelector("span").textContent = on ? "In my schedule" : "Add to my schedule";
        }
      });
      $("[data-empty]").hidden = shown > 0;
    };
    $$("[data-day-tab]").forEach(function (tab) {
      tab.addEventListener("click", function () {
        $$("[data-day-tab]").forEach(function (t) { t.setAttribute("aria-selected", String(t === tab)); });
        state.day = tab.getAttribute("data-day-tab");
        paint();
      });
    });
    $$("[data-track-filter]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        $$("[data-track-filter]").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        state.track = btn.getAttribute("data-track-filter");
        paint();
      });
    });
    var mineBtn = $("[data-mine-toggle]");
    if (mineBtn) mineBtn.addEventListener("click", function () {
      state.mineOnly = !state.mineOnly;
      mineBtn.setAttribute("aria-pressed", String(state.mineOnly));
      paint();
    });
    sessions.forEach(function (s) {
      var star = s.querySelector(".star");
      if (!star) return;
      star.addEventListener("click", function () {
        var id = s.getAttribute("data-session");
        var i = mine.indexOf(id);
        if (i === -1) mine.push(id); else mine.splice(i, 1);
        saveMine();
        paint();
      });
    });
    if (location.hash === "#mine" && mineBtn) mineBtn.click();
    paint();
  }

  /* ---------------------------------------------------------- tickets */
  var checkout = $("#checkout");
  if (checkout) {
    var qty = { early: 0, standard: 0, team: 0 };
    var discount = 0, code = "";
    var money = function (n) { return "£" + n.toLocaleString("en-GB", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }); };
    var render = function () {
      var lines = $("[data-lines]"), sub = 0, count = 0;
      lines.innerHTML = "";
      Object.keys(qty).forEach(function (k) {
        $('[data-qty="' + k + '"]').textContent = qty[k];
        if (!qty[k]) return;
        var n = k === "team" ? qty[k] * 5 : qty[k];
        var cost = (k === "team" ? PRICES.team * 5 : PRICES[k]) * qty[k];
        sub += cost; count += n;
        var li = document.createElement("li");
        li.innerHTML = "<span>" + qty[k] + " × " + $('[data-name="' + k + '"]').textContent + "</span><span>" + money(cost) + "</span>";
        lines.appendChild(li);
      });
      if (!count) lines.innerHTML = '<li class="muted"><span>No tickets yet</span><span>—</span></li>';
      var off = Math.round(sub * discount);
      $("[data-discount]").hidden = !off;
      $("[data-discount-value]").textContent = "−" + money(off) + " (" + code + ")";
      $("[data-total]").textContent = money(sub - off);
      $("[data-count]").textContent = count + (count === 1 ? " attendee" : " attendees");
      $("[data-pay]").disabled = !count;
    };
    $$("[data-add]").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-add");
        qty[k] = Math.max(0, Math.min(10, qty[k] + Number(b.getAttribute("data-by"))));
        render();
      });
    });
    $("#promo-apply").addEventListener("click", function () {
      var v = $("#promo").value.trim().toUpperCase();
      var msg = $("[data-promo-msg]");
      if (PROMOS[v]) { discount = PROMOS[v]; code = v; msg.className = "ok"; msg.textContent = Math.round(discount * 100) + "% off applied."; }
      else { discount = 0; code = ""; msg.className = "error"; msg.textContent = v ? "That code isn’t valid." : "Enter a code first."; }
      render();
    });
    checkout.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      $$("[required]", checkout).forEach(function (input) {
        var bad = !input.value.trim() || (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim()));
        input.setAttribute("aria-invalid", String(bad));
        $('[data-error="' + input.name + '"]', checkout).textContent = bad ? input.getAttribute("data-message") : "";
        if (bad) ok = false;
      });
      if (!ok) { $('[aria-invalid="true"]', checkout).focus(); return; }
      $("[data-done-email]").textContent = $("#email").value.trim();
      checkout.hidden = true;
      $("#checkout-done").hidden = false;
      $("#checkout-done").scrollIntoView({ behavior: "smooth", block: "center" });
    });
    var pre = new URLSearchParams(location.search).get("ticket");
    if (pre && qty[pre] !== undefined) qty[pre] = 1;
    render();
  }
})();
