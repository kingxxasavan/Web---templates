/* Panetto — bakery behaviour. No dependencies. */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var money = function (p) { return "£" + (p / 100).toFixed(p % 100 ? 2 : 0); };

  /* Opening hours for each shop: decimal hours, null when closed. Sunday
     first, matching JavaScript's getDay(). */
  var SHOPS = {
    "Market Street": [[8, 14], [null], [7.5, 17], [7.5, 17], [7.5, 17], [7.5, 18], [8, 17]],
    "Canal Wharf": [[9, 15], [7, 15], [7, 15], [7, 15], [7, 15], [7, 16], [8, 16]],
  };
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var fmt = function (h) {
    var hr = Math.floor(h), m = Math.round((h - hr) * 60);
    return (hr % 12 || 12) + (m ? "." + String(m).padStart(2, "0") : "") + (hr >= 12 ? "pm" : "am");
  };
  var now = new Date();
  var hourNow = now.getHours() + now.getMinutes() / 60;

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

  /* ---------------------------------------------------------------- hours */
  $$("[data-shop]").forEach(function (el) {
    var hours = SHOPS[el.getAttribute("data-shop")];
    var list = $(".hours", el), pill = $(".open-pill", el);
    if (list) {
      list.innerHTML = "";
      [1, 2, 3, 4, 5, 6, 0].forEach(function (d) {
        var li = document.createElement("li");
        li.innerHTML = "<span>" + DAYS[d] + "</span><span>" + (hours[d][0] === null ? "Closed" : fmt(hours[d][0]) + " – " + fmt(hours[d][1])) + "</span>";
        if (d === now.getDay()) li.className = "is-today";
        list.appendChild(li);
      });
    }
    if (pill) {
      var t = hours[now.getDay()];
      var open = t[0] !== null && hourNow >= t[0] && hourNow < t[1];
      pill.classList.toggle("is-open", open);
      pill.textContent = open ? "Open now, until " + fmt(t[1]) : "Closed now";
    }
  });

  /* --------------------------------------------------------------- basket */
  var KEY = "panetto-basket";
  var basket;
  try { basket = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { basket = {}; }
  var catalogue = {};
  $$("[data-product]").forEach(function (p) {
    catalogue[p.getAttribute("data-product")] = { name: p.getAttribute("data-name"), price: Number(p.getAttribute("data-price")) };
  });
  var toast = $(".toast");
  var toastTimer;
  function say(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-on"); }, 2200);
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(basket)); } catch (e) { /* private mode */ }
    var n = Object.keys(basket).reduce(function (s, k) { return s + basket[k].qty; }, 0);
    $$("[data-basket-count]").forEach(function (el) { el.textContent = n; });
    renderBasket();
  }
  $$("[data-add]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-add");
      var item = catalogue[id] || { name: btn.getAttribute("data-name"), price: Number(btn.getAttribute("data-price")) };
      basket[id] = basket[id] || { name: item.name, price: item.price, qty: 0 };
      basket[id].qty = Math.min(24, basket[id].qty + 1);
      save();
      say(item.name + " added to your order");
    });
  });

  var lines = $("[data-basket-lines]");
  function renderBasket() {
    if (!lines) return;
    var ids = Object.keys(basket);
    lines.innerHTML = "";
    var total = 0;
    ids.forEach(function (id) {
      var it = basket[id];
      total += it.price * it.qty;
      var li = document.createElement("li");
      li.innerHTML = '<span class="name"></span><span class="line-price">' + money(it.price * it.qty) + '</span>' +
        '<span class="mini-qty"><button type="button" aria-label="One fewer">−</button><span>' + it.qty + '</span><button type="button" aria-label="One more">+</button></span>';
      li.querySelector(".name").textContent = it.name;
      var b = li.querySelectorAll("button");
      b[0].addEventListener("click", function () { it.qty--; if (it.qty <= 0) delete basket[id]; save(); });
      b[1].addEventListener("click", function () { it.qty = Math.min(24, it.qty + 1); save(); });
      lines.appendChild(li);
    });
    $("[data-basket-empty]").hidden = ids.length > 0;
    $("[data-basket-total]").textContent = money(total);
    $("[data-checkout]").disabled = !ids.length;
  }

  /* Categories on the order page */
  var cats = $$("[data-cat]");
  cats.forEach(function (c) {
    c.addEventListener("click", function () {
      cats.forEach(function (x) { x.setAttribute("aria-pressed", String(x === c)); });
      var which = c.getAttribute("data-cat");
      $$("[data-product]").forEach(function (p) { p.hidden = which !== "all" && p.getAttribute("data-type") !== which; });
    });
  });

  /* Pickup: the next six open days at the chosen shop, then times in
     30-minute steps from opening until an hour before close. */
  var shopSel = $("#pickup-shop"), daySel = $("#pickup-day"), timeSel = $("#pickup-time");
  function fillDays() {
    if (!daySel) return;
    var hours = SHOPS[shopSel.value];
    daySel.innerHTML = "";
    for (var i = 1, added = 0; added < 6 && i < 14; i++) {
      var d = new Date(now); d.setDate(d.getDate() + i);
      if (hours[d.getDay()][0] === null) continue;
      var o = document.createElement("option");
      o.value = d.toISOString().slice(0, 10);
      o.textContent = (i === 1 ? "Tomorrow, " : "") + d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
      daySel.appendChild(o); added++;
    }
    fillTimes();
  }
  function fillTimes() {
    var d = new Date(daySel.value + "T12:00:00");
    var t = SHOPS[shopSel.value][d.getDay()];
    timeSel.innerHTML = "";
    for (var h = t[0]; h <= t[1] - 1; h += 0.5) {
      var o = document.createElement("option");
      o.textContent = fmt(h);
      timeSel.appendChild(o);
    }
  }
  if (shopSel) { shopSel.addEventListener("change", fillDays); daySel.addEventListener("change", fillTimes); fillDays(); }

  function validate(form) {
    var ok = true;
    $$("[required]", form).forEach(function (input) {
      var v = input.value.trim();
      var bad = !v || (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) || (input.type === "tel" && v.replace(/\D/g, "").length < 9);
      input.setAttribute("aria-invalid", String(bad));
      var err = $('[data-error="' + input.name + '"]', form);
      if (err) err.textContent = bad ? input.getAttribute("data-message") : "";
      if (bad) ok = false;
    });
    if (!ok) $('[aria-invalid="true"]', form).focus();
    return ok;
  }

  var checkout = $("#order-form");
  if (checkout) checkout.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!Object.keys(basket).length || !validate(checkout)) return;
    $("[data-done-detail]").textContent = "Collect from " + shopSel.value + " on " + daySel.options[daySel.selectedIndex].textContent.replace("Tomorrow, ", "") + " at " + timeSel.value + ". Pay when you collect.";
    basket = {}; save();
    checkout.hidden = true;
    $("#order-done").hidden = false;
    $("#order-done").scrollIntoView({ behavior: "smooth", block: "center" });
  });
  save();

  /* ---------------------------------------------------------------- cakes */
  var cake = $("#cake-form");
  if (cake) {
    var date = $("#cake-date");
    var min = new Date(now); min.setDate(min.getDate() + 3);
    date.min = min.toISOString().slice(0, 10);
    var price = function () {
      var size = $('input[name="size"]:checked', cake), flavour = $('input[name="flavour"]:checked', cake);
      var p = Number(size.getAttribute("data-price")) + Number(flavour.getAttribute("data-extra") || 0);
      $$('input[name="extra"]:checked', cake).forEach(function (x) { p += Number(x.getAttribute("data-extra")); });
      $("[data-cake-price]").textContent = money(p);
      return p;
    };
    cake.addEventListener("change", price);
    var msg = $("#cake-message"), left = $("[data-chars]");
    msg.addEventListener("input", function () { left.textContent = (40 - msg.value.length) + " characters left"; });
    cake.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = validate(cake);
      if (date.value && date.value < date.min) {
        date.setAttribute("aria-invalid", "true");
        $('[data-error="date"]', cake).textContent = "We need three days’ notice for celebration cakes.";
        ok = false;
      }
      if (!ok) return;
      $("[data-cake-done]").textContent = "A " + $('input[name="size"]:checked', cake).value.toLowerCase() + " " + $('input[name="flavour"]:checked', cake).value.toLowerCase() + " cake for " +
        new Date(date.value + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) + ", " + money(price()) + ". We’ll call to confirm and take a deposit.";
      cake.hidden = true;
      $("#cake-done").hidden = false;
    });
    price();
  }

  $$("[data-signup]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      f.innerHTML = '<p style="margin:0;color:#fbf6ee">Thanks, see you on Friday.</p>';
    });
  });

  var wholesale = $("#wholesale-form");
  if (wholesale) wholesale.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate(wholesale)) return;
    wholesale.hidden = true;
    $("#wholesale-done").hidden = false;
  });
})();
