import { readingTime } from '../useReadingDurationCalculator'
import { NewsArticle } from '../../types/newsArticle'

const FEED_URL = 'https://www.christian.org.uk/news/england-wales/rssfeed/'
const CACHE_KEY = 'ci_news_feed'
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

function cacheGet<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(key)
    if (!cached) return null

    const { value, expiry } = JSON.parse(cached)

    if (Date.now() > expiry) {
      localStorage.removeItem(key)
      return null
    }

    return value
  } catch {
    return null
  }
}

function cacheSet<T>(key: string, value: T, ttlMs: number) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        value,
        expiry: Date.now() + ttlMs
      })
    )
  } catch {
    // silently fail
  }
}


export async function fetchCINews(): Promise<NewsArticle[]> {
  const cached = cacheGet<NewsArticle[]>(CACHE_KEY)
  if (cached) return cached

  const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
    FEED_URL
  )}`

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

  cacheSet(CACHE_KEY, items, CACHE_TTL)

  return items
}