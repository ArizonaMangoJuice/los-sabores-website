/**
 * sync-videos.mjs
 *
 * Fetches ALL videos from the YouTube channel, saves them locally as content/videos.json.
 * Also runs the recipe parser on any NEW videos that have recipe descriptions.
 *
 * Run this:
 *   - Once after setup to populate the cache
 *   - Periodically (daily/weekly) to pick up new uploads
 *
 * Usage: node scripts/sync-videos.mjs
 */
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: ".env.local" });

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
const API = "https://www.googleapis.com/youtube/v3";
const VIDEOS_FILE = path.join(process.cwd(), "content", "videos.json");
const RECIPES_DIR = path.join(process.cwd(), "content", "recipes");

// ─── Import recipe parser from generate-recipes ──────────────────────────────
// (inline the parsing functions so this script is self-contained)

const CATEGORY_RULES = [
  { category: "sopas", keywords: ["caldo", "sopa", "pozole", "consomé", "birria", "menudo"] },
  { category: "antojitos", keywords: ["taco", "tamales", "tamal", "enchilada", "quesadilla", "gordita", "sope", "elote"] },
  { category: "postres", keywords: ["postre", "pastel", "pan de", "galleta", "flan", "dulce", "capirotada", "arroz con leche", "gelatina"] },
  { category: "bebidas", keywords: ["agua de", "jarabe", "raspado", "atole", "champurrado", "horchata", "jamaica", "limonada", "ponche", "bebida", "jugo"] },
  { category: "carnes", keywords: ["carne", "res", "puerco", "cerdo", "pollo", "gallina", "costilla", "bistec", "cachete", "barbacoa", "carnitas"] },
  { category: "mariscos", keywords: ["camaron", "camarón", "pescado", "mariscos", "ceviche", "aguachile"] },
  { category: "salsas", keywords: ["salsa", "chile", "jalapeño", "jalapeno", "habanero", "chipotle", "mole", "adobo"] },
  { category: "pan", keywords: ["pan ", "tortilla", "cornbread"] },
  { category: "ensaladas", keywords: ["ensalada", "nopal", "quelite", "verdura", "jicama"] },
  { category: "desayunos", keywords: ["huevo", "chilaquil", "desayuno", "hotcake"] },
  { category: "platillo-fuerte", keywords: ["preparar", "receta", "como hacer"] },
];

function detectCategory(title, desc) {
  const text = `${title} ${desc}`.toLowerCase();
  for (const r of CATEGORY_RULES) for (const kw of r.keywords) if (text.includes(kw)) return r.category;
  return "platillo-fuerte";
}

function slugify(t) {
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

function cleanTitle(t) { return t.split(" - ")[0].split(" | ")[0].replace(/[\u{1F000}-\u{1FFFF}]/gu, "").trim(); }
function extractEnglishTitle(t) { const p = t.split(/\s+-\s+|\s+\|\s+/); return p.length > 1 ? p[p.length-1].replace(/[\u{1F000}-\u{1FFFF}]/gu, "").trim() : null; }

function durationToMinutes(iso) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  return m ? (parseInt(m[1]||"0")*60) + parseInt(m[2]||"0") : 30;
}

function parseDescription(desc) {
  if (!desc || desc.trim().length < 50 || !/ingredientes/i.test(desc)) return null;
  const lines = desc.split("\n").map(l => l.trim());
  const groups = []; let current = null; let items = [];
  let prepLines = []; let sugLines = []; let intro = ""; let section = "intro";

  for (const line of lines) {
    if (/^INGREDIENTES?\s*[=.]?\s*(PARA\s+.*)?\.?\s*$/i.test(line) || /^INGREDIENTES?\s*=/i.test(line)) {
      if (items.length) { groups.push({ group: current, items: [...items] }); items = []; }
      const gm = line.match(/(?:PARA|para)\s+(.+?)\.?\s*$/i);
      current = gm ? gm[1].trim() : null;
      section = "ingredients"; continue;
    }
    if (/^PREPARACI[ÓO]N\b/i.test(line)) {
      if (items.length) { groups.push({ group: current, items: [...items] }); items = []; current = null; }
      section = "preparation"; continue;
    }
    if (/^SUGERENCIA/i.test(line)) { section = "suggestion"; continue; }
    if (/^(?:Bon\s+app|Bob\s+ap)/i.test(line) || !line) continue;

    if (section === "intro") { intro += (intro ? " " : "") + line; }
    else if (section === "ingredients") {
      const cl = line.replace(/^[-•*]\s*/, "").trim();
      if (cl.length > 2 && cl.length < 200 && !(cl.length > 100 && /agrega|deja cocinar|revuelve/i.test(cl))) items.push(cl);
      else if (cl.length > 100) { prepLines.push(line); section = "preparation"; }
    }
    else if (section === "preparation") prepLines.push(line);
    else if (section === "suggestion") sugLines.push(line);
  }
  if (items.length) groups.push({ group: current, items });
  if (!groups.length) return null;

  const prepText = prepLines.join(" ").trim();
  const steps = prepText ? prepText.replace(/\.\s+(?=[A-ZÁÉÍÓÚÑ])/g, ".\n").replace(/(?:en seguida|enseguida)\s+/gi, ".\n")
    .split("\n").map(s => s.trim()).filter(s => s.length > 15)
    .map(s => { s = s.replace(/^\./, "").trim(); if (!s.endsWith(".")) s += "."; return s.charAt(0).toUpperCase() + s.slice(1); }) : [];

  return { intro, groups, steps, suggestion: sugLines.join(" ").trim() };
}

function detectTags(title, desc) {
  const text = `${title} ${desc}`.toLowerCase();
  const tags = [];
  const map = { tradicional: ["tradicional","abuela"], facil: ["facil","fácil","sencilla"], economica: ["economica","económica"], picante: ["picante","chile"], casero: ["casero","casera","en casa"] };
  for (const [t,kws] of Object.entries(map)) if (kws.some(k => text.includes(k))) tags.push(t);
  return tags.length ? tags : ["tradicional"];
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("=== Video Sync ===\n");

  // Load existing cache
  let existingVideos = [];
  try { existingVideos = JSON.parse(fs.readFileSync(VIDEOS_FILE, "utf-8")); } catch {}
  const existingIds = new Set(existingVideos.map(v => v.id));
  console.log(`Existing cached videos: ${existingVideos.length}`);

  // Fetch all videos from YouTube
  console.log("Fetching from YouTube API...");
  const allFetched = [];
  let pageToken;

  do {
    const params = new URLSearchParams({
      part: "snippet", channelId: CHANNEL_ID, type: "video", order: "date", maxResults: "50", key: API_KEY,
    });
    if (pageToken) params.set("pageToken", pageToken);
    const res = await fetch(`${API}/search?${params}`);
    const data = await res.json();
    if (!data.items) break;

    const ids = data.items.map(i => i.id.videoId).filter(Boolean);
    if (ids.length) {
      const detRes = await fetch(`${API}/videos?part=snippet,contentDetails,statistics&id=${ids.join(",")}&key=${API_KEY}`);
      const detData = await detRes.json();
      if (detData.items) allFetched.push(...detData.items);
    }
    pageToken = data.nextPageToken;
    process.stdout.write(`  ${allFetched.length} videos...\r`);
  } while (pageToken);

  console.log(`\nFetched ${allFetched.length} videos from YouTube`);

  // Convert to our format
  const videos = allFetched.map(item => ({
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnailUrl: item.snippet.thumbnails?.maxres?.url || item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || "",
    publishedAt: item.snippet.publishedAt,
    channelTitle: item.snippet.channelTitle,
    duration: item.contentDetails.duration,
    viewCount: item.statistics.viewCount || "0",
    likeCount: item.statistics.likeCount || "0",
  }));

  // Find new videos
  const newVideos = videos.filter(v => !existingIds.has(v.id));
  console.log(`New videos since last sync: ${newVideos.length}`);

  // Save full video cache
  fs.writeFileSync(VIDEOS_FILE, JSON.stringify(videos, null, 2), "utf-8");
  console.log(`Saved ${videos.length} videos to content/videos.json`);

  // Generate recipes for new videos
  if (!fs.existsSync(RECIPES_DIR)) fs.mkdirSync(RECIPES_DIR, { recursive: true });
  const existingRecipes = new Set(fs.readdirSync(RECIPES_DIR).filter(f => f.endsWith(".json")).map(f => f.replace(".json", "")));

  let newRecipes = 0;
  const seenDescs = new Set();

  for (const video of videos) {
    if (existingRecipes.has(video.id)) continue; // Already has recipe

    const descHash = video.description?.slice(0, 200) || "";
    if (descHash.length > 50 && seenDescs.has(descHash)) continue;
    if (descHash.length > 50) seenDescs.add(descHash);

    const minutes = durationToMinutes(video.duration);
    if (minutes < 2) continue;

    const parsed = parseDescription(video.description);
    if (!parsed) continue;

    const esTitle = cleanTitle(video.title);
    const enTitle = extractEnglishTitle(video.title) || esTitle;
    const category = detectCategory(video.title, video.description);
    const difficulty = parsed.groups.reduce((s, g) => s + g.items.length, 0) > 15 ? "hard" : parsed.groups.reduce((s, g) => s + g.items.length, 0) > 8 ? "medium" : "easy";
    const prepTime = Math.max(10, Math.round(minutes * 0.3));
    const cookTime = Math.max(10, minutes - prepTime);

    const recipe = {
      videoId: video.id, slug: slugify(esTitle), category,
      tags: detectTags(video.title, video.description), featured: false,
      difficulty, prepTime, cookTime, servings: 6,
      es: { title: esTitle, description: parsed.intro || `Deliciosa receta de ${esTitle.toLowerCase()}.`,
        ingredients: parsed.groups, steps: parsed.steps.length ? parsed.steps : ["Sigue las instrucciones del video."],
        ...(parsed.suggestion ? { tips: [parsed.suggestion] } : {}) },
      en: { title: enTitle, description: parsed.intro || `Delicious ${enTitle.toLowerCase()} recipe.`,
        ingredients: parsed.groups, steps: parsed.steps.length ? parsed.steps : ["Follow the instructions in the video."],
        ...(parsed.suggestion ? { tips: [parsed.suggestion] } : {}) },
    };

    fs.writeFileSync(path.join(RECIPES_DIR, `${video.id}.json`), JSON.stringify(recipe, null, 2), "utf-8");
    console.log(`  NEW RECIPE: ${esTitle}`);
    newRecipes++;
  }

  console.log(`\n=== Done ===`);
  console.log(`  Videos cached: ${videos.length}`);
  console.log(`  New recipes generated: ${newRecipes}`);
  console.log(`  Total recipes: ${fs.readdirSync(RECIPES_DIR).filter(f => f.endsWith(".json")).length}`);
}

main().catch(console.error);
