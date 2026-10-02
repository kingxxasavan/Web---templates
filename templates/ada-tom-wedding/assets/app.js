/* Ada & Tom — wedding site behaviour. No dependencies. */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  /* The ceremony starts here; the countdown reads this one value. */
  var WEDDING = new Date("2027-06-19T14:00:00+01:00");
  /* Reply by this date; after it the form says replies have closed. */
  var RSVP_BY = new Date("2027-04-30T23:59:00+01:00");
  /* The meal choices offered to each guest. */
  var MEALS = ["Roast chicken, tarragon", "Hake, brown shrimp butter", "Wild mushroom risotto (v)", "Children’s menu"];

  var toggle = $(".nav-toggle"), nav = $("#nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () { toggle.setAttribute("aria-expanded", String(nav.classList.toggle("is-open"))); });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { nav.classList.remove("is-open"); }); });
  }

  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add("is-in"); });

  /* ------------------------------------------------------------ countdown */
  var cd = $("[data-countdown]");
  if (cd) {
    var tick = function () {
      var ms = Math.max(0, WEDDING - new Date());
      var v = { days: Math.floor(ms / 864e5), hours: Math.floor(ms / 36e5) % 24, mins: Math.floor(ms / 6e4) % 60 };
      Object.keys(v).forEach(function (k) { $('[data-cd="' + k + '"]', cd).textContent = v[k]; });
    };
    tick(); setInterval(tick, 30000);
  }
  $$("[data-rsvp-by]").forEach(function (el) {
    el.textContent = RSVP_BY.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  });

  /* ------------------------------------------------------------------ RSVP */
  var form = $("#rsvp");
  if (form) {
    var list = $("[data-guests]"), tpl = $("#guest-row");
    var addGuest = function (name) {
      var row = tpl.content.firstElementChild.cloneNode(true);
      var sel = $("select", row);
      sel.innerHTML = MEALS.map(function (m) { return "<option>" + m + "</option>"; }).join("");
      if (name) $("input", row).value = name;
      $(".remove", row).addEventListener("click", function () {
        if ($$(".guest", list).length > 1) row.remove();
        number();
      });
      list.appendChild(row);
      number();
    };
    var number = function () {
      $$(".guest", list).forEach(function (g, i) {
        var id = "guest-" + i;
        $("input", g).id = id + "-name"; $("label", g).setAttribute("for", id + "-name");
        $("label", g).textContent = i === 0 ? "Your name" : "Guest " + (i + 1);
        $("select", g).setAttribute("aria-label", "Meal for " + (i === 0 ? "you" : "guest " + (i + 1)));
        $(".remove", g).hidden = i === 0;
      });
    };
    addGuest();
    $(".add", form).addEventListener("click", function () { if ($$(".guest", list).length < 6) addGuest(); });
    $$('input[name="coming"]', form).forEach(function (r) {
      r.addEventListener("change", function () {
        $$(".attending", form).forEach(function (a) { a.hidden = r.value !== "yes" || !r.checked; });
      });
    });
    if (new Date() > RSVP_BY) {
      form.innerHTML = '<p class="thanks">Replies have now closed. If your plans have changed, please email us.</p>';
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      var coming = $('input[name="coming"]:checked', form);
      $('[data-error="coming"]', form).textContent = coming ? "" : "Let us know if you can come.";
      if (!coming) ok = false;
      var first = $(".guest input", form);
      var email = $("#r-email");
      [first, email].forEach(function (input) {
        var v = input.value.trim();
        var bad = !v || (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v));
        input.setAttribute("aria-invalid", String(bad));
        if (bad) ok = false;
      });
      $('[data-error="email"]', form).textContent = email.getAttribute("aria-invalid") === "true" ? "We’ll send updates here." : "";
      $('[data-error="name"]', form).textContent = first.getAttribute("aria-invalid") === "true" ? "Tell us who’s replying." : "";
      if (!ok) return;
      var names = $$(".guest input", form).map(function (i) { return i.value.trim(); }).filter(Boolean);
      $("[data-thanks-title]").textContent = coming.value === "yes" ? "We can’t wait to see you." : "You’ll be missed.";
      $("[data-thanks-text]").textContent = coming.value === "yes"
        ? "We’ve saved places for " + names.join(", ") + ". Details and the day’s timings are on their way to your inbox."
        : "Thank you for letting us know, " + names[0] + ". We’ll raise a glass to you.";
      form.hidden = true;
      $("#rsvp-thanks").hidden = false;
    });
  }
})();
