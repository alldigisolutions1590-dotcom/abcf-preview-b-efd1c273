/* ==========================================================================
   A Beautiful California Florist — ui.js
   Shared DOM helpers: focus trap, scroll lock, live region, escaping.
   ========================================================================== */
window.BW = window.BW || {};

BW.ui = (function () {
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---- scroll lock (reference counted) ---- */
  var locks = 0;
  var savedPad = '';
  function lock() {
    locks++;
    if (locks === 1) {
      var sw = window.innerWidth - document.documentElement.clientWidth;
      savedPad = document.body.style.paddingRight;
      if (sw > 0) document.body.style.paddingRight = sw + 'px';
      document.body.classList.add('is-locked');
    }
  }
  function unlock() {
    locks = Math.max(0, locks - 1);
    if (locks === 0) {
      document.body.classList.remove('is-locked');
      document.body.style.paddingRight = savedPad;
    }
  }

  /* ---- focus trap ---- */
  function trap(container, opts) {
    opts = opts || {};
    var release = null;
    function onKey(e) {
      if (e.key !== 'Tab') return;
      var items = qsa(FOCUSABLE, container).filter(function (el) {
        return el.offsetParent !== null || el === document.activeElement;
      });
      if (!items.length) { e.preventDefault(); return; }
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
    document.addEventListener('keydown', onKey, true);
    release = function () {
      document.removeEventListener('keydown', onKey, true);
      release = null;
    };
    return function () { if (release) release(); };
  }

  /* ---- live announcements ---- */
  var liveRegion = null;
  function announce(msg) {
    if (!liveRegion) liveRegion = qs('[data-live]');
    if (!liveRegion) return;
    liveRegion.textContent = '';
    window.setTimeout(function () { liveRegion.textContent = msg; }, 60);
  }

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function money(n) { return BW.money(n); }

  function on(el, type, fn, opts) {
    if (el) el.addEventListener(type, fn, opts || false);
  }

  function motionAllowed() {
    return !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /* ---- focus helpers ---- */
  function focusFirst(container) {
    var first = qsa(FOCUSABLE, container).filter(function (el) {
      return el.offsetParent !== null;
    })[0];
    if (first) first.focus({ preventScroll: true });
    else if (container.setAttribute) {
      container.setAttribute('tabindex', '-1');
      container.focus({ preventScroll: true });
    }
  }

  return {
    qs: qs, qsa: qsa,
    lock: lock, unlock: unlock,
    trap: trap,
    announce: announce,
    esc: esc,
    money: money,
    on: on,
    motionAllowed: motionAllowed,
    focusFirst: focusFirst
  };
})();
