# Google Workspace Compact

Reclaim vertical space in Google Slides, Docs and Sheets. Available as a Chrome extension or as userscripts.

| Script | What it does |
|---|---|
| [`slides-compact.user.js`](slides-compact.user.js) | Moves **File / Edit / View…** up onto the title row, and automatically dismisses the Gemini **"Create a slide"** / **"Enhance this slide"** nudge so the slide can use the full window height. |
| [`docs-compact.user.js`](docs-compact.user.js) | Moves the menus up onto the title row in Google Docs. |
| [`sheets-compact.user.js`](sheets-compact.user.js) | Moves the menus up onto the title row in Google Sheets. |

Each one gives back roughly 27px of height (plus 48px on Slides when the Gemini nudge would otherwise appear). To fit everything on one row, the Google logo and the buttons on the right (history, comments, Meet, Share, avatar) are drawn a little smaller. In a narrow window where the menus won't fit beside the title, Google's normal two-row header is left alone.

## Install

**Chrome extension:** the [`chrome-extension/`](chrome-extension) folder holds the same code packaged for the Chrome Web Store, with nothing to install but the extension.

**Userscripts:**
1. Install a userscript manager: [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/).
2. Open the script you want above, click **Raw**, and your userscript manager will offer to install it.
3. Reload any open Slides, Docs or Sheets tabs.

Use one or the other. If both are installed, whichever loads first runs and the other stays inactive.

## How it works

- **Menus on the title row:** CSS lifts the menu bar into the title row, next to the star / folder / cloud icons. A small timer keeps it lined up when the title changes length, and switches back to two rows if the window gets too narrow.
- **Filling the freed space:** Google's editors size their panels with JavaScript and don't notice when the header changes height. When the script sees a gap (or overflow) at the bottom of the window, it sends the built-in **Ctrl+Shift+F** ("Hide menus") shortcut twice so the editor re-measures. You may see a brief flicker. If the menus somehow end up hidden, it presses once more to bring them back. It never acts while you've hidden the menus yourself, or while you're typing in a field such as the title box.
- **Gemini nudge (Slides):** Slides reserves 48px at the bottom whenever the nudge is due, even when it's hidden. The script clicks the nudge's own close (X) button, which makes Slides give the space back.

## Privacy

No data is collected, stored or sent anywhere. See [PRIVACY.md](PRIVACY.md).

## Troubleshooting

- **Menus disappeared:** press **Ctrl+Shift+F** to show them again.
- **Something looks off after a Google update:** these scripts rely on Google's internal element names, which can change without notice. Please open an issue.

## For developers

All six files (three userscripts, three extension content scripts) are generated from [`src/core.js`](src/core.js) by [`src/build.py`](src/build.py), so a fix only has to be made once.

## Changelog

- **1.1.0:** Falls back to the normal two-row header when the window is too narrow (menus used to overlap the Share button). More reliable re-layout when the editor has lost keyboard focus. Never steals focus while you're typing in a field. Chrome extension added.
- **1.0.0:** First release.

## License

MIT

Not affiliated with or endorsed by Google.
