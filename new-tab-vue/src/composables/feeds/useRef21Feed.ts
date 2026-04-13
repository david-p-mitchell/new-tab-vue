import { normalizePost } from '@/utils/normalizePost'
import type { RssResponse, RSSFeedItem } from '@/types/rssFeedItem'
import { getCachedFeed, setCachedFeed } from '../useCache'
const cacheKey = "BannerOfTruthFeed"

export async function fetchReformation21Feed(): Promise<RSSFeedItem[]> {
    const cached = getCachedFeed(cacheKey)
                if (cached) return cached
  const url = 'http://reformation21.org/feed/'
  const sourceName = 'Reformation 21'
  const days = 14

  try {
    const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`
    const res = await fetch(api)
    if (!res.ok) throw new Error('Failed to fetch Reformation21 feed')

    const data: RssResponse = await res.json()
    if (!data.items) throw new Error('Invalid Reformation21 feed data')

    const result = data.items
                  .slice(0, 20)
                  .map(item  => normalizePost(item, sourceName, days))
            
                setCachedFeed(cacheKey, result)
                return result

  } catch (err) {
    console.warn('Reformation21 feed failed, skipping.', err)
    return []
  }
}