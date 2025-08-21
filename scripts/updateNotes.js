// scripts/updateNotes.js
// Run: npm run update-notes
// Requires: "type": "module" in package.json (since we use ESM imports)

import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const PAGES = path.join(SRC, 'pages');
const COMPONENTS = path.join(SRC, 'components');
const CONTEXT = path.join(SRC, 'context');
const PUBLIC = path.join(ROOT, 'public');
const APP_FILE = path.join(SRC, 'App.tsx');
const TAILWIND_FILE_JS = path.join(ROOT, 'tailwind.config.js');
const TAILWIND_FILE_TS = path.join(ROOT, 'tailwind.config.ts');
const ROADMAP = path.join(ROOT, 'projectRoadmap.json');
const NOTES = path.join(ROOT, 'PROJECT_NOTES.md');

const timestamp = new Date().toLocaleString();

// -----------------------------
// Helpers
// -----------------------------
const safeRead = (p) => {
  try {
    return fs.readFileSync(p, 'utf-8');
  } catch {
    return '';
  }
};

const listFiles = (dir, exts = null) => {
  try {
    const all = fs.readdirSync(dir, { withFileTypes: true });
    return all
      .filter((d) => d.isFile())
      .map((d) => d.name)
      .filter((name) => !exts || exts.some((e) => name.toLowerCase().endsWith(e)));
  } catch {
    return [];
  }
};

const walk = (dir) => {
  let results = [];
  try {
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of list) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results = results.concat(walk(p));
      } else {
        results.push(p);
      }
    }
  } catch {
    // ignore
  }
  return results;
};

const codeBlock = (lang, content) => `\`\`\`${lang}\n${content}\n\`\`\``;

// -----------------------------
// 1) Pages status
// -----------------------------
const pageNames = [
  'Home',
  'IntervalTraining',
  'ThresholdTraining',
  'RoadRun',
  'JustRun',
  'Settings',
];
const pageStatus = Object.fromEntries(
  pageNames.map((name) => [name, fs.existsSync(path.join(PAGES, `${name}.tsx`)) ? '✅' : '❌'])
);

// -----------------------------
// 2) Components inventory
// -----------------------------
const componentFiles = listFiles(COMPONENTS).concat(
  listFiles(path.join(COMPONENTS, 'icons')).map((f) => `icons/${f}`)
);

// -----------------------------
// 3) Routes from App.tsx
// -----------------------------
const appSource = safeRead(APP_FILE);
const routeRegex =
  /<Route\s+path=["'`]([^"'`]+)["'`]\s+element=\{<([A-Za-z0-9_$.]+)\s*\/?>\}\s*\/?>/g;
let routes = [];
if (appSource) {
  let m;
  while ((m = routeRegex.exec(appSource)) !== null) {
    routes.push({ path: m[1], element: m[2] });
  }
}
if (routes.length === 0 && appSource) {
  // more tolerant: also catch <Route element={<X />} path="/y" />
  const routeRegexAlt =
    /<Route[^>]*\bpath=["'`]([^"'`]+)["'`][^>]*\belement=\{<\s*([A-Za-z0-9_$.]+)[^>]*>\s*\}\s*\/?>/g;
  let m2;
  while ((m2 = routeRegexAlt.exec(appSource)) !== null) {
    routes.push({ path: m2[1], element: m2[2] });
  }
}

// -----------------------------
// 4) Tailwind config parsing (shallow, no execution)
// -----------------------------
const twConfigSrc = safeRead(fs.existsSync(TAILWIND_FILE_TS) ? TAILWIND_FILE_TS : TAILWIND_FILE_JS);
const extractObject = (label) => {
  // tries to find `${label}:\s*{ ... }` with balanced braces (basic)
  const idx = twConfigSrc.indexOf(`${label}:`);
  if (idx === -1) return null;

  // Find first { after label
  let i = twConfigSrc.indexOf('{', idx);
  if (i === -1) return null;

  let depth = 0;
  let start = i;
  for (; i < twConfigSrc.length; i++) {
    if (twConfigSrc[i] === '{') depth++;
    else if (twConfigSrc[i] === '}') {
      depth--;
      if (depth === 0) {
        const end = i;
        return twConfigSrc.slice(start, end + 1);
      }
    }
  }
  return null;
};

const extendObj = extractObject('extend') || '';
// Grab colors/fonts/screens inside extend
const matchInner = (objSrc, key) => {
  if (!objSrc) return null;
  const idx = objSrc.indexOf(`${key}:`);
  if (idx === -1) return null;
  // find { after key
  let i = objSrc.indexOf('{', idx);
  if (i === -1) return null;
  let depth = 0;
  let start = i;
  for (; i < objSrc.length; i++) {
    if (objSrc[i] === '{') depth++;
    else if (objSrc[i] === '}') {
      depth--;
      if (depth === 0) {
        const end = i;
        return objSrc.slice(start, end + 1);
      }
    }
  }
  return null;
};

const colorsSrc = matchInner(extendObj, 'colors');
const fontsSrc = matchInner(extendObj, 'fontFamily');
const screensSrc = matchInner(extendObj, 'screens');

const summarizeObjKeys = (src) => {
  if (!src) return [];
  // naive key capture: keys like foo: or "foo":
  const keys = new Set();
  const re = /(?:["'`]?)([A-Za-z0-9_-]+)(?:["'`]?)\s*:/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    keys.add(m[1]);
  }
  return Array.from(keys);
};

const tailwindSummary = {
  colors: summarizeObjKeys(colorsSrc),
  fonts: summarizeObjKeys(fontsSrc),
  screens: summarizeObjKeys(screensSrc),
};

// -----------------------------
// 5) Context inventory (value keys)
// -----------------------------
const contextFiles = listFiles(CONTEXT, ['.tsx']);
const contextInfo = contextFiles.map((file) => {
  const src = safeRead(path.join(CONTEXT, file));
  // Try to extract keys from object passed to useMemo for "value"
  // e.g. const value = useMemo(() => ({ a, b: fn, c }), [deps])
  const valueBlockMatch = src.match(
    /const\s+value\s*=\s*useMemo\([\s\S]*?\(\s*{\s*([\s\S]*?)\s*}\s*\)\s*,/
  );
  let keys = [];
  if (valueBlockMatch && valueBlockMatch[1]) {
    // split by commas at top-level (basic)
    const raw = valueBlockMatch[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    keys = raw
      .map((s) => s.split(':')[0].trim()) // before colon is key
      .map((s) => s.replace(/\s+/g, ' '))
      .filter((k) => /^[A-Za-z0-9_$]+$/.test(k));
  }
  return { file, keys };
});

// -----------------------------
// 6) Public assets
// -----------------------------
const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif'];
const publicFiles = listFiles(PUBLIC)
  .concat(
    // also include nested images one level deep
    fs.existsSync(PUBLIC)
      ? fs
          .readdirSync(PUBLIC, { withFileTypes: true })
          .filter((d) => d.isDirectory())
          .flatMap((d) => listFiles(path.join(PUBLIC, d.name)))
      : []
  )
  .filter((f) => imageExts.some((e) => f.toLowerCase().endsWith(e)));

// -----------------------------
// 7) Recent changes (src)
// -----------------------------
const srcFiles = walk(SRC).filter(
  (p) => p.endsWith('.ts') || p.endsWith('.tsx') || p.endsWith('.css')
);
const recent = srcFiles
  .map((p) => ({ p, mtime: fs.statSync(p).mtimeMs }))
  .sort((a, b) => b.mtime - a.mtime)
  .slice(0, 5)
  .map(({ p, mtime }) => `${path.relative(ROOT, p)} — ${new Date(mtime).toLocaleString()}`);

// -----------------------------
// 8) TODO scanner
// -----------------------------
const allCode = srcFiles.map((p) => ({ p, src: safeRead(p) }));
const todos = allCode.flatMap(({ p, src }) => {
  const lines = src.split('\n');
  const items = [];
  lines.forEach((line, i) => {
    const idx = line.indexOf('TODO:');
    if (idx !== -1) {
      items.push(`${path.relative(ROOT, p)}:${i + 1} — ${line.trim()}`);
    }
  });
  return items;
});

// -----------------------------
// 9) Roadmap
// -----------------------------
let nextSteps = [];
try {
  const roadmap = JSON.parse(safeRead(ROADMAP) || '{}');
  nextSteps = roadmap.nextSteps || [];
} catch {
  nextSteps = [];
}

// -----------------------------
// 10) Build Markdown
// -----------------------------
const md = `# 🏃‍♂️ Treadmill Dashboard Project — Developer Notes

_Last updated: **${timestamp}**_

## 📌 Project Summary
We are building a **React + TypeScript + Tailwind CSS** web app to display live metrics from a **Woodway treadmill** and **Garmin HRM Pro**, inspired by **Woodway consoles, Zwift, and Peloton**.

---

## ✅ Pages Status
${pageNames.map((n) => `- ${pageStatus[n]} ${n}`).join('\n')}

---

## 🗺️ Active Routes (from \`src/App.tsx\`)
${
  routes.length
    ? routes.map((r) => `- \`${r.path}\` → \`${r.element}\``).join('\n')
    : '_No <Route> entries detected_'
}
${routes.length ? '\n' : ''}

---

## 🧩 Components
${componentFiles.length ? componentFiles.map((c) => `- ${c}`).join('\n') : '_No components found_'}

---

## 🧠 Context Inventory
${
  contextInfo.length
    ? contextInfo
        .map(
          (c) =>
            `- ${c.file}${
              c.keys.length ? ` → exports: ${c.keys.map((k) => `\`${k}\``).join(', ')}` : ''
            }`
        )
        .join('\n')
    : '_No context files found_'
}

---

## 🎨 Tailwind Config (summary)
${
  tailwindSummary.colors.length
    ? `**Colors:** ${tailwindSummary.colors.map((k) => `\`${k}\``).join(', ')}`
    : '_No custom colors detected_'
}
${
  tailwindSummary.fonts.length
    ? `\n\n**Fonts:** ${tailwindSummary.fonts.map((k) => `\`${k}\``).join(', ')}`
    : ''
}
${
  tailwindSummary.screens.length
    ? `\n\n**Screens:** ${tailwindSummary.screens.map((k) => `\`${k}\``).join(', ')}`
    : ''
}

---

## 🖼️ Public Assets (images)
${publicFiles.length ? publicFiles.map((f) => `- ${f}`).join('\n') : '_No image assets found_'}

---

## 📝 Recent Changes (last 5 in /src)
${recent.length ? recent.map((r) => `- ${r}`).join('\n') : '_No source files found_'}

---

## 🔧 TODOs Found in Code
${todos.length ? todos.map((t) => `- ${t}`).join('\n') : '_No TODO comments found_'}

---

## 📅 Next Planned Steps
${nextSteps.length ? nextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n') : '_No steps listed_'}

---

## 🛠 Development Flow
1. Edit \`.tsx\` page/component
2. Save — Vite hot reload refreshes instantly
3. Use \`connectMock()\` for UI pairing testing
4. Replace mock pairing with backend WebSocket integration
`;

fs.writeFileSync(NOTES, md, 'utf-8');
console.log(`✅ PROJECT_NOTES.md updated dynamically at ${timestamp}`);
