import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: ".env.local" });

const API_KEY = process.env.YOUTUBE_API_KEY;
const HANDLE = process.env.YOUTUBE_CHANNEL_HANDLE;
const API = "https://www.googleapis.com/youtube/v3";
const RECIPES_DIR = path.join(process.cwd(), "content", "recipes");

// ─── Category detection based on title/ingredient keywords ──────────────────
const CATEGORY_RULES = [
  { category: "sopas", keywords: ["caldo", "sopa", "pozole", "consomé", "consomme", "birria", "menudo"] },
  { category: "antojitos", keywords: ["taco", "tamales", "tamal", "enchilada", "quesadilla", "gordita", "sope", "tostada", "empanada", "elote"] },
  { category: "postres", keywords: ["postre", "pastel", "pan de", "galleta", "flan", "dulce", "capirotada", "arroz con leche", "gelatina", "pay", "pie", "cake", "cornbread"] },
  { category: "bebidas", keywords: ["agua de", "jarabe", "raspado", "atole", "champurrado", "horchata", "jamaica", "limonada", "ponche", "bebida", "jugo"] },
  { category: "carnes", keywords: ["carne", "res", "puerco", "cerdo", "pollo", "gallina", "costilla", "bistec", "cachete", "barbacoa", "carnitas", "chicharron", "chorizo"] },
  { category: "mariscos", keywords: ["camaron", "camarón", "pescado", "mariscos", "ceviche", "aguachile", "atun"] },
  { category: "salsas", keywords: ["salsa", "chile", "jalapeño", "jalapeno", "habanero", "chipotle", "guacamole", "mole", "adobo"] },
  { category: "pan", keywords: ["pan ", "pan de", "tortilla", "bread", "cornbread"] },
  { category: "ensaladas", keywords: ["ensalada", "nopal", "quelite", "verdura", "jicama"] },
  { category: "desayunos", keywords: ["huevo", "chilaquil", "desayuno", "hotcake", "breakfast"] },
  { category: "platillo-fuerte", keywords: ["preparar", "receta", "como hacer"] },
];

function detectCategory(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    for (const kw of rule.keywords) {
      if (text.includes(kw)) return rule.category;
    }
  }
  return "platillo-fuerte";
}

// ─── Difficulty guess based on ingredient count and prep complexity ──────────
function guessDifficulty(ingredients, steps) {
  const totalIngredients = ingredients.reduce((sum, g) => sum + g.items.length, 0);
  const totalSteps = steps.length;
  if (totalIngredients > 15 || totalSteps > 8) return "hard";
  if (totalIngredients > 8 || totalSteps > 5) return "medium";
  return "easy";
}

// ─── Parse duration from ISO 8601 to minutes ────────────────────────────────
function durationToMinutes(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 30;
  return (parseInt(match[1] || "0") * 60) + parseInt(match[2] || "0");
}

// ─── Slugify a title ─────────────────────────────────────────────────────────
function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// ─── Clean a title (extract Spanish part, remove emoji) ──────────────────────
function cleanTitle(title) {
  // Many titles have English after " - " or " | "
  let es = title.split(" - ")[0].split(" | ")[0].trim();
  // Remove emojis
  es = es.replace(/[\u{1F000}-\u{1FFFF}]/gu, "").trim();
  return es;
}

function extractEnglishTitle(title) {
  // Try to get English part after " - " or " | "
  const parts = title.split(/\s+-\s+|\s+\|\s+/);
  if (parts.length > 1) {
    return parts[parts.length - 1].replace(/[\u{1F000}-\u{1FFFF}]/gu, "").trim();
  }
  return null;
}

// ─── Parse the description to extract recipe data ────────────────────────────
function parseDescription(description) {
  if (!description || description.trim().length < 50) return null;

  const text = description.trim();

  // Check if it contains recipe indicators
  const hasIngredients = /ingredientes/i.test(text);
  if (!hasIngredients) return null;

  // Split into sections by known headers
  const sections = splitSections(text);

  if (!sections.ingredientSections.length) return null;

  return {
    intro: sections.intro,
    ingredientGroups: sections.ingredientSections,
    preparationText: sections.preparationText,
    suggestion: sections.suggestion,
  };
}

function splitSections(text) {
  const lines = text.split("\n").map((l) => l.trim());
  const result = {
    intro: "",
    ingredientSections: [],
    preparationText: "",
    suggestion: "",
  };

  let currentSection = "intro";
  let currentGroupName = null;
  let currentIngredients = [];
  let prepLines = [];
  let sugLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upper = line.toUpperCase();

    // Detect section headers
    if (/^INGREDIENTES?\s*[=.]?\s*(PARA\s+.*)?\.?\s*$/i.test(line) ||
        /^INGREDIENTES?\s*=/i.test(line)) {
      // Save previous ingredient group if any
      if (currentIngredients.length > 0) {
        result.ingredientSections.push({
          group: currentGroupName,
          items: currentIngredients,
        });
        currentIngredients = [];
      }

      // Extract group name from "INGREDIENTES =PARA EL POZOLE"
      const groupMatch = line.match(/(?:PARA|para)\s+(.+?)\.?\s*$/i);
      currentGroupName = groupMatch ? groupMatch[1].trim() : null;
      currentSection = "ingredients";
      continue;
    }

    // Detect sub-ingredient headers like "FRIJOLES CON CARNE DE PUERCO Y NOPAL"
    // These are all-caps lines within an ingredient section that introduce a new sub-recipe
    if (currentSection === "ingredients" && /^[A-ZÁÉÍÓÚÑ\s,.']+$/.test(line) && line.length > 5 && line.length < 80 && !line.match(/^\d/)) {
      // Could be a sub-group header
      if (currentIngredients.length > 0) {
        result.ingredientSections.push({
          group: currentGroupName,
          items: currentIngredients,
        });
        currentIngredients = [];
      }
      currentGroupName = line.replace(/\.\s*$/, "").trim();
      // Capitalize properly
      currentGroupName = currentGroupName.charAt(0).toUpperCase() +
        currentGroupName.slice(1).toLowerCase();
      continue;
    }

    if (/^PREPARACI[ÓO]N\b/i.test(line)) {
      // Save remaining ingredients
      if (currentIngredients.length > 0) {
        result.ingredientSections.push({
          group: currentGroupName,
          items: currentIngredients,
        });
        currentIngredients = [];
        currentGroupName = null;
      }

      // Check if there's a group name after PREPARACION
      const prepGroup = line.match(/PREPARACI[ÓO]N\s+(?:DE\s+)?(?:LOS?\s+)?(.+?)\.?\s*$/i);
      if (prepGroup) {
        // It's a sub-recipe preparation
      }

      currentSection = "preparation";
      continue;
    }

    if (/^SUGERENCIA/i.test(line)) {
      currentSection = "suggestion";
      continue;
    }

    if (/^(?:Bon\s+app[eé]tit|Bob\s+apetti)/i.test(line)) {
      continue; // Skip sign-off
    }

    // Add content to current section
    if (line === "") continue;

    switch (currentSection) {
      case "intro":
        if (result.intro) result.intro += " ";
        result.intro += line;
        break;

      case "ingredients":
        // Clean ingredient line
        const cleaned = cleanIngredientLine(line);
        if (cleaned && !isPreparationText(cleaned)) {
          currentIngredients.push(cleaned);
        } else if (isPreparationText(cleaned || line)) {
          // This is actually preparation text mixed into ingredients section
          prepLines.push(line);
          currentSection = "preparation";
        }
        break;

      case "preparation":
        prepLines.push(line);
        break;

      case "suggestion":
        sugLines.push(line);
        break;
    }
  }

  // Save any remaining ingredients
  if (currentIngredients.length > 0) {
    result.ingredientSections.push({
      group: currentGroupName,
      items: currentIngredients,
    });
  }

  result.preparationText = prepLines.join(" ").trim();
  result.suggestion = sugLines.join(" ").trim();

  return result;
}

function cleanIngredientLine(line) {
  if (!line) return null;
  // Remove leading dashes, bullets, numbers with dashes
  let clean = line.replace(/^[-•*]\s*/, "").trim();
  // Skip very short or empty lines
  if (clean.length < 2) return null;
  // Skip lines that are clearly section markers
  if (/^(Entotal|Para cocinar|Para el pozole)$/i.test(clean)) return null;
  return clean;
}

function isPreparationText(line) {
  if (!line) return false;
  // Preparation text is typically long sentences with cooking verbs
  const cookingVerbs = ["agrega", "deja cocinar", "revuelve", "mezcla", "corta",
    "en una sartén", "en una olla", "ponla al fuego", "lava", "hierva",
    "ya que", "enseguida", "en seguida", "apaga el fuego"];
  const lower = line.toLowerCase();
  const hasCookingVerbs = cookingVerbs.some((v) => lower.includes(v));
  return line.length > 100 && hasCookingVerbs;
}

// ─── Split a preparation paragraph into logical steps ────────────────────────
function splitPreparationIntoSteps(text) {
  if (!text) return [];

  // Split on sentence-like boundaries
  // Common patterns: "en seguida", "enseguida", "ya que", periods followed by caps
  let steps = [];

  // First split by double newlines or periods followed by capital letters
  const sentences = text
    .replace(/\.\s+(?=[A-ZÁÉÍÓÚÑ])/g, ".\n")
    .replace(/(?:en seguida|enseguida|,en seguida)\s+/gi, ".\n")
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  for (const sentence of sentences) {
    // If a sentence is very long, try to split on commas near cooking action transitions
    if (sentence.length > 200) {
      const parts = splitLongSentence(sentence);
      steps.push(...parts);
    } else {
      steps.push(sentence);
    }
  }

  // Clean up steps
  steps = steps
    .map((s) => {
      // Capitalize first letter
      s = s.trim();
      if (s.startsWith(".")) s = s.slice(1).trim();
      if (s.endsWith(",")) s = s.slice(0, -1).trim();
      if (!s.endsWith(".")) s += ".";
      return s.charAt(0).toUpperCase() + s.slice(1);
    })
    .filter((s) => s.length > 15);

  return steps.length > 0 ? steps : [text];
}

function splitLongSentence(sentence) {
  // Split on cooking action transitions
  const splitPoints = [
    /,\s*(?=agrega\b)/gi,
    /,\s*(?=deja\b)/gi,
    /,\s*(?=tapa\b)/gi,
    /,\s*(?=retira\b)/gi,
    /,\s*(?=saca\b)/gi,
    /,\s*(?=sirve\b)/gi,
    /,\s*(?=pon(?:er|la|los)?\b)/gi,
    /\.\s*/g,
  ];

  let parts = [sentence];
  for (const pattern of splitPoints) {
    const newParts = [];
    for (const part of parts) {
      if (part.length > 150) {
        const split = part.split(pattern).filter((s) => s.trim().length > 10);
        if (split.length > 1) {
          newParts.push(...split);
        } else {
          newParts.push(part);
        }
      } else {
        newParts.push(part);
      }
    }
    parts = newParts;
  }

  return parts;
}

// ─── YouTube API helpers ─────────────────────────────────────────────────────
async function getChannelId() {
  const res = await fetch(
    `${API}/channels?part=id&forHandle=${HANDLE}&key=${API_KEY}`,
  );
  const data = await res.json();
  return data.items?.[0]?.id;
}

async function getAllVideos(channelId) {
  const allVideos = [];
  let pageToken = undefined;

  do {
    const params = new URLSearchParams({
      part: "snippet",
      channelId,
      type: "video",
      order: "date",
      maxResults: "50",
      key: API_KEY,
    });
    if (pageToken) params.set("pageToken", pageToken);

    const res = await fetch(`${API}/search?${params}`);
    const data = await res.json();

    if (!data.items) break;

    const videoIds = data.items.map((i) => i.id.videoId).filter(Boolean);

    if (videoIds.length > 0) {
      // Get full details including descriptions
      const detailRes = await fetch(
        `${API}/videos?part=snippet,contentDetails,statistics&id=${videoIds.join(",")}&key=${API_KEY}`,
      );
      const detailData = await detailRes.json();
      if (detailData.items) {
        allVideos.push(...detailData.items);
      }
    }

    pageToken = data.nextPageToken;
    console.log(`  Fetched ${allVideos.length} videos...`);
  } while (pageToken);

  return allVideos;
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("=== Recipe Auto-Generator ===\n");

  // Ensure output directory
  if (!fs.existsSync(RECIPES_DIR)) {
    fs.mkdirSync(RECIPES_DIR, { recursive: true });
  }

  // Remove old sample file
  const samplePath = path.join(RECIPES_DIR, "sample1.json");
  if (fs.existsSync(samplePath)) {
    fs.unlinkSync(samplePath);
    console.log("Removed sample recipe file.\n");
  }

  console.log("1. Finding channel...");
  const channelId = await getChannelId();
  if (!channelId) {
    console.error("Could not find channel!");
    process.exit(1);
  }
  console.log(`   Channel ID: ${channelId}\n`);

  console.log("2. Fetching all videos...");
  const videos = await getAllVideos(channelId);
  console.log(`   Total videos: ${videos.length}\n`);

  console.log("3. Parsing descriptions for recipes...\n");

  let generated = 0;
  let skipped = 0;
  const seenDescriptions = new Set();

  for (const video of videos) {
    const title = video.snippet.title;
    const description = video.snippet.description || "";
    const videoId = video.id;
    const duration = video.contentDetails.duration;

    // Skip duplicate descriptions (same pozole recipe on multiple videos)
    const descHash = description.slice(0, 200);
    if (descHash.length > 50 && seenDescriptions.has(descHash)) {
      console.log(`   SKIP (duplicate): ${title}`);
      skipped++;
      continue;
    }
    if (descHash.length > 50) seenDescriptions.add(descHash);

    // Skip very short videos (likely shorts/teasers)
    const minutes = durationToMinutes(duration);
    if (minutes < 2) {
      console.log(`   SKIP (too short): ${title} (${minutes}min)`);
      skipped++;
      continue;
    }

    // Parse recipe from description
    const parsed = parseDescription(description);

    if (!parsed) {
      console.log(`   SKIP (no recipe): ${title}`);
      skipped++;
      continue;
    }

    // Build recipe object
    const spanishTitle = cleanTitle(title);
    const englishTitle = extractEnglishTitle(title) || spanishTitle;
    const category = detectCategory(title, description);
    const steps = splitPreparationIntoSteps(parsed.preparationText);
    const difficulty = guessDifficulty(parsed.ingredientGroups, steps);
    const totalMinutes = minutes;
    const prepTime = Math.max(10, Math.round(totalMinutes * 0.3));
    const cookTime = Math.max(10, totalMinutes - prepTime);

    const recipe = {
      videoId,
      slug: slugify(spanishTitle),
      category,
      tags: detectTags(title, description),
      featured: false,
      difficulty,
      prepTime,
      cookTime,
      servings: guessServings(description),
      es: {
        title: spanishTitle,
        description: parsed.intro || `Deliciosa receta de ${spanishTitle.toLowerCase()}.`,
        ingredients: parsed.ingredientGroups,
        steps: steps.length > 0 ? steps : ["Sigue las instrucciones del video."],
        ...(parsed.suggestion ? { tips: [parsed.suggestion] } : {}),
      },
      en: {
        title: englishTitle,
        description: parsed.intro || `Delicious ${englishTitle.toLowerCase()} recipe.`,
        ingredients: parsed.ingredientGroups, // Keep Spanish ingredients (authentic)
        steps: steps.length > 0 ? steps : ["Follow the instructions in the video."],
        ...(parsed.suggestion ? { tips: [parsed.suggestion] } : {}),
      },
    };

    // Write JSON file
    const filePath = path.join(RECIPES_DIR, `${videoId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(recipe, null, 2), "utf-8");
    generated++;

    console.log(`   OK: ${spanishTitle}`);
    console.log(`       -> ${filePath}`);
    console.log(`       Category: ${category} | Difficulty: ${difficulty} | Steps: ${steps.length} | Ingredients: ${parsed.ingredientGroups.reduce((s, g) => s + g.items.length, 0)}`);
  }

  console.log("\n" + "=".repeat(60));
  console.log(`DONE!`);
  console.log(`  Generated: ${generated} recipe files`);
  console.log(`  Skipped:   ${skipped} videos (no recipe/duplicate/short)`);
  console.log(`  Location:  ${RECIPES_DIR}`);

  // Mark first 3 as featured
  if (generated > 0) {
    const files = fs.readdirSync(RECIPES_DIR).filter((f) => f.endsWith(".json"));
    for (let i = 0; i < Math.min(3, files.length); i++) {
      const fp = path.join(RECIPES_DIR, files[i]);
      const data = JSON.parse(fs.readFileSync(fp, "utf-8"));
      data.featured = true;
      fs.writeFileSync(fp, JSON.stringify(data, null, 2), "utf-8");
    }
    console.log(`  Featured:  First ${Math.min(3, files.length)} recipes marked as featured`);
  }
}

// ─── Helper: detect tags from content ────────────────────────────────────────
function detectTags(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  const tags = [];

  const tagKeywords = {
    tradicional: ["tradicional", "abuela", "mexicana", "mexicano"],
    facil: ["facil", "fácil", "sencilla", "simple"],
    economica: ["economica", "económica", "barato"],
    picante: ["picante", "picoso", "chile", "habanero"],
    navidad: ["navidad", "navideño", "posada"],
    vegano: ["vegano", "vegan"],
    vegetariano: ["vegetariano", "sin carne", "nopal", "quelite"],
    rapido: ["rapido", "rápido", "minutos"],
    casero: ["casero", "casera", "en casa", "homemade"],
  };

  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    if (keywords.some((kw) => text.includes(kw))) {
      tags.push(tag);
    }
  }

  return tags.length > 0 ? tags : ["tradicional"];
}

// ─── Helper: guess servings ──────────────────────────────────────────────────
function guessServings(description) {
  const match = description.match(/(\d+)\s*(?:porcion|racion|persona|serving)/i);
  if (match) return parseInt(match[1]);
  return 6; // default
}

main().catch(console.error);
