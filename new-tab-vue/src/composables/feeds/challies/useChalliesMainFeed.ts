import { normalizePost } from '../../../utils/normalizePost'
import type { RssResponse } from '../../../types/rssFeedItem'
import type { RSSFeedItem } from '../../../types/rssFeedItem'
import { getCachedFeed,setCachedFeed } from '@/composables/useCache'
const cacheKey = "challiesFeed"
export async function fetchChalliesFeed(): Promise<RSSFeedItem[]> {

  const cached = getCachedFeed(cacheKey)
  console.log('Cached Challies Feed:', cached)
  if (cached) return cached

  const url = 'https://www.challies.com/feed/'
  const sourceName = 'Challies'
  const days = 5

  try {
    const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`
    const res = await fetch(api)
    
    if (!res.ok) throw new Error('Failed to fetch Challies feed')

    const data: RssResponse = await res.json()
    if (!data.items) throw new Error('Invalid Challies feed data')

    const result = data.items
      .slice(0, 20)
      .map(item  => normalizePost(item, sourceName, days))

    setCachedFeed(cacheKey, result)
    return result

  } catch (err) {
    console.warn('Challies feed failed, skipping.', err)
    return []
  }
}