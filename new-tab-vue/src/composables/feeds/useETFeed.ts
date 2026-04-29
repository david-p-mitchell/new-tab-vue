

import { normalizePost } from '../../utils/normalizePost'
import { RSSFeedItem, RssResponse } from '../../types/rssFeedItem'
import { getCachedFeed, setCachedFeed } from '../useCache'
const cacheKey = "ETFeed"
export async function fetchEvangelicalTimesFeed(): Promise<RSSFeedItem[]> {
  const cached = getCachedFeed(cacheKey)
              if (cached) return cached
  const url = 'https://www.evangelical-times.org/rss/'
  const sourceName = 'ET'
  const days = 7

  try {
    const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`
    const res = await fetch(api)

    if (!res.ok) throw new Error('Failed to fetch ET feed')

    const data: RssResponse = await res.json()

    if (!data.items) throw new Error('Invalid ET feed data')

    const result = data.items
                  .slice(0, 20)
                .map(item  => { 
                let np = normalizePost(item, sourceName, days)
                const isPodcast = np.type.includes("Podcast")
                const isReview = np.type.includes("Reviews")
                const isArticle = np.type.includes("Articles")
                return { ...np, genreType: isPodcast ? "Podcast" : isReview  ? "Review" : isArticle ? "Article" : np.genreType }
              })
                setCachedFeed(cacheKey, result)
                return result

  } catch (err) {
    console.warn('Evangelical Times feed failed, skipping.', err)
    return []
  }
}