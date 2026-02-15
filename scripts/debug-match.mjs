import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: ".env.local" });

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
const API = "https://www.googleapis.com/youtube/v3";
const RECIPES_DIR = path.join(process.cwd(), "content", "recipes");

// 1. Get recipe file video IDs
const recipeFiles = fs.readdirSync(RECIPES_DIR).filter(f => f.endsWith(".json"));
const recipeVideoIds = new Set(recipeFiles.map(f => f.replace(".json", "")));
console.log(`Recipe files: ${recipeFiles.length}`);

// 2. Fetch videos exactly like the website does (search.list then videos.list)
const searchRes = await fetch(
  `${API}/search?part=snippet&channelId=${CHANNEL_ID}&type=video&order=date&maxResults=12&key=${API_KEY}`
);
const searchData = await searchRes.json();

if (!searchData.items) {
  console.error("Search API error:", JSON.stringify(searchData, null, 2));
  process.exit(1);
}

const searchVideoIds = searchData.items.map(i => i.id.videoId);
console.log(`\nSearch API returned ${searchVideoIds.length} videos:`);

for (const id of searchVideoIds) {
  const hasRecipe = recipeVideoIds.has(id);
  const title = searchData.items.find(i => i.id.videoId === id)?.snippet?.title;
  console.log(`  ${hasRecipe ? "HAS RECIPE" : "NO RECIPE "} | ${id} | ${title}`);
}

// 3. Get video details for these
const videoIds = searchVideoIds.join(",");
const vidRes = await fetch(
  `${API}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${API_KEY}`
);
const vidData = await vidRes.json();
console.log(`\nVideo details returned: ${vidData.items?.length || 0}`);

for (const item of vidData.items || []) {
  const hasRecipe = recipeVideoIds.has(item.id);
  console.log(`  ${hasRecipe ? "HAS RECIPE" : "NO RECIPE "} | ${item.id} | ${item.snippet.title}`);
}
