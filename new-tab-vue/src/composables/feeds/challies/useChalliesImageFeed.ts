import { normalizePost } from '../../../utils/normalizePost'
import type { RssItem, RssResponse } from '../../../types/rssFeedItem'
import type { RSSFeedItem } from '../../../types/rssFeedItem'
import { getCachedFeed,setCachedFeed } from '@/composables/useCache'
const cacheKey = "challiesImageFeed"
export async function fetchChalliesImageFeed(): Promise<RssItem[]> {
  const cached = getCachedFeed(cacheKey)
  if (cached) return cached

  const FEEDS = [
    "https://www.squarequotes.church/hack/feed.mg?Type=gallery&Data=213861404_c9XR3k&format=rss200",
    "https://www.squarequotes.church/hack/feed.mg?Type=gallery&Data=214358190_MFsznf&format=rss200",
    "https://www.squarequotes.church/hack/feed.mg?Type=gallery&Data=214034578_ntM8jj&format=rss200",
    "https://www.squarequotes.church/hack/feed.mg?Type=gallery&Data=213883468_W3WrS5&format=rss200",
    "https://www.squarequotes.church/hack/feed.mg?Type=gallery&Data=214490688_v5kmgm&format=rss200",
    "https://www.squarequotes.church/hack/feed.mg?Type=gallery&Data=213861744_kXRkVW&format=rss200",
    "https://www.squarequotes.church/hack/feed.mg?Type=gallery&Data=213943992_2P43v8&format=rss200",
    "https://www.squarequotes.church/hack/feed.mg?Type=gallery&Data=213861677_bdK3DT&format=rss200",
    "https://www.squarequotes.church/hack/feed.mg?Type=gallery&Data=213861440_fXpfF5&format=rss200",
    "https://www.squarequotes.church/hack/feed.mg?Type=gallery&Data=213882135_862T7d&format=rss200",
    "https://www.squarequotes.church/hack/feed.mg?Type=gallery&Data=213860678_hn6TVv&format=rss200",
    "https://www.squarequotes.church/hack/feed.mg?Type=gallery&Data=214322821_Xw3cMd&format=rss200",
    "https://www.squarequotes.church/hack/feed.mg?Type=gallery&Data=213861566_GdfBf4&format=rss200",
    "https://www.squarequotes.church/hack/feed.mg?Type=gallery&Data=211252509_dT3Prc&format=rss200",
    "https://www.squarequotes.church/hack/feed.mg?Type=gallery&Data=213860718_swH7tf&format=rss200",
    "https://www.squarequotes.church/hack/feed.mg?Type=gallery&Data=213882116_PgFtTV&format=rss200"

  ]

  const apiKey =
    (import.meta.env as Record<string, string>).VITE_RSS2JSON_API_KEY 
    

  if (!apiKey) {
    console.warn("RSS2JSON API key is missing.")
    return []
  }

  try {
    const allItems: RssItem[] = []

    for (const feedUrl of FEEDS) {
      const api = `https://api.rss2json.com/v1/api.json?api_key=${apiKey}&count=1000&rss_url=${encodeURIComponent(feedUrl)}`

      const res = await fetch(api)
      if (!res.ok) continue

      const data: RssResponse = await res.json()
      if (!data.items) continue

      allItems.push(...data.items)
    }

    // optional: dedupe by title or link
    const deduped = Array.from(
      new Map(allItems.map(item => [item.link ?? item.title, item])).values()
    )

    setCachedFeed(cacheKey, deduped)
    return deduped
  } catch (err) {
    console.warn("Feed failed", err)
    return []
  }
}