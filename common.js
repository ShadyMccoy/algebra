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
  // gets each new whole number in [min, max]. Returns `set`, to change it from code.
  function numberPicker(root, { get, onChange, min = 1, max = 999 }) {
    const num = root.querySelector('input[type=number]');
    const set = v => {
      v = clamp(Math.round(v) || min, min, max);
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

  window.doodle = { $, clamp, gcd, bump, holdRepeat, numberPicker, css, onTheme };
})();
