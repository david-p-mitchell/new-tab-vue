import { normalizePost } from '@/utils/normalizePost'
import type { RssResponse,RSSFeedItem } from '@/types/rssFeedItem'
import { getCachedFeed, setCachedFeed } from '../useCache'
const cacheKey = "DesiringGodFeed"

export async function fetchDesiringGodFeed(): Promise<RSSFeedItem[]> {
    const cached = getCachedFeed(cacheKey)
                //if (cached) return cached
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
                  .map(item  => { 
                    
                    const lowerImg = getFirstImageSrc(item.content)
                    let np = normalizePost(item, sourceName, days) 
                    const isLookAtTheBook = item.content!.includes("https://www.desiringgod.org/labs")
                    const isSermonExcerpt = lowerImg.includes("light-and-truth")
                    const isPodcast = lowerImg.includes("podcasts/ask-pastor-john")
                    
                    const isMessage = lowerImg.includes("/podcasts/messages-by-desiring-god")
                    let isArticle = false;
                    if(!(isSermonExcerpt || isPodcast || isMessage || isLookAtTheBook)) {
                      isArticle = true
                    }
                    return { ...np, genreType: isSermonExcerpt ? "Sermon Excerpt" : isPodcast ? "Podcast" : isArticle ? "Article" : isMessage ? "Message" : isLookAtTheBook ? "Look at the Book" : np.genreType }
                  })
            
                setCachedFeed(cacheKey, result)
                return result

  } catch (err) {
    console.warn('Desiring God feed failed, skipping.', err)
    return []
  }
}

function getFirstImageSrc(html = "") {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  return match ? match[1] : ""
}