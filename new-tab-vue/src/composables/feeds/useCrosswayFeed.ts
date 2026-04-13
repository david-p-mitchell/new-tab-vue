import { normalizePost } from '@/utils/normalizePost'
import type { RSSFeedItem,RssResponse } from '@/types/rssFeedItem'
import { getCachedFeed, setCachedFeed } from '../useCache'
const cacheKey= "CrosswayFeed"

export async function fetchCrosswayFeed(): Promise<RSSFeedItem[]> {
    const cached = getCachedFeed(cacheKey)
            if (cached) return cached
  const url = 'https://www.crossway.org/articles/rss/'
  const sourceName = 'Crossway'
  const days = 4

  try {
    const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`
    const res = await fetch(api)
    if (!res.ok) throw new Error('Failed to fetch Crossway feed')

    const data: RssResponse = await res.json()
    if (!data.items) throw new Error('Invalid Crossway feed data')

    const result = data.items
              .slice(0, 20)
              .map(item  => normalizePost(item, sourceName, days))
        
            setCachedFeed(cacheKey, result)
            return result

  } catch (err) {
    console.warn('Crossway feed failed, skipping.', err)
    return []
  }
}