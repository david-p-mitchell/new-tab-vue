import { normalizePost } from '@/utils/normalizePost'
import type { RSSFeedItem, RssResponse } from '@/types/rssFeedItem'
import { getCachedFeed, setCachedFeed } from '../useCache'
const cacheKey = "TGCFeed"

export async function fetchTgcFeed(): Promise<RSSFeedItem[]> {
    const cached = getCachedFeed(cacheKey)
          if (cached) return cached

  const url = 'https://www.thegospelcoalition.org/feed/'
  const sourceName = 'TGC'
  const days = 5

  try {
    const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`
    const res = await fetch(api)
    if (!res.ok) throw new Error('Failed to fetch TGC feed')

    const data: RssResponse = await res.json()
    if (!data.items) throw new Error('Invalid TGC feed data')

      const result = data.items
                .slice(0, 20)
                .map(item  => normalizePost(item, sourceName, days))
          
              setCachedFeed(cacheKey, result)
              return result

  } catch (err) {
    console.warn('TGC feed failed, skipping.', err)
    return []
  }
}