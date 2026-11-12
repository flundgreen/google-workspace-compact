"""Generate the three userscripts and the three extension content scripts from core.js."""
from pathlib import Path

HERE = Path(__file__).parent
CORE = (HERE / "core.js").read_text()
VERSION = "1.1.0"
REPO = HERE.parent
EXT = HERE.parent / "chrome-extension"

NUDGE = {
    "@@NUDGE_CSS@@*/": """@@*/
    /* Hide the Gemini "Create a slide" / "Enhance this slide" nudge */
    .appsElementsGenerativeAiNudgeButtonNudgeRoot,
    #canvas-nudge-surface-soy-container,
    #canvas-nudge-surface { display: none !important; }""",
    "/*@@NUDGE_STATE@@*/": ", nudgeClicked = false",
    "/*@@NUDGE_RESET@@*/": "; nudgeClicked = false",
    "/*@@NUDGE_ACTION@@*/": """// Slides reserves space for the Gemini nudge even while it's hidden.
    // Clicking the nudge's own close (X) button makes Slides give it back.
    const xs = document.querySelectorAll('.appsElementsGenerativeAiNudgeButtonNudgeDismissButton');
    if (gap > 0 && !nudgeClicked && xs.length) { xs.forEach(b => b.click()); nudgeClicked = true; return; }""",
}

APPS = {
    "slides": dict(
        name="Google Slides – compact header + no Gemini nudge",
        desc='Moves File/Edit/View… onto the title row, and auto-dismisses the Gemini "Create a slide" / "Enhance this slide" nudge so the slide can use the full height.',
        match="https://docs.google.com/presentation/*",
        nudge=True,
    ),
    "docs": dict(
        name="Google Docs – compact header",
        desc="Moves File/Edit/View… onto the title row to give the document more vertical space.",
        match="https://docs.google.com/document/*",
        nudge=False,
    ),
    "sheets": dict(
        name="Google Sheets – compact header",
        desc="Moves File/Edit/View… onto the title row to give the spreadsheet more vertical space.",
        match="https://docs.google.com/spreadsheets/*",
        nudge=False,
    ),
}


def body_for(nudge: bool) -> str:
    src = CORE
    for marker, code in NUDGE.items():
        if nudge:
            src = src.replace(marker, code)
        else:
            # Remove markers entirely
            if marker == "@@NUDGE_CSS@@*/":
                src = src.replace("/*@@NUDGE_CSS@@*/\n", "")
            elif marker == "/*@@NUDGE_ACTION@@*/":
                src = src.replace("    /*@@NUDGE_ACTION@@*/\n", "")
            else:
                src = src.replace(marker, "")
    if nudge:
        src = src.replace("    /*@@*/\n", "")
    assert "@@" not in src, src
    return src


for app, cfg in APPS.items():
    body = body_for(cfg["nudge"])
    header = f"""// ==UserScript==
// @name         {cfg['name']}
// @namespace    google-workspace-compact
// @version      {VERSION}
// @description  {cfg['desc']}
// @match        {cfg['match']}
// @run-at       document-start
// @grant        none
// @license      MIT
// ==/UserScript==
"""
    guarded = (
        "// Skip if the Workspace Compact Chrome extension (or another copy) already ran.\n"
        "if (!window.__workspaceCompactLoaded) {\n"
        "window.__workspaceCompactLoaded = true;\n" + body + "}\n"
    )
    (REPO / f"{app}-compact.user.js").write_text(header + guarded)

    ext = f"""// Workspace Compact – {app.capitalize()} content script (v{VERSION}).
// Runs in the page (MAIN world) so it behaves exactly like the userscript version.
// No data is read, stored or sent anywhere.
if (!window.__workspaceCompactLoaded) {{
window.__workspaceCompactLoaded = true;
{body}}}
"""
    (EXT / f"{app}.js").write_text(ext)

print("built", ", ".join(APPS))
