import { NewsArticle } from '../../types/newsArticle'

const FEED_URL = 'https://www.christian.org.uk/news/england-wales/rssfeed/'
import { getCachedFeed, setCachedFeed } from '../useCache'
const cacheKey= "CIFeed"

export async function fetchCINews(): Promise<NewsArticle[]> {
  const cached = getCachedFeed(cacheKey)
        if (cached) return cached

  const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(FEED_URL)}`

  const res = await fetch(api)

  if (!res.ok) {
    throw new Error('Feed request failed')
  }

  const data = await res.json()

  if (!data.items?.length) {
    throw new Error('No articles found')
  }

  const items: NewsArticle[] = data.items.map((item: any) => ({
    title: item.title || '',
    pubDate: item.pubDate || item.date,
    link: item.link || FEED_URL,
    source: "CI"
  }))

  setCachedFeed(cacheKey, items)

  return items
}