import { normalizePost } from '@/utils/normalizePost'
import type { RssResponse, RSSFeedItem } from '@/types/rssFeedItem'
import { getCachedFeed, setCachedFeed } from '../useCache'
const cacheKey = "LigionierFeed"

export async function fetchLigonierFeed(): Promise<RSSFeedItem[]> {
    const cached = getCachedFeed(cacheKey)
                if (cached) return cached
  const url = 'https://www.ligonier.org/rss.xml'
  const sourceName = 'Ligonier'
  const days = 3

  try {
    const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`
    const res = await fetch(api)
    if (!res.ok) throw new Error('Failed to fetch Ligonier feed')

    const data: RssResponse = await res.json()
    if (!data.items) throw new Error('Invalid Ligonier feed data')

    const result = data.items
                  .slice(0, 20)
                  .map(item  => normalizePost(item, sourceName, days))
            
                setCachedFeed(cacheKey, result)
                return result

  } catch (err) {
    console.warn('Ligonier feed failed, skipping.', err)
    return []
  }
}