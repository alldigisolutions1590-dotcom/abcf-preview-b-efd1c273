/* ==========================================================================
   A Beautiful California Florist — main.js
   Rendering, Motion orchestration, Embla rail, filters (FLIP), product modal.
   Every product, price and description comes from BW.PRODUCTS (data.js), which
   is built from the client's own catalogue.
   ========================================================================== */
(function () {
  'use strict';
  var U = BW.ui;
  var qs = U.qs, qsa = U.qsa, money = U.money, esc = U.esc;
  var M = window.Motion;
  var RM = !U.motionAllowed();
  var html = document.documentElement;

  function safe(fn, label) {
    try { fn(); } catch (err) {
      if (window.console) console.warn('[bw] ' + label + ' failed:', err);
    }
  }

  /* ====================================================================== *
   *  1. RENDER — rail cards + product cards from BW.PRODUCTS
   * ====================================================================== */
  function railCard(p) {
    var main = p.gallery[0];
    var hover = p.gallery[1] || main;   // cursor preview shows a second detail shot
    var price = BW.priceFor(p, BW.DEFAULT_SIZE);
    return '' +
      '<div class="embla__slide">' +
        '<article class="railcard">' +
          '<button class="railcard__hit" type="button" data-open="' + esc(p.id) + '" data-img="' + esc(hover.src) + '" ' +
            'aria-label="View ' + esc(p.name) + ', ' + money(price) + '">' +
            BW.picture(main, { cls: 'railcard__img', sizes: '(min-width:1100px) 600px, 88vw' }) +
            '<span class="railcard__no">' + esc(p.no) + '</span>' +
            (p.tag ? '<span class="railcard__tag">' + esc(p.tag) + '</span>' : '') +
            '<span class="railcard__cap">' +
              '<span>' +
                '<span class="railcard__name">' + esc(p.name) + '</span>' +
                '<span class="railcard__occ">' + esc(p.occasionsLabel.join(' · ')) + '</span>' +
              '</span>' +
              '<span class="railcard__price">' + money(price) + '</span>' +
            '</span>' +
          '</button>' +
        '</article>' +
      '</div>';
  }

  function gridCard(p) {
    var main = p.gallery[0];
    var price = BW.priceFor(p, BW.DEFAULT_SIZE);
    return '' +
      '<article class="card" data-card data-id="' + esc(p.id) + '" data-occasions="' + esc(p.occasions.join(',')) + '" data-reveal>' +
        '<button class="card__media" type="button" data-open="' + esc(p.id) + '" ' +
          'aria-label="View ' + esc(p.name) + ' in detail">' +
          BW.picture(main, { cls: 'card__img', sizes: '(min-width:1100px) 30vw, (min-width:640px) 46vw, 92vw' }) +
          '<span class="card__no">' + esc(p.no) + '</span>' +
          (p.tag ? '<span class="card__tag">' + esc(p.tag) + '</span>' : '') +
          '<span class="card__reveal"><span>View piece</span><i aria-hidden="true">↗</i></span>' +
        '</button>' +
        '<div class="card__body">' +
          '<div class="card__row">' +
            '<h3 class="card__name">' + esc(p.name) + '</h3>' +
            '<p class="card__price">' + money(price) + '</p>' +
          '</div>' +
          '<p class="card__occ">' + esc(p.occasionsLabel.join(' · ')) + '</p>' +
          '<div class="card__foot">' +
            '<button class="card__btn card__btn--add" type="button" data-quickadd="' + esc(p.id) + '" data-add-to-cart>' +
              'Add · ' + money(price) + '</button>' +
            '<button class="card__btn card__btn--ghost" type="button" data-open="' + esc(p.id) + '" data-open-product="' + esc(p.id) + '">Details</button>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  var railTrack = qs('[data-rail-track]');
  if (railTrack) railTrack.innerHTML = BW.PRODUCTS.map(railCard).join('');

  var grid = qs('[data-grid]');
  if (grid) grid.innerHTML = BW.PRODUCTS.map(gridCard).join('');

  /* ====================================================================== *
   *  2. MOTION — the shared layer does the work
   *  abc-motion.js owns the only scroll listener on the page: reveals
   *  ([data-reveal] -> .is-inview), the parallax layers, the hero arming
   *  (.is-loaded + --item-index) and the ticker clone. Nothing in this file
   *  listens to scroll; anything that needs a scroll position asks the module.
   * ====================================================================== */
  var M = window.Motion;
  var EASE = [0.16, 1, 0.3, 1];

  function motion() {
    return window.ABCMotion || null;
  }

  /* A second ABCMotion.reinit() re-runs the module's marquee pass, and the
     module only guards the clone by looking at the *first* child of
     [data-marquee]. Keep exactly one clone so a theme-editor reload (or a
     doubled reinit in QA) can never stack copies of the ticker. */
  function dedupeMarquee() {
    qsa('[data-marquee]').forEach(function (el) {
      var clones = qsa('[data-marquee-clone]', el);
      for (var i = 1; i < clones.length; i++) el.removeChild(clones[i]);
    });
  }

  function armMotion() {
    var mm = motion();
    if (mm && typeof mm.onReinit === 'function') {
      mm.onReinit(function () {
        dedupeMarquee();
        safe(function () { rearm(document); }, 'rearm');
      });
    }
  }

  function rearm(root) {
    initRail(root);
    initFilters(root);
    initLightbox(root);
    initHeader(root);
  }

  /* magnetic buttons — desktop pointer only, transform only, no listeners
     beyond pointer events on the buttons themselves */
  function magnetic() {
    if (RM || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    qsa('.btn--cream, .btn--accent').forEach(function (btn) {
      if (btn.__bwMag) return;
      btn.__bwMag = true;
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * 0.12;
        var dy = (e.clientY - (r.top + r.height / 2)) * 0.18;
        btn.style.transform = 'translate(' + dx.toFixed(2) + 'px,' + dy.toFixed(2) + 'px)';
      });
      btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
    });
  }

  /* ====================================================================== *
   *  3. HEADER + MOBILE MENU
   * ====================================================================== */
  /* Sticky header without a scroll listener: a 32px sentinel pinned to the top
     of the document leaves the viewport exactly when the page has scrolled 32px. */
  function initHeader(root) {
    var head = qs('[data-head]', root || document);
    if (!head || head.__bwHead) return;
    head.__bwHead = true;
    if (!('IntersectionObserver' in window)) { head.classList.add('is-stuck'); return; }
    var mark = document.getElementById('bw-head-sentinel');
    if (!mark) {
      mark = document.createElement('span');
      mark.id = 'bw-head-sentinel';
      mark.setAttribute('aria-hidden', 'true');
      mark.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:32px;pointer-events:none;z-index:-1';
      document.body.insertBefore(mark, document.body.firstChild);
    }
    new IntersectionObserver(function (entries) {
      head.classList.toggle('is-stuck', !entries[0].isIntersecting);
    }, { threshold: 0, rootMargin: '0px' }).observe(mark);
  }

  function menu() {
    var el = qs('[data-menu]');
    var openBtn = qs('[data-menu-open]');
    if (!el || !openBtn) return;
    var release = null;
    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      el.classList.add('is-open');
      el.removeAttribute('inert');
      openBtn.setAttribute('aria-expanded', 'true');
      U.lock();
      release = U.trap(el);
      window.setTimeout(function () { U.focusFirst(el.querySelector('.mmenu__panel')); }, 140);
    }
    function close(restore) {
      if (!el.classList.contains('is-open')) return;
      el.classList.remove('is-open');
      el.setAttribute('inert', '');
      openBtn.setAttribute('aria-expanded', 'false');
      U.unlock();
      if (release) { release(); release = null; }
      if (restore !== false && lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
      lastFocus = null;
    }

    openBtn.addEventListener('click', open);
    qsa('[data-menu-close]', el).forEach(function (b) {
      b.addEventListener('click', function () { close(); });
    });
    qsa('a[href]', el).forEach(function (a) {
      a.addEventListener('click', function () { close(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
    /* only one overlay at a time */
    document.addEventListener('bw:drawer-open', function () { close(false); });
    document.addEventListener('bw:modal-open', function () { close(false); });
  }

  /* ====================================================================== *
   *  4. EMBLA RAIL
   * ====================================================================== */
  function initRail(root) {
    var doc = root && root.querySelectorAll ? root : document;
    var viewport = qs('[data-embla-viewport]', doc);
    if (!viewport || !window.EmblaCarousel) return;
    var railEl = viewport.closest('[data-rail]');
    var curEl = qs('[data-rail-cur]', doc);
    var progEl = qs('[data-rail-prog]', doc);
    var prevBtn = qs('[data-rail-prev]', doc);
    var nextBtn = qs('[data-rail-next]', doc);
    var totalEl = qs('[data-rail-total]', doc);

    /* a re-rendered section re-arms the *same* instance instead of stacking a
       second one on the same viewport */
    if (viewport.__bwEmbla) {
      try {
        viewport.__bwEmbla.reInit();
        paintRail();
      } catch (err) { /* a dead instance is replaced below */ }
      if (viewport.__bwEmbla) return;
    }

    var embla = window.EmblaCarousel(viewport, {
      loop: true,
      align: 'start',
      skipSnaps: false,
      containScroll: false,
      duration: 26,          /* softer snap easing than the default 25-frame hop */
      dragThreshold: 6
    });
    viewport.__bwEmbla = embla;

    function pad(n) { return (n < 10 ? '0' : '') + n; }

    function paintRail() {
      var e = viewport.__bwEmbla;
      if (!e) return;
      if (totalEl) totalEl.textContent = pad(e.scrollSnapList().length);
      if (curEl) curEl.textContent = pad(e.selectedScrollSnap() + 1);
      if (progEl) {
        var p = Math.max(0.1, Math.min(1, e.scrollProgress()));
        progEl.style.setProperty('--rail-progress', p.toFixed(3));
      }
      if (railEl) railEl.classList.toggle('is-end', e.scrollProgress() > 0.985);
    }
    embla.on('select', paintRail);
    embla.on('scroll', paintRail);
    embla.on('reInit', paintRail);
    paintRail();

    if (prevBtn && !prevBtn.__bwRail) {
      prevBtn.__bwRail = true;
      prevBtn.addEventListener('click', function () {
        if (viewport.__bwEmbla) viewport.__bwEmbla.scrollPrev();
      });
    }
    if (nextBtn && !nextBtn.__bwRail) {
      nextBtn.__bwRail = true;
      nextBtn.addEventListener('click', function () {
        if (viewport.__bwEmbla) viewport.__bwEmbla.scrollNext();
      });
    }

    /* keyboard: the rail itself is a tab stop, and arrows work anywhere inside
       it — so a keyboard user never has to reach for the pointer */
    if (railEl && !railEl.__bwKeys) {
      railEl.__bwKeys = true;
      railEl.addEventListener('keydown', function (e) {
        var k = e.key, em = viewport.__bwEmbla;
        if (!em) return;
        if (k === 'ArrowRight' || k === 'PageDown') { e.preventDefault(); em.scrollNext(); }
        else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); em.scrollPrev(); }
        else if (k === 'Home') { e.preventDefault(); em.scrollTo(0); }
        else if (k === 'End') { e.preventDefault(); em.scrollTo(em.scrollSnapList().length - 1); }
      });
    }

    /* drag affordance: grab / grabbing, and a click after a drag never opens a
       product */
    if (!viewport.__bwDrag) {
      viewport.__bwDrag = true;
      var downX = 0, downY = 0, dragged = false;
      viewport.addEventListener('pointerdown', function (e) {
        downX = e.clientX; downY = e.clientY; dragged = false;
        if (railEl) railEl.classList.add('is-dragging');
      }, { passive: true });
      viewport.addEventListener('pointermove', function (e) {
        if (Math.abs(e.clientX - downX) > 8 || Math.abs(e.clientY - downY) > 8) dragged = true;
      }, { passive: true });
      var release = function () { if (railEl) railEl.classList.remove('is-dragging'); };
      viewport.addEventListener('pointerup', release, { passive: true });
      viewport.addEventListener('pointercancel', release, { passive: true });
      viewport.addEventListener('pointerleave', release, { passive: true });
      viewport.addEventListener('click', function (e) {
        if (dragged) {
          e.preventDefault();
          e.stopPropagation();
          dragged = false;
        }
      }, true);
    }

    /* cursor-following preview (desktop, transform only) */
    var preview = qs('[data-rail-preview]', doc);
    var previewImg = qs('[data-rail-preview-img]', doc);
    if (preview && previewImg && railEl && !railEl.__bwPreview && !RM &&
        window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      railEl.__bwPreview = true;
      var raf = null, tx = -999, ty = -999, cx = -999, cy = -999;
      function loop() {
        cx += (tx - cx) * 0.18;
        cy += (ty - cy) * 0.18;
        preview.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
        if (Math.abs(tx - cx) > 0.4 || Math.abs(ty - cy) > 0.4) raf = window.requestAnimationFrame(loop);
        else raf = null;
      }
      railEl.addEventListener('pointerover', function (e) {
        var hit = e.target.closest('.railcard__hit');
        if (!hit) return;
        var src = hit.getAttribute('data-img');
        if (src) BW.repaint(previewImg, src, { sizes: '196px' });
        preview.classList.add('is-on');
      });
      railEl.addEventListener('pointermove', function (e) {
        if (!preview.classList.contains('is-on')) return;
        var w = 196;
        tx = Math.min(e.clientX + 30, window.innerWidth - w - 14);
        ty = Math.max(12, Math.min(e.clientY - 123, window.innerHeight - 260));
        if (!raf) raf = window.requestAnimationFrame(loop);
      });
      railEl.addEventListener('pointerleave', function () {
        preview.classList.remove('is-on');
      });
    }
  }

  /* ====================================================================== *
   *  5. FILTERS — FLIP
   * ====================================================================== */
  /* the indicator's box is set instantly and its transform is FLIPped back to
     the chip it came from, so the travel is a transform — never a width tween */
  function moveChipIndicator(chip, animate) {
    var ind = qs('[data-chip-ind]');
    if (!ind || !chip) return;
    var host = ind.parentNode;
    if (!host) return;
    var hr = host.getBoundingClientRect();
    var cr = chip.getBoundingClientRect();
    if (!cr.width) { ind.classList.remove('is-on'); return; }
    var x = cr.left - hr.left;
    var y = cr.bottom - hr.top + 1;
    var w = Math.max(1, cr.width);
    var prev = ind.__bwPrev;

    ind.style.width = w + 'px';
    ind.style.height = '1px';
    if (!animate || !prev) {
      ind.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      ind.classList.add('is-on');
    } else {
      ind.style.transition = 'none';
      ind.style.transform = 'translate3d(' + prev.x.toFixed(1) + 'px,' + prev.y.toFixed(1) + 'px,0) scaleX(' +
        (prev.w / w).toFixed(4) + ')';
      ind.classList.add('is-on');
      void ind.offsetWidth;
      ind.style.transition = '';
      window.requestAnimationFrame(function () {
        ind.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scaleX(1)';
      });
    }
    ind.__bwPrev = { x: x, y: y, w: w };
  }

  function initFilters(root) {
    var doc = root && root.querySelectorAll ? root : document;
    var grid = qs('[data-grid]', doc);
    if (!grid) return;
    var chips = qsa('[data-filter]', doc);
    var countEl = qs('[data-grid-count]', doc);

    function apply(cat, animate) {
      if (grid.__bwActive === cat && animate) return;
      grid.__bwActive = cat;
      var cards = qsa('.card', grid);
      var first = [];
      cards.forEach(function (c) {
        if (!c.hidden) first.push([c, c.getBoundingClientRect()]);
      });
      var shown = 0;
      cards.forEach(function (c) {
        var occ = (c.getAttribute('data-occasions') || '').split(',');
        var show = cat === 'all' || occ.indexOf(cat) !== -1;
        c.hidden = !show;
        if (show) shown++;
      });

      var moving = [], appearing = [];
      cards.forEach(function (c) {
        if (c.hidden) return;
        var last = c.getBoundingClientRect();
        var prev = null;
        for (var i = 0; i < first.length; i++) if (first[i][0] === c) prev = first[i][1];
        if (!prev) { appearing.push(c); return; }
        var dx = prev.left - last.left, dy = prev.top - last.top;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          c.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
          moving.push(c);
        }
      });

      window.requestAnimationFrame(function () {
        if (animate && !RM && typeof Element.prototype.animate === 'function') {
          moving.forEach(function (c) {
            var from = c.style.transform;
            c.style.transform = '';
            c.animate([{ transform: from }, { transform: 'translate(0,0)' }],
              { duration: 620, easing: 'cubic-bezier(.16,1,.3,1)' });
          });
          appearing.forEach(function (c) {
            c.animate([{ opacity: 0, transform: 'scale(.975)' }, { opacity: 1, transform: 'none' }],
              { duration: 520, easing: 'cubic-bezier(.16,1,.3,1)' });
          });
        } else {
          moving.forEach(function (c) { c.style.transform = ''; });
        }
      });

      var activeChip = null;
      chips.forEach(function (c) {
        var on = c.getAttribute('data-filter') === cat;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
        if (on) activeChip = c;
      });
      moveChipIndicator(activeChip, animate);
      if (countEl) countEl.textContent = shown + (shown === 1 ? ' piece' : ' pieces');
      U.announce(shown + (shown === 1 ? ' arrangement' : ' arrangements') +
        (cat === 'all' ? '' : ' for ' + cat) + ' shown.');
    }

    chips.forEach(function (chip) {
      if (chip.__bwChip) return;
      chip.__bwChip = true;
      chip.addEventListener('click', function () {
        apply(chip.getAttribute('data-filter'), true);
      });
    });

    /* first paint: park the indicator on the active chip without travelling */
    var initial = chips.filter(function (c) { return c.classList.contains('is-active'); })[0];
    window.requestAnimationFrame(function () { moveChipIndicator(initial, false); });
    if (!document.__bwChipResize) {
      document.__bwChipResize = true;
      var rt = null;
      window.addEventListener('resize', function () {
        if (rt) return;
        rt = window.setTimeout(function () {
          rt = null;
          if (grid.hidden) return;
          var on = qsa('[data-filter]').filter(function (c) { return c.classList.contains('is-active'); })[0];
          moveChipIndicator(on, false);
        }, 160);
      }, { passive: true });
    }

    BW.applyFilter = function (cat) { apply(cat, true); };
  }

  /* ====================================================================== *
   *  6. PRODUCT MODAL + ZOOM
   * ====================================================================== */
  var modal = qs('[data-modal]');
  var stage = qs('[data-stage]');
  var stageImg = qs('[data-pm-img]');
  var zoomTag = qs('[data-pm-zoomtag]');
  var thumbsEl = qs('[data-pm-thumbs]');
  var sizesEl = qs('[data-pm-sizes]');
  var current = null;
  var imgIndex = 0;
  var sizeKey = BW.DEFAULT_SIZE;
  var scale = 1, tx = 0, ty = 0;
  var modalOpen = false;
  var releaseTrap = null;
  var lastFocus = null;

  function zoomPaint(smooth) {
    if (!stageImg) return;
    stageImg.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) scale(' + scale.toFixed(3) + ')';
    if (zoomTag) zoomTag.textContent = scale.toFixed(1) + '×';
    if (stage) {
      stage.classList.toggle('is-zoomed', scale > 1.01);
      stage.classList.toggle('is-smooth', !!smooth && !RM);
    }
  }

  function clampPan() {
    if (!stage || !stageImg) return;
    var r = stage.getBoundingClientRect();
    var maxX = (scale - 1) * r.width / 2;
    var maxY = (scale - 1) * r.height / 2;
    tx = Math.max(-maxX, Math.min(maxX, tx));
    ty = Math.max(-maxY, Math.min(maxY, ty));
    if (scale <= 1.001) { tx = 0; ty = 0; }
  }

  function zoomAt(next, mx, my, smooth) {
    var prev = scale;
    scale = Math.max(1, Math.min(3.4, next));
    var rect = stage.getBoundingClientRect();
    var ox = mx == null ? 0 : mx - rect.width / 2;
    var oy = my == null ? 0 : my - rect.height / 2;
    var ratio = scale / prev;
    tx = ox - (ox - tx) * ratio;
    ty = oy - (oy - ty) * ratio;
    clampPan();
    zoomPaint(smooth);
  }

  function resetZoom() {
    scale = 1; tx = 0; ty = 0;
    zoomPaint(false);
  }

  function setImage(i) {
    if (!current) return;
    imgIndex = (i + current.gallery.length) % current.gallery.length;
    var im = current.gallery[imgIndex];
    if (stageImg) {
      /* the stage is up to 3.4x zoomed: hand the browser the whole ladder and a
         sizes hint wide enough that it picks 2560-3000 rather than the 1600 JPEG */
      BW.repaint(stageImg, im.src, { sizes: 'min(1200px, 100vw)', width: im.w, height: im.h });
      stageImg.setAttribute('alt', im.alt);
    }
    if (stage) stage.setAttribute('aria-label',
      current.name + ' photograph ' + (imgIndex + 1) + ' of ' + current.gallery.length +
      '. ' + im.alt + '. Scroll or press plus to zoom, drag to pan.');
    resetZoom();
    qsa('.pm__thumb', thumbsEl).forEach(function (b, n) {
      b.setAttribute('aria-current', n === imgIndex ? 'true' : 'false');
    });
  }

  function paintPrice() {
    var size = BW.sizeByKey(sizeKey);
    var price = BW.priceFor(current, sizeKey);
    qs('[data-pm-price]').textContent = money(price);
    qs('[data-pm-add-price]').textContent = money(price);
    qs('[data-pm-stems]').textContent = size.label;
    qsa('.size', sizesEl).forEach(function (lab) {
      lab.classList.toggle('is-selected', lab.querySelector('input').value === sizeKey);
    });
  }

  function buildSizes() {
    sizesEl.innerHTML = BW.SIZES.map(function (s) {
      return '<label class="size">' +
        '<input type="radio" name="pm-size" value="' + s.key + '"' +
          (s.key === sizeKey ? ' checked' : '') + '>' +
        '<span class="size__dot" aria-hidden="true"></span>' +
        '<span class="size__label">' +
          '<span class="size__name">' + esc(s.label) + '</span>' +
          '<span class="size__desc">' + esc(s.desc) + '</span>' +
        '</span>' +
        '<span class="size__price">' + money(BW.priceFor(current, s.key)) + '</span>' +
      '</label>';
    }).join('');
    sizesEl.addEventListener('change', function (e) {
      if (e.target && e.target.name === 'pm-size') {
        sizeKey = e.target.value;
        paintPrice();
      }
    });
  }

  function openProduct(id) {
    var p = BW.byId(id);
    if (!p || !modal) return;
    current = p;
    sizeKey = BW.DEFAULT_SIZE;
    if (BW.drawer && BW.drawer.isOpen()) BW.drawer.close();

    qs('[data-pm-no]').textContent = 'Nº ' + p.no;
    qs('[data-pm-title]').textContent = p.name;
    qs('[data-pm-occ]').textContent = p.occasionsLabel.join(' · ');
    qs('[data-pm-blurb]').textContent = p.blurb;
    qs('[data-pm-palette]').textContent = p.palette;

    thumbsEl.innerHTML = p.gallery.map(function (g, i) {
      return '<button class="pm__thumb" type="button" data-thumb="' + i + '" aria-current="' + (i === 0) + '" ' +
        'aria-label="Photograph ' + (i + 1) + ': ' + esc(g.alt) + '">' +
        '<img src="' + esc(BW.thumbSrc(g)) + '" width="62" height="78" loading="lazy" alt=""></button>';
    }).join('');

    buildSizes();
    paintPrice();
    setImage(0);

    lastFocus = document.activeElement;
    modalOpen = true;
    modal.classList.add('is-open');
    modal.removeAttribute('inert');
    U.lock();
    releaseTrap = U.trap(modal);
    document.dispatchEvent(new CustomEvent('bw:modal-open'));
    window.setTimeout(function () {
      var x = qs('.modal__close, .modal__x', modal);
      if (x) x.focus({ preventScroll: true });
    }, 140);
    U.announce(p.name + ' opened. ' + p.blurb.slice(0, 60) + '…');
  }

  function closeProduct() {
    if (!modalOpen) return;
    modalOpen = false;
    modal.classList.remove('is-open');
    modal.setAttribute('inert', '');
    U.unlock();
    if (releaseTrap) { releaseTrap(); releaseTrap = null; }
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    lastFocus = null;
    resetZoom();
  }

  function initModal() {
    if (!modal) return;
    qsa('[data-modal-close]', modal).forEach(function (b) {
      b.addEventListener('click', closeProduct);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modalOpen) closeProduct();
    });

    thumbsEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-thumb]');
      if (!b) return;
      setImage(parseInt(b.getAttribute('data-thumb'), 10));
    });

    qs('[data-pm-add]').addEventListener('click', function () {
      if (!current) return;
      BW.cart.add(current.id, sizeKey);
      var size = BW.sizeByKey(sizeKey);
      U.announce(current.name + ', ' + size.label + ', added to basket.');
      closeProduct();
      if (BW.drawer) window.setTimeout(function () { BW.drawer.open(); }, 260);
    });

    qs('[data-zoom-in]').addEventListener('click', function () { zoomAt(scale + 0.5, 0, 0, true); });
    qs('[data-zoom-out]').addEventListener('click', function () { zoomAt(scale - 0.5, 0, 0, true); });
    qs('[data-zoom-reset]').addEventListener('click', function () { resetZoom(); });

    /* wheel zoom, cursor anchored */
    stage.addEventListener('wheel', function (e) {
      e.preventDefault();
      var r = stage.getBoundingClientRect();
      var mx = e.clientX - r.left;
      var my = e.clientY - r.top;
      var factor = Math.exp(-e.deltaY * 0.0018);
      zoomAt(scale * factor, mx, my, false);
    }, { passive: false });

    /* drag to pan / click to zoom */
    var dragging = false, moved = false, lastX = 0, lastY = 0, downX = 0, downY = 0;
    stage.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      dragging = true; moved = false;
      lastX = downX = e.clientX; lastY = downY = e.clientY;
      if (scale > 1.01) stage.classList.add('is-panning');
      if (stage.setPointerCapture) { try { stage.setPointerCapture(e.pointerId); } catch (err) {} }
    });
    stage.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      if (Math.abs(e.clientX - downX) > 3 || Math.abs(e.clientY - downY) > 3) moved = true;
      if (scale <= 1.01) return;
      tx += e.clientX - lastX;
      ty += e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      clampPan();
      zoomPaint(false);
    });
    stage.addEventListener('pointerup', function (e) {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove('is-panning');
      if (!moved) {
        var r = stage.getBoundingClientRect();
        if (scale > 1.2) resetZoom();
        else zoomAt(2.1, e.clientX - r.left, e.clientY - r.top, true);
      }
    });
    stage.addEventListener('pointercancel', function () {
      dragging = false;
      stage.classList.remove('is-panning');
    });
    stage.addEventListener('keydown', function (e) {
      var handled = true;
      if (e.key === '+' || e.key === '=') zoomAt(scale + 0.4, null, null, true);
      else if (e.key === '-' || e.key === '_') zoomAt(scale - 0.4, null, null, true);
      else if (e.key === '0') resetZoom();
      else if (e.key === 'ArrowLeft') { tx += 60; clampPan(); zoomPaint(false); }
      else if (e.key === 'ArrowRight') { tx -= 60; clampPan(); zoomPaint(false); }
      else if (e.key === 'ArrowUp') { ty += 60; clampPan(); zoomPaint(false); }
      else if (e.key === 'ArrowDown') { ty -= 60; clampPan(); zoomPaint(false); }
      else handled = false;
      if (handled) e.preventDefault();
    });

    /* swipe left/right on the stage when not zoomed */
    var touchX = null;
    stage.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1 && scale <= 1.01) touchX = e.touches[0].clientX;
    }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (touchX == null) return;
      var dx = (e.changedTouches[0].clientX - touchX);
      if (Math.abs(dx) > 46) setImage(imgIndex + (dx < 0 ? 1 : -1));
      touchX = null;
    }, { passive: true });
  }

  /* ====================================================================== *
   *  6b. IMAGE EXPANSION — a gallery that grows out of the thumbnail
   *  Every [data-expand] button resolves its own figure's photograph, so the
   *  lightbox always scales from the exact rectangle the reader clicked.
   * ====================================================================== */
  var lb = qs('[data-lightbox]');
  var lbImg = qs('[data-lightbox-img]');
  var lbCap = qs('[data-lightbox-cap]');
  var lbI = qs('[data-lightbox-i]');
  var lbN = qs('[data-lightbox-n]');
  var lbItems = [];
  var lbIndex = 0;
  var lbIsOpen = false;
  var lbTrap = null;
  var lbLastFocus = null;

  function collectGallery() {
    lbItems = qsa('[data-expand]').map(function (btn) {
      var fig = btn.closest('figure');
      if (!fig) return null;
      var img = fig.querySelector('img');
      if (!img) return null;
      var cap = fig.querySelector('figcaption, .atelier__cap');
      return {
        src: BW.fullSrc(img) || img.getAttribute('src'),
        alt: img.getAttribute('alt') || '',
        cap: cap ? cap.textContent.replace(/\s+/g, ' ').trim() : '',
        w: img.getAttribute('width') || img.naturalWidth || 1600,
        h: img.getAttribute('height') || img.naturalHeight || 2133,
        thumb: img
      };
    }).filter(Boolean);
  }

  function paintLightbox() {
    var it = lbItems[lbIndex];
    if (!it || !lbImg) return;
    BW.repaint(lbImg, it.src, { sizes: '100vw', width: it.w, height: it.h });
    lbImg.setAttribute('alt', it.alt);
    if (lbCap) lbCap.textContent = it.cap;
    if (lbI) lbI.textContent = String(lbIndex + 1);
    if (lbN) lbN.textContent = String(lbItems.length);
  }

  function flipOpen(from) {
    if (!from || !lbImg) return;
    var to = lbImg.getBoundingClientRect();
    if (!to.width || !to.height) return;
    var s = Math.max(from.width / to.width, from.height / to.height);
    var dx = (from.left + from.width / 2) - (to.left + to.width / 2);
    var dy = (from.top + from.height / 2) - (to.top + to.height / 2);
    var fromT = 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0) scale(' + s.toFixed(3) + ')';
    if (M && M.animate && !RM) {
      lbImg.style.transformOrigin = '50% 50%';
      M.animate(lbImg,
        { transform: [fromT, 'translate3d(0px,0px,0px) scale(1)'], opacity: [0.4, 1] },
        { duration: 0.62, ease: EASE });
    }
  }

  function flipClose(to) {
    if (!to || !lbImg) return;
    var from = lbImg.getBoundingClientRect();
    if (!from.width || !to.width) return;
    var s = Math.max(to.width / from.width, to.height / from.height);
    var dx = (to.left + to.width / 2) - (from.left + from.width / 2);
    var dy = (to.top + to.height / 2) - (from.top + from.height / 2);
    var toT = 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0) scale(' + s.toFixed(3) + ')';
    if (M && M.animate && !RM) {
      lbImg.style.transformOrigin = '50% 50%';
      M.animate(lbImg, { transform: ['translate3d(0px,0px,0px) scale(1)', toT], opacity: [1, 0] },
        { duration: 0.42, ease: EASE });
      window.setTimeout(function () { lbImg.style.transform = ''; lbImg.style.opacity = ''; }, 440);
    }
  }

  function openLightbox(btn) {
    if (!lb) return;
    collectGallery();
    var i = -1;
    for (var n = 0; n < lbItems.length; n++) if (lbItems[n].thumb === btn.closest('figure').querySelector('img')) i = n;
    if (i < 0) return;
    lbIndex = i;
    lbLastFocus = btn;
    paintLightbox();
    lbIsOpen = true;
    lb.removeAttribute('inert');
    lb.classList.add('is-open');
    U.lock();
    lbTrap = U.trap(lb);
    document.dispatchEvent(new CustomEvent('bw:lightbox-open'));
    var thumb = lbItems[i].thumb.getBoundingClientRect();
    window.requestAnimationFrame(function () { flipOpen(thumb); });
    var x = qs('.lightbox__x', lb);
    if (x) window.setTimeout(function () { x.focus({ preventScroll: true }); }, 60);
    U.announce('Photograph expanded, ' + (i + 1) + ' of ' + lbItems.length + '.');
  }

  function closeLightbox() {
    if (!lbIsOpen) return;
    lbIsOpen = false;
    var thumb = lbItems[lbIndex] && lbItems[lbIndex].thumb;
    flipClose(thumb ? thumb.getBoundingClientRect() : null);
    lb.classList.remove('is-open');
    lb.setAttribute('inert', '');
    U.unlock();
    if (lbTrap) { lbTrap(); lbTrap = null; }
    if (lbLastFocus && lbLastFocus.focus) lbLastFocus.focus({ preventScroll: true });
    lbLastFocus = null;
  }

  function stepLightbox(dir) {
    if (!lbItems.length) return;
    lbIndex = (lbIndex + dir + lbItems.length) % lbItems.length;
    paintLightbox();
    if (lbImg && !RM) {
      lbImg.style.transform = 'translate3d(' + (dir * 26) + 'px,0,0)';
      window.requestAnimationFrame(function () {
        if (M && M.animate) {
          M.animate(lbImg, { transform: ['translate3d(' + (dir * 26) + 'px,0,0)', 'none'], opacity: [0.5, 1] },
            { duration: 0.4, ease: EASE });
        } else {
          lbImg.style.transform = '';
        }
      });
    }
  }

  function initLightbox(root) {
    if (!lb) return;
    var doc = root && root.querySelectorAll ? root : document;
    qsa('[data-expand]', doc).forEach(function (btn) {
      if (btn.__bwExpand) return;
      btn.__bwExpand = true;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openLightbox(btn);
      });
    });
    if (lb.__bwBound) return;
    lb.__bwBound = true;
    qsa('[data-lightbox-close]', lb).forEach(function (b) {
      b.addEventListener('click', closeLightbox);
    });
    var prev = qs('[data-lightbox-prev]', lb);
    var next = qs('[data-lightbox-next]', lb);
    if (prev) prev.addEventListener('click', function () { stepLightbox(-1); });
    if (next) next.addEventListener('click', function () { stepLightbox(1); });
    document.addEventListener('keydown', function (e) {
      if (!lbIsOpen) return;
      if (e.key === 'Escape') { e.preventDefault(); closeLightbox(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); stepLightbox(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); stepLightbox(1); }
    });
    document.addEventListener('bw:modal-open', function () { if (lbIsOpen) closeLightbox(); });
  }

  /* ====================================================================== *
   *  7. GLOBAL DELEGATION — open / quick add
   * ====================================================================== */
  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-open]');
    if (opener) {
      e.preventDefault();
      openProduct(opener.getAttribute('data-open'));
      return;
    }
    var quick = e.target.closest('[data-quickadd]');
    if (quick) {
      e.preventDefault();
      var p = BW.byId(quick.getAttribute('data-quickadd'));
      if (!p) return;
      BW.cart.add(p.id, BW.DEFAULT_SIZE);
      U.announce(p.name + ', ' + BW.sizeByKey(BW.DEFAULT_SIZE).label + ', added to basket.');
      if (BW.drawer) window.setTimeout(function () { BW.drawer.open(); }, 200);
    }
  });

  /* ====================================================================== *
   *  8. NEWSLETTER (demo, no network)
   * ====================================================================== */
  function newsletter() {
    var form = qs('[data-newsletter]');
    if (!form) return;
    var input = qs('input[type="email"]', form);
    var err = qs('[data-nl-err]');
    var ok = qs('[data-nl-ok]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = (input.value || '').trim();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
      if (err) err.hidden = valid;
      input.setAttribute('aria-invalid', valid ? 'false' : 'true');
      if (!valid) { input.focus(); return; }
      if (ok) ok.textContent = 'Thank you — this demo does not send anything. Call the shop on (562) 437-4106 to order.';
      U.announce('Subscribed to the demo newsletter.');
      form.reset();
    });
  }

  /* ====================================================================== *
   *  BOOT
   * ====================================================================== */
  /* the module is loaded first, so it has already armed the static document;
     the product cards are injected above, after that pass — arm them now */
  safe(function () { if (motion()) motion().init(document); }, 'shared motion init');

  safe(function () { initHeader(document); }, 'header');
  safe(menu, 'mobile menu');
  safe(function () { initRail(document); }, 'embla rail');
  safe(function () { initFilters(document); }, 'filters');
  safe(initModal, 'product modal');
  safe(function () { initLightbox(document); }, 'image expansion');
  safe(magnetic, 'magnetic buttons');
  safe(newsletter, 'newsletter');
  safe(armMotion, 'shared motion re-arm');
  safe(dedupeMarquee, 'ticker clone');
  safe(function () { if (motion()) motion().refresh(); }, 'parallax refresh');

  /* nav occasion links filter the grid once the anchor lands */
  if (!document.__bwNavOcc) {
    document.__bwNavOcc = true;
    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-nav-occ]');
      if (!a || !BW.applyFilter) return;
      window.setTimeout(function () { BW.applyFilter(a.getAttribute('data-nav-occ')); }, 380);
    });
  }

  BW.openProduct = openProduct;
  BW.closeProduct = closeProduct;
  window.__bwReady = true;
})();
