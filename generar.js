// Genera los temas de Windows Terminal y Obsidian a partir de los 8 temas de VS Code (starfall-vscode/themes)
// Uso: node generar.js
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "starfall-vscode", "themes");
const ORDER = ["night", "day", "cereza", "fresa", "cafe-con-leche", "chocolate", "lavanda", "menta"];

const themes = ORDER.map(key => {
    const t = JSON.parse(fs.readFileSync(path.join(SRC, `starfall-${key}-color-theme.json`), "utf8"));
    const tok = scope => t.tokenColors.find(x => x.scope.includes(scope)).settings.foreground;
    return {
        key, name: t.name, dark: t.type === "dark", c: t.colors,
        fn: tok("entity.name.function"), kw: tok("keyword"), str: tok("string"), num: tok("constant.numeric"),
        prop: tok("variable.other.property"), comment: tok("comment")
    };
});

// ---------- Windows Terminal ----------
const schemes = themes.map(t => ({
    name: t.name,
    background: t.c["terminal.background"],
    foreground: t.c["terminal.foreground"],
    cursorColor: t.c["terminalCursor.foreground"],
    selectionBackground: t.c["editor.selectionBackground"].slice(0, 7),
    black: t.c["terminal.ansiBlack"],
    red: t.c["terminal.ansiRed"],
    green: t.c["terminal.ansiGreen"],
    yellow: t.c["terminal.ansiYellow"],
    blue: t.c["terminal.ansiBlue"],
    purple: t.c["terminal.ansiMagenta"],
    cyan: t.c["terminal.ansiCyan"],
    white: t.c["terminal.ansiWhite"],
    brightBlack: t.c["terminal.ansiBrightBlack"],
    brightRed: t.c["terminal.ansiBrightRed"],
    brightGreen: t.c["terminal.ansiBrightGreen"],
    brightYellow: t.c["terminal.ansiBrightYellow"],
    brightBlue: t.c["terminal.ansiBrightBlue"],
    brightPurple: t.c["terminal.ansiBrightMagenta"],
    brightCyan: t.c["terminal.ansiBrightCyan"],
    brightWhite: t.c["terminal.ansiBrightWhite"]
}));
fs.mkdirSync(path.join(__dirname, "windows-terminal"), { recursive: true });
fs.writeFileSync(path.join(__dirname, "windows-terminal", "starfall-schemes.json"), JSON.stringify(schemes, null, 4) + "\n");

// ---------- Obsidian ----------
// Un solo tema: Starfall Night en modo oscuro y Starfall Day en modo claro.
// Los otros colores van como fragmentos CSS (snippets) que se activan por separado.
const vars = t => `
    --background-primary: ${t.c["editor.background"]};
    --background-primary-alt: ${t.c["editorWidget.background"]};
    --background-secondary: ${t.c["sideBar.background"]};
    --background-secondary-alt: ${t.c["activityBar.background"]};
    --background-modifier-border: ${t.c["sideBar.border"]};
    --background-modifier-hover: ${t.c["list.hoverBackground"]};
    --background-modifier-active-hover: ${t.c["list.hoverBackground"]};
    --text-normal: ${t.c["editor.foreground"]};
    --text-muted: ${t.c["descriptionForeground"]};
    --text-faint: ${t.comment};
    --text-accent: ${t.fn};
    --text-accent-hover: ${t.kw};
    --text-selection: ${t.c["editor.selectionBackground"]};
    --text-highlight-bg: ${t.c["editor.findMatchBackground"]};
    --interactive-accent: ${t.c["button.background"]};
    --interactive-accent-hover: ${t.c["button.hoverBackground"]};
    --text-on-accent: ${t.c["button.foreground"]};
    --color-accent: ${t.c["button.background"]};
    --link-color: ${t.fn};
    --link-color-hover: ${t.kw};
    --link-external-color: ${t.fn};
    --h1-color: ${t.fn};
    --h2-color: ${t.kw};
    --h3-color: ${t.num};
    --h4-color: ${t.str};
    --h5-color: ${t.prop};
    --h6-color: ${t.text || t.c["descriptionForeground"]};
    --bold-color: ${t.num};
    --italic-color: ${t.kw};
    --code-normal: ${t.str};
    --code-background: ${t.c["editorWidget.background"]};
    --blockquote-border-color: ${t.kw};
    --hr-color: ${t.c["sideBar.border"]};
    --tag-color: ${t.fn};
    --tag-background: ${t.c["list.hoverBackground"]};
    --checkbox-color: ${t.c["button.background"]};
    --checkbox-marker-color: ${t.c["button.foreground"]};
    --caret-color: ${t.c["editorCursor.foreground"]};
    --titlebar-background: ${t.c["titleBar.activeBackground"]};
    --titlebar-background-focused: ${t.c["titleBar.activeBackground"]};
    --tab-text-color-focused-active: ${t.c["tab.activeForeground"]};
    --nav-item-color-active: ${t.c["editor.foreground"]};
    --nav-item-background-active: ${t.c["list.activeSelectionBackground"]};
    --graph-node: ${t.fn};
    --graph-node-focused: ${t.num};
    --graph-line: ${t.c["sideBar.border"]};`;

const night = themes.find(t => t.key === "night");
const day = themes.find(t => t.key === "day");
const obsidianDir = path.join(__dirname, "obsidian");
fs.mkdirSync(path.join(obsidianDir, "snippets"), { recursive: true });
fs.writeFileSync(path.join(obsidianDir, "theme.css"), `/* Starfall para Obsidian, por ccrccne. Noche en modo oscuro y día en modo claro. */
.theme-dark {${vars(night)}
}

.theme-light {${vars(day)}
}

/* Toques de estrellita */
.markdown-rendered ul > li::marker {
    color: var(--h3-color);
}
.markdown-rendered blockquote {
    border-radius: 0 10px 10px 0;
    background: var(--background-primary-alt);
}
`);
fs.writeFileSync(path.join(obsidianDir, "manifest.json"), JSON.stringify({
    name: "Starfall", version: "1.0.0", minAppVersion: "1.0.0", author: "ccrccne", authorUrl: "https://ccrccne.github.io"
}, null, 4) + "\n");
for (const t of themes.filter(t => !["night", "day"].includes(t.key))) {
    const mode = t.dark ? ".theme-dark" : ".theme-light";
    fs.writeFileSync(path.join(obsidianDir, "snippets", `starfall-${t.key}.css`),
        `/* ${t.name}: actívalo con el tema Starfall en modo ${t.dark ? "oscuro" : "claro"}. */\n${mode} {${vars(t)}\n}\n`);
}
console.log(`${schemes.length} esquemas de terminal, tema de Obsidian y ${themes.length - 2} fragmentos`);
