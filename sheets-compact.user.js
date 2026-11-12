// ==UserScript==
// @name         Google Sheets – compact header
// @namespace    google-workspace-compact
// @version      1.0.0
// @description  Moves File/Edit/View… onto the title row to give the spreadsheet more vertical space.
// @match        https://docs.google.com/spreadsheets/*
// @run-at       document-start
// @grant        none
// @license      MIT
// ==/UserScript==
(function () {
  const style = document.createElement('style');
  style.textContent = `
    #docs-menubars {
      position: absolute !important;
      top: -32px !important;
      left: var(--menus-left, 360px) !important;
      width: auto !important;
      margin: 0 !important;
      z-index: 10;
    }
    #docs-menubar { margin-left: 0 !important; }
    #docs-branding-container { transform: scale(0.6); transform-origin: top left; }
    .docs-titlebar-buttons { height: 38px !important; transform: scale(0.8); transform-origin: right center; }
  `;
  (document.head || document.documentElement).appendChild(style);

  const header = () => document.getElementById('docs-header');
  const menusShown = () => { const h = header(); return !!h && h.offsetHeight > 0; };

  const gapNow = () => {
    const ed = document.getElementById('docs-editor-container');
    return ed ? Math.round(window.innerHeight - ed.getBoundingClientRect().bottom) : 0;
  };

  // Send Ctrl+Shift+F ("Hide menus") to whatever currently has keyboard focus
  const press = () => {
    const ifr = document.querySelector('.docs-texteventtarget-iframe');
    const t = ifr?.contentDocument?.activeElement || document.activeElement || document.body;
    ['keydown', 'keyup'].forEach(type =>
      t.dispatchEvent(new KeyboardEvent(type, {
        key: 'F', code: 'KeyF', keyCode: 70, which: 70,
        ctrlKey: true, shiftKey: true, bubbles: true, cancelable: true
      })));
  };

  // Toggle "Hide menus" off and back on so Sheets re-measures the header.
  // Safety net: if the menus end up hidden afterwards, show them again.
  const relayout = () => {
    press();
    setTimeout(press, 400);
    setTimeout(() => { if (!menusShown()) press(); }, 1500);
  };

  let last = 0, tries = 0;
  setInterval(() => {
    const badges = document.querySelector('.docs-titlebar-badges');
    if (badges) {
      document.documentElement.style.setProperty(
        '--menus-left', Math.round(badges.getBoundingClientRect().right + 8) + 'px');
    }
    if (!menusShown()) return;          // you've hidden the menus yourself: leave it alone
    if (gapNow() < 3) { tries = 0; return; }
    if (Date.now() - last < 2500 || tries >= 3) return;
    last = Date.now();
    tries++;
    relayout();
  }, 500);
})();
