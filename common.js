// Shared helpers for every Math Doodles page. Load with a plain <script src="common.js">
// before the page's own script; everything lives on the global `doodle`.
(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
  const gcd = (x, y) => { while (y) [x, y] = [y, x % y]; return x; };

  // replay the .bump grow-and-settle animation on an element
  const bump = el => { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); };

  // press-and-hold repeats, speeding up; keyboard Enter/Space still works through click
  // (a touch tap also fires click afterwards, so skip the click a press already handled)
  function holdRepeat(btn, fn) {
    let t = null, pressed = false;
    const stop = () => { clearTimeout(t); t = null; btn.classList.remove('held'); };
    btn.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      e.preventDefault();
      pressed = true;
      btn.classList.add('held');
      fn();
      let delay = 400;
      const go = () => { fn(); delay = Math.max(45, delay * .8); t = setTimeout(go, delay); };
      t = setTimeout(go, delay);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => btn.addEventListener(ev, stop));
    btn.addEventListener('click', () => { if (pressed) pressed = false; else fn(); });   // keyboard
    btn.addEventListener('contextmenu', e => e.preventDefault());
  }

  // Wire up a .picker (see common.css): typing, the + / − buttons (hold to repeat),
  // and the scroll wheel anywhere over it. `get` reads the current value; `onChange`
  // gets each new whole number in [min, max]; `max` may be a function, for a limit that
  // changes. Returns `set`, to change it from code.
  function numberPicker(root, { get, onChange, min = 1, max = 999 }) {
    const num = root.querySelector('input[type=number]');
    const set = v => {
      v = clamp(Math.round(v) || min, min, typeof max === 'function' ? max() : max);
      if (v !== get()) bump(num);
      if (document.activeElement !== num || +num.value !== v) num.value = v;
      onChange(v);
    };
    num.addEventListener('input', () => { if (num.value !== '') set(+num.value); });
    num.addEventListener('blur', () => { set(+num.value); num.value = get(); });
    root.querySelectorAll('.pm').forEach(b => holdRepeat(b, () => set(get() + +b.dataset.d)));
    let acc = 0;
    root.addEventListener('wheel', e => {
      e.preventDefault();
      acc += e.deltaY;
      if (Math.abs(acc) >= 40) { set(get() + (acc < 0 ? 1 : -1)); acc = 0; }
    }, { passive: false });
    return set;
  }

  // read CSS custom properties (e.g. for drawing on a canvas): css('ink', 'red') -> { ink: '#…', red: '#…' }
  function css(...names) {
    const cs = getComputedStyle(document.documentElement), out = {};
    for (const n of names) out[n] = cs.getPropertyValue('--' + n).trim();
    return out;
  }
  // run fn whenever light / dark mode flips
  const onTheme = fn => matchMedia('(prefers-color-scheme: dark)').addEventListener('change', fn);

  // '#abc' / '#aabbcc' / 'rgb(…)' -> [r, g, b]
  function rgb(c) {
    c = (c || '').trim();
    let m = /^#([0-9a-f]{3})$/i.exec(c);
    if (m) c = '#' + [...m[1]].map(x => x + x).join('');
    m = /^#([0-9a-f]{6})/i.exec(c);
    if (m) { const n = parseInt(m[1], 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
    m = /rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/.exec(c);
    return m ? [+m[1], +m[2], +m[3]] : [0, 0, 0];
  }
  const toHex = c => '#' + rgb(c).map(v => Math.round(v).toString(16).padStart(2, '0')).join('');

  // User-picked colors, kept in this browser only under localStorage[storeKey].
  // Every <input type=color data-k="x"> on the page sets --x; inputs sharing a key stay in step.
  // `names` lists the keys that can be customised; `onChange` runs after each change.
  // Returns { reset } to go back to the page's own colors.
  function colorPicker(storeKey, names, onChange = () => {}) {
    let custom = {};
    try { custom = JSON.parse(localStorage.getItem(storeKey)) || {}; } catch (e) { custom = {}; }
    const inputs = document.querySelectorAll('input[type=color][data-k]');
    const sync = () => { const c = css(...names); inputs.forEach(i => { i.value = toHex(c[i.dataset.k]); }); };
    function apply() {
      const rs = document.documentElement.style;
      for (const k of names) custom[k] ? rs.setProperty('--' + k, custom[k]) : rs.removeProperty('--' + k);
      try { localStorage.setItem(storeKey, JSON.stringify(custom)); } catch (e) {}
      sync(); onChange();
    }
    inputs.forEach(i => i.addEventListener('input', () => { custom[i.dataset.k] = i.value; apply(); }));
    onTheme(sync);
    apply();
    return { reset() { custom = {}; apply(); } };
  }

  // Header buttons that open panels: pairs of [button, panel].
  // A panel that floats (position: absolute) closes on a tap outside it, and when
  // another panel opens; Escape closes them all. Returns show(index, on).
  function popovers(pairs) {
    const floating = el => getComputedStyle(el).position === 'absolute';
    const show = (i, on) => {
      const [btn, pan] = pairs[i];
      pan.hidden = !on; btn.setAttribute('aria-expanded', on);
      if (on) pairs.forEach(([, p], j) => { if (j !== i && !p.hidden && floating(p)) show(j, false); });
    };
    pairs.forEach(([btn, pan], i) => btn.addEventListener('click', () => show(i, pan.hidden)));
    document.addEventListener('pointerdown', e => pairs.forEach(([btn, pan], i) => {
      if (!pan.hidden && floating(pan) && !pan.contains(e.target) && !btn.contains(e.target)) show(i, false);
    }));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') pairs.forEach((_, i) => show(i, false)); });
    return show;
  }

  window.doodle = { $, clamp, gcd, bump, holdRepeat, numberPicker, css, onTheme, rgb, toHex, colorPicker, popovers };
})();
