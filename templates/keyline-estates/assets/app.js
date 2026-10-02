/* Keyline — estate agent behaviour. No dependencies. */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var gbp = function (n) { return "£" + Math.round(n).toLocaleString("en-GB"); };

  /* ------------------------------------------------------------------ nav */
  var toggle = $(".nav-toggle"), nav = $("#nav");
  if (toggle && nav) toggle.addEventListener("click", function () {
    toggle.setAttribute("aria-expanded", String(nav.classList.toggle("is-open")));
  });

  /* --------------------------------------------------------------- reveal */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add("is-in"); });

  /* ---------------------------------------------------------- saved homes */
  var KEY = "keyline-saved";
  var saved;
  try { saved = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { saved = []; }
  function paintSaved() {
    $$("[data-heart]").forEach(function (h) {
      var on = saved.indexOf(h.getAttribute("data-heart")) !== -1;
      h.setAttribute("aria-pressed", String(on));
      h.setAttribute("aria-label", on ? "Remove from saved homes" : "Save this home");
    });
    $$("[data-saved-count]").forEach(function (el) { el.textContent = saved.length; });
  }
  $$("[data-heart]").forEach(function (h) {
    h.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      var id = h.getAttribute("data-heart"), i = saved.indexOf(id);
      if (i === -1) saved.push(id); else saved.splice(i, 1);
      try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (err) { /* private mode */ }
      paintSaved();
      if (window.keylineFilter) window.keylineFilter();
    });
  });
  paintSaved();

  /* ----------------------------------------------------- home page search */
  var search = $("#search");
  if (search) {
    var mode = "buy";
    $$("[data-mode]", search).forEach(function (b) {
      b.addEventListener("click", function () {
        mode = b.getAttribute("data-mode");
        $$("[data-mode]", search).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        var max = $("#s-max", search);
        max.innerHTML = mode === "rent"
          ? '<option value="">Any</option><option value="1500">£1,500 pcm</option><option value="2000">£2,000 pcm</option><option value="3000">£3,000 pcm</option>'
          : '<option value="">Any</option><option value="500000">£500,000</option><option value="750000">£750,000</option><option value="1000000">£1,000,000</option>';
      });
    });
    search.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = new URLSearchParams({ mode: mode, area: $("#s-area").value, beds: $("#s-beds").value, max: $("#s-max").value, type: $("#s-type").value });
      location.href = "listings.html?" + q.toString();
    });
  }

  /* -------------------------------------------------------- listings page */
  var grid = $("[data-results]");
  if (grid) {
    var cards = $$("[data-listing]", grid);
    var params = new URLSearchParams(location.search);
    var state = {
      mode: params.get("mode") || "buy",
      area: params.get("area") || "",
      beds: Number(params.get("beds") || 0),
      max: Number(params.get("max") || 0),
      savedOnly: params.get("saved") === "1",
    };
    var range = $("#max-price"), rangeOut = $("[data-max-out]");
    $$("[data-type]").forEach(function (c) { if (c.value === params.get("type")) c.checked = true; });
    function scaleFor(mode) { return mode === "rent" ? { min: 1000, max: 4000, step: 250 } : { min: 250000, max: 2000000, step: 50000 }; }
    function setRange() {
      var s = scaleFor(state.mode);
      range.min = s.min; range.max = s.max; range.step = s.step;
      if (!state.max || state.max > s.max || state.max < s.min) state.max = s.max;
      range.value = state.max;
      rangeOut.textContent = (state.max >= s.max ? "Any" : gbp(state.max)) + (state.mode === "rent" ? " pcm" : "");
    }
    function filter() {
      var types = $$("[data-type]:checked").map(function (c) { return c.value; });
      var s = scaleFor(state.mode), shown = 0;
      cards.forEach(function (c) {
        var price = Number(c.getAttribute("data-price"));
        var ok = c.getAttribute("data-mode") === state.mode &&
          (!state.area || c.getAttribute("data-area") === state.area) &&
          Number(c.getAttribute("data-beds")) >= state.beds &&
          (state.max >= s.max || price <= state.max) &&
          (!types.length || types.indexOf(c.getAttribute("data-kind")) !== -1) &&
          (!state.savedOnly || saved.indexOf(c.getAttribute("data-listing")) !== -1);
        c.hidden = !ok;
        if (ok) shown++;
      });
      $("[data-count]").textContent = shown + (shown === 1 ? " home" : " homes") + (state.mode === "rent" ? " to rent" : " for sale");
      $("[data-none]").hidden = shown > 0;
      var sort = $("#sort").value;
      cards.slice().sort(function (a, b) {
        if (sort === "low") return a.getAttribute("data-price") - b.getAttribute("data-price");
        if (sort === "high") return b.getAttribute("data-price") - a.getAttribute("data-price");
        return a.getAttribute("data-order") - b.getAttribute("data-order");
      }).forEach(function (c) { grid.appendChild(c); });
    }
    window.keylineFilter = filter;
    $$("[data-set-mode]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-set-mode") === state.mode));
      b.addEventListener("click", function () {
        state.mode = b.getAttribute("data-set-mode"); state.max = 0;
        $$("[data-set-mode]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        setRange(); filter();
      });
    });
    $$("[data-beds]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(Number(b.getAttribute("data-beds")) === state.beds));
      b.addEventListener("click", function () {
        state.beds = Number(b.getAttribute("data-beds"));
        $$("[data-beds]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        filter();
      });
    });
    var area = $("#area"); area.value = state.area;
    area.addEventListener("change", function () { state.area = area.value; filter(); });
    range.addEventListener("input", function () { state.max = Number(range.value); setRange(); filter(); });
    $$("[data-type]").forEach(function (c) { c.addEventListener("change", filter); });
    $("#sort").addEventListener("change", filter);
    var savedBox = $("#saved-only"); savedBox.checked = state.savedOnly;
    savedBox.addEventListener("change", function () { state.savedOnly = savedBox.checked; filter(); });
    $("[data-reset]").addEventListener("click", function () {
      state = { mode: state.mode, area: "", beds: 0, max: 0, savedOnly: false };
      area.value = ""; savedBox.checked = false;
      $$("[data-type]").forEach(function (c) { c.checked = false; });
      $$("[data-beds]").forEach(function (x) { x.setAttribute("aria-pressed", String(x.getAttribute("data-beds") === "0")); });
      setRange(); filter();
    });
    setRange(); filter();
  }

  /* ------------------------------------------------------- gallery lightbox */
  var box = $("#lightbox");
  if (box && typeof box.showModal === "function") {
    var shots = $$("[data-shot]");
    var at = 0;
    var show = function (i) {
      at = (i + shots.length) % shots.length;
      var img = $("img", shots[at]);
      $("[data-lb-img]", box).src = img.getAttribute("data-full") || img.src;
      $("[data-lb-img]", box).alt = img.alt;
      $("[data-lb-count]", box).textContent = (at + 1) + " / " + shots.length + " · " + img.alt;
    };
    shots.forEach(function (s, i) { s.addEventListener("click", function () { show(i); box.showModal(); }); });
    $("[data-lb-prev]", box).addEventListener("click", function () { show(at - 1); });
    $("[data-lb-next]", box).addEventListener("click", function () { show(at + 1); });
    $("[data-lb-close]", box).addEventListener("click", function () { box.close(); });
    box.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(at - 1);
      if (e.key === "ArrowRight") show(at + 1);
    });
  }

  /* ------------------------------------------------- mortgage calculator */
  var calc = $("#calc");
  if (calc) {
    var run = function () {
      var price = Number($("#c-price").value) || 0;
      var dep = Number($("#c-deposit").value) || 0;
      var rate = (Number($("#c-rate").value) || 0) / 100 / 12;
      var n = (Number($("#c-term").value) || 25) * 12;
      var loan = Math.max(0, price - price * dep / 100);
      var monthly = rate ? loan * rate / (1 - Math.pow(1 + rate, -n)) : loan / n;
      $("[data-monthly]").textContent = gbp(monthly);
      $("[data-loan]").textContent = gbp(loan) + " borrowed over " + (n / 12) + " years";
    };
    calc.addEventListener("input", run);
    run();
  }

  /* ---------------------------------------------------------------- forms */
  function validate(form, scope) {
    var ok = true;
    $$("[required]", scope || form).forEach(function (input) {
      var v = input.value.trim();
      var bad = !v || (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) || (input.type === "tel" && v.replace(/\D/g, "").length < 9);
      input.setAttribute("aria-invalid", String(bad));
      var err = $('[data-error="' + input.name + '"]', form);
      if (err) err.textContent = bad ? input.getAttribute("data-message") : "";
      if (bad) ok = false;
    });
    if (!ok) $('[aria-invalid="true"]', scope || form).focus();
    return ok;
  }
  $$("form[data-simple]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(form)) return;
      form.hidden = true;
      $("#" + form.getAttribute("data-simple")).hidden = false;
    });
  });

  var val = $("#valuation");
  if (val) {
    var steps = $$(".form-step", val), bars = $$(".steps span", val);
    var go = function (i) {
      steps.forEach(function (s, j) { s.hidden = j !== i; });
      bars.forEach(function (b, j) { b.classList.toggle("is-on", j <= i); });
    };
    $("[data-next]", val).addEventListener("click", function () { if (validate(val, steps[0])) go(1); });
    $("[data-back]", val).addEventListener("click", function () { go(0); });
    val.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(val, steps[1])) return;
      val.hidden = true;
      $("#valuation-done").hidden = false;
    });
  }
})();
