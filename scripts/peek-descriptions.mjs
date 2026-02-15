import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const API_KEY = process.env.YOUTUBE_API_KEY;
const HANDLE = process.env.YOUTUBE_CHANNEL_HANDLE;
const API = "https://www.googleapis.com/youtube/v3";

// Try multiple methods to find channel ID
async function findChannelId() {
  // Method 1: forHandle
  let res = await fetch(
    `${API}/channels?part=id,snippet&forHandle=${HANDLE}&key=${API_KEY}`,
  );
  let data = await res.json();
  console.log("forHandle response:", JSON.stringify(data, null, 2));

  if (data.items?.length) return data.items[0].id;

  // Method 2: Search for the channel
  res = await fetch(
    `${API}/search?part=snippet&q=los+sabores+de+mi+tierra&type=channel&key=${API_KEY}`,
  );
  data = await res.json();
  console.log("\nSearch response:", JSON.stringify(data.items?.slice(0, 3), null, 2));

  if (data.items?.length) return data.items[0].snippet.channelId;

  return null;
}

const channelId = await findChannelId();
console.log("\nChannel ID:", channelId);

if (!channelId) {
  console.log("Could not find channel. Exiting.");
  process.exit(1);
}

// Get recent videos
const searchRes = await fetch(
  `${API}/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=50&key=${API_KEY}`,
);
const searchData = await searchRes.json();

if (!searchData.items?.length) {
  console.log("No videos found");
  process.exit(1);
}

const videoIds = searchData.items.map((i) => i.id.videoId).join(",");

// Get full details
const vidRes = await fetch(
  `${API}/videos?part=snippet,contentDetails&id=${videoIds}&key=${API_KEY}`,
);
const vidData = await vidRes.json();

for (const item of vidData.items) {
  console.log("\n" + "=".repeat(80));
  console.log(`TITLE: ${item.snippet.title}`);
  console.log(`VIDEO ID: ${item.id}`);
  console.log(`DURATION: ${item.contentDetails.duration}`);
  console.log("-".repeat(80));
  console.log("DESCRIPTION:");
  console.log(item.snippet.description);
  console.log("=".repeat(80));
}
