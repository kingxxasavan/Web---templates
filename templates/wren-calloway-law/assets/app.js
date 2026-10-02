/* Wren & Calloway — site behaviour. No dependencies. */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  /* ------------------------------------------------------------ settings */
  /* Opening hours per office, Sunday first, as [open, close] in 24-hour
     decimal (8.5 is 8.30am). null means closed. */
  var HOURS = {
    york: [null, [8.5, 17.5], [8.5, 17.5], [8.5, 17.5], [8.5, 17.5], [8.5, 17.5], [9.5, 12.5]],
    harrogate: [null, [8.5, 17.5], [8.5, 17.5], [8.5, 17.5], [8.5, 17.5], [8.5, 17.5], null]
  };
  /* Free first calls: the first and last start times each weekday. */
  var CALLS_FROM = 9, CALLS_TO = 16.5;
  /* The people who can be booked, matching the "Who" list on contact.html. */
  var PEOPLE = { helen: "Helen Wren", daniel: "Daniel Calloway", priya: "Priya Shah", tom: "Tom Okafor" };

  /* Conveyancing fees, before VAT. Each band is [up to this price, fee]. */
  var BUY_FEE = [[250000, 895], [500000, 1095], [1000000, 1395], [Infinity, 1795]];
  var SELL_FEE = [[250000, 795], [500000, 945], [1000000, 1195], [Infinity, 1495]];
  var EXTRAS = { leasehold: 350, mortgage: 150, idChecks: 24, transfer: 42 };
  var VAT = 0.2;
  /* Third-party costs, passed on at cost. Check the Land Registry's current
     fee scale before going live. */
  var SEARCHES = 320;
  var LAND_REGISTRY = [[80000, 20], [100000, 40], [200000, 100], [500000, 150], [1000000, 295], [Infinity, 500]];
  var LEASE_PACK = 350, LEASE_NOTICES = 150, OFFICE_COPIES = 12;
  /* Stamp Duty Land Tax, England and Northern Ireland, from 1 April 2025.
     Bands are [from, to, rate]. Update these if the rates change. */
  var SDLT = [[0, 125000, 0], [125000, 250000, .02], [250000, 925000, .05], [925000, 1500000, .10], [1500000, Infinity, .12]];
  var SDLT_FTB = [[0, 300000, 0], [300000, 500000, .05]];
  var FTB_LIMIT = 500000;
  var SURCHARGE = .05; /* added to every band if the buyer will own another home */

  /* --------------------------------------------------------------- helpers */
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var gbp = function (n) { return "£" + Math.round(n).toLocaleString("en-GB"); };
  var num = function (s) { return Number(String(s).replace(/[^\d.]/g, "")) || 0; };
  var clock = function (h) {
    var hh = Math.floor(h), mm = Math.round((h - hh) * 60);
    return (hh % 12 || 12) + "." + String(mm).padStart(2, "0") + (hh < 12 ? "am" : "pm");
  };
  /* The date and time in the UK, wherever the visitor is. */
  var ukNow = function () {
    var p = {};
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", hourCycle: "h23" })
      .formatToParts(new Date()).forEach(function (x) { p[x.type] = Number(x.value); });
    var date = new Date(Date.UTC(p.year, p.month - 1, p.day));
    return { date: date, dow: date.getUTCDay(), h: p.hour + p.minute / 60 };
  };
  var addDays = function (d, n) { return new Date(d.getTime() + n * 864e5); };
  var dayName = function (d, today) {
    var diff = Math.round((d - today) / 864e5);
    return diff === 0 ? "Today" : diff === 1 ? "Tomorrow" : DAYS[d.getUTCDay()];
  };
  /* A repeatable "is this slot taken?" so the diary looks lived-in. */
  var taken = function (key) {
    var h = 0;
    for (var i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
    return Math.abs(h) % 10 < 3;
  };
  var params = new URLSearchParams(location.search);
  var now = ukNow();

  /* ------------------------------------------------------------------ nav */
  var toggle = $(".nav-toggle"), nav = $("#nav");
  if (toggle && nav) toggle.addEventListener("click", function () {
    toggle.setAttribute("aria-expanded", String(nav.classList.toggle("is-open")));
  });
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add("is-in"); });

  /* ---------------------------------------------------------------- hours */
  var nextOpening = function (hours) {
    for (var i = 1; i <= 7; i++) {
      var dow = (now.dow + i) % 7;
      if (hours[dow]) return (i === 1 ? "tomorrow" : DAYS[dow]) + " " + clock(hours[dow][0]);
    }
    return "";
  };
  $$("[data-open]").forEach(function (el) {
    var hours = HOURS[el.getAttribute("data-open")], today = hours[now.dow], label = $("span", el);
    var open = today && now.h >= today[0] && now.h < today[1];
    el.classList.toggle("is-closed", !open);
    if (open) label.textContent = "Open now · closes " + clock(today[1]);
    else if (today && now.h < today[0]) label.textContent = "Closed · opens " + clock(today[0]) + " today";
    else label.textContent = "Closed · opens " + nextOpening(hours);
  });
  $$("[data-hours]").forEach(function (ul) {
    var hours = HOURS[ul.getAttribute("data-hours")];
    [1, 2, 3, 4, 5, 6, 0].forEach(function (d) {
      var li = document.createElement("li");
      li.innerHTML = "<span></span><span></span>";
      li.firstChild.textContent = DAYS[d];
      li.lastChild.textContent = hours[d] ? clock(hours[d][0]) + " – " + clock(hours[d][1]) : "Closed";
      if (d === now.dow) li.className = "is-today";
      ul.appendChild(li);
    });
  });

  /* ----------------------------------------------- free-call availability */
  /* The next working days with call slots, starting today if there's time. */
  var callDays = function (count) {
    var out = [], d = now.date;
    if (now.h > CALLS_TO - 1) d = addDays(d, 1);
    while (out.length < count) {
      var dow = d.getUTCDay();
      if (dow !== 0 && dow !== 6) out.push(d);
      d = addDays(d, 1);
    }
    return out;
  };
  var slotsFor = function (day, who) {
    var out = [];
    var isToday = day.getTime() === now.date.getTime();
    for (var h = CALLS_FROM; h <= CALLS_TO; h += .5) {
      var key = day.toISOString().slice(0, 10) + h + (who || "any");
      out.push({ h: h, off: (isToday && h < now.h + 1) || taken(key) });
    }
    return out;
  };
  var nextSlot = $("[data-next-slot]");
  if (nextSlot) {
    var found = null;
    callDays(5).some(function (d) {
      var s = slotsFor(d).filter(function (x) { return !x.off; })[0];
      if (s) found = dayName(d, now.date) + ", " + clock(s.h);
      return !!s;
    });
    nextSlot.textContent = found || "This week";
  }

  /* --------------------------------------------------------------- finder */
  var finder = $("[data-finder]");
  if (finder) finder.addEventListener("submit", function (e) {
    e.preventDefault();
    location.href = $("select", finder).value;
  });

  /* --------------------------------------------------------- conveyancing */
  var band = function (bands, price) {
    for (var i = 0; i < bands.length; i++) if (price <= bands[i][0]) return bands[i][1];
    return bands[bands.length - 1][1];
  };
  var sdlt = function (price, ftb, extra) {
    var useFtb = ftb && !extra && price <= FTB_LIMIT;
    var bands = useFtb ? SDLT_FTB : SDLT, rows = [], total = 0;
    bands.forEach(function (b) {
      if (price <= b[0]) return;
      var slice = Math.min(price, b[1]) - b[0];
      var rate = b[2] + (extra ? SURCHARGE : 0);
      var tax = slice * rate;
      total += tax;
      rows.push([gbp(b[0]) + (b[1] === Infinity ? "+" : " – " + gbp(b[1])) + " at " + Math.round(rate * 100) + "%", tax]);
    });
    return { total: Math.floor(total), rows: rows, ftb: useFtb };
  };
  var feeIncVat = function (type, price, sellPrice) {
    var fee = 0;
    if (type !== "sell") fee += band(BUY_FEE, price);
    if (type !== "buy") fee += band(SELL_FEE, type === "both" ? sellPrice : price);
    return fee * (1 + VAT);
  };
  var formatInput = function (input) {
    input.addEventListener("input", function () {
      var v = num(input.value);
      input.value = v ? v.toLocaleString("en-GB") : "";
    });
  };

  var qq = $("[data-qq]");
  if (qq) {
    var qqPrice = $("#qq-price");
    formatInput(qqPrice);
    var paintQQ = function () {
      var type = $('input[name="type"]:checked', qq).value;
      $("[data-qq-fee]").textContent = gbp(feeIncVat(type, num(qqPrice.value), num(qqPrice.value)));
    };
    qq.addEventListener("input", paintQQ);
    qq.addEventListener("submit", function (e) {
      e.preventDefault();
      location.href = "quote.html?type=" + $('input[name="type"]:checked', qq).value + "&price=" + num(qqPrice.value);
    });
    paintQQ();
  }

  var qf = $("[data-quote]");
  if (qf) {
    var buyIn = $("#q-buy"), sellIn = $("#q-sell");
    [buyIn, sellIn].forEach(formatInput);
    if (params.get("type")) {
      var r = $('input[name="type"][value="' + params.get("type") + '"]', qf);
      if (r) r.checked = true;
    }
    if (params.get("price")) {
      var p = num(params.get("price"));
      (params.get("type") === "sell" ? sellIn : buyIn).value = p.toLocaleString("en-GB");
    }
    var line = function (label, amount, cls) {
      return '<div class="q-line' + (cls ? " " + cls : "") + '"><span>' + label + "</span><span>" + gbp(amount) + "</span></div>";
    };
    var paintQuote = function () {
      var type = $('input[name="type"]:checked', qf).value;
      var lease = $('input[name="tenure"]:checked', qf).value === "leasehold";
      var mortgage = $('input[name="mortgage"]', qf).checked, ftb = $('input[name="ftb"]', qf).checked, extra = $('input[name="extra"]', qf).checked;
      var buy = num(buyIn.value), sell = num(sellIn.value);
      var buying = type !== "sell", selling = type !== "buy";
      $$("[data-for='buy']", qf).forEach(function (el) { el.hidden = !buying; });
      $$("[data-for='sell']", qf).forEach(function (el) { el.hidden = !selling; });

      var fees = [], disb = [];
      if (buying) fees.push(["Purchase legal fee", band(BUY_FEE, buy)]);
      if (selling) fees.push(["Sale legal fee", band(SELL_FEE, sell)]);
      if (lease) fees.push(["Leasehold supplement", EXTRAS.leasehold * (buying && selling ? 2 : 1)]);
      if (buying && mortgage) fees.push(["Acting for your lender", EXTRAS.mortgage]);
      fees.push(["ID and anti-money-laundering checks", EXTRAS.idChecks]);
      fees.push(["Bank transfer fee", EXTRAS.transfer * (buying && selling ? 2 : 1)]);
      var net = fees.reduce(function (s, f) { return s + f[1]; }, 0);
      fees.push(["VAT at " + Math.round(VAT * 100) + "%", net * VAT]);

      if (buying) {
        disb.push(["Property searches", SEARCHES]);
        disb.push(["Land Registry fee (estimate)", band(LAND_REGISTRY, buy)]);
        if (lease) disb.push(["Notices to the landlord (estimate)", LEASE_NOTICES]);
      }
      if (selling) {
        disb.push(["Land Registry title copies", OFFICE_COPIES]);
        if (lease) disb.push(["Management pack (estimate)", LEASE_PACK]);
      }
      var tax = buying ? sdlt(buy, ftb, extra) : { total: 0, rows: [] };
      var feeTotal = net * (1 + VAT), disbTotal = disb.reduce(function (s, d) { return s + d[1]; }, 0);

      $("[data-q-fees]").innerHTML = fees.map(function (f) { return line(f[0], f[1]); }).join("") + line("Our fee, including VAT", feeTotal, "is-sum");
      $("[data-q-disb]").innerHTML = disb.map(function (d) { return line(d[0], d[1]); }).join("") + line("Third-party costs", disbTotal, "is-sum");
      $("[data-q-sdlt-block]").hidden = !buying;
      $("[data-q-sdlt]").textContent = gbp(tax.total);
      $("[data-q-bands]").innerHTML = (tax.ftb ? "<tr><td colspan='2'>First-time buyer relief applied</td></tr>" : "") +
        tax.rows.map(function (rw) { return "<tr><td>" + rw[0] + "</td><td>" + gbp(rw[1]) + "</td></tr>"; }).join("");
      $("[data-q-total]").textContent = gbp(feeTotal + disbTotal + tax.total);
    };
    qf.addEventListener("input", paintQuote);
    qf.addEventListener("change", paintQuote);
    paintQuote();

    var send = $("[data-q-send]");
    send.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(send)) return;
      $("[data-q-done-text]").textContent = "Quote WC-" + String(Date.now()).slice(-5) + " is on its way to " + $("#q-email").value.trim() + ". It’s valid for 30 days, and Daniel will follow up within one working day.";
      send.hidden = true;
      var d = $("[data-q-done]"); d.hidden = false; d.focus();
    });
  }

  /* -------------------------------------------------------- practice page */
  var subLinks = $$(".subnav a");
  if (subLinks.length && "IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        subLinks.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    subLinks.forEach(function (a) { var t = $(a.getAttribute("href")); if (t) so.observe(t); });
  }
  var cb = $("[data-callback]");
  if (cb) cb.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate(cb)) return;
    var when = $("#cb-when").value;
    $("[data-callback-text]").textContent = "Thank you, " + $("#cb-name").value.trim().split(" ")[0] + ". A family solicitor will call " + $("#cb-phone").value.trim() + (when === "As soon as possible" ? " within two working hours." : " (" + when.toLowerCase() + ").");
    cb.hidden = true;
    var d = $("[data-callback-done]"); d.hidden = false; d.focus();
  });

  /* --------------------------------------------------------- booking a call */
  var book = $("#book");
  if (book) {
    var matter = $("#b-matter"), who = $("#b-who");
    if (params.get("matter") && $('option[value="' + params.get("matter") + '"]', matter)) matter.value = params.get("matter");
    if (params.get("to") && PEOPLE[params.get("to")]) who.value = params.get("to");
    var chosen = { day: null, h: null };
    var daysBox = $("[data-days]"), timesBox = $("[data-times]");
    var days = callDays(5);
    var summary = function () {
      var s = $("[data-summary]");
      if (chosen.h === null) { s.textContent = "Choose a time above."; return; }
      var d = chosen.day;
      s.textContent = dayName(d, now.date) + ", " + d.getUTCDate() + " " + MONTHS[d.getUTCMonth()] + " at " + clock(chosen.h) +
        (who.value === "any" ? ", with a " + matter.options[matter.selectedIndex].text.toLowerCase() + " solicitor" : ", with " + PEOPLE[who.value]);
    };
    var paintTimes = function () {
      timesBox.innerHTML = "";
      slotsFor(chosen.day, who.value).forEach(function (s) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "time"; b.textContent = clock(s.h);
        b.disabled = s.off;
        b.setAttribute("aria-pressed", String(chosen.h === s.h && !s.off));
        b.addEventListener("click", function () {
          chosen.h = s.h;
          $$(".time", timesBox).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
          $('[data-error="time"]', book).textContent = "";
          summary();
        });
        timesBox.appendChild(b);
      });
    };
    days.forEach(function (d, i) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "day";
      b.innerHTML = "<small></small><b></b><small></small>";
      b.children[0].textContent = i === 0 && d.getTime() === now.date.getTime() ? "Today" : DAYS[d.getUTCDay()].slice(0, 3);
      b.children[1].textContent = d.getUTCDate();
      b.children[2].textContent = MONTHS[d.getUTCMonth()].slice(0, 3);
      b.addEventListener("click", function () {
        chosen.day = d; chosen.h = null;
        $$(".day", daysBox).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        paintTimes(); summary();
      });
      b.setAttribute("aria-pressed", String(i === 0));
      daysBox.appendChild(b);
    });
    chosen.day = days[0];
    paintTimes();
    [matter, who].forEach(function (s) { s.addEventListener("change", function () { chosen.h = null; paintTimes(); summary(); }); });
    book.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = validate(book);
      if (chosen.h === null) { $('[data-error="time"]', book).textContent = "Please choose a time for your call."; ok = false; }
      if (!ok) return;
      $("[data-booked-text]").textContent = "Thanks, " + $("#b-name").value.trim().split(" ")[0] + ". " + $("[data-summary]").textContent + ". We’ll call " + $("#b-phone").value.trim() + " and email a confirmation to " + $("#b-email").value.trim() + ".";
      book.hidden = true;
      var d = $("#booked"); d.hidden = false; d.focus();
    });
  }

  /* ---------------------------------------------------------------- forms */
  function validate(form) {
    var ok = true;
    $$("[required]", form).forEach(function (input) {
      var v = input.type === "checkbox" ? (input.checked ? "y" : "") : input.value.trim();
      var bad = !v || (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) || (input.type === "tel" && v.replace(/\D/g, "").length < 10);
      input.setAttribute("aria-invalid", String(bad));
      var err = $('[data-error="' + input.name + '"]', form);
      if (err) err.textContent = bad ? input.getAttribute("data-message") : "";
      if (bad) ok = false;
    });
    var first = $('[aria-invalid="true"]', form);
    if (first) first.focus();
    return ok;
  }
})();
