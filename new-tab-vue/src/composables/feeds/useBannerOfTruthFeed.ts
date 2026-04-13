import { normalizePost } from '@/utils/normalizePost'
import type { RssResponse, RssPostItem } from '@/types/rssFeedItem'
import { getCachedFeed, setCachedFeed } from '../useCache'
const cacheKey = "BannerOfTruthFeed"

export async function fetchBannerOfTruthFeed(): Promise<RssPostItem[]> {
    const cached = getCachedFeed(cacheKey)
      if (cached) return cached
  const url = 'http://banneroftruth.org/uk/feed/'
  const sourceName = 'Banner of Truth'
  const days = 60
  

  try {
    const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`
    const res = await fetch(api)
    if (!res.ok) throw new Error('Failed to fetch Banner feed')

    const data: RssResponse = await res.json()
    if (!data.items) throw new Error('Invalid Banner feed data')

    const result = data.items
          .slice(0, 20)
          .map(item  => normalizePost(item, sourceName, days))
    
        setCachedFeed(cacheKey, result)
        return result
    

  } catch (err) {
    console.warn('Banner of Truth feed failed, skipping.', err)
    return []
  }
}