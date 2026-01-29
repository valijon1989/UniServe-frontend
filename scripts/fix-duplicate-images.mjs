import fs from "fs";
import path from "path";
import crypto from "crypto";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const STATE_PATH = "/tmp/pexels-duplicate-fix-state.json";
const ENV_PATH = path.join(ROOT, ".env.local");

const exts = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const readEnvKey = () => {
  if (!fs.existsSync(ENV_PATH)) return null;
  const content = fs.readFileSync(ENV_PATH, "utf8");
  const match = content.match(/^PEXELS_API_KEY\s*=\s*(.+)\s*$/m);
  if (!match) return null;
  return match[1].trim();
};

const walk = (dir, out = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (exts.has(path.extname(entry.name).toLowerCase())) {
      out.push(full);
    }
  }
  return out;
};

const hashBuffer = (buf) => crypto.createHash("sha1").update(buf).digest("hex");

const hashFile = (filePath) => hashBuffer(fs.readFileSync(filePath));

const loadState = () => {
  if (!fs.existsSync(STATE_PATH)) {
    return { done: {}, usedPhotoIds: [] };
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(STATE_PATH, "utf8"));
    return {
      done: parsed.done || {},
      usedPhotoIds: parsed.usedPhotoIds || []
    };
  } catch {
    return { done: {}, usedPhotoIds: [] };
  }
};

const saveState = (state) => {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
};

const normalizeWords = (text) =>
  text
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const loadSportTypeMap = () => {
  const sportMap = new Map();
  const sportPath = "/tmp/sport-services.json";
  if (!fs.existsSync(sportPath)) return sportMap;
  try {
    const data = JSON.parse(fs.readFileSync(sportPath, "utf8"));
    for (const item of data) {
      if (item?.id && item?.sportType) {
        sportMap.set(item.id, item.sportType);
      }
    }
  } catch {
    return sportMap;
  }
  return sportMap;
};

const inferQuery = (filePath, sportMap) => {
  const rel = filePath.replace(PUBLIC_DIR, "");
  const lower = rel.toLowerCase();
  if (lower.includes("/services/psychology/")) return "psychology therapy counseling";
  if (lower.includes("/services/legal/")) return "lawyer legal consultation";
  if (lower.includes("/services/translation/")) return "translator documents office";
  if (lower.includes("/services/consulting/")) return "business consulting meeting";
  if (lower.includes("/services/sport/")) {
    const name = path.basename(filePath, path.extname(filePath));
    if (name.startsWith("sport-")) {
      const sportType = sportMap.get(name);
      if (sportType) return `${sportType} training`;
    }
    return "fitness training";
  }
  if (lower.includes("/services/technical/")) return "technician repair tools";
  if (lower.includes("/services/taxi/")) return "taxi cab driver";
  if (lower.includes("/services/education/")) return "teacher classroom";
  if (lower.includes("/services/medical/")) return "doctor clinic";
  if (lower.includes("/services/beauty/")) return "beauty salon";
  if (lower.includes("/services/catering/")) return "catering food";
  if (lower.includes("/services/construction/")) return "construction worker site";
  if (lower.includes("/services/marketing/")) return "digital marketing team";
  if (lower.includes("/services/design/")) return "graphic design studio";
  if (lower.includes("/services/it/")) return "software developer laptop";
  if (lower.includes("/services/nanny/")) return "nanny babysitter";
  if (lower.includes("/services/cleaning/")) return "cleaning service";
  if (lower.includes("/services/real")) return "real estate interior";
  if (lower.includes("/avatars/")) return "portrait person";
  if (lower.includes("/images/remote/")) return "lifestyle people";
  if (lower.includes("/static/posts/")) {
    const name = normalizeWords(path.basename(filePath));
    return name.length ? name : "lifestyle";
  }
  if (lower.includes("header-bg") || lower.includes("footer-bg") || lower.includes("background")) {
    return "abstract gradient background";
  }
  const name = normalizeWords(path.basename(filePath));
  return name.length ? name : "lifestyle";
};

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const fetchJson = async (url, key) => {
  const res = await fetch(url, { headers: { Authorization: key } });
  if (!res.ok) {
    throw new Error(`Pexels error: ${res.status}`);
  }
  return res.json();
};

const downloadBuffer = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Download failed: ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

const pickUniquePhoto = async ({ query, key, usedHashes, usedPhotoIds }) => {
  const encoded = encodeURIComponent(query);
  for (let page = 1; page <= 3; page += 1) {
    const data = await fetchJson(
      `https://api.pexels.com/v1/search?query=${encoded}&per_page=80&page=${page}`,
      key
    );
    const photos = shuffle(data?.photos || []);
    for (const photo of photos) {
      if (!photo?.src?.large) continue;
      if (usedPhotoIds.has(photo.id)) continue;
      const buffer = await downloadBuffer(photo.src.large);
      const hash = hashBuffer(buffer);
      if (usedHashes.has(hash)) continue;
      return { buffer, hash, photoId: photo.id };
    }
  }
  return null;
};

const main = async () => {
  const apiKey = readEnvKey();
  if (!apiKey) {
    console.error("PEXELS_API_KEY not found in .env.local");
    process.exit(1);
  }

  const sportMap = loadSportTypeMap();
  const state = loadState();
  const usedPhotoIds = new Set(state.usedPhotoIds || []);

  const files = walk(PUBLIC_DIR);
  const hashGroups = new Map();
  for (const file of files) {
    const hash = hashFile(file);
    if (!hashGroups.has(hash)) hashGroups.set(hash, []);
    hashGroups.get(hash).push(file);
  }

  const usedHashes = new Set(hashGroups.keys());
  const duplicateGroups = [...hashGroups.values()].filter((group) => group.length > 1);
  const toReplace = [];

  for (const group of duplicateGroups) {
    const sorted = [...group].sort();
    const [, ...rest] = sorted;
    toReplace.push(...rest);
  }

  console.log(`Duplicate images to replace: ${toReplace.length}`);

  let replaced = 0;
  for (const target of toReplace) {
    const status = state.done?.[target];
    if (status === "ok" || status === "skipped") continue;
    const query = inferQuery(target, sportMap);
    try {
      const result = await pickUniquePhoto({
        query,
        key: apiKey,
        usedHashes,
        usedPhotoIds
      });
      if (!result) {
        console.warn(`No unique photo found for ${target} (${query})`);
        state.done[target] = "skipped";
        saveState(state);
        continue;
      }
      fs.writeFileSync(target, result.buffer);
      usedHashes.add(result.hash);
      usedPhotoIds.add(result.photoId);
      state.done[target] = "ok";
      state.usedPhotoIds = [...usedPhotoIds];
      saveState(state);
      replaced += 1;
      console.log(`Replaced ${replaced}/${toReplace.length}: ${target}`);
      await sleep(350);
    } catch (error) {
      console.warn(`Failed ${target}: ${error.message}`);
      state.done[target] = `error:${error.message}`;
      saveState(state);
      await sleep(350);
    }
  }

  console.log("Done.");
};

main();
