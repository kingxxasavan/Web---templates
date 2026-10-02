/* Hollis Gray — portfolio behaviour. No dependencies. */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  /* Print sizes and prices in pounds. Every print offers these sizes. */
  var SIZES = { "A3 · 42 × 30 cm": 95, "A2 · 59 × 42 cm": 160, "A1 · 84 × 59 cm": 290 };

  /* ------------------------------------------------------------- header */
  var header = $(".header");
  var toggle = $(".nav-toggle"), nav = $("#nav");
  if (toggle && nav) toggle.addEventListener("click", function () {
    toggle.setAttribute("aria-expanded", String(nav.classList.toggle("is-open")));
    header.classList.add("is-solid");
  });
  if (header && !header.classList.contains("header--solid")) {
    var onScroll = function () { header.classList.toggle("is-solid", window.scrollY > 40); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* --------------------------------------------------------------- reveal */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add("is-in"); });

  /* ------------------------------------------------------- hero slideshow */
  var slides = $$(".hero__slide");
  if (slides.length > 1) {
    var dots = $(".hero__dots"), caption = $("[data-hero-caption]"), at = 0, timer;
    slides.forEach(function (s, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Show photograph " + (i + 1));
      b.addEventListener("click", function () { show(i); restart(); });
      dots.appendChild(b);
    });
    var show = function (i) {
      at = i;
      slides.forEach(function (s, j) { s.classList.toggle("is-on", j === i); });
      $$("button", dots).forEach(function (b, j) { b.setAttribute("aria-current", String(j === i)); });
      if (caption) caption.textContent = slides[i].getAttribute("data-caption");
    };
    var restart = function () {
      clearInterval(timer);
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) timer = setInterval(function () { show((at + 1) % slides.length); }, 6000);
    };
    show(0); restart();
  }

  /* -------------------------------------------------------------- gallery */
  var shots = $$(".shot");
  var filters = $$("[data-series]");
  filters.forEach(function (f) {
    var key = f.getAttribute("data-series");
    var n = key === "all" ? shots.length : shots.filter(function (s) { return s.getAttribute("data-in") === key; }).length;
    var count = document.createElement("span"); count.textContent = n; f.appendChild(count);
    f.addEventListener("click", function () {
      filters.forEach(function (x) { x.setAttribute("aria-pressed", String(x === f)); });
      shots.forEach(function (s) { s.hidden = key !== "all" && s.getAttribute("data-in") !== key; });
      history.replaceState(null, "", key === "all" ? location.pathname : "#" + key);
    });
  });
  if (filters.length && location.hash) {
    var pre = $('[data-series="' + location.hash.slice(1) + '"]');
    if (pre) pre.click();
  }

  var box = $("#lightbox");
  if (box && typeof box.showModal === "function" && shots.length) {
    var current = 0;
    var visible = function () { return shots.filter(function (s) { return !s.hidden; }); };
    var open = function (shot) {
      var list = visible();
      current = list.indexOf(shot);
      paint(list);
      box.showModal();
    };
    var paint = function (list) {
      var s = list[current], img = $("img", s);
      $("[data-lb-img]", box).src = img.src;
      $("[data-lb-img]", box).alt = img.alt;
      $("[data-lb-title]", box).textContent = $("b", s).textContent;
      $("[data-lb-place]", box).textContent = $("figcaption span", s).textContent;
      $("[data-lb-count]", box).textContent = (current + 1) + " / " + list.length;
    };
    var step = function (d) { var list = visible(); current = (current + d + list.length) % list.length; paint(list); };
    shots.forEach(function (s) {
      s.tabIndex = 0;
      s.setAttribute("role", "button");
      s.addEventListener("click", function () { open(s); });
      s.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(s); } });
    });
    $(".lb-prev", box).addEventListener("click", function () { step(-1); });
    $(".lb-next", box).addEventListener("click", function () { step(1); });
    $(".lb-close", box).addEventListener("click", function () { box.close(); });
    box.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }

  /* ---------------------------------------------------------------- prints */
  var KEY = "hollis-prints";
  var bagItems;
  try { bagItems = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { bagItems = []; }
  var bag = $("#bag");
  $$(".print").forEach(function (p) {
    var sel = $("select", p), price = $(".price", p);
    sel.innerHTML = Object.keys(SIZES).map(function (k) { return "<option>" + k + "</option>"; }).join("");
    var upd = function () { price.textContent = "£" + SIZES[sel.value]; };
    sel.addEventListener("change", upd); upd();
    $(".btn", p).addEventListener("click", function () {
      bagItems.push({ title: $("h3", p).textContent, size: sel.value, price: SIZES[sel.value] });
      saveBag();
    });
  });
  function saveBag() {
    try { localStorage.setItem(KEY, JSON.stringify(bagItems)); } catch (e) { /* private mode */ }
    if (!bag) return;
    var list = $("ul", bag); list.innerHTML = "";
    var total = 0;
    bagItems.forEach(function (it, i) {
      total += it.price;
      var li = document.createElement("li");
      li.innerHTML = "<span></span><span>£" + it.price + ' <button type="button" aria-label="Remove">×</button></span>';
      li.firstChild.textContent = it.title + ", " + it.size.split(" ·")[0];
      $("button", li).addEventListener("click", function () { bagItems.splice(i, 1); saveBag(); });
      list.appendChild(li);
    });
    $("[data-bag-total]", bag).textContent = "£" + total;
    bag.hidden = !bagItems.length;
  }
  saveBag();

  /* ----------------------------------------------------------------- forms */
  function validate(form) {
    var ok = true;
    $$("[required]", form).forEach(function (input) {
      var v = input.value.trim();
      var bad = !v || (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v));
      input.setAttribute("aria-invalid", String(bad));
      var err = $('[data-error="' + input.name + '"]', form);
      if (err) err.textContent = bad ? input.getAttribute("data-message") : "";
      if (bad) ok = false;
    });
    if (!ok) $('[aria-invalid="true"]', form).focus();
    return ok;
  }
  $$("form[data-done]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(form)) return;
      form.hidden = true;
      $("#" + form.getAttribute("data-done")).hidden = false;
      if (form.id === "checkout") { bagItems = []; saveBag(); }
    });
  });
  var checkout = $("#checkout");
  if (checkout && bag) {
    $("[data-checkout]", bag).addEventListener("click", function () {
      checkout.closest("section").scrollIntoView({ behavior: "smooth" });
      $("input", checkout).focus({ preventScroll: true });
    });
  }
})();
