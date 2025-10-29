const fs = require("fs");
const path = require("path");

const argv = process.argv.slice(2);
const argMap = {};
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith("--")) {
    const k = a.slice(2);
    const v = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
    argMap[k] = v;
  }
}

// Default input folder: mobile/data/wiktextract relative to this script file
const defaultInput = path.resolve(__dirname, "..", "data", "wiktextract");
const inputDir = path.resolve(process.cwd(), argMap.input || defaultInput);
const outputDir = path.resolve(
  process.cwd(),
  argMap.output || path.join("assets", "dictionaries", "bilingual")
);
const limit = Number(argMap.limit || 600);

const LANG_MAP = {
  en: ["en", "eng", "english", "inglês", "ingles"],
  es: ["es", "spa", "spanish", "español", "espanol"],
  pt: [
    "pt",
    "por",
    "portuguese",
    "português",
    "portugues",
    "brazilian portuguese",
    "portuguese (brazilian)",
    "pt-br",
    "ptbr",
  ],
};

function mapLang(val) {
  if (!val) return null;
  const s = String(val).toLowerCase();
  for (const [code, arr] of Object.entries(LANG_MAP)) {
    if (arr.includes(s)) return code;
  }
  return null;
}

function readFilesRecursive(dir) {
  const entries = [];
  if (!fs.existsSync(dir)) return entries;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const p = path.join(dir, item);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) entries.push(...readFilesRecursive(p));
    else entries.push(p);
  }
  return entries;
}

function tryParseJson(file) {
  try {
    const raw = fs.readFileSync(file, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function collectTranslationsFromEntry(entry) {
  const head =
    entry.word || entry.title || entry.headword || entry.head || null;
  const src = mapLang(entry.lang_code || entry.lang);
  if (!head || !src) return null;
  const translations = {};
  if (Array.isArray(entry.translations)) {
    for (const t of entry.translations) {
      if (!t) continue;
      const tLang = mapLang(t.lang_code || t.code || t.lang);
      const tWord = t.word || t.title || t.text || t.gloss;
      if (!tLang || !tWord) continue;
      if (!["en", "es", "pt"].includes(tLang)) continue;
      translations[tLang] = translations[tLang] || [];
      translations[tLang].push(String(tWord));
    }
  }
  if (entry.senses && Array.isArray(entry.senses)) {
    for (const s of entry.senses) {
      const arr = s.translations || s.translation || [];
      if (Array.isArray(arr)) {
        for (const t of arr) {
          if (!t) continue;
          const tLang = mapLang(t.lang_code || t.lang);
          const tWord = t.word || t.title || t.text || t.gloss;
          if (!tLang || !tWord) continue;
          if (!["en", "es", "pt"].includes(tLang)) continue;
          translations[tLang] = translations[tLang] || [];
          translations[tLang].push(String(tWord));
        }
      }
    }
  }
  const keys = Object.keys(translations);
  if (keys.length === 0) return null;
  return { head: String(head), source: src, translations };
}

function extractFromParsed(parsed, filename) {
  const results = [];
  if (!parsed) return results;
  if (Array.isArray(parsed)) {
    for (const entry of parsed) {
      if (!entry || typeof entry !== "object") continue;
      const item = collectTranslationsFromEntry(entry);
      if (item) results.push(item);
    }
    return results;
  }
  if (parsed && typeof parsed === "object") {
    const maybeEntries = Object.entries(parsed);
    let looksLikeMap =
      maybeEntries.length > 0 && typeof maybeEntries[0][1] !== "object";
    if (looksLikeMap) {
      for (const [k, v] of maybeEntries) {
        if (Array.isArray(v) && v.every((x) => typeof x === "string")) {
          results.push({
            head: String(k),
            source: null,
            translations: { unknown: v.map(String) },
          });
        }
      }
      return results;
    }
    for (const [k, v] of maybeEntries) {
      if (!v || typeof v !== "object") continue;
      const entry = Object.assign({}, v, { title: v.title || k });
      const item = collectTranslationsFromEntry(entry);
      if (item) results.push(item);
    }
  }
  return results;
}

function assignLevel(word, frequency) {
  const w = String(word || "");
  const len = w.length;
  if (typeof frequency === "number") {
    if (frequency > 1000) return "basic";
    if (frequency > 200) return "intermediate";
    return "advanced";
  }
  if (len <= 4) return "basic";
  if (len <= 7) return "intermediate";
  return "advanced";
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function createWordMap() {
  return Object.create(null);
}

function isSafeKey(k) {
  if (!k) return false;
  const s = String(k);
  return !["__proto__", "prototype", "constructor"].includes(s);
}

// Utility: inspect levels of a given dictionary file (new format)
function inspectLevels(filePath) {
  try {
    const p = path.resolve(process.cwd(), filePath);
    const json = JSON.parse(fs.readFileSync(p, "utf8"));
    const levels = { basic: 0, intermediate: 0, advanced: 0 };
    for (const [w, e] of Object.entries(json.words || {})) {
      if (e && e.level) levels[e.level] = (levels[e.level] || 0) + 1;
    }
    console.log({
      file: path.basename(p),
      metadataLevels: json.metadata && json.metadata.levels,
      counted: levels,
    });
  } catch (e) {
    console.error(`[inspect] Failed to read ${filePath}:`, e.message);
    process.exitCode = 1;
  }
}

// Utility: check translations for a word from an existing nested dictionary
function checkWord(word, src, tgt) {
  try {
    const file = path.join(outputDir, src, `${tgt}.json`);
    if (!fs.existsSync(file)) {
      console.error(`[check] Dictionary not found: ${file}`);
      process.exitCode = 1;
      return;
    }
    const dict = JSON.parse(fs.readFileSync(file, "utf8"));
    const entry = (dict.words || {})[word];
    const translations = Array.isArray(entry)
      ? entry
      : (entry && entry.translations) || null;
    console.log(translations);
  } catch (e) {
    console.error(`[check] Error:`, e.message);
    process.exitCode = 1;
  }
}

function readJsonlStream(file, onItem, options = {}) {
  const { maxLines = Infinity, logEvery = 100000 } = options;
  return new Promise((resolve) => {
    const stream = fs.createReadStream(file, { encoding: "utf8" });
    let buf = "";
    let lines = 0;
    stream.on("data", (chunk) => {
      buf += chunk;
      let idx;
      while ((idx = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, idx);
        buf = buf.slice(idx + 1);
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const obj = JSON.parse(trimmed);
          onItem(obj);
        } catch {}
        lines++;
        if (lines % logEvery === 0) {
          console.log(
            `[wiktextract] processed ${lines.toLocaleString()} lines from ${path.basename(
              file
            )}`
          );
        }
        if (lines >= maxLines) {
          stream.close();
          break;
        }
      }
    });
    stream.on("end", () => {
      const trimmed = buf.trim();
      if (trimmed) {
        try {
          const obj = JSON.parse(trimmed);
          onItem(obj);
        } catch {}
      }
      resolve();
    });
  });
}

async function build() {
  ensureDir(outputDir);
  const files = readFilesRecursive(inputDir).filter(
    (f) => f.endsWith(".json") || f.endsWith(".jsonl")
  );
  const pairs = createWordMap();
  for (const file of files) {
    if (file.endsWith(".jsonl")) {
      const maxLines = argMap.maxLines ? Number(argMap.maxLines) : Infinity;
      const logEvery = argMap.logEvery ? Number(argMap.logEvery) : 100000;
      await readJsonlStream(
        file,
        (obj) => {
          const it = collectTranslationsFromEntry(obj);
          if (!it) return;
          const head = it.head;
          const src = it.source;
          if (!["en", "es", "pt"].includes(src)) return;
          for (const tc of Object.keys(it.translations)) {
            const target = tc;
            if (!["en", "es", "pt"].includes(target)) continue;
            if (src === target) continue;
            const key = `${src}-${target}`;
            if (!pairs[key]) pairs[key] = createWordMap();
            const map = pairs[key];
            const translations = (it.translations[target] || [])
              .map(String)
              .map((t) => t.trim())
              .filter(Boolean);
            if (translations.length === 0) continue;
            if (!isSafeKey(head)) continue;
            if (!map[head]) map[head] = { translations: new Set(), count: 0 };
            translations.forEach((t) => map[head].translations.add(t));
            map[head].count += translations.length;
          }
        },
        { maxLines, logEvery }
      );
      continue;
    }
    const parsed = tryParseJson(file);
    if (!parsed) continue;
    const items = extractFromParsed(parsed, file);
    for (const it of items) {
      const head = it.head;
      const src =
        it.source || detectLanguageFromFileOrEntry(file, it) || "unknown";
      for (const target of Object.keys(it.translations)) {
        const tc = target;
        const s = src;
        if (!["en", "es", "pt"].includes(tc)) continue;
        if (!["en", "es", "pt"].includes(s)) continue;
        if (s === tc) continue;
        const key = `${s}-${tc}`;
        if (!pairs[key]) pairs[key] = createWordMap();
        const map = pairs[key];
        const translations = (it.translations[tc] || [])
          .map(String)
          .map((t) => t.trim())
          .filter(Boolean);
        if (translations.length === 0) continue;
        if (!isSafeKey(head)) continue;
        if (!map[head]) map[head] = { translations: new Set(), count: 0 };
        translations.forEach((t) => map[head].translations.add(t));
        map[head].count += translations.length;
      }
    }
  }

  function detectLanguageFromFileOrEntry(file, entry) {
    const name = path.basename(file).toLowerCase();
    if (name.includes(".en") || name.startsWith("en") || name.includes("_en"))
      return "en";
    if (name.includes(".es") || name.startsWith("es") || name.includes("_es"))
      return "es";
    if (name.includes(".pt") || name.startsWith("pt") || name.includes("_pt"))
      return "pt";
    if (entry && entry.translations) {
      const codes = Object.keys(entry.translations || {});
      if (
        codes.includes("en") &&
        !codes.includes("pt") &&
        !codes.includes("es")
      )
        return "en";
      if (
        codes.includes("es") &&
        !codes.includes("pt") &&
        !codes.includes("en")
      )
        return "es";
      if (
        codes.includes("pt") &&
        !codes.includes("es") &&
        !codes.includes("en")
      )
        return "pt";
    }
    return "unknown";
  }

  const pairEntries = Object.entries(pairs);
  for (const [key, map] of pairEntries) {
    const [src, tgt] = key.split("-");
    const reverseKey = `${tgt}-${src}`;
    if (!pairs[reverseKey]) pairs[reverseKey] = createWordMap();
    for (const [w, v] of Object.entries(map)) {
      const translations = Array.from(v.translations || []);
      for (const t of translations) {
        if (!isSafeKey(t)) continue;
        if (!pairs[reverseKey][t])
          pairs[reverseKey][t] = { translations: new Set(), count: 0 };
        pairs[reverseKey][t].translations.add(w);
        pairs[reverseKey][t].count += 1;
      }
    }
  }
  const expectedKeys = ["en-pt", "en-es", "pt-en", "pt-es", "es-en", "es-pt"];
  for (const k of expectedKeys) {
    if (!pairs[k]) pairs[k] = createWordMap();
  }

  // Compose cross-language pairs via English pivot to enrich es-pt and pt-es
  function composeViaPivot(from, via, to) {
    const k1 = `${from}-${via}`; // e.g., es-en
    const k2 = `${via}-${to}`; // e.g., en-pt
    const kd = `${from}-${to}`; // e.g., es-pt
    const map1 = pairs[k1] || {};
    const map2 = pairs[k2] || {};
    if (!pairs[kd]) pairs[kd] = createWordMap();
    const dst = pairs[kd];
    for (const [w, v] of Object.entries(map1)) {
      const mids = Array.from(v.translations || []);
      if (!dst[w]) dst[w] = { translations: new Set(), count: 0 };
      const outSet = dst[w].translations;
      for (const m of mids) {
        if (!isSafeKey(m)) continue;
        const hit = map2[m];
        if (!hit) continue;
        for (const t of Array.from(hit.translations || [])) {
          if (!isSafeKey(t)) continue;
          outSet.add(t);
        }
      }
      dst[w].count = outSet.size;
      if (dst[w].count === 0) delete dst[w];
    }
  }

  // Always attempt enrichment; natural pairs will still dominate in ranking
  composeViaPivot("es", "en", "pt");
  composeViaPivot("pt", "en", "es");

  // Fallback enrichment from existing assets if composed pairs are still sparse
  function mergeFromExistingAssets(src, tgt) {
    const key = `${src}-${tgt}`;
    const nestedPath = path.join(outputDir, src, `${tgt}.json`);
    const flatPath = path.join(outputDir, `${src}-${tgt}.json`);
    const candidate = fs.existsSync(nestedPath)
      ? nestedPath
      : fs.existsSync(flatPath)
      ? flatPath
      : null;
    if (!candidate) return;
    try {
      const data = JSON.parse(fs.readFileSync(candidate, "utf8"));
      const words = data.words || {};
      if (!pairs[key]) pairs[key] = createWordMap();
      const map = pairs[key];
      for (const [w, entry] of Object.entries(words)) {
        const translations = Array.isArray(entry)
          ? entry
          : (entry && entry.translations) || [];
        if (!isSafeKey(w) || translations.length === 0) continue;
        if (!map[w]) map[w] = { translations: new Set(), count: 0 };
        translations.forEach((t) => map[w].translations.add(String(t)));
        map[w].count = map[w].translations ? map[w].translations.size : 0;
      }
    } catch {}
  }

  const esPtSize = Object.keys(pairs["es-pt"] || {}).length;
  const ptEsSize = Object.keys(pairs["pt-es"] || {}).length;
  if (esPtSize < 100) mergeFromExistingAssets("es", "pt");
  if (ptEsSize < 100) mergeFromExistingAssets("pt", "es");

  for (const [key, map] of Object.entries(pairs)) {
    const arr = Object.entries(map).map(([w, v]) => ({
      word: w,
      translations: Array.from(v.translations),
      count: v.count,
    }));
    arr.sort(
      (a, b) => (b.count || 0) - (a.count || 0) || a.word.length - b.word.length
    );
    const limited = arr.slice(0, limit);
    const wordsObj = {};

    const counts = limited.map((x) => x.count || 0);
    const lens = limited.map((x) => x.word.length);
    const minC = Math.min(...counts, 0);
    const maxC = Math.max(...counts, 1);
    const minL = Math.min(...lens, 1);
    const maxL = Math.max(...lens, 2);
    function norm(v, min, max) {
      return max === min ? 0 : (v - min) / (max - min);
    }
    const combined = limited.map((x) => {
      const c = norm(x.count || 0, minC, maxC);
      const l = norm(x.word.length, minL, maxL);
      return { word: x.word, score: 0.6 * c + 0.4 * (1 - l) };
    });
    const scoresSorted = [...combined]
      .map((x) => x.score)
      .sort((a, b) => a - b);
    const q = (p) =>
      scoresSorted[
        Math.min(
          scoresSorted.length - 1,
          Math.max(0, Math.floor(p * scoresSorted.length))
        )
      ];
    const t33 = q(0.33);
    const t66 = q(0.66);
    let lvlCounts = { basic: 0, intermediate: 0, advanced: 0 };
    const scoreByWord = combined.reduce((acc, cur) => {
      acc[cur.word] = cur.score;
      return acc;
    }, {});

    for (const item of limited) {
      const s = scoreByWord[item.word] ?? 0;
      let level;
      if (s >= t66) level = "basic";
      else if (s >= t33) level = "intermediate";
      else level = "advanced";
      lvlCounts[level]++;
      wordsObj[item.word] = {
        translations: item.translations.slice(0, 5),
        level,
      };
    }

    const src = key.split("-")[0];
    const tgt = key.split("-")[1];
    const metadata = {
      source: src,
      target: tgt,
      words: Object.keys(wordsObj).length,
      level: "mixed",
      version: "1.0",
      generatedAt: new Date().toISOString(),
      source_data: inputDir,
      levels: lvlCounts,
    };
    const out = { metadata, words: wordsObj };
    const outDir = path.join(outputDir, src);
    ensureDir(outDir);
    const outFile = path.join(outDir, `${tgt}.json`);
    fs.writeFileSync(outFile, JSON.stringify(out, null, 2), "utf8");
    console.log(
      `[wiktextract] wrote ${metadata.words} words to ${path.relative(
        process.cwd(),
        outFile
      )}`
    );
  }
}

// Entry point: allow utility modes or full build
(async function main() {
  if (argMap.inspect) {
    inspectLevels(String(argMap.inspect));
    return;
  }
  if (argMap.checkWord && argMap.src && argMap.tgt) {
    checkWord(String(argMap.checkWord), String(argMap.src), String(argMap.tgt));
    return;
  }
  await build();
})();
