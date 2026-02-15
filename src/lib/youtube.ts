import { YouTubeVideo, VideoDetails, ChannelInfo } from "@/types";

const API_BASE = "https://www.googleapis.com/youtube/v3";
const API_KEY = process.env.YOUTUBE_API_KEY!;
const CHANNEL_ID_ENV = process.env.YOUTUBE_CHANNEL_ID;
const CHANNEL_HANDLE = process.env.YOUTUBE_CHANNEL_HANDLE!;

let cachedChannelId: string | null = CHANNEL_ID_ENV || null;

async function getChannelId(): Promise<string> {
  if (cachedChannelId) return cachedChannelId;

  const params = new URLSearchParams({
    part: "id",
    forHandle: CHANNEL_HANDLE,
    key: API_KEY,
  });

  const res = await fetch(`${API_BASE}/channels?${params}`, {
    next: { revalidate: 86400 },
  });
  const data = await res.json();

  if (!data.items?.length) {
    throw new Error(`Channel not found for handle: ${CHANNEL_HANDLE}`);
  }

  cachedChannelId = data.items[0].id;
  return cachedChannelId!;
}

export async function getChannelVideos(
  maxResults: number = 12,
  pageToken?: string,
): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string }> {
  const channelId = await getChannelId();

  const params = new URLSearchParams({
    part: "snippet",
    channelId,
    type: "video",
    order: "date",
    maxResults: String(maxResults),
    key: API_KEY,
  });
  if (pageToken) params.set("pageToken", pageToken);

  const res = await fetch(`${API_BASE}/search?${params}`, {
    next: { revalidate: 3600 },
  });
  const data = await res.json();

  if (!data.items) {
    return { videos: [] };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const videos: YouTubeVideo[] = data.items.map((item: any) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnailUrl:
      item.snippet.thumbnails?.high?.url ||
      item.snippet.thumbnails?.medium?.url ||
      "",
    publishedAt: item.snippet.publishedAt,
    channelTitle: item.snippet.channelTitle,
  }));

  return {
    videos,
    nextPageToken: data.nextPageToken,
  };
}

export async function getVideoDetails(
  videoIds: string[],
): Promise<VideoDetails[]> {
  if (videoIds.length === 0) return [];

  const params = new URLSearchParams({
    part: "snippet,contentDetails,statistics",
    id: videoIds.join(","),
    key: API_KEY,
  });

  const res = await fetch(`${API_BASE}/videos?${params}`, {
    next: { revalidate: 3600 },
  });
  const data = await res.json();

  if (!data.items) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.items.map((item: any) => ({
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnailUrl:
      item.snippet.thumbnails?.maxres?.url ||
      item.snippet.thumbnails?.high?.url ||
      item.snippet.thumbnails?.medium?.url ||
      "",
    publishedAt: item.snippet.publishedAt,
    channelTitle: item.snippet.channelTitle,
    duration: item.contentDetails.duration,
    viewCount: item.statistics.viewCount || "0",
    likeCount: item.statistics.likeCount || "0",
  }));
}

export async function getChannelInfo(): Promise<ChannelInfo | null> {
  const channelId = await getChannelId();

  const params = new URLSearchParams({
    part: "snippet,statistics,brandingSettings",
    id: channelId,
    key: API_KEY,
  });

  const res = await fetch(`${API_BASE}/channels?${params}`, {
    next: { revalidate: 86400 },
  });
  const data = await res.json();

  if (!data.items?.length) return null;

  const item = data.items[0];
  return {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnailUrl: item.snippet.thumbnails?.high?.url || "",
    subscriberCount: item.statistics.subscriberCount || "0",
    videoCount: item.statistics.videoCount || "0",
    bannerUrl: item.brandingSettings?.image?.bannerExternalUrl,
  };
}

export async function getAllChannelVideos(): Promise<YouTubeVideo[]> {
  const allVideos: YouTubeVideo[] = [];
  let pageToken: string | undefined;

  do {
    const { videos, nextPageToken } = await getChannelVideos(50, pageToken);
    allVideos.push(...videos);
    pageToken = nextPageToken;
  } while (pageToken && allVideos.length < 200);

  return allVideos;
}
