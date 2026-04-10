export interface RssItem {
  title: string
  link: string
  pubDate: string
  content?: string
  description?: string
}

export interface RssResponse {
  items: RssItem[]
}
import { normalizePost } from '../../../utils/normalizePost'
import { RSSFeedItem } from '../../types/rssFeedItem'
export async function fetchEvangelicalTimesFeed(): Promise<RSSFeedItem[]> {
  const url = 'https://www.evangelical-times.org/rss/'
  const sourceName = 'ET'
  const days = 5

  try {
    const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`
    const res = await fetch(api)

    if (!res.ok) throw new Error('Failed to fetch ET feed')

    const data: RssResponse = await res.json()

    if (!data.items) throw new Error('Invalid ET feed data')

    return data.items
      .slice(0, 20)
      .map(item => {
        const normalized = normalizePost(item, sourceName, days)
        return normalized
      })

  } catch (err) {
    console.warn('Evangelical Times feed failed, skipping.', err)
    return []
  }
}