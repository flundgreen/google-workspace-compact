// Workspace Compact – Sheets content script (v1.1.0).
// Runs in the page (MAIN world) so it behaves exactly like the userscript version.
// No data is read, stored or sent anywhere.
if (!window.__workspaceCompactLoaded) {
window.__workspaceCompactLoaded = true;
(function () {
  // ---------- Styles ----------
  // Everything that moves the menus is gated on the "wc-compact" class, so the
  // script can fall back to Google's normal two-row header when the window is
  // too narrow for the menus to fit beside the title.
  const style = document.createElement('style');
  style.textContent = `
        html.wc-compact #docs-menubars {
      position: absolute !important;
      top: -32px !important;
      left: var(--menus-left, 360px) !important;
      width: auto !important;
      margin: 0 !important;
      z-index: 10;
    }
    html.wc-compact #docs-menubar { margin-left: 0 !important; }
    html.wc-compact #docs-branding-container { transform: scale(0.6); transform-origin: top left; }
    html.wc-compact .docs-titlebar-buttons { height: 38px !important; transform: scale(0.8); transform-origin: right center; }
  `;
  (document.head || document.documentElement).appendChild(style);
  document.documentElement.classList.add('wc-compact');

  const $ = s => document.querySelector(s);
  const menusShown = () => { const h = $('#docs-header'); return !!h && h.offsetHeight > 0; };

  // Positive = empty gap under the editor; negative = editor runs past the window.
  const gapNow = () => {
    const ed = $('#docs-editor-container');
    return ed ? Math.round(window.innerHeight - ed.getBoundingClientRect().bottom) : 0;
  };

  // ---------- Re-layout ----------
  // Google sizes the editor with JavaScript and doesn't notice when the header
  // changes height. Toggling the built-in "Hide menus" (Ctrl+Shift+F) off and
  // back on makes it measure again.
  // The shortcut only registers when the editor's own keyboard target has focus:
  // a hidden text box inside an iframe in Docs/Slides, the cell input in Sheets.
  const keyTarget = () => {
    const ifr = $('.docs-texteventtarget-iframe');
    return ifr?.contentDocument?.querySelector('[contenteditable="true"]') || $('.cell-input') || document.body;
  };
  // Don't steal focus while you're typing in a field such as the title box or a dialog.
  const userIsTyping = () => {
    const a = document.activeElement;
    return !!a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' ||
      (a.isContentEditable && !a.classList.contains('cell-input')));
  };
  const press = () => {
    const t = keyTarget();
    t.focus({ preventScroll: true });
    ['keydown', 'keyup'].forEach(type =>
      t.dispatchEvent(new KeyboardEvent(type, {
        key: 'F', code: 'KeyF', keyCode: 70, which: 70,
        ctrlKey: true, shiftKey: true, bubbles: true, cancelable: true
      })));
  };
  const relayout = () => {
    press();
    setTimeout(press, 400);
    // Safety net: if the menus ended up hidden, show them again.
    setTimeout(() => { if (!menusShown()) press(); }, 1500);
  };

  // ---------- Fit check ----------
  // Is there room for the menus between the title icons and the right-hand buttons?
  const fitsOnTitleRow = (compactNow) => {
    const badges = $('.docs-titlebar-badges');
    const menubar = $('#docs-menubar');
    const buttons = $('.docs-titlebar-buttons');
    if (!badges || !menubar || !buttons) return compactNow;
    const firstBtn = [...buttons.children].find(c => c.getBoundingClientRect().width > 0) || buttons;
    let rightLimit = firstBtn.getBoundingClientRect().left;
    // When not compact the buttons are drawn larger; estimate their compact position.
    if (!compactNow) rightLimit = window.innerWidth - (window.innerWidth - rightLimit) * 0.8;
    const room = rightLimit - (badges.getBoundingClientRect().right + 8) - 12;
    const need = menubar.getBoundingClientRect().width;
    // A little hysteresis so it doesn't flip back and forth at the edge.
    return compactNow ? room >= need : room >= need + 24;
  };

  let last = 0, tries = 0;
  setInterval(() => {
    const root = document.documentElement;
    const badges = $('.docs-titlebar-badges');
    if (badges) {
      root.style.setProperty('--menus-left', Math.round(badges.getBoundingClientRect().right + 8) + 'px');
    }

    // Switch between one-row and two-row headers as the window width changes.
    if (menusShown()) {
      const compactNow = root.classList.contains('wc-compact');
      const shouldBe = fitsOnTitleRow(compactNow);
      if (shouldBe !== compactNow) {
        root.classList.toggle('wc-compact', shouldBe);
        tries = 0;
        last = 0;
      }
    }

    const gap = gapNow();
    if (Math.abs(gap) < 3) { tries = 0; return; }
    if (Date.now() - last < 2500 || tries >= 3 || userIsTyping()) return;
    last = Date.now();
    tries++;
    if (menusShown()) relayout();   // menus hidden by you: leave them alone
  }, 500);
})();
}
