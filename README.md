# Google Workspace Compact

Userscripts that reclaim vertical space in Google Slides, Docs and Sheets.

| Script | What it does |
|---|---|
| [`slides-compact.user.js`](slides-compact.user.js) | Moves **File / Edit / View…** up onto the title row, and automatically dismisses the Gemini **"Create a slide"** / **"Enhance this slide"** nudge so the slide can use the full window height. |
| [`docs-compact.user.js`](docs-compact.user.js) | Moves the menus up onto the title row in Google Docs. |
| [`sheets-compact.user.js`](sheets-compact.user.js) | Moves the menus up onto the title row in Google Sheets. |

Each one gives back roughly 27px of height (plus 48px on Slides when the Gemini nudge would otherwise appear). To fit everything on one row, the Google logo and the buttons on the right (history, comments, Meet, Share, avatar) are drawn a little smaller.

## Install

1. Install a userscript manager: [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/).
2. Open the script you want above, click **Raw**, and your userscript manager will offer to install it.
3. Reload any open Slides, Docs or Sheets tabs.

## How it works

- **Menus on the title row:** CSS lifts the menu bar into the title row, next to the star / folder / cloud icons. A small timer keeps it lined up when the title changes length.
- **Filling the freed space:** Google's editors size their panels with JavaScript and don't notice when the header gets shorter. When the script sees a gap at the bottom of the window, it sends the built-in **Ctrl+Shift+F** ("Hide menus") shortcut twice so the editor re-measures. You may see a brief flicker. If the menus somehow end up hidden, it presses once more to bring them back, and it never acts while you've hidden the menus yourself.
- **Gemini nudge (Slides):** Slides reserves 48px at the bottom whenever the nudge is due, even when it's hidden. The script clicks the nudge's own close (X) button, which makes Slides give the space back.

## Troubleshooting

- **Menus disappeared:** press **Ctrl+Shift+F** to show them again.
- **Something looks off after a Google update:** these scripts rely on Google's internal element names, which can change without notice. Please open an issue.

## License

MIT
