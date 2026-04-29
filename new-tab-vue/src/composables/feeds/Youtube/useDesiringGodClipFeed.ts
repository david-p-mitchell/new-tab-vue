export interface YoutubeVideo {
  id: string
  title: string
  thumbnail: string
  pubDate: string
}

import { getCachedFeed, setCachedFeed } from "@/composables/useCache"

export function useYoutubeFeed() {
  async function fetchFeed(playlistId: string): Promise<YoutubeVideo[]> {
    const cached = getCachedFeed(playlistId)
    if (cached) return cached

    const apiKey = (import.meta.env as Record<string, string>).VITE_YOUTUBE_API_KEY

    let videos: YoutubeVideo[] = []
    let nextPageToken: string | undefined = undefined

    do {
      const url =
        `https://www.googleapis.com/youtube/v3/playlistItems` +
        `?part=snippet&playlistId=${playlistId}` +
        `&maxResults=50` +
        `&pageToken=${nextPageToken ?? ''}` +
        `&key=${apiKey}`

      const res = await fetch(url)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error?.message || "Failed to fetch YouTube playlist")
      }

      const items = data.items || []

      const mapped = items.map((item: any) => {
        const snippet = item.snippet
        const videoId = snippet.resourceId.videoId

        return {
          id: videoId,
          title: snippet.title,
          thumbnail:
            snippet.thumbnails?.high?.url ||
            snippet.thumbnails?.default?.url ||
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          pubDate: snippet.publishedAt
        }
      })

      videos.push(...mapped)
      nextPageToken = data.nextPageToken

    } while (nextPageToken)

    setCachedFeed(playlistId, videos)
    
    return videos
  }

  function filterShorts(videos: YoutubeVideo[]): YoutubeVideo[] {
    return videos.filter(v =>
      v.title.toLowerCase().includes("short") ||
      v.thumbnail.includes("shorts")
    )
  }

  return {
    fetchFeed,
    filterShorts,
  }
}