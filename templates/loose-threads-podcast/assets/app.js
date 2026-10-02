/* Loose Threads — podcast site behaviour. No dependencies. */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var fmt = function (s) {
    s = Math.max(0, Math.floor(s));
    var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
    return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(sec).padStart(2, "0");
  };
  var parseTime = function (str) {
    return str.split(":").reduce(function (acc, p) { return acc * 60 + Number(p); }, 0);
  };

  /* Membership prices are monthly; a year costs this many months. */
  var MONTHS_PER_YEAR = 10;

  /* ------------------------------------------------------------ nav */
  var toggle = $(".nav-toggle"), nav = $("#nav");
  if (toggle && nav) toggle.addEventListener("click", function () {
    toggle.setAttribute("aria-expanded", String(nav.classList.toggle("is-open")));
  });
  var listenBtn = $("[data-listen]"), listenMenu = $("#listen-menu");
  if (listenBtn) {
    listenBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = listenMenu.hidden;
      listenMenu.hidden = !open;
      listenBtn.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", function (e) {
      if (!listenMenu.hidden && !e.target.closest(".listen")) { listenMenu.hidden = true; listenBtn.setAttribute("aria-expanded", "false"); }
    });
  }

  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add("is-in"); });

  var toast = $(".toast"), toastTimer;
  var say = function (msg) {
    toast.textContent = msg; toast.classList.add("is-on");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toast.classList.remove("is-on"); }, 2400);
  };

  /* ---------------------------------------------------------- player
     Each episode element carries its details as data attributes:
     data-ep, data-title, data-sub, data-duration (seconds) and data-audio.
     If the audio file can't be played (for example before you've added
     your MP3s), the player runs in preview mode and simulates playback. */
  var KEY = "loosethreads-player";
  var player = $("#player"), audio = $("[data-p-audio]");
  var seek = $("[data-p-seek]");
  var SPEEDS = [1, 1.25, 1.5, 2, 0.75];
  var state = { ep: null, t: 0, playing: false, demo: false, speed: 0 };
  var demoTimer = null;

  var epFrom = function (el) {
    var box = el.closest("[data-ep]");
    if (!box) return null;
    var c = $(".ep-art", box) || $(".cover", box);
    return {
      id: box.getAttribute("data-ep"), title: box.getAttribute("data-title"), sub: box.getAttribute("data-sub"),
      duration: Number(box.getAttribute("data-duration")), audio: box.getAttribute("data-audio"),
      cover: c ? c.outerHTML : ""
    };
  };
  var save = function () {
    try { localStorage.setItem(KEY, JSON.stringify({ ep: state.ep, t: state.t })); } catch (e) { /* private mode */ }
  };
  var render = function () {
    if (!state.ep) return;
    var d = state.ep.duration;
    $("[data-p-now]").textContent = fmt(state.t);
    $("[data-p-dur]").textContent = fmt(d);
    seek.max = d;
    seek.value = state.t;
    seek.style.setProperty("--p", (state.t / d * 100) + "%");
    player.classList.toggle("is-playing", state.playing);
    $("[data-p-toggle]").setAttribute("aria-label", state.playing ? "Pause" : "Play");
    $("[data-p-demo]").hidden = !state.demo;
    $$("[data-ep]").forEach(function (el) {
      el.classList.toggle("is-playing", state.playing && el.getAttribute("data-ep") === state.ep.id);
    });
    syncPage();
  };
  var show = function (ep) {
    state.ep = ep;
    $("[data-p-cover]").innerHTML = ep.cover;
    $("[data-p-title]").textContent = ep.title;
    $("[data-p-sub]").textContent = ep.sub;
    player.hidden = false;
    document.body.classList.add("has-player");
    requestAnimationFrame(function () { player.classList.add("is-on"); });
  };
  var stopDemo = function () { clearInterval(demoTimer); demoTimer = null; };
  var play = function () {
    state.playing = true;
    if (state.demo) {
      stopDemo();
      demoTimer = setInterval(function () {
        state.t += 0.25 * SPEEDS[state.speed];
        if (state.t >= state.ep.duration) { state.t = state.ep.duration; pause(); }
        render();
      }, 250);
    } else {
      if (audio.getAttribute("src") !== state.ep.audio) { audio.src = state.ep.audio; }
      audio.playbackRate = SPEEDS[state.speed];
      var p = audio.play();
      if (p && p.catch) p.catch(function () { state.demo = true; play(); });
    }
    render();
  };
  var pause = function () {
    state.playing = false;
    stopDemo();
    if (!audio.paused) audio.pause();
    save();
    render();
  };
  var seekTo = function (t) {
    state.t = Math.max(0, Math.min(state.ep.duration, t));
    if (!state.demo && audio.readyState > 0) audio.currentTime = state.t;
    render();
    save();
  };
  var load = function (ep, t) {
    if (state.ep && state.ep.id === ep.id) return;
    pause();
    show(ep);
    state.t = t || 0;
    state.demo = false;
    audio.removeAttribute("src");
    render();
  };

  if (player) {
    audio.addEventListener("loadedmetadata", function () {
      if (audio.duration && isFinite(audio.duration)) state.ep.duration = audio.duration;
      if (state.t) audio.currentTime = state.t;
    });
    audio.addEventListener("timeupdate", function () { if (!state.demo) { state.t = audio.currentTime; render(); } });
    audio.addEventListener("ended", function () { state.playing = false; render(); });
    audio.addEventListener("error", function () { if (state.playing && !state.demo) { state.demo = true; play(); } });

    $$("[data-play]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var ep = epFrom(btn);
        if (state.ep && state.ep.id === ep.id) { state.playing ? pause() : play(); return; }
        load(ep, 0);
        play();
      });
    });
    $("[data-p-toggle]").addEventListener("click", function () { state.playing ? pause() : play(); });
    $$("[data-p-skip]").forEach(function (b) {
      b.addEventListener("click", function () { seekTo(state.t + Number(b.getAttribute("data-p-skip"))); });
    });
    seek.addEventListener("input", function () { seekTo(Number(seek.value)); });
    $("[data-p-speed]").addEventListener("click", function (e) {
      state.speed = (state.speed + 1) % SPEEDS.length;
      e.currentTarget.textContent = SPEEDS[state.speed] + "×";
      audio.playbackRate = SPEEDS[state.speed];
      if (state.playing && state.demo) play();
    });
    $("[data-p-close]").addEventListener("click", function () {
      pause();
      player.classList.remove("is-on");
      document.body.classList.remove("has-player");
      setTimeout(function () { player.hidden = true; }, 400);
      try { localStorage.removeItem(KEY); } catch (e) { /* private mode */ }
    });
    document.addEventListener("keydown", function (e) {
      if (e.code !== "Space" || !state.ep || /input|textarea|select|button/i.test(e.target.tagName)) return;
      e.preventDefault();
      state.playing ? pause() : play();
    });
    window.addEventListener("pagehide", save);

    /* Pick up where the visitor left off, on any page. */
    try {
      var saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (saved && saved.ep) { show(saved.ep); state.t = saved.t || 0; render(); }
    } catch (e) { /* ignore */ }
  }

  /* -------------------------------------------- episode page: sync & share */
  var pageEp = $("[data-page-ep]");
  var lines = $$("[data-transcript] .line"), chapters = $$("[data-chapters] li");
  var lastNow = null;
  function syncPage() {
    if (!pageEp || !state.ep || state.ep.id !== pageEp.getAttribute("data-ep")) return;
    var mark = function (list) {
      var now = null;
      list.forEach(function (el) { if (Number(el.getAttribute("data-t")) <= state.t) now = el; });
      list.forEach(function (el) { el.classList.toggle("is-now", el === now); });
      return now;
    };
    mark(chapters);
    var line = mark(lines);
    var panel = $("#p-tr");
    if (line && line !== lastNow && state.playing && !panel.hidden && !$("[data-t-search]").value) {
      var r = line.getBoundingClientRect();
      if (r.top < 80 || r.bottom > innerHeight - 120) line.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    lastNow = line;
  }
  if (pageEp) {
    $$("[data-seek]").forEach(function (b) {
      b.addEventListener("click", function () {
        load(epFrom(pageEp), 0);
        seekTo(Number(b.getAttribute("data-seek")));
        play();
      });
    });
    $$("[data-share]").forEach(function (b) {
      b.addEventListener("click", function () {
        var url = location.href.split("#")[0];
        var atTime = b.getAttribute("data-share") === "time";
        var t = state.ep && state.ep.id === pageEp.getAttribute("data-ep") ? state.t : 0;
        if (atTime) url += "#t=" + fmt(t);
        var done = function () { say(atTime ? "Link copied, starting at " + fmt(t) : "Link copied"); };
        if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () { say(url); });
        else say(url);
      });
    });
    var m = /#t=([\d:]+)/.exec(location.hash);
    if (m && player) {
      load(epFrom(pageEp), 0);
      seekTo(parseTime(m[1]));
      say("Ready to play from " + m[1]);
    }

    /* Tabs */
    var tabs = $$('[role="tab"]');
    var select = function (tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        $("#" + t.getAttribute("aria-controls")).hidden = !on;
      });
    };
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t); });
      t.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!d) return;
        var next = tabs[(i + d + tabs.length) % tabs.length];
        select(next); next.focus();
      });
    });

    /* Transcript search: highlights matches and hides other lines. */
    var tInput = $("[data-t-search]");
    var originals = lines.map(function (l) { return $("p", l).textContent; });
    var esc = function (s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
    tInput.addEventListener("input", function () {
      var q = tInput.value.trim().toLowerCase(), hits = 0;
      lines.forEach(function (l, i) {
        var text = originals[i], p = $("p", l);
        if (!q) { p.textContent = text; l.hidden = false; return; }
        var at = text.toLowerCase().indexOf(q);
        l.hidden = at === -1;
        if (at === -1) { p.textContent = text; return; }
        hits++;
        var out = "", from = 0, lower = text.toLowerCase();
        while (at !== -1) {
          out += esc(text.slice(from, at)) + "<mark>" + esc(text.slice(at, at + q.length)) + "</mark>";
          from = at + q.length;
          at = lower.indexOf(q, from);
        }
        p.innerHTML = out + esc(text.slice(from));
      });
      $("[data-t-count]").textContent = q ? hits + (hits === 1 ? " line mentions" : " lines mention") + " “" + tInput.value.trim() + "”" : "";
    });
  }
  if (player && state.ep) render();

  /* ----------------------------------------------------- episode list */
  var list = $("[data-eps]");
  if (list) {
    var rows = $$(".ep", list);
    var topic = "all";
    var input = $("[data-ep-search]"), sort = $("[data-ep-sort]"), more = $("[data-ep-more]");
    var apply = function () {
      var q = input.value.trim().toLowerCase(), shown = 0;
      var filtering = q || topic !== "all";
      list.classList.toggle("show-all", !!filtering || list.classList.contains("expanded"));
      rows.forEach(function (r) {
        var ok = (topic === "all" || r.getAttribute("data-topic") === topic) && (!q || r.getAttribute("data-search").indexOf(q) !== -1);
        r.classList.toggle("is-out", !ok);
        if (ok) shown++;
      });
      $("[data-ep-empty]").hidden = shown > 0;
      more.parentNode.hidden = !!filtering || list.classList.contains("expanded");
      var key = sort.value;
      rows.slice().sort(function (a, b) {
        if (key === "short") return a.getAttribute("data-duration") - b.getAttribute("data-duration");
        var d = a.getAttribute("data-ep") - b.getAttribute("data-ep");
        return key === "old" ? d : -d;
      }).forEach(function (r) { list.appendChild(r); });
    };
    input.addEventListener("input", apply);
    sort.addEventListener("change", function () { list.classList.add("expanded"); apply(); });
    $$("[data-topic-filter]").forEach(function (c) {
      c.addEventListener("click", function () {
        topic = c.getAttribute("data-topic-filter");
        $$("[data-topic-filter]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === c)); });
        apply();
      });
    });
    more.addEventListener("click", function () { list.classList.add("expanded"); apply(); });
  }

  /* ------------------------------------------------------------- forms */
  var validate = function (form) {
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
  };
  var done = function (form, box) { form.hidden = true; box.hidden = false; box.focus(); };

  $$("[data-news]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = $("input", f), v = input.value.trim();
      var bad = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
      input.setAttribute("aria-invalid", String(bad));
      $("[data-news-error]", f).textContent = bad ? "That email doesn’t look quite right." : "";
      if (bad) { input.focus(); return; }
      f.innerHTML = '<p style="font-weight:700;font-size:1.1rem">You’re in. The next Offcuts lands with episode 49.</p>';
    });
  });

  /* ----------------------------------------------------------- support */
  var billing = $$('input[name="billing"]');
  if (billing.length) {
    var yearly = function () { return $('input[name="billing"]:checked').value === "year"; };
    var money = function (n) { return "£" + (n % 1 ? n.toFixed(2) : n); };
    var planSel = $("#j-plan");
    var paint = function () {
      var y = yearly();
      $$("[data-price]").forEach(function (el) {
        if (el.tagName === "OPTION") return;
        var m = Number(el.getAttribute("data-price"));
        $("[data-amount]", el).textContent = money(y ? m * MONTHS_PER_YEAR : m);
        $("[data-per]", el).textContent = y ? "/ year" : "/ month";
      });
      var opt = planSel.options[planSel.selectedIndex];
      var price = Number(opt.getAttribute("data-price"));
      $("[data-sum-plan]").textContent = opt.value;
      $("[data-sum-billing]").textContent = y ? "Yearly (2 months free)" : "Monthly";
      $("[data-sum-total]").textContent = "£" + (y ? price * MONTHS_PER_YEAR : price).toFixed(2);
    };
    billing.forEach(function (r) { r.addEventListener("change", paint); });
    planSel.addEventListener("change", paint);
    $$("[data-plan]").forEach(function (a) {
      a.addEventListener("click", function () { planSel.value = a.getAttribute("data-plan"); paint(); });
    });
    paint();
    var join = $("#join-form");
    join.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(join)) return;
      $("[data-join-text]").textContent = "Thanks, " + $("#j-name").value.trim().split(" ")[0] + ". You’re a " + planSel.value + " now. Your private feed link is on its way to " + $("#j-email").value.trim() + ".";
      done(join, $("#join-done"));
    });
    var sp = $("#sponsor-form");
    sp.addEventListener("submit", function (e) {
      e.preventDefault();
      if (validate(sp)) done(sp, $("#sponsor-done"));
    });
  }
})();
