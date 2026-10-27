/* ==========================================================================
   A Beautiful California Florist — drawer.js
   Slide-out basket + simulated three-step checkout.
   ========================================================================== */
(function () {
  'use strict';
  var U = BW.ui;
  var qs = U.qs, qsa = U.qsa, money = U.money, esc = U.esc;
  if (!document.querySelector('[data-drawer]')) return;

  var drawer = qs('[data-drawer]');
  var scrim = qs('[data-scrim]');
  var linesEl = qs('[data-cart-lines]');
  var emptyEl = qs('[data-cart-empty]');
  var footEl = qs('[data-cart-foot]');
  var giftEl = qs('[data-gift]');
  var giftCount = qs('[data-gift-count]');
  var isOpen = false;
  var releaseTrap = null;
  var lastFocus = null;
  var scrimTimer = null;

  /* ------------------------------------------------------------------ count */
  function paintCount() {
    var n = BW.cart.count();
    qsa('[data-cart-count]').forEach(function (el) {
      el.textContent = String(n);
      if (el.classList.contains('cart-btn__count')) {
        el.classList.remove('is-pulse');
        /* restart animation */
        void el.offsetWidth;
      }
    });
    var btn = qs('.cart-btn');
    if (btn) btn.setAttribute('aria-label', 'Open basket, ' + n + (n === 1 ? ' item' : ' items'));
    qsa('[data-cart-open]').forEach(function (b) {
      if (b.classList.contains('cart-btn')) return;
      if (b.dataset.originalLabel == null) b.dataset.originalLabel = b.textContent.trim();
    });
  }

  function pulseCount() {
    qsa('.cart-btn__count').forEach(function (el) {
      el.classList.remove('is-pulse');
      void el.offsetWidth;
      el.classList.add('is-pulse');
    });
  }

  /* ------------------------------------------------------------------ lines */
  function renderLines() {
    var rows = BW.cart.lines();
    var n = BW.cart.count();
    var subtotal = BW.cart.subtotal();

    linesEl.innerHTML = rows.map(function (l) {
      return '' +
        '<li class="line" data-line="' + esc(l.key) + '">' +
          '<img class="line__thumb" src="' + esc(BW.thumbSrc(l.product.gallery[0])) + '" width="76" height="101" ' +
            'loading="lazy" alt="' + esc(l.product.name) + '">' +
          '<div class="line__main">' +
            '<div class="line__top">' +
              '<p class="line__name">' + esc(l.product.name) + '</p>' +
              '<p class="line__price">' + money(l.total) + '</p>' +
            '</div>' +
            '<p class="line__meta">' + esc(l.sizeObj.label) + ' · ' + money(l.unit) + ' each</p>' +
            '<p class="line__occ">' + esc(l.product.occasionsLabel.join(' · ')) + '</p>' +
            '<div class="line__ctrl">' +
              '<span class="stepper">' +
                '<button type="button" data-qty="-1" aria-label="Decrease quantity of ' + esc(l.product.name) + '">−</button>' +
                '<output aria-live="off">' + l.qty + '</output>' +
                '<button type="button" data-qty="1" aria-label="Increase quantity of ' + esc(l.product.name) + '">+</button>' +
              '</span>' +
              '<button type="button" class="line__remove" data-remove aria-label="Remove ' +
                esc(l.product.name) + ' — ' + esc(l.sizeObj.label) + ', from the basket">' +
                'Remove ' + esc(l.product.name) + '</button>' +
            '</div>' +
          '</div>' +
        '</li>';
    }).join('');

    emptyEl.hidden = n > 0;
    footEl.hidden = n === 0;
    linesEl.hidden = n === 0;
    qs('[data-cart-subtotal]').textContent = money(subtotal);
    if (giftEl && giftEl.value !== BW.cart.gift() && document.activeElement !== giftEl) {
      giftEl.value = BW.cart.gift();
    }
    if (giftCount) giftCount.textContent = String((giftEl ? giftEl.value : '').length);
    paintCount();
  }

  /* ------------------------------------------------------------------- open */
  function openDrawer() {
    if (isOpen) return;
    isOpen = true;
    lastFocus = document.activeElement;
    scrim.hidden = false;
    window.clearTimeout(scrimTimer);
    window.requestAnimationFrame(function () { scrim.classList.add('is-on'); });
    drawer.removeAttribute('inert');
    drawer.classList.add('is-open');
    drawer.removeAttribute('aria-hidden');
    U.lock();
    releaseTrap = U.trap(drawer);
    document.dispatchEvent(new CustomEvent('bw:drawer-open'));
    window.setTimeout(function () {
      U.focusFirst(drawer);
    }, 120);
    U.announce('Basket opened, ' + BW.cart.count() + ' items.');
  }

  function closeDrawer() {
    if (!isOpen) return;
    isOpen = false;
    drawer.classList.remove('is-open');
    drawer.setAttribute('inert', '');
    scrim.classList.remove('is-on');
    scrimTimer = window.setTimeout(function () { scrim.hidden = true; }, 520);
    U.unlock();
    if (releaseTrap) { releaseTrap(); releaseTrap = null; }
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    lastFocus = null;
  }

  /* ------------------------------------------------------------ drawer wiring */
  qsa('[data-cart-open]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openDrawer();
    });
  });
  qsa('[data-drawer-close]').forEach(function (btn) {
    btn.addEventListener('click', function () { closeDrawer(); });
  });
  if (scrim) scrim.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) { closeDrawer(); }
  });

  linesEl.addEventListener('click', function (e) {
    var lineEl = e.target.closest('[data-line]');
    if (!lineEl) return;
    var parts = lineEl.getAttribute('data-line').split('::');
    var id = parts[0], size = parts[1];
    var stepBtn = e.target.closest('[data-qty]');
    if (stepBtn) {
      var current = 0;
      BW.cart.lines().forEach(function (l) { if (l.id === id && l.size === size) current = l.qty; });
      var next = current + parseInt(stepBtn.getAttribute('data-qty'), 10);
      if (next < 1) {
        BW.cart.remove(id, size);
        U.announce('Item removed from basket.');
      } else {
        BW.cart.setQty(id, size, next);
      }
      return;
    }
    if (e.target.closest('[data-remove]')) {
      BW.cart.remove(id, size);
      U.announce('Item removed from basket.');
      if (BW.cart.count() === 0) U.focusFirst(drawer);
    }
  });

  if (giftEl) {
    var giftTimer = null;
    giftEl.addEventListener('input', function () {
      if (giftCount) giftCount.textContent = String(giftEl.value.length);
      window.clearTimeout(giftTimer);
      giftTimer = window.setTimeout(function () {
        BW.cart.setGift(giftEl.value);
      }, 260);
    });
    giftEl.addEventListener('blur', function () { BW.cart.setGift(giftEl.value); });
  }

  document.addEventListener('bw:cart', function () {
    renderLines();
    if (coIsOpen && coStep === 3) paintReview();
  });
  document.addEventListener('bw:add', function () {
    pulseCount();
  });

  /* ---------------------------------------------------------------- checkout */
  var checkout = qs('[data-checkout]');
  var coPanel = qs('.checkout__panel');
  var coForm = qs('[data-co-form]');
  var coNext = qs('[data-co-next]');
  var coBack = qs('[data-co-back]');
  var coNav = qs('[data-co-nav]');
  var coDone = qs('[data-co-done]');
  var coTitle = qs('[data-co-title]');
  var coSteps = qsa('[data-step-tab]');
  var coPanes = qsa('[data-step]');
  var coIsOpen = false;
  var coStep = 1;
  var coReleaseTrap = null;
  var coLastFocus = null;
  var coTitles = { 1: 'Your details', 2: 'Delivery', 3: 'Review' };

  /* give error messages ids so inputs can reference them */
  qsa('[data-err-for]').forEach(function (p) {
    p.id = 'err-' + p.getAttribute('data-err-for');
  });

  function tomorrowISO() {
    var d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  /* ------------------------------------------------------- delivery / pickup */
  var PICKUP_ADDRESS = '611 E Carson St Ste B, Long Beach, CA 90807';
  var coChoice = qsa('.co-choice__opt', coForm);
  var addrLabel = qs('[data-co-out-label="addr"]');

  function isPickup() {
    var f = coForm.elements['delivery-option'];
    return !!f && f.value === 'pickup';
  }

  /* One control decides three things: which address fields are asked for and
     required, what the date and window labels say, and what the review echoes. */
  function applyFulfilment() {
    var pickup = isPickup();
    qsa('[data-delivery-only]', coForm).forEach(function (el) {
      el.classList.toggle('is-off', pickup);
      el.hidden = pickup;
    });
    ['address', 'city', 'zip'].forEach(function (n) {
      var el = coForm.elements[n];
      if (!el) return;
      el.required = !pickup;
      if (pickup) setErr(el, false);
    });
    var dLabel = qs('[data-date-label]');
    if (dLabel) dLabel.textContent = pickup ? 'Requested pickup date' : 'Requested delivery date';
    var wLabel = qs('[data-window-label]');
    if (wLabel) wLabel.textContent = pickup ? 'Pickup window' : 'Time window';
    var note = qs('[data-fulfil-note]');
    if (note) {
      note.textContent = pickup
        ? 'Pick up from 611 E Carson St Ste B — Mon–Fri 9–5, Sat 9–3, closed Sunday. No delivery charge is added.'
        : 'Same-day delivery is offered across Long Beach where the day allows, next day on the rest. We photograph the arrangement before it leaves the shop.';
    }
    coChoice.forEach(function (opt) {
      var input = opt.querySelector('input');
      opt.classList.toggle('is-selected', !!input && input.checked);
    });
  }

  coChoice.forEach(function (opt) {
    var input = opt.querySelector('input');
    if (input) input.addEventListener('change', applyFulfilment);
  });

  function setErr(input, show) {
    if (!input) return;
    var err = qs('[data-err-for="' + input.id + '"]');
    if (err) {
      err.hidden = !show;
      if (show) input.setAttribute('aria-describedby', err.id);
      else if (input.getAttribute('aria-describedby') === err.id) input.removeAttribute('aria-describedby');
    }
    if (show) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
    input.classList.toggle('is-invalid', !!show);
  }

  function val(name) {
    var el = coForm.elements[name];
    return el ? String(el.value || '').trim() : '';
  }

  function validateStep(step) {
    var bad = [];
    if (step === 1) {
      var name = coForm.elements['name'];
      var nm = val('name');
      setErr(name, nm.length < 2); if (nm.length < 2) bad.push(name);
      var email = coForm.elements['email'];
      var em = val('email');
      var okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em);
      setErr(email, !okEmail); if (!okEmail) bad.push(email);
      var phone = coForm.elements['phone'];
      var ph = val('phone').replace(/[^\d]/g, '');
      var badPhone = ph.length > 0 && ph.length < 7;
      setErr(phone, badPhone); if (badPhone) bad.push(phone);
    }
    if (step === 2) {
      if (!isPickup()) {
        var addr = coForm.elements['address'];
        setErr(addr, val('address').length < 4); if (val('address').length < 4) bad.push(addr);
        var city = coForm.elements['city'];
        setErr(city, val('city').length < 2); if (val('city').length < 2) bad.push(city);
        var zipEl = coForm.elements['zip'];
        var zipOk = /^\d{5}$/.test(val('zip'));
        setErr(zipEl, !zipOk); if (!zipOk) bad.push(zipEl);
      }
      var dateEl = coForm.elements['date'];
      var dv = val('date');
      var dateOk = !!dv && dv >= tomorrowISO();
      setErr(dateEl, !dateOk); if (!dateOk) bad.push(dateEl);
    }
    return bad;
  }

  function showStep(step) {
    coStep = step;
    coPanes.forEach(function (p) {
      var on = parseInt(p.getAttribute('data-step'), 10) === step;
      p.hidden = !on;
      p.classList.toggle('is-active', on);
    });
    coSteps.forEach(function (li) {
      var n = parseInt(li.getAttribute('data-step-tab'), 10);
      li.classList.toggle('is-current', n === step);
      li.classList.toggle('is-done', n < step);
      li.setAttribute('aria-current', n === step ? 'step' : 'false');
    });
    coBack.hidden = step === 1;
    coNav.hidden = false;
    coTitle.textContent = coTitles[step] || 'Checkout';
    coNext.innerHTML = step === 3
      ? 'Place demo order <span class="btn__arrow" aria-hidden="true">→</span>'
      : 'Continue <span class="btn__arrow" aria-hidden="true">→</span>';
    coPanel.scrollTop = 0;
    if (step === 3) paintReview();
    var pane = qs('[data-step="' + step + '"]');
    if (pane) {
      var firstInput = qs('input, select', pane);
      if (firstInput && step !== 3) window.setTimeout(function () { firstInput.focus({ preventScroll: true }); }, 60);
    }
  }

  function fmtDate(iso) {
    if (!iso) return '—';
    var d = new Date(iso + 'T12:00:00');
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function whenText() {
    var w = val('window') || 'Afternoon';
    return fmtDate(val('date')) + ' · ' + w;
  }

  function addressText() {
    if (isPickup()) return PICKUP_ADDRESS;
    return [val('address'), val('city'), val('zip')].filter(Boolean).join(', ');
  }

  function paintReview() {
    var rows = BW.cart.lines();
    qs('[data-co-lines]').innerHTML = rows.map(function (l) {
      return '<li><span>' + esc(l.product.name) + '<em>' + esc(l.sizeObj.label) + ' × ' + l.qty + '</em></span>' +
        '<span>' + money(l.total) + '</span></li>';
    }).join('') || '<li><span>Basket is empty</span><span>—</span></li>';

    var recipient = val('name');
    var recipName = val('recipient');
    qs('[data-co-out="name"]').textContent = recipient ? recipient + (recipName ? ' → ' + recipName : '') : '—';
    qs('[data-co-out="addr"]').textContent = addressText() || '—';
    qs('[data-co-out="when"]').textContent = whenText();
    var how = qs('[data-co-out="fulfil"]');
    if (how) how.textContent = isPickup() ? 'Pickup at the shop' : 'Hand-delivered by our driver';
    if (addrLabel) addrLabel.textContent = isPickup() ? 'Collect from' : 'Deliver to';
    var gift = BW.cart.gift().trim();
    qs('[data-co-out="gift"]').textContent = gift ? '“' + gift + '”' : 'No message';

    var sub = BW.cart.subtotal();
    var del = isPickup() ? 0 : BW.cart.delivery();
    qs('[data-co-subtotal]').textContent = money(sub);
    qs('[data-co-delivery]').textContent = del === 0 ? 'Free' : money(del);
    qs('[data-co-total]').textContent = money(sub + del);
  }

  function openCheckout() {
    if (BW.cart.count() === 0) {
      U.announce('Your basket is empty.');
      return;
    }
    closeDrawer();
    coIsOpen = true;
    coLastFocus = document.activeElement;
    checkout.classList.add('is-open');
    checkout.removeAttribute('inert');
    U.lock();
    coReleaseTrap = U.trap(checkout);
    var dateEl = coForm.elements['date'];
    if (dateEl) {
      dateEl.min = tomorrowISO();
      if (!dateEl.value || dateEl.value < tomorrowISO()) dateEl.value = tomorrowISO();
    }
    coDone.hidden = true;
    coSteps.forEach(function (s) { s.hidden = false; });
    qsa('.co-steps').forEach(function (s) { s.hidden = false; });
    coForm.reset();
    if (dateEl) dateEl.value = tomorrowISO();
    applyFulfilment();
    qsa('[data-err-for]').forEach(function (p) { p.hidden = true; });
    qsa('[aria-invalid]').forEach(function (i) { i.removeAttribute('aria-invalid'); });
    showStep(1);
    U.announce('Checkout opened. This is a demo; no payment will be taken.');
    window.setTimeout(function () {
      var f = coForm.elements['name'];
      if (f) f.focus({ preventScroll: true });
    }, 160);
    document.dispatchEvent(new CustomEvent('bw:checkout-open'));
  }

  function closeCheckout() {
    if (!coIsOpen) return;
    coIsOpen = false;
    checkout.classList.remove('is-open');
    checkout.setAttribute('inert', '');
    U.unlock();
    if (coReleaseTrap) { coReleaseTrap(); coReleaseTrap = null; }
    if (coLastFocus && coLastFocus.focus) coLastFocus.focus({ preventScroll: true });
    coLastFocus = null;
    /* reset for next time, keep basket */
    coDone.hidden = true;
    coNav.hidden = false;
    coSteps.forEach(function (s) { s.hidden = false; });
    showStepSilent(1);
  }

  function showStepSilent(step) {
    coStep = step;
    coPanes.forEach(function (p) {
      var on = parseInt(p.getAttribute('data-step'), 10) === step;
      p.hidden = !on;
    });
    coSteps.forEach(function (li) {
      var n = parseInt(li.getAttribute('data-step-tab'), 10);
      li.classList.toggle('is-current', n === step);
      li.classList.toggle('is-done', n < step);
    });
    coBack.hidden = step === 1;
    coTitle.textContent = coTitles[step];
    coNext.innerHTML = 'Continue <span class="btn__arrow" aria-hidden="true">→</span>';
  }

  function placeOrder() {
    var ref = 'ABC-' + String(Math.floor(1000 + Math.random() * 9000));
    var n = BW.cart.count();
    var del = isPickup() ? 0 : BW.cart.delivery();
    var total = money(BW.cart.subtotal() + del);
    /* read everything off the basket and the form before it is cleared */
    var rows = [
      ['Items', n + (n === 1 ? ' piece' : ' pieces')],
      ['How', isPickup() ? 'Pickup at the shop' : 'Hand-delivered by our driver'],
      ['Where', addressText() || '—'],
      ['When', whenText()],
      ['Total', total + ' · sample figures']
    ];
    qs('[data-co-ref]').textContent = ref;
    var sumEl = qs('[data-co-done-summary]');
    if (sumEl) {
      sumEl.innerHTML = rows.map(function (r) {
        return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>';
      }).join('');
    }
    coPanes.forEach(function (p) { p.hidden = true; });
    coDone.hidden = false;
    coNav.hidden = true;
    qsa('.co-steps').forEach(function (s) { s.hidden = true; });
    coTitle.textContent = 'Order confirmed';
    BW.cart.clear();
    U.announce('Demo order ' + ref + ' placed. Your basket has been cleared.');
    var btn = qs('[data-co-done] .btn');
    if (btn) window.setTimeout(function () { btn.focus({ preventScroll: true }); }, 120);
    coPanel.scrollTop = 0;
  }

  qsa('[data-checkout-open]').forEach(function (b) {
    b.addEventListener('click', function () { openCheckout(); });
  });
  qsa('[data-checkout-close]').forEach(function (b) {
    b.addEventListener('click', function () { closeCheckout(); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && coIsOpen) closeCheckout();
  });

  coForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (coStep < 3) {
      var bad = validateStep(coStep);
      if (bad.length) {
        U.announce(bad.length + ' field' + (bad.length > 1 ? 's need' : ' needs') + ' attention.');
        bad[0].focus({ preventScroll: false });
        return;
      }
      showStep(coStep + 1);
      return;
    }
    placeOrder();
  });

  coBack.addEventListener('click', function () {
    if (coStep > 1) showStep(coStep - 1);
  });

  /* Continue shopping — leave the confirmation and land back in the store with
     the basket empty and the page at the top, focus on the wordmark. */
  qsa('[data-continue]').forEach(function (b) {
    b.addEventListener('click', function () {
      closeCheckout();
      window.scrollTo({ top: 0, behavior: U.motionAllowed() ? 'smooth' : 'auto' });
      var brand = qs('.site-head .brand') || qs('.brand');
      if (brand) brand.focus({ preventScroll: true });
      U.announce('Back at the top of the shop. The demo basket is empty.');
    });
  });

  /* clear an error as soon as the field is edited */
  coForm.addEventListener('input', function (e) {
    var t = e.target;
    if (t && t.getAttribute('aria-invalid') === 'true') setErr(t, false);
  });

  /* ------------------------------------------------------------------- init */
  renderLines();
  giftEl.value = BW.cart.gift();

  BW.drawer = {
    open: openDrawer,
    close: closeDrawer,
    refresh: renderLines,
    isOpen: function () { return isOpen; }
  };
  BW.checkout = {
    open: openCheckout,
    close: closeCheckout
  };
})();
