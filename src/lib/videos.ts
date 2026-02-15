import fs from "fs/promises";
import path from "path";
import { VideoDetails } from "@/types";

const VIDEOS_FILE = path.join(process.cwd(), "content", "videos.json");

let cachedVideos: VideoDetails[] | null = null;

export async function getAllVideos(): Promise<VideoDetails[]> {
  if (cachedVideos) return cachedVideos;

  try {
    const content = await fs.readFile(VIDEOS_FILE, "utf-8");
    cachedVideos = JSON.parse(content) as VideoDetails[];
    return cachedVideos;
  } catch {
    return [];
  }
}

export async function getVideoById(
  videoId: string,
): Promise<VideoDetails | null> {
  const videos = await getAllVideos();
  return videos.find((v) => v.id === videoId) ?? null;
}

export async function getLatestVideos(
  count: number = 12,
): Promise<VideoDetails[]> {
  const videos = await getAllVideos();
  return videos
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, count);
}
