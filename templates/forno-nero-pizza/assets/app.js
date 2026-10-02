/* Forno Nero — pizzeria behaviour. No dependencies. */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  /* ------------------------------------------------------------ settings */
  /* Opening hours, Sunday first, as [open, close] in 24-hour decimals. */
  var HOURS = [[12, 21], null, [17, 22], [17, 22], [17, 22], [12, 23], [12, 23]];
  /* Minutes until a collection order is ready, and a delivery arrives. */
  var COLLECT_MINS = 20, DELIVER_MINS = 40;
  /* Delivery zones by the first part of the postcode. Fees in pence. */
  var ZONES = [
    { name: "Zone 1", areas: ["M1", "M2", "M3", "M4"], fee: 199, eta: "25–35 min", colour: "#2f6b3a" },
    { name: "Zone 2", areas: ["M8", "M11", "M12", "M13", "M15", "M40"], fee: 299, eta: "35–50 min", colour: "#f29a3a" }
  ];
  var FREE_OVER = 2500, MIN_DELIVERY = 1500;
  var MAX_TOPPINGS = 8;

  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var money = function (p) { return "£" + (p / 100).toFixed(p % 100 ? 2 : 0); };
  var clock = function (h) { var hh = Math.floor(h) % 24, mm = Math.round((h % 1) * 60); return String(hh).padStart(2, "0") + ":" + String(mm).padStart(2, "0"); };
  var nice = function (h) { var hh = Math.floor(h) % 24; return (hh % 12 || 12) + (h % 1 ? ":" + String(Math.round((h % 1) * 60)).padStart(2, "0") : "") + (hh < 12 ? "am" : "pm"); };
  /* Day and time in the UK, wherever the visitor is. */
  var ukNow = function () {
    var p = {};
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23" })
      .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    return { dow: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday), h: Number(p.hour) + Number(p.minute) / 60 };
  };
  var now = ukNow();
  var today = HOURS[now.dow];
  var openNow = !!(today && now.h >= today[0] && now.h < today[1] - .25);
  var nextOpen = function () {
    if (today && now.h < today[0]) return { dow: now.dow, h: today[0], label: "today at " + nice(today[0]) };
    for (var i = 1; i <= 7; i++) {
      var d = (now.dow + i) % 7;
      if (HOURS[d]) return { dow: d, h: HOURS[d][0], label: (i === 1 ? "tomorrow" : DAYS[d]) + " at " + nice(HOURS[d][0]) };
    }
  };

  /* ---------------------------------------------------------- nav & bits */
  var toggle = $(".nav-toggle"), nav = $("#nav");
  if (toggle && nav) toggle.addEventListener("click", function () { toggle.setAttribute("aria-expanded", String(nav.classList.toggle("is-open"))); });
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add("is-in"); });
  var toastEl = $(".toast"), toastT;
  var toast = function (m) { toastEl.textContent = m; toastEl.classList.add("is-on"); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove("is-on"); }, 2200); };

  /* --------------------------------------------------------------- status */
  var line = $("[data-status-line]"), status = $("[data-status]");
  var no = nextOpen();
  if (line) line.innerHTML = openNow
    ? "<b>Open now</b> · collection in about " + COLLECT_MINS + " minutes · free delivery over " + money(FREE_OVER)
    : "<b>Closed right now</b> · opens " + no.label + " · pre-order any time";
  if (status) {
    status.classList.toggle("is-closed", !openNow);
    $("span", status).textContent = openNow ? "Oven’s hot · open until " + nice(today[1]) : "Closed · back " + no.label;
  }
  $$("[data-hours]").forEach(function (ul) {
    [1, 2, 3, 4, 5, 6, 0].forEach(function (d) {
      var li = document.createElement("li");
      li.innerHTML = "<span></span><span></span>";
      li.firstChild.textContent = DAYS[d];
      li.lastChild.textContent = HOURS[d] ? nice(HOURS[d][0]) + " – " + nice(HOURS[d][1]) : "Closed";
      if (d === now.dow) li.className = "is-today";
      ul.appendChild(li);
    });
  });
  $$("[data-deal-day]").forEach(function (d) {
    if (Number(d.getAttribute("data-deal-day")) === now.dow) { d.classList.add("is-today"); $("small", d).textContent += " · Tonight"; }
  });

  /* ------------------------------------------------------------- delivery */
  var zoneFor = function (pc) {
    var out = pc.toUpperCase().replace(/\s+/g, " ").trim();
    out = out.indexOf(" ") > 0 ? out.split(" ")[0] : out.slice(0, Math.max(2, out.length - 3));
    return ZONES.filter(function (z) { return z.areas.indexOf(out) !== -1; })[0] || null;
  };
  var zonesBox = $("[data-zones]");
  if (zonesBox) zonesBox.innerHTML = ZONES.map(function (z) {
    return '<div class="zone"><i style="background:' + z.colour + '"></i><div><b>' + z.name + " · " + z.eta + "</b><small>" + z.areas.join(", ") + "</small></div><b>" + money(z.fee) + "</b></div>";
  }).join("") + '<div class="zone"><i style="background:var(--accent)"></i><div><b>Free delivery</b><small>On orders over ' + money(FREE_OVER) + ", any zone</small></div><b>£0</b></div>";
  var check = $("[data-check]");
  if (check) check.addEventListener("submit", function (e) {
    e.preventDefault();
    var pc = $("input", check).value.trim(), res = $("[data-check-result]");
    res.hidden = false;
    if (!/^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d?[A-Za-z]{0,2}$/.test(pc)) { res.className = "result is-no"; res.textContent = "That doesn’t look like a UK postcode. Try something like M4 6XX."; return; }
    var z = zoneFor(pc);
    res.className = "result " + (z ? "is-ok" : "is-no");
    res.textContent = z ? "Yes! You’re in " + z.name + ": " + money(z.fee) + " delivery (free over " + money(FREE_OVER) + "), usually " + z.eta + "." : "Sorry, we don’t deliver there yet. You’re welcome to collect: we’re at 48 Jersey Street, M4.";
  });

  /* --------------------------------------------------------------- basket */
  var KEY = "forno-basket";
  var basket;
  try { basket = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { basket = []; }
  var drawer = $("#drawer"), scrim = $("[data-scrim]"), lastFocus;
  var subtotal = function () { return basket.reduce(function (s, b) { return s + b.price * b.qty; }, 0); };
  var save = function () { try { localStorage.setItem(KEY, JSON.stringify(basket)); } catch (e) { /* private mode */ } render(); };
  var add = function (item) {
    var found = basket.filter(function (b) { return b.key === item.key; })[0];
    if (found) found.qty = Math.min(20, found.qty + 1); else basket.push(item);
    save();
    toast(item.name + " added");
  };
  var lineHtml = function (b, i) {
    return '<div class="line" data-i="' + i + '"><div><b></b><small></small><div class="qty"><button type="button" data-q="-1" aria-label="One fewer">−</button><span></span><button type="button" data-q="1" aria-label="One more">+</button></div></div><b class="price"></b></div>';
  };
  var fillLines = function (box) {
    box.innerHTML = basket.length ? basket.map(lineHtml).join("") : '<p class="empty">Your basket is empty. <a class="link" href="menu.html">See the menu</a></p>';
    $$(".line", box).forEach(function (row) {
      var b = basket[Number(row.getAttribute("data-i"))];
      $("div > b", row).textContent = b.name;
      $("small", row).textContent = b.detail || "";
      $(".qty span", row).textContent = b.qty;
      $(".price", row).textContent = money(b.price * b.qty);
    });
  };
  var onQty = function (e) {
    var btn = e.target.closest("[data-q]");
    if (!btn) return;
    var i = Number(btn.closest(".line").getAttribute("data-i"));
    basket[i].qty += Number(btn.getAttribute("data-q"));
    if (basket[i].qty < 1) basket.splice(i, 1);
    save();
  };
  function render() {
    var n = basket.reduce(function (s, b) { return s + b.qty; }, 0), sub = subtotal();
    $$("[data-count]").forEach(function (el) { el.textContent = n; });
    if (drawer) {
      fillLines($("[data-lines]", drawer));
      $("[data-subtotal]").textContent = money(sub);
      $("[data-free-note]").textContent = sub >= FREE_OVER ? "You’ve got free delivery" : "Spend " + money(FREE_OVER - sub) + " more for free delivery";
    }
    paintCheckout();
  }
  var openDrawer = function () { lastFocus = document.activeElement; drawer.classList.add("is-open"); scrim.classList.add("is-open"); drawer.removeAttribute("aria-hidden"); $("[data-close-basket]").focus(); };
  var closeDrawer = function () { drawer.classList.remove("is-open"); scrim.classList.remove("is-open"); drawer.setAttribute("aria-hidden", "true"); if (lastFocus) lastFocus.focus(); };
  if (drawer) {
    $$("[data-open-basket]").forEach(function (b) { b.addEventListener("click", openDrawer); });
    $("[data-close-basket]").addEventListener("click", closeDrawer);
    scrim.addEventListener("click", closeDrawer);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && drawer.classList.contains("is-open")) closeDrawer(); });
    $("[data-lines]", drawer).addEventListener("click", onQty);
    $("[data-to-checkout]").addEventListener("click", function () { if (location.pathname.indexOf("order.html") !== -1) closeDrawer(); });
  }
  $$("[data-add]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var el = btn.closest("[data-item]");
      add({ key: el.getAttribute("data-item"), name: el.getAttribute("data-name"), price: Number(el.getAttribute("data-price")), qty: 1 });
    });
  });

  /* ----------------------------------------------------------------- menu */
  var filters = $$("[data-filter]");
  if (filters.length) {
    var applyMenu = function () {
      var on = filters.filter(function (f) { return f.checked; }).map(function (f) { return f.value; });
      $$(".menu-section").forEach(function (sec) {
        var shown = 0;
        $$(".item", sec).forEach(function (it) {
          var tags = (it.getAttribute("data-tags") || "").split(" ");
          var ok = on.every(function (t) { return t === "v" ? tags.indexOf("v") !== -1 || tags.indexOf("vg") !== -1 : tags.indexOf(t) !== -1; });
          it.classList.toggle("is-out", !ok);
          if (ok) shown++;
        });
        $("[data-none]", sec).hidden = shown > 0;
      });
    };
    filters.forEach(function (f) { f.addEventListener("change", applyMenu); });
    var tabs = $$(".tabs a");
    if ("IntersectionObserver" in window) {
      var to = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) tabs.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id); }); });
      }, { rootMargin: "-35% 0px -60% 0px" });
      $$(".menu-section").forEach(function (s) { to.observe(s); });
    }
  }

  /* -------------------------------------------------------------- builder */
  var svg = $("[data-pizza]");
  var choice = {};
  /* Small repeatable random numbers, so toppings don't jump around. */
  var rand = function (seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  var spots = function (seed, n, side, rMax) {
    var r = rand(seed), out = [], tries = 0;
    while (out.length < n && tries++ < 400) {
      var a = r() * Math.PI * 2, d = Math.sqrt(r()) * rMax;
      var x = 200 + Math.cos(a) * d, y = 200 + Math.sin(a) * d;
      if (side === "left" && x > 192) continue;
      if (side === "right" && x < 208) continue;
      if (out.some(function (p) { return Math.hypot(p[0] - x, p[1] - y) < 20; })) continue;
      out.push([x, y, r() * 360]);
    }
    return out;
  };
  var SHAPES = {
    salami: function (x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="14" fill="#b8321f"/><circle cx="' + (x - 4) + '" cy="' + (y - 3) + '" r="2" fill="#e8a593"/><circle cx="' + (x + 5) + '" cy="' + (y + 4) + '" r="1.6" fill="#e8a593"/>'; },
    sausage: function (x, y) { return '<g fill="#8b5a3c"><circle cx="' + x + '" cy="' + y + '" r="6"/><circle cx="' + (x + 6) + '" cy="' + (y + 3) + '" r="5"/><circle cx="' + (x - 3) + '" cy="' + (y + 6) + '" r="4.5"/></g>'; },
    ham: function (x, y, a) { return '<rect x="' + (x - 10) + '" y="' + (y - 7) + '" width="20" height="14" rx="4" fill="#e7a2a0" transform="rotate(' + a + " " + x + " " + y + ')"/>'; },
    nduja: function (x, y, a) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="11" ry="8" fill="#9c1f12" opacity=".92" transform="rotate(' + a + " " + x + " " + y + ')"/>'; },
    mushroom: function (x, y, a) { return '<g transform="rotate(' + a + " " + x + " " + y + ')"><path d="M' + (x - 11) + " " + y + "a11 9 0 0 1 22 0Z" + '" fill="#d9c3a0" stroke="#a8906b" stroke-width="1.5"/><rect x="' + (x - 4) + '" y="' + y + '" width="8" height="9" rx="2" fill="#e6d6b8" stroke="#a8906b" stroke-width="1.5"/></g>'; },
    olive: function (x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="6.5" fill="none" stroke="#2a2522" stroke-width="4.5"/>'; },
    pepper: function (x, y, a) { return '<path d="M' + (x - 12) + " " + y + "q12 -12 24 0" + '" fill="none" stroke="#d63a2a" stroke-width="6" stroke-linecap="round" transform="rotate(' + a + " " + x + " " + y + ')"/>'; },
    onion: function (x, y, a) { return '<path d="M' + (x - 10) + " " + (y + 4) + "a11 11 0 0 1 20 0" + '" fill="none" stroke="#9a4a8a" stroke-width="3.2" stroke-linecap="round" transform="rotate(' + a + " " + x + " " + y + ')"/>'; },
    artichoke: function (x, y, a) { return '<path d="M' + x + " " + (y - 11) + "c8 4 8 16 0 22c-8 -6 -8 -18 0 -22Z" + '" fill="#a6b36a" stroke="#7d8a45" stroke-width="1.2" transform="rotate(' + a + " " + x + " " + y + ')"/>'; },
    chilli: function (x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="5.5" fill="#e23b2b"/><circle cx="' + x + '" cy="' + y + '" r="2" fill="#f8d36b"/>'; },
    basil: function (x, y, a) { return '<path d="M' + (x - 10) + " " + y + "q10 -12 20 0q-10 12 -20 0Z" + '" fill="#3f8a3a" transform="rotate(' + a + " " + x + " " + y + ')"/>'; },
    rocket: function (x, y, a) { return '<path d="M' + (x - 12) + " " + y + "q4 -6 8 0t8 0t8 0" + '" fill="none" stroke="#4f8f2f" stroke-width="3.4" stroke-linecap="round" transform="rotate(' + a + " " + x + " " + y + ')"/>'; }
  };
  var drawPizza = function () {
    var sauce = $('input[name="sauce"]:checked').value, cheese = $('input[name="cheese"]:checked').value;
    var s = '<defs><radialGradient id="crust" cx="50%" cy="45%" r="55%"><stop offset="70%" stop-color="#e8b26a"/><stop offset="100%" stop-color="#b9762f"/></radialGradient>' +
      '<radialGradient id="rosso" cx="45%" cy="40%" r="60%"><stop offset="0%" stop-color="#d9472c"/><stop offset="100%" stop-color="#b12d19"/></radialGradient></defs>';
    s += '<circle cx="200" cy="200" r="182" fill="url(#crust)"/>';
    var r0 = rand(7);
    for (var i = 0; i < 34; i++) {
      var a = r0() * Math.PI * 2, d = 160 + r0() * 18;
      s += '<ellipse cx="' + (200 + Math.cos(a) * d).toFixed(1) + '" cy="' + (200 + Math.sin(a) * d).toFixed(1) + '" rx="' + (3 + r0() * 5).toFixed(1) + '" ry="' + (2 + r0() * 3).toFixed(1) + '" fill="#3a2416" opacity="' + (.45 + r0() * .4).toFixed(2) + '"/>';
    }
    s += '<circle cx="200" cy="200" r="150" fill="' + (sauce === "rosso" ? "url(#rosso)" : "#f3e5cc") + '"/>';
    if (cheese !== "none") {
      var rc = rand(11);
      for (var c = 0; c < 17; c++) {
        var ca = rc() * Math.PI * 2, cd = Math.sqrt(rc()) * 118;
        s += '<ellipse cx="' + (200 + Math.cos(ca) * cd).toFixed(1) + '" cy="' + (200 + Math.sin(ca) * cd).toFixed(1) + '" rx="' + (15 + rc() * 12).toFixed(1) + '" ry="' + (11 + rc() * 9).toFixed(1) + '" fill="' + (cheese === "vegan" ? "#f6eed6" : "#fffbf1") + '" opacity=".96"/>';
      }
    }
    var halves = Object.keys(choice).some(function (k) { return choice[k] !== "whole"; });
    if (halves) s += '<path d="M200 52V348" stroke="rgba(28,23,20,.25)" stroke-width="2" stroke-dasharray="6 7"/>';
    Object.keys(choice).forEach(function (k, idx) {
      var where = choice[k], seed = (idx + 3) * 97 + k.length * 13;
      var pts = spots(seed, where === "whole" ? 9 : 5, where, 128);
      pts.forEach(function (p) { s += SHAPES[k](p[0].toFixed(1), p[1].toFixed(1), Math.round(p[2])); });
    });
    svg.innerHTML = s;
  };
  var buildPrice = function () {
    var p = Number($('input[name="size"]:checked').getAttribute("data-price"));
    var ch = $('input[name="cheese"]:checked'); p += Number(ch.getAttribute("data-price") || 0);
    if ($('input[name="gf"]').checked) p += 200;
    Object.keys(choice).forEach(function (k) {
      var tp = Number($('[data-topping="' + k + '"]').getAttribute("data-price"));
      p += choice[k] === "whole" ? tp : Math.round(tp / 2);
    });
    return p;
  };
  var describe = function () {
    var size = $('input[name="size"]:checked').value + "″";
    var bits = [$('input[name="sauce"]:checked').value === "rosso" ? "Tomato" : "White"];
    var ch = $('input[name="cheese"]:checked').value;
    bits.push(ch === "fior" ? "fior di latte" : ch === "vegan" ? "vegan mozzarella" : "no cheese");
    if ($('input[name="gf"]').checked) bits.push("gluten-free");
    var tops = Object.keys(choice).map(function (k) {
      var n = $('[data-topping="' + k + '"] b').textContent;
      return choice[k] === "whole" ? n : n + " (" + choice[k] + ")";
    });
    return { size: size, text: bits.join(", ") + (tops.length ? " · " + tops.join(", ") : "") };
  };
  var paintBuilder = function () {
    drawPizza();
    $("[data-build-price]").textContent = money(buildPrice());
    var d = describe();
    $("[data-build-name]").textContent = d.size + " · " + d.text;
    $$("[data-topping]").forEach(function (t) {
      var k = t.getAttribute("data-topping");
      t.classList.toggle("is-on", !!choice[k]);
      $$("[data-where]", t).forEach(function (b) { b.setAttribute("aria-pressed", String(choice[k] === b.getAttribute("data-where"))); });
    });
    $("[data-top-note]").textContent = Object.keys(choice).length + " of " + MAX_TOPPINGS + " toppings. Choose Left or Right to put a topping on one half only; half toppings are half price.";
  };
  if (svg) {
    $$("[data-where]").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.closest("[data-topping]").getAttribute("data-topping"), w = b.getAttribute("data-where");
        if (choice[k] === w) delete choice[k];
        else {
          if (!choice[k] && Object.keys(choice).length >= MAX_TOPPINGS) { toast("That’s " + MAX_TOPPINGS + " toppings, our limit. The dough can only take so much."); return; }
          choice[k] = w;
        }
        paintBuilder();
      });
    });
    $$(".steps input").forEach(function (i) { i.addEventListener("change", paintBuilder); });
    $("[data-build-add]").addEventListener("click", function () {
      var d = describe();
      add({ key: "custom-" + Date.now(), name: "Your pizza (" + d.size + ")", detail: d.text, price: buildPrice(), qty: 1 });
    });
    $("[data-build-reset]").addEventListener("click", function () {
      choice = {};
      $('input[name="size"][value="12"]').checked = true; $('input[name="sauce"][value="rosso"]').checked = true;
      $('input[name="cheese"][value="fior"]').checked = true; $('input[name="gf"]').checked = false;
      paintBuilder();
    });
    choice = { basil: "whole" };
    paintBuilder();
  }

  /* ------------------------------------------------------------- checkout */
  var co = $("#checkout-form");
  var method = function () { var m = $('input[name="method"]:checked'); return m ? m.value : "collect"; };
  var deliveryFee = function () {
    if (method() !== "deliver") return 0;
    var z = zoneFor(($("#co-pc") || {}).value || "");
    if (!z) return null;
    return subtotal() >= FREE_OVER ? 0 : z.fee;
  };
  var slots = function () {
    var out = [], deliver = method() === "deliver", lead = (deliver ? DELIVER_MINS : COLLECT_MINS) / 60;
    var day = now.dow, from, close;
    if (openNow) { out.push(["asap", "As soon as possible (about " + (deliver ? DELIVER_MINS : COLLECT_MINS) + " min)"]); from = Math.ceil((now.h + lead + .25) * 4) / 4; close = today[1]; }
    else { var n = nextOpen(); day = n.dow; from = n.h + lead; close = HOURS[day][1]; }
    var prefix = day === now.dow ? "Today" : DAYS[day];
    for (var h = from; h <= close - .25 && out.length < 24; h += .25) out.push([prefix + " " + clock(h), prefix + " at " + clock(h)]);
    return out;
  };
  function paintCheckout() {
    if (!co) return;
    fillLines($("[data-checkout-lines]"));
    var sub = subtotal(), fee = deliveryFee();
    $("[data-co-sub]").textContent = money(sub);
    $("[data-co-delivery]").textContent = method() !== "deliver" ? "Collection, free" : fee === null ? "Enter a postcode" : fee ? money(fee) : "Free";
    $("[data-co-total]").textContent = money(sub + (fee || 0));
  }
  if (co) {
    $("[data-checkout-lines]").addEventListener("click", onQty);
    var timeSel = $("[data-times]");
    var paintTimes = function () { timeSel.innerHTML = slots().map(function (s) { return '<option value="' + s[0] + '">' + s[1] + "</option>"; }).join(""); };
    $("[data-collect-eta]").textContent = openNow ? "Ready in about " + COLLECT_MINS + " min" : "Pre-order for " + nextOpen().label;
    $$('input[name="method"]').forEach(function (r) {
      r.addEventListener("change", function () {
        var d = method() === "deliver";
        $$("[data-for-deliver]").forEach(function (el) { el.hidden = !d; $("input", el).required = d; });
        paintTimes(); paintCheckout();
      });
    });
    $("#co-pc").addEventListener("input", paintCheckout);
    paintTimes();
    co.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      $$("[required]", co).forEach(function (input) {
        var v = input.value.trim();
        var bad = !v || (input.type === "tel" && v.replace(/\D/g, "").length < 10) || (input.name === "postcode" && !zoneFor(v));
        input.setAttribute("aria-invalid", String(bad));
        $('[data-error="' + input.name + '"]', co).textContent = bad ? input.getAttribute("data-message") : "";
        if (bad) ok = false;
      });
      var err = $('[data-error="basket"]', co);
      err.textContent = !basket.length ? "Your basket is empty. Add something from the menu or build a pizza." :
        method() === "deliver" && subtotal() < MIN_DELIVERY ? "Delivery orders start at " + money(MIN_DELIVERY) + ". Add a little more, or switch to collection." : "";
      if (err.textContent) ok = false;
      if (!ok) { var f = $('[aria-invalid="true"]', co); if (f) f.focus(); return; }
      var when = timeSel.value === "asap" ? (method() === "deliver" ? "at your door in about " + DELIVER_MINS + " minutes" : "ready in about " + COLLECT_MINS + " minutes") : (method() === "deliver" ? "delivered " : "ready for collection ") + timeSel.options[timeSel.selectedIndex].text.toLowerCase();
      $("[data-placed-text]").textContent = "Thanks, " + $("#co-name").value.trim().split(" ")[0] + ". Your order is " + when + ". We’ll text " + $("#co-phone").value.trim() + " if anything changes.";
      $("[data-ticket]").textContent = "FN-" + String(Math.floor(1000 + Math.random() * 9000));
      basket = []; save();
      co.hidden = true;
      var p = $("#placed"); p.hidden = false; p.focus();
    });
  }
  render();
})();
