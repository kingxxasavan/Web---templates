/* Leaf & Clay — shop behaviour. No dependencies. */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var money = function (p) { return "£" + (p / 100).toFixed(p % 100 ? 2 : 0); };

  /* Free delivery from this basket total, in pence. */
  var FREE_FROM = 5000;
  var DELIVERY = 595;

  var toggle = $(".nav-toggle"), nav = $("#nav");
  if (toggle && nav) toggle.addEventListener("click", function () {
    toggle.setAttribute("aria-expanded", String(nav.classList.toggle("is-open")));
  });

  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add("is-in"); });

  /* --------------------------------------------------------------- basket */
  var KEY = "leafclay-basket";
  var basket;
  try { basket = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { basket = []; }
  var drawer = $("#drawer"), scrim = $(".scrim"), toast = $(".toast"), lastFocus;
  var openDrawer = function () {
    lastFocus = document.activeElement;
    drawer.classList.add("is-open"); scrim.classList.add("is-open");
    drawer.removeAttribute("aria-hidden");
    $(".drawer__close", drawer).focus();
  };
  var closeDrawer = function () {
    drawer.classList.remove("is-open"); scrim.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    if (lastFocus) lastFocus.focus();
  };
  $$("[data-open-basket]").forEach(function (b) { b.addEventListener("click", function (e) { e.preventDefault(); openDrawer(); }); });
  $(".drawer__close", drawer).addEventListener("click", closeDrawer);
  scrim.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && drawer.classList.contains("is-open")) closeDrawer(); });

  var timer;
  function say(msg) {
    toast.textContent = msg; toast.classList.add("is-on");
    clearTimeout(timer); timer = setTimeout(function () { toast.classList.remove("is-on"); }, 2200);
  }
  function add(item) {
    var key = item.id + "|" + (item.option || "");
    var found = basket.filter(function (b) { return b.key === key; })[0];
    if (found) found.qty = Math.min(20, found.qty + item.qty);
    else basket.push({ key: key, id: item.id, name: item.name, option: item.option || "", price: item.price, img: item.img, qty: item.qty });
    save();
    say(item.name + " added to your basket");
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(basket)); } catch (e) { /* private mode */ }
    render();
  }
  function render() {
    var n = basket.reduce(function (s, b) { return s + b.qty; }, 0);
    var sub = basket.reduce(function (s, b) { return s + b.qty * b.price; }, 0);
    $$("[data-count]").forEach(function (el) { el.textContent = n; });
    var body = $(".drawer__body", drawer);
    body.innerHTML = "";
    if (!basket.length) body.innerHTML = '<p class="empty" style="margin-top:20px">Your basket is empty. Let’s find you a plant.</p>';
    basket.forEach(function (b, i) {
      var row = document.createElement("div");
      row.className = "line";
      row.innerHTML = '<img alt="" width="64" height="76"><div><b></b><small></small><div class="mini"><button type="button" aria-label="One fewer">−</button><span></span><button type="button" aria-label="One more">+</button></div></div><span></span>';
      $("img", row).src = b.img;
      $("b", row).textContent = b.name;
      $("small", row).textContent = b.option;
      $(".mini span", row).textContent = b.qty;
      row.lastChild.textContent = money(b.price * b.qty);
      var btns = $$(".mini button", row);
      btns[0].addEventListener("click", function () { b.qty--; if (!b.qty) basket.splice(i, 1); save(); });
      btns[1].addEventListener("click", function () { b.qty = Math.min(20, b.qty + 1); save(); });
      body.appendChild(row);
    });
    var left = Math.max(0, FREE_FROM - sub);
    $("[data-free-msg]", drawer).textContent = sub === 0 ? "Free delivery on orders over " + money(FREE_FROM) + "." : left ? "Spend " + money(left) + " more for free delivery." : "You’ve got free delivery.";
    $(".freebar i", drawer).style.width = Math.min(100, sub / FREE_FROM * 100) + "%";
    var delivery = sub && left ? DELIVERY : 0;
    $("[data-total]", drawer).textContent = money(sub + delivery);
    $("[data-delivery]", drawer).textContent = sub ? (delivery ? money(delivery) : "Free") : "—";
    $("[data-checkout]", drawer).disabled = !basket.length;
  }

  /* Products are read from the page so prices live in one place: the HTML. */
  function itemFrom(el) {
    return { id: el.getAttribute("data-product"), name: el.getAttribute("data-name"), price: Number(el.getAttribute("data-price")), img: el.getAttribute("data-img"), qty: 1 };
  }
  $$("[data-quick]").forEach(function (btn) {
    btn.addEventListener("click", function () { add(itemFrom(btn.closest("[data-product]"))); });
  });

  /* ------------------------------------------------------------ checkout */
  var form = $("#checkout");
  $("[data-checkout]", drawer).addEventListener("click", function () {
    form.hidden = false;
    $("input", form).focus();
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    $$("[required]", form).forEach(function (input) {
      var v = input.value.trim();
      var bad = !v || (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v));
      input.setAttribute("aria-invalid", String(bad));
      if (bad) ok = false;
    });
    if (!ok) { $('[aria-invalid="true"]', form).focus(); return; }
    basket = []; save();
    form.hidden = true;
    $(".drawer__body", drawer).innerHTML = '<div class="done"><h3>Thank you!</h3><p>Your plants are being wrapped. We’ll email tracking details when they leave the greenhouse, usually within two working days.</p></div>';
  });
  render();

  /* ------------------------------------------------------------ shop page */
  var grid = $("[data-shop]");
  if (grid) {
    var products = $$("[data-product]", grid);
    var state = { cat: new URLSearchParams(location.search).get("cat") || "all" };
    var apply = function () {
      var pet = $("#pet").checked, easy = $("#easy").checked, shown = 0;
      products.forEach(function (p) {
        var tags = p.getAttribute("data-tags") || "";
        var ok = (state.cat === "all" || p.getAttribute("data-cat") === state.cat) && (!pet || tags.indexOf("pet") !== -1) && (!easy || tags.indexOf("easy") !== -1);
        p.hidden = !ok; if (ok) shown++;
      });
      $("[data-shown]").textContent = shown + (shown === 1 ? " plant" : " plants");
      $("[data-none]").hidden = shown > 0;
      var sort = $("#sort").value;
      products.slice().sort(function (a, b) {
        if (sort === "low") return a.getAttribute("data-price") - b.getAttribute("data-price");
        if (sort === "high") return b.getAttribute("data-price") - a.getAttribute("data-price");
        return a.getAttribute("data-order") - b.getAttribute("data-order");
      }).forEach(function (p) { grid.appendChild(p); });
    };
    $$("[data-cat-filter]").forEach(function (c) {
      c.setAttribute("aria-pressed", String(c.getAttribute("data-cat-filter") === state.cat));
      c.addEventListener("click", function () {
        state.cat = c.getAttribute("data-cat-filter");
        $$("[data-cat-filter]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === c)); });
        apply();
      });
    });
    ["#pet", "#easy", "#sort"].forEach(function (s) { $(s).addEventListener("change", apply); });
    apply();
  }

  /* --------------------------------------------------------- product page */
  var pdp = $("[data-pdp]");
  if (pdp) {
    var main = $(".main-img img", pdp), qty = 1;
    $$(".thumbs button", pdp).forEach(function (b) {
      b.addEventListener("click", function () {
        $$(".thumbs button", pdp).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        main.src = $("img", b).src; main.alt = $("img", b).alt;
      });
    });
    var price = function () {
      var opt = $('input[name="pot"]:checked', pdp);
      return Number(pdp.getAttribute("data-price")) + Number(opt.getAttribute("data-extra"));
    };
    var paint = function () { $("[data-price-out]", pdp).textContent = money(price()); };
    $$('input[name="pot"]', pdp).forEach(function (r) { r.addEventListener("change", paint); });
    $$("[data-step]", pdp).forEach(function (b) {
      b.addEventListener("click", function () { qty = Math.max(1, Math.min(10, qty + Number(b.getAttribute("data-step")))); $("output", pdp).textContent = qty; });
    });
    $("[data-add-pdp]", pdp).addEventListener("click", function () {
      add({ id: pdp.getAttribute("data-product-id"), name: pdp.getAttribute("data-name"), price: price(), img: main.getAttribute("src"), qty: qty, option: "Pot: " + $('input[name="pot"]:checked', pdp).value });
      openDrawer();
    });
    $$(".tablist button", pdp).forEach(function (t) {
      t.addEventListener("click", function () {
        $$(".tablist button", pdp).forEach(function (x) { x.setAttribute("aria-selected", String(x === t)); });
        $$(".tabpanel", pdp).forEach(function (p) { p.hidden = p.id !== t.getAttribute("aria-controls"); });
      });
    });
    paint();
  }

  /* ---------------------------------------------------------- plant doctor */
  var doctor = $("#doctor");
  if (doctor) doctor.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    $$("[required]", doctor).forEach(function (input) {
      var v = input.value.trim();
      var bad = !v || (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v));
      input.setAttribute("aria-invalid", String(bad));
      $('[data-error="' + input.name + '"]', doctor).textContent = bad ? input.getAttribute("data-message") : "";
      if (bad) ok = false;
    });
    if (!ok) return;
    doctor.hidden = true;
    $("#doctor-done").hidden = false;
  });

  $$("[data-signup]").forEach(function (f) {
    f.addEventListener("submit", function (e) { e.preventDefault(); f.innerHTML = "<p>Thanks! Your first care tip is on its way.</p>"; });
  });
})();
