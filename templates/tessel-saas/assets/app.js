/* Tessel — product site behaviour. No dependencies. */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var gbp = function (n, dp) { return "£" + n.toLocaleString("en-GB", { minimumFractionDigits: dp || 0, maximumFractionDigits: dp || 0 }); };
  var DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  var DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  /* ------------------------------------------------------- demo rota data
     The interactive rota in the hero. Days run Monday (0) to Sunday (6). */
  var STAFF = [
    { id: "sam", name: "Sam Patel", initials: "SP", role: "lead", rate: 13.5, max: 40, off: [] },
    { id: "mia", name: "Mia Chen", initials: "MC", role: "bar", rate: 12.21, max: 32, off: [] },
    { id: "jonah", name: "Jonah Reid", initials: "JR", role: "kitchen", rate: 12.8, max: 40, off: [2] },
    { id: "ama", name: "Ama Owusu", initials: "AO", role: "floor", rate: 12.21, max: 40, off: [] },
    { id: "leo", name: "Leo Park", initials: "LP", role: "bar", rate: 11.5, max: 24, off: [6] }
  ];
  var ROLES = { lead: "Shift lead", floor: "Floor", bar: "Bar", kitchen: "Kitchen" };
  /* Forecast sales per day, Monday first, and the labour target. */
  var FORECAST = [900, 850, 950, 1050, 1400, 1700, 1150];
  var TARGET = 0.28;
  var MIN_REST = 11; /* hours between shifts */
  /* [person, day, start, end, role] */
  var START = [
    ["sam", 0, 8, 16, "lead"], ["sam", 1, 8, 16, "lead"], ["sam", 3, 12, 20, "lead"], ["sam", 4, 8, 16, "lead"], ["sam", 6, 10, 18, "lead"],
    ["mia", 0, 7, 15, "bar"], ["mia", 2, 7, 15, "bar"], ["mia", 3, 7, 15, "bar"], ["mia", 4, 7, 15, "bar"], ["mia", 5, 7, 15, "bar"],
    ["jonah", 0, 10, 18, "kitchen"], ["jonah", 1, 10, 18, "kitchen"], ["jonah", 3, 10, 18, "kitchen"], ["jonah", 4, 10, 18, "kitchen"], ["jonah", 5, 10, 18, "kitchen"],
    ["ama", 0, 11, 19, "floor"], ["ama", 2, 8, 16, "lead"], ["ama", 4, 11, 19, "floor"], ["ama", 5, 9, 17, "floor"], ["ama", 6, 9, 17, "floor"],
    ["leo", 1, 11, 17, "bar"], ["leo", 5, 10, 18, "bar"]
  ];

  var toastEl = $(".toast"), toastTimer;
  var toast = function (msg) {
    if (!toastEl) return;
    toastEl.textContent = msg; toastEl.classList.add("is-on");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, 2600);
  };

  /* ------------------------------------------------------------ header */
  var header = $(".header");
  var onScroll = function () { header.classList.toggle("is-stuck", window.scrollY > 4); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  var toggle = $(".nav-toggle"), nav = $("#nav");
  if (toggle && nav) toggle.addEventListener("click", function () { toggle.setAttribute("aria-expanded", String(nav.classList.toggle("is-open"))); });
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add("is-in"); });

  var hrs = function (s) { return s.end - s.start; };
  var fmtTime = function (h) { return (h % 24) + (h % 1 ? ":30" : ""); };
  var staffById = function (id) { return STAFF.filter(function (p) { return p.id === id; })[0]; };

  /* ---------------------------------------------------------------- rota */
  var rota = $("[data-rota]");
  var shifts = START.map(function (s, i) { return { id: i, who: s[0], day: s[1], start: s[2], end: s[3], role: s[4] }; });
  var selected = null, fresh = [];
  var at = function (who, day) { return shifts.filter(function (s) { return s.who === who && s.day === day; })[0]; };
  var hoursOf = function (who) { return shifts.filter(function (s) { return s.who === who; }).reduce(function (t, s) { return t + hrs(s); }, 0); };

  var checks = function () {
    var out = [];
    DAYS.forEach(function (d, i) {
      if (!shifts.some(function (s) { return s.day === i && s.role === "lead"; })) out.push({ bad: true, text: DAY_NAMES[i] + " has no shift lead" });
    });
    STAFF.forEach(function (p) {
      var h = hoursOf(p.id);
      if (h > p.max) out.push({ bad: true, text: p.name.split(" ")[0] + " is " + (h - p.max) + "h over their " + p.max + "h contract" });
      for (var d = 0; d < 6; d++) {
        var a = at(p.id, d), b = at(p.id, d + 1);
        if (a && b && b.start + 24 - a.end < MIN_REST) out.push({ bad: true, text: p.name.split(" ")[0] + " has under " + MIN_REST + "h rest before " + DAY_NAMES[d + 1] });
      }
    });
    if (!out.length) out.push({ bad: false, text: "No gaps, overtime or rest-break problems" });
    return out;
  };

  var render = function () {
    if (!rota) return;
    rota.innerHTML = "";
    var corner = document.createElement("div");
    corner.className = "rota__head"; corner.innerHTML = "<b>Team</b>Hours this week";
    rota.appendChild(corner);
    var monday = weekStart();
    DAYS.forEach(function (d, i) {
      var h = document.createElement("div");
      var date = new Date(monday.getTime() + i * 864e5);
      h.className = "rota__head" + (i > 4 ? " is-weekend" : "");
      h.innerHTML = "<b></b><span></span>";
      h.firstChild.textContent = d + " " + date.getDate();
      h.lastChild.textContent = "Sales " + gbp(FORECAST[i]);
      rota.appendChild(h);
    });
    STAFF.forEach(function (p) {
      var cell = document.createElement("div");
      var h = hoursOf(p.id);
      cell.className = "person";
      cell.innerHTML = '<span class="av"></span><div><b></b><small></small></div>';
      $(".av", cell).textContent = p.initials;
      $(".av", cell).style.background = "var(--r-" + p.role + ")";
      $(".av", cell).style.color = "var(--r-" + p.role + "-ink)";
      $("b", cell).textContent = p.name;
      var sm = $("small", cell);
      sm.textContent = h + "/" + p.max + "h · " + gbp(p.rate, 2);
      sm.classList.toggle("is-over", h > p.max);
      rota.appendChild(cell);
      DAYS.forEach(function (d, i) {
        var c = document.createElement("div");
        c.className = "cell" + (i > 4 ? " is-weekend" : "") + (p.off.indexOf(i) !== -1 ? " is-off" : "");
        c.setAttribute("data-who", p.id); c.setAttribute("data-day", i);
        var s = at(p.id, i);
        if (s) {
          var b = document.createElement("button");
          b.type = "button"; b.className = "shift" + (fresh.indexOf(s.id) !== -1 ? " is-new" : "") + (selected === s.id ? " is-selected" : "");
          b.setAttribute("data-role", s.role); b.setAttribute("data-id", s.id);
          b.setAttribute("aria-label", p.name + ", " + DAY_NAMES[i] + ", " + fmtTime(s.start) + " to " + fmtTime(s.end) + ", " + ROLES[s.role] + ". Press Enter to pick up, then arrow keys to move.");
          b.setAttribute("aria-pressed", String(selected === s.id));
          b.innerHTML = "<b></b><span></span>";
          b.firstChild.textContent = fmtTime(s.start) + "–" + fmtTime(s.end);
          b.lastChild.textContent = ROLES[s.role];
          c.appendChild(b);
        } else if (selected !== null && p.off.indexOf(i) === -1) c.classList.add("is-empty-pick");
        rota.appendChild(c);
      });
    });
    fresh = [];
    summarise();
  };

  var summarise = function () {
    var hours = 0, cost = 0;
    shifts.forEach(function (s) { var h = hrs(s); hours += h; cost += h * staffById(s.who).rate; });
    var sales = FORECAST.reduce(function (a, b) { return a + b; }, 0);
    var pct = cost / sales;
    $("[data-total-hours]").textContent = hours + "h";
    $("[data-total-cost]").textContent = gbp(cost);
    $("[data-labour-pct]").textContent = (pct * 100).toFixed(1) + "%";
    var m = $("[data-meter]");
    m.style.setProperty("--v", Math.min(100, pct / .4 * 100) + "%");
    m.classList.toggle("is-high", pct > TARGET);
    $("[data-total-shifts]").textContent = shifts.length;
    $("[data-issues]").innerHTML = checks().map(function (c) { return '<li class="' + (c.bad ? "" : "is-ok") + '"></li>'; }).join("");
    $$("[data-issues] li").forEach(function (li, i) { li.textContent = checks()[i].text; });
    paintPayroll();
  };

  /* Move shift `id` to a person and day. Swaps if the cell is taken. */
  var move = function (id, who, day) {
    var s = shifts.filter(function (x) { return x.id === id; })[0];
    if (!s || (s.who === who && s.day === day)) return false;
    var p = staffById(who);
    if (p.off.indexOf(day) !== -1) { toast(p.name.split(" ")[0] + " is off on " + DAY_NAMES[day] + "."); return false; }
    var other = at(who, day);
    if (other) {
      other.who = s.who; other.day = s.day; fresh.push(other.id);
    }
    s.who = who; s.day = day; fresh.push(s.id);
    return true;
  };

  var weekOffset = 0;
  function weekStart() {
    var d = new Date(); d.setHours(0, 0, 0, 0);
    var dow = (d.getDay() + 6) % 7;
    return new Date(d.getTime() + (7 - dow + weekOffset * 7) * 864e5);
  }
  var paintWeek = function () {
    var m = weekStart(), e = new Date(m.getTime() + 6 * 864e5);
    var f = function (x) { return x.getDate() + " " + x.toLocaleDateString("en-GB", { month: "short" }); };
    $("[data-week-label]").textContent = (weekOffset === 0 ? "Next week · " : "") + f(m) + " – " + f(e);
  };

  if (rota) {
    paintWeek();
    $$("[data-week]").forEach(function (b) {
      b.addEventListener("click", function () { weekOffset += Number(b.getAttribute("data-week")); paintWeek(); render(); });
    });

    /* Pointer drag, with a click-to-pick-up fallback for touch and keyboard. */
    var drag = null, ghost = null, target = null;
    rota.addEventListener("pointerdown", function (e) {
      var el = e.target.closest(".shift");
      if (!el || e.button > 0) return;
      drag = { el: el, id: Number(el.getAttribute("data-id")), x: e.clientX, y: e.clientY, moved: false };
    });
    window.addEventListener("pointermove", function (e) {
      if (!drag) return;
      if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 6) return;
      if (!drag.moved) {
        drag.moved = true;
        ghost = drag.el.cloneNode(true); ghost.classList.add("ghost"); ghost.style.width = drag.el.offsetWidth + "px";
        document.body.appendChild(ghost);
        drag.el.style.opacity = ".35";
      }
      e.preventDefault();
      ghost.style.left = e.clientX - 20 + "px"; ghost.style.top = e.clientY - 16 + "px";
      var under = document.elementFromPoint(e.clientX, e.clientY);
      var cell = under && under.closest && under.closest(".cell");
      if (target && target !== cell) target.classList.remove("is-target");
      target = cell && rota.contains(cell) ? cell : null;
      if (target) target.classList.add("is-target");
    });
    window.addEventListener("pointerup", function () {
      if (!drag) return;
      var d = drag; drag = null;
      if (ghost) { ghost.remove(); ghost = null; }
      if (d.moved) {
        d.el.style.opacity = "";
        if (target) {
          target.classList.remove("is-target");
          selected = null;
          move(d.id, target.getAttribute("data-who"), Number(target.getAttribute("data-day")));
          target = null;
          render();
        }
        suppressClick = true;
      }
    });
    var suppressClick = false;
    rota.addEventListener("click", function (e) {
      if (suppressClick) { suppressClick = false; return; }
      var el = e.target.closest(".shift"), cell = e.target.closest(".cell");
      if (el) {
        var id = Number(el.getAttribute("data-id"));
        if (selected !== null && selected !== id) {
          var o = shifts.filter(function (x) { return x.id === id; })[0];
          move(selected, o.who, o.day); selected = null;
        } else selected = selected === id ? null : id;
        render();
        var again = $('.shift[data-id="' + id + '"]', rota);
        if (again) again.focus();
        return;
      }
      if (cell && selected !== null && !cell.classList.contains("is-off")) {
        var moved = selected;
        move(selected, cell.getAttribute("data-who"), Number(cell.getAttribute("data-day")));
        selected = null; render();
        var m = $('.shift[data-id="' + moved + '"]', rota); if (m) m.focus();
      } else if (cell && selected !== null) toast(staffById(cell.getAttribute("data-who")).name.split(" ")[0] + " is off that day.");
    });
    rota.addEventListener("keydown", function (e) {
      var el = e.target.closest(".shift");
      if (!el || selected === null || Number(el.getAttribute("data-id")) !== selected) return;
      var s = shifts.filter(function (x) { return x.id === selected; })[0];
      var ids = STAFF.map(function (p) { return p.id; });
      var who = ids.indexOf(s.who), day = s.day;
      if (e.key === "ArrowLeft") day--; else if (e.key === "ArrowRight") day++;
      else if (e.key === "ArrowUp") who--; else if (e.key === "ArrowDown") who++;
      else if (e.key === "Escape") { selected = null; render(); return; } else return;
      e.preventDefault();
      if (day < 0 || day > 6 || who < 0 || who >= ids.length) return;
      var keep = selected;
      if (move(keep, ids[who], day)) { render(); var m = $('.shift[data-id="' + keep + '"]', rota); if (m) m.focus(); }
    });

    $("[data-fix]").addEventListener("click", function () {
      var changes = 0;
      /* Missing leads: promote someone already working, else add a shift. */
      DAYS.forEach(function (d, i) {
        if (shifts.some(function (s) { return s.day === i && s.role === "lead"; })) return;
        var onFloor = shifts.filter(function (s) { return s.day === i && s.role === "floor"; })[0];
        if (onFloor) { onFloor.role = "lead"; fresh.push(onFloor.id); changes++; return; }
        var free = STAFF.filter(function (p) { return !at(p.id, i) && p.off.indexOf(i) === -1 && hoursOf(p.id) + 8 <= p.max; })[0];
        if (free) { var n = { id: shifts.length + 100, who: free.id, day: i, start: 9, end: 17, role: "lead" }; shifts.push(n); fresh.push(n.id); changes++; }
      });
      /* Overtime: hand shifts to someone in the same role with spare hours. */
      STAFF.forEach(function (p) {
        shifts.filter(function (s) { return s.who === p.id; }).slice().reverse().forEach(function (s) {
          if (hoursOf(p.id) <= p.max) return;
          var to = STAFF.filter(function (q) { return q.id !== p.id && q.role === s.role && !at(q.id, s.day) && q.off.indexOf(s.day) === -1 && hoursOf(q.id) + hrs(s) <= q.max; })[0];
          if (to) { s.who = to.id; fresh.push(s.id); changes++; }
        });
      });
      selected = null;
      render();
      toast(changes ? "Fixed " + changes + (changes === 1 ? " thing" : " things") + ". Changes are highlighted." : "Nothing to fix. Nice rota!");
    });
    $("[data-publish]").addEventListener("click", function () {
      var bad = checks().filter(function (c) { return c.bad; }).length;
      toast(bad ? "Published with " + bad + " warning" + (bad > 1 ? "s" : "") + ". " + STAFF.length + " people notified." : "Rota published. " + STAFF.length + " people notified by app and text.");
    });
    render();
  }

  /* --------------------------------------------------------- feature tour */
  var tabs = $$(".tour__tab");
  var pick = function (t) {
    tabs.forEach(function (x) {
      var on = x === t;
      x.setAttribute("aria-selected", String(on)); x.tabIndex = on ? 0 : -1;
      $("#" + x.getAttribute("aria-controls")).hidden = !on;
    });
  };
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { pick(t); });
    t.addEventListener("keydown", function (e) {
      var d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var n = tabs[(i + d + tabs.length) % tabs.length]; pick(n); n.focus();
    });
  });
  $$("[data-swap]").forEach(function (b) {
    b.addEventListener("click", function () {
      var ok = b.getAttribute("data-swap") === "ok", box = b.parentNode;
      box.outerHTML = '<span class="tag ' + (ok ? "tag--ok" : "tag--wait") + '">' + (ok ? "Approved" : "Declined") + "</span>";
      toast(ok ? "Swap approved. Both people have been told." : "Swap declined with a note.");
    });
  });
  var clockBtn = $("[data-clock]");
  if (clockBtn) {
    var started = null, timer;
    clockBtn.addEventListener("click", function () {
      if (started) {
        clearInterval(timer); started = null;
        clockBtn.textContent = "Clock in"; clockBtn.classList.remove("is-in");
        $("[data-clock-note]").textContent = "Clocked out. Your hours are in today’s timesheet.";
        return;
      }
      started = Date.now();
      clockBtn.textContent = "Clock out"; clockBtn.classList.add("is-in");
      $("[data-clock-note]").textContent = "Clocked in at " + new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      timer = setInterval(function () {
        var s = Math.floor((Date.now() - started) / 1000);
        $("[data-clock-time]").textContent = [s / 3600, s / 60 % 60, s % 60].map(function (n) { return String(Math.floor(n)).padStart(2, "0"); }).join(":");
      }, 250);
    });
  }
  var bars = $("[data-bars]");
  if (bars) {
    var wages = [262, 238, 247, 268, 330, 402, 290];
    var sales = [2400, 2200, 2500, 2800, 3900, 4600, 3000];
    bars.innerHTML = sales.map(function (s, i) {
      return '<div data-d="' + DAYS[i] + '" style="height:' + (s / 4600 * 100) + '%" title="' + DAY_NAMES[i] + ": " + Math.round(wages[i] * 4 / s * 100) + '% labour"><i style="height:' + (wages[i] * 4 / s * 100) + '%"></i></div>';
    }).join("");
  }
  function paintPayroll() {
    var box = $("[data-payroll]");
    if (!box) return;
    box.innerHTML = "";
    STAFF.forEach(function (p) {
      var h = hoursOf(p.id), row = document.createElement("div");
      row.className = "mini-row";
      row.innerHTML = '<span class="av"></span><div><span></span><small></small></div><b class="mono"></b>';
      $(".av", row).textContent = p.initials; $(".av", row).style.background = "var(--r-" + p.role + ")";
      $("div span", row).textContent = p.name;
      $("small", row).textContent = h + "h at " + gbp(p.rate, 2) + (h > p.max ? " · " + (h - p.max) + "h overtime" : "");
      $("b", row).textContent = gbp(h * p.rate, 2);
      box.appendChild(row);
    });
  }
  var exp = $("[data-export]");
  if (exp) exp.addEventListener("click", function () {
    var lines = [["Employee", "Hours", "Rate", "Overtime hours", "Gross pay"]];
    STAFF.forEach(function (p) {
      var h = hoursOf(p.id);
      lines.push([p.name, h, p.rate.toFixed(2), Math.max(0, h - p.max), (h * p.rate).toFixed(2)]);
    });
    var blob = new Blob([lines.map(function (l) { return l.join(","); }).join("\n")], { type: "text/csv" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "tessel-payroll.csv";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    toast("Payroll file downloaded, built from the rota above.");
  });

  /* -------------------------------------------------------------- pricing */
  var team = $("[data-team]");
  if (team) {
    var FREE_LIMIT = 5;
    var paintPrices = function () {
      var n = Number(team.value), yearly = $('input[name="billing"]:checked').value === "year";
      $("[data-team-out]").textContent = n === 150 ? "150+" : n;
      team.style.setProperty("--p", ((n - 1) / 149 * 100) + "%");
      $$("[data-plan]").forEach(function (card) {
        var per = Number(card.getAttribute(yearly ? "data-year" : "data-month"));
        var total = $("[data-total]", card);
        if (!per) {
          $("[data-price]", card).textContent = "£0";
          total.textContent = n <= FREE_LIMIT ? "Free for your team of " + n : "Up to " + FREE_LIMIT + " people (you have " + n + ")";
          card.style.opacity = n <= FREE_LIMIT ? "" : ".6";
          return;
        }
        $("[data-price]", card).textContent = gbp(per, per % 1 ? 2 : 0);
        $("[data-per]", card).textContent = yearly ? "per person / month, billed yearly" : "per person / month";
        var y = per * n * 12, m = per * n;
        total.textContent = yearly ? gbp(y, y % 1 ? 2 : 0) + " a year for " + n + " people" : gbp(m, m % 1 ? 2 : 0) + " a month for " + n + " people";
      });
    };
    team.addEventListener("input", paintPrices);
    $$('input[name="billing"]').forEach(function (r) { r.addEventListener("change", paintPrices); });
    paintPrices();
  }

  /* ------------------------------------------------------------ changelog */
  var rel = $("[data-releases]");
  if (rel) {
    var kind = "all", q = $("[data-cl-search]");
    var items = $$("li[data-kind]", rel);
    ["all", "new", "improved", "fixed"].forEach(function (k) {
      $('[data-count="' + k + '"]').textContent = k === "all" ? items.length : items.filter(function (i) { return i.getAttribute("data-kind") === k; }).length;
    });
    var apply = function () {
      var term = q.value.trim().toLowerCase(), any = false;
      $$("[data-release]", rel).forEach(function (r) {
        var title = (r.querySelector("h2").textContent + " " + r.querySelector("p").textContent).toLowerCase();
        var shown = 0;
        $$("li[data-kind]", r).forEach(function (li) {
          var ok = (kind === "all" || li.getAttribute("data-kind") === kind) && (!term || li.textContent.toLowerCase().indexOf(term) !== -1 || title.indexOf(term) !== -1);
          li.hidden = !ok; if (ok) shown++;
        });
        r.hidden = !shown; if (shown) any = true;
      });
      $("[data-cl-none]").hidden = any;
    };
    q.addEventListener("input", apply);
    $$("[data-kind-filter]").forEach(function (b) {
      b.addEventListener("click", function () {
        kind = b.getAttribute("data-kind-filter");
        $$("[data-kind-filter]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        apply();
      });
    });
  }
  $$("[data-subscribe]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = $("input", f), ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
      input.setAttribute("aria-invalid", String(!ok));
      $("[data-sub-error]", f).textContent = ok ? "" : "Please enter a valid email.";
      if (ok) f.innerHTML = "<p><b>You’re subscribed.</b> See you at the next big release.</p>";
    });
  });

  /* --------------------------------------------------------------- signup */
  var wiz = $("#wizard");
  if (wiz) {
    var ROLE_SETS = {
      cafe: ["Barista", "Floor", "Kitchen", "Shift lead"], restaurant: ["Front of house", "Bar", "Chef", "Kitchen porter", "Manager"],
      bar: ["Bar", "Floor", "Kitchen", "Door", "Manager"], shop: ["Sales floor", "Tills", "Stockroom", "Supervisor"],
      care: ["Carer", "Senior carer", "Nurse", "Kitchen", "Housekeeping"], gym: ["Front desk", "Instructor", "Cleaning", "Duty manager"]
    };
    /* Opening hours per business type, Monday first. null is closed. */
    var HOUR_SETS = {
      cafe: [[7, 17], [7, 17], [7, 17], [7, 17], [7, 17], [8, 17], [9, 16]], restaurant: [null, [12, 22], [12, 22], [12, 22], [12, 23], [12, 23], [12, 21]],
      bar: [[16, 23], [16, 23], [16, 23], [16, 24], [12, 24], [12, 24], [12, 22]], shop: [[9, 18], [9, 18], [9, 18], [9, 18], [9, 18], [9, 18], [10, 16]],
      care: [[7, 22], [7, 22], [7, 22], [7, 22], [7, 22], [7, 22], [7, 22]], gym: [[6, 22], [6, 22], [6, 22], [6, 22], [6, 22], [8, 20], [8, 20]]
    };
    var step = 1, LAST = 4;
    var biz = function () { return $('input[name="biz"]:checked', wiz).value; };
    var timeOpts = function (sel) {
      var o = "";
      for (var h = 5; h <= 24; h++) o += '<option value="' + h + '"' + (h === sel ? " selected" : "") + ">" + (h === 24 ? "Midnight" : String(h).padStart(2, "0") + ":00") + "</option>";
      return o;
    };
    var buildStep2 = function () {
      $("[data-roles]").innerHTML = ROLE_SETS[biz()].map(function (r) {
        return '<label class="chip"><input type="checkbox" name="roles" value="' + r + '" checked><span>' + r + "</span></label>";
      }).join("");
    };
    var buildStep3 = function () {
      var hs = HOUR_SETS[biz()];
      $("[data-hours-list]").innerHTML = DAY_NAMES.map(function (d, i) {
        var h = hs[i] || [9, 17];
        return '<div class="hours-row' + (hs[i] ? "" : " is-closed") + '" data-day="' + i + '"><b>' + d + '</b><label class="switch"><input type="checkbox" aria-label="Open on ' + d + '"' + (hs[i] ? " checked" : "") + '><i></i></label>' +
          '<div class="times"><select aria-label="' + d + ' opens">' + timeOpts(h[0]) + '</select>to<select aria-label="' + d + ' closes">' + timeOpts(h[1]) + "</select></div></div>";
      }).join("");
      $$(".hours-row", wiz).forEach(function (row) {
        $("input", row).addEventListener("change", function (e) { row.classList.toggle("is-closed", !e.target.checked); });
      });
    };
    var show = function (n) {
      step = n;
      $$("[data-step]", wiz).forEach(function (s) { s.hidden = Number(s.getAttribute("data-step")) !== n; });
      $$(".progress i").forEach(function (b, i) { b.classList.toggle("is-done", i < n); });
      $("[data-back]").hidden = n === 1 || n > LAST;
      $("[data-wiz-nav]").hidden = n > LAST;
      $("[data-next]").innerHTML = n === LAST ? "Create account" : "Continue " + '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      var first = $('[data-step="' + n + '"] input, [data-step="' + n + '"]', wiz);
      if (n > 1 && first) setTimeout(function () { (n > LAST ? $('[data-step="5"]', wiz) : first).focus(); }, 30);
    };
    var valid = function () {
      var ok = true;
      $$('[data-step="' + step + '"] [required]', wiz).forEach(function (input) {
        var v = input.value.trim();
        var bad = !v || (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) || (input.minLength > 0 && v.length < input.minLength);
        input.setAttribute("aria-invalid", String(bad));
        var err = $('[data-error="' + input.name + '"]', wiz);
        if (err) err.textContent = bad ? input.getAttribute("data-message") : "";
        if (bad && ok) { input.focus(); ok = false; }
      });
      if (step === 2 && !$$('input[name="roles"]:checked', wiz).length) { toast("Pick at least one role."); ok = false; }
      return ok;
    };
    var pass = $("#w-pass");
    pass.addEventListener("input", function () {
      var v = pass.value, s = 0;
      if (v.length >= 10) s++;
      if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
      if (/\d/.test(v)) s++;
      if (/[^A-Za-z0-9]/.test(v) || v.length >= 16) s++;
      $("[data-strength]").className = "strength" + (v ? " s" + Math.max(1, s) : "");
    });
    var finish = function () {
      var roles = $$('input[name="roles"]:checked', wiz).map(function (i) { return i.value; }).slice(0, 4);
      var open = $$(".hours-row", wiz).map(function (row) {
        if (!$("input", row).checked) return null;
        var sel = $$("select", row);
        return [Number(sel[0].value), Number(sel[1].value)];
      });
      var site = $("#w-site").value.trim(), name = $("#w-name").value.trim().split(" ")[0];
      var colours = ["lead", "floor", "bar", "kitchen"];
      var grid = $("[data-ready-rota]");
      var html = '<div class="rota__head"><b>Role</b></div>' + DAYS.map(function (d) { return '<div class="rota__head"><b>' + d + "</b></div>"; }).join("");
      roles.forEach(function (r, ri) {
        html += '<div class="person"><b></b></div>';
        open.forEach(function (o, di) {
          if (!o) { html += '<div class="cell is-off"></div>'; return; }
          var len = Math.min(8, o[1] - o[0]);
          var early = (ri + di) % 2 === 0;
          var st = early ? o[0] : o[1] - len;
          html += '<div class="cell"><span class="shift" data-role="' + colours[ri % 4] + '"><b>' + fmtTime(st) + "–" + fmtTime(st + len) + "</b></span></div>";
        });
      });
      grid.innerHTML = html;
      $$(".person b", grid).forEach(function (b, i) { b.textContent = roles[i]; });
      var days = open.filter(Boolean).length;
      $("[data-ready-title]").textContent = site + "’s first rota is drafted.";
      $("[data-ready-text]").textContent = "Welcome, " + name + ". Here’s a starting point: " + roles.length + " roles across " + days + " open days. Drag things around, add your team, then publish.";
      show(5);
    };
    wiz.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!valid()) return;
      if (step === 1) buildStep2();
      if (step === 2 && !$(".hours-row", wiz)) buildStep3();
      if (step === LAST) { finish(); return; }
      show(step + 1);
    });
    $$('input[name="biz"]', wiz).forEach(function (r) { r.addEventListener("change", function () { $("[data-hours-list]").innerHTML = ""; }); });
    $("[data-back]").addEventListener("click", function () { show(step - 1); });
    show(1);
  }
})();
