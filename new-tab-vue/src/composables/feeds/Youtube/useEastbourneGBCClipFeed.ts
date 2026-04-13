export interface YoutubeVideo {
  id: string
  title: string
  link: string
  thumbnail: string
  published: string
}

interface Rss2JsonItem {
  title: string
  link: string
  pubDate: string
  thumbnail: string
  guid: string
}

interface Rss2JsonResponse {
  status: string
  items: Rss2JsonItem[]
}
import { getCachedFeed, setCachedFeed } from "@/composables/useCache"
export function useYoutubeFeed() {
  async function fetchFeed(playlistId: string): Promise<YoutubeVideo[]> {
    const cached = getCachedFeed(playlistId)
          if (cached) return cached
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`
    const apiKey = (import.meta.env as Record<string, string>).VITE_RSS2JSON_API_KEY 


    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`

    const res = await fetch(apiUrl)
    const data: Rss2JsonResponse = await res.json()

    if (data.status !== 'ok') {
      throw new Error('Failed to fetch RSS feed')
    }

    const result =  data.items.map((item) => {
      const videoId = extractVideoId(item.link)

      return {
        id: videoId,
        title: item.title,
        link: item.link,
        thumbnail: item.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        published: item.pubDate,
      }
    })
    setCachedFeed(playlistId, result);
    return result;
  }

  function extractVideoId(url: string): string {
    const match = url.match(/(?:v=|shorts\/)([^&?/]+)/)
  return match ? match[1] : ''

  }

  function filterShorts(videos: YoutubeVideo[]): YoutubeVideo[] {
    return videos.filter(v =>
      v.link.includes('/shorts/') ||
      v.title.toLowerCase().includes('short')
    )
  }

  return {
    fetchFeed,
    filterShorts,
  }
}