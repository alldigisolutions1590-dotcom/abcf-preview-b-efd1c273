/* ==========================================================================
   A Beautiful California Florist — cart.js
   Versioned localStorage basket. Demo only; nothing is transmitted.
   Lines are keyed on product id + size tier, priced from the catalogue.
   ========================================================================== */
window.BW = window.BW || {};

BW.cart = (function () {
  var KEY = 'abc.basket.v1';
  var VERSION = 1;
  var MAX_QTY = 12;
  var DELIVERY_FEE = 15;
  var FREE_OVER = 150;
  var state = { v: VERSION, lines: [], gift: '' };
  var memoryOnly = false;

  function blank() { return { v: VERSION, lines: [], gift: '' }; }

  function saneLines(raw) {
    if (!Array.isArray(raw)) return [];
    var out = [];
    raw.forEach(function (l) {
      if (!l || typeof l.id !== 'string' || typeof l.size !== 'string') return;
      if (!BW.byId(l.id)) return;
      var q = parseInt(l.qty, 10);
      if (!isFinite(q) || q < 1) return;
      out.push({ id: l.id, size: BW.sizeByKey(l.size).key, qty: Math.min(MAX_QTY, q) });
    });
    return out;
  }

  function load() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return blank();
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.v !== VERSION) return blank();
      return {
        v: VERSION,
        lines: saneLines(parsed.lines),
        gift: typeof parsed.gift === 'string' ? parsed.gift.slice(0, 240) : ''
      };
    } catch (err) {
      memoryOnly = true;
      return blank();
    }
  }

  function persist() {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch (err) {
      memoryOnly = true;
    }
  }

  function emit() {
    persist();
    try {
      document.dispatchEvent(new CustomEvent('bw:cart', { detail: api }));
    } catch (err) { /* very old browser */ }
  }

  function lineKey(id, size) { return id + '::' + size; }

  function add(id, sizeKey) {
    var product = BW.byId(id);
    if (!product) return null;
    var size = BW.sizeByKey(sizeKey);
    var key = lineKey(product.id, size.key);
    var found = null;
    for (var i = 0; i < state.lines.length; i++) {
      if (lineKey(state.lines[i].id, state.lines[i].size) === key) { found = state.lines[i]; break; }
    }
    if (found) {
      found.qty = Math.min(MAX_QTY, found.qty + 1);
    } else {
      found = { id: product.id, size: size.key, qty: 1 };
      state.lines.push(found);
    }
    emit();
    try {
      document.dispatchEvent(new CustomEvent('bw:add', {
        detail: { product: product, size: size, line: found }
      }));
    } catch (err) { /* ignore */ }
    return found;
  }

  function setQty(id, sizeKey, qty) {
    var key = lineKey(id, sizeKey);
    var next = parseInt(qty, 10);
    for (var i = 0; i < state.lines.length; i++) {
      if (lineKey(state.lines[i].id, state.lines[i].size) === key) {
        if (!isFinite(next) || next < 1) {
          state.lines.splice(i, 1);
        } else {
          state.lines[i].qty = Math.min(MAX_QTY, next);
        }
        emit();
        return;
      }
    }
  }

  function remove(id, sizeKey) {
    var key = lineKey(id, sizeKey);
    state.lines = state.lines.filter(function (l) { return lineKey(l.id, l.size) !== key; });
    emit();
  }

  function clear() {
    state.lines = [];
    state.gift = '';
    emit();
  }

  function setGift(text) {
    state.gift = (text || '').slice(0, 240);
    emit();
  }

  function lines() {
    return state.lines.map(function (l) {
      var product = BW.byId(l.id);
      var size = BW.sizeByKey(l.size);
      return {
        id: l.id, size: l.size, qty: l.qty,
        key: lineKey(l.id, l.size),
        product: product, sizeObj: size,
        unit: BW.priceFor(product, size.key),
        total: BW.priceFor(product, size.key) * l.qty
      };
    });
  }

  function count() {
    return state.lines.reduce(function (n, l) { return n + l.qty; }, 0);
  }

  function subtotal() {
    return Math.round(state.lines.reduce(function (n, l) {
      var p = BW.byId(l.id);
      return n + BW.priceFor(p, l.size) * l.qty;
    }, 0) * 100) / 100;
  }

  /* A flat sample delivery figure — the shop confirms delivery when it is ordered. */
  function delivery() {
    return subtotal() ? DELIVERY_FEE : 0;
  }

  function total() { return subtotal() + delivery(); }

  var api = {
    KEY: KEY,
    MAX_QTY: MAX_QTY,
    FREE_OVER: FREE_OVER,
    add: add,
    setQty: setQty,
    remove: remove,
    clear: clear,
    setGift: setGift,
    gift: function () { return state.gift; },
    lines: lines,
    count: count,
    subtotal: subtotal,
    delivery: delivery,
    total: total,
    isMemoryOnly: function () { return memoryOnly; }
  };

  state = load();
  return api;
})();
