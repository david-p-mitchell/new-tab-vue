import { normalizePost } from '@/utils/normalizePost'
import type { RssResponse,RSSFeedItem } from '@/types/rssFeedItem'
import { getCachedFeed, setCachedFeed } from '../useCache'
const cacheKey = "DesiringGodFeed"

export async function fetchDesiringGodFeed(): Promise<RSSFeedItem[]> {
    const cached = getCachedFeed(cacheKey)
                if (cached) return cached
  const url = 'http://rss.desiringgod.org/'
  const sourceName = 'Desiring God'
  const days = 5

  try {
    const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`
    const res = await fetch(api)
    if (!res.ok) throw new Error('Failed to fetch DG feed')

    const data: RssResponse = await res.json()
    if (!data.items) throw new Error('Invalid DG feed data')

    const result = data.items
                  .slice(0, 20)
                  .map(item  => normalizePost(item, sourceName, days))
            
                setCachedFeed(cacheKey, result)
                return result

  } catch (err) {
    console.warn('Desiring God feed failed, skipping.', err)
    return []
  }
}