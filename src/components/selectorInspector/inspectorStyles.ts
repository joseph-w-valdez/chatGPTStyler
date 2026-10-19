// Injected into the inspector's shadow root; ChatGPT's stylesheet cannot reach it.
export const INSPECTOR_STYLES = `
* { box-sizing: border-box; }

.panel {
    position: fixed;
    bottom: 12px;
    right: 12px;
    width: 480px;
    max-width: calc(100vw - 24px);
    max-height: min(72vh, 680px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    pointer-events: auto;
    background: #0f1513;
    color: #e6efec;
    border: 1px solid rgba(20, 184, 166, 0.45);
    border-radius: 10px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
    font: 12px/1.45 system-ui, -apple-system, "Segoe UI", sans-serif;
    text-align: left;
}
.panel.left { right: auto; left: 12px; }

.head {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 10px;
    background: linear-gradient(90deg, #030712 0%, #14b8a6 100%);
}
.title { flex: 1; font-weight: 600; color: #5eead4; }

.body { overflow: auto; padding: 10px; display: grid; gap: 12px; align-content: start; }
.foot { padding: 6px 10px; border-top: 1px solid rgba(255, 255, 255, 0.08); font-size: 11px; }

button {
    font: inherit;
    color: inherit;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 6px;
    padding: 2px 8px;
    cursor: pointer;
    white-space: nowrap;
}
button:hover { background: rgba(255, 255, 255, 0.16); }
button:disabled { opacity: 0.4; cursor: default; }
button.primary { background: #14b8a6; border-color: #14b8a6; color: #04110e; font-weight: 600; }

h3 { margin: 0 0 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: #9caba7; }
p { margin: 0; }
ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 6px; }

code, .mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 11px;
    word-break: break-all;
}

.row { display: grid; gap: 4px; padding: 6px 8px; border-radius: 6px; background: rgba(255, 255, 255, 0.04); }
.row-meta { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.spacer { flex: 1; }
.badge {
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.1);
    white-space: nowrap;
}

.crumbs { display: flex; flex-wrap: wrap; gap: 4px; }
.crumb { max-width: 100%; overflow: hidden; text-overflow: ellipsis; font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 11px; }
.crumb.current { background: rgba(20, 184, 166, 0.25); border-color: #14b8a6; }

details { border-radius: 6px; background: rgba(255, 255, 255, 0.03); padding: 4px 8px; }
details > summary { cursor: pointer; padding: 3px 0; font-weight: 600; }
details[open] > summary { margin-bottom: 6px; }

table { width: 100%; border-collapse: collapse; }
td { padding: 2px 4px; vertical-align: top; border-bottom: 1px solid rgba(255, 255, 255, 0.06); }
td:first-child { color: #9caba7; white-space: nowrap; }

.badge.warn { background: rgba(251, 191, 36, 0.18); color: #fbbf24; }
details.target > summary .badge { margin-left: 4px; font-weight: 400; }

.card { display: grid; gap: 6px; margin: 0; }
.about { font-size: 11px; color: #b9c6c3; line-height: 1.5; }
.about strong { color: #e6efec; font-weight: 600; }
.selector-input {
    width: 100%;
    padding: 5px 7px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: #060a09;
    color: #e6efec;
    font: 11px/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.selector-input:focus { outline: 2px solid #14b8a6; outline-offset: -1px; }

.result { display: grid; gap: 2px; padding: 6px 8px; border-radius: 6px; border-left: 3px solid #9caba7; background: rgba(255, 255, 255, 0.04); }
.result.pass { border-left-color: #5eead4; }
.result.warn { border-left-color: #fbbf24; }
.result.fail { border-left-color: #f87171; }

.notice { padding: 6px 8px; border-radius: 6px; background: rgba(20, 184, 166, 0.14); }
.notice.warn-notice { background: rgba(251, 191, 36, 0.14); border: 1px solid rgba(251, 191, 36, 0.4); }

.ok { color: #5eead4; }
.bad { color: #f87171; }
.warn { color: #fbbf24; }
.muted { color: #9caba7; }

.banner {
    position: fixed;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    padding: 6px 14px;
    border-radius: 999px;
    background: #14b8a6;
    color: #04110e;
    font: 600 12px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
    pointer-events: none;
}

.hover-box, .highlight-box { position: fixed; pointer-events: none; border-radius: 2px; }
.hover-box { outline: 2px solid #14b8a6; background: rgba(20, 184, 166, 0.14); }
.highlight-box { outline: 2px dashed #fbbf24; background: rgba(251, 191, 36, 0.14); }
.hover-label {
    position: fixed;
    pointer-events: none;
    padding: 1px 5px;
    border-radius: 3px;
    background: #14b8a6;
    color: #04110e;
    font: 11px/1.3 ui-monospace, Menlo, Consolas, monospace;
    white-space: nowrap;
}
`;
