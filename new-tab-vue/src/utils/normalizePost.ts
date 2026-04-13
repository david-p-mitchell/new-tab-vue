import type { RssItem, RssPostItem } from '../types/rssFeedItem'

export function normalizePost(item: RssItem, sourceName: string, sourceDays: number): RssPostItem {
  const html = item.content || item.description || ''
  let img = getImageFromHtml(item, html)
  if (img && !img.match(/\.(jpeg|jpg|gif|png|webp|bmp|svg)/i)) {
      img= ''
  }
  const categories = item.categories
    ? Array.isArray(item.categories)
      ? item.categories
      : [item.categories]
    : []

  const itemTitle =
    item.title?.includes(':') && item.title.length > 100
      ? item.title.slice(0, item.title.indexOf(':'))
      : item.title

      
  const looksLikeNews = (categories && categories.length > 0 && categories.filter(c => c.toLowerCase().includes("news")).length > 0) ? true : false;
  const pubDate = item.pubDate || item.isoDate || new Date().toISOString()
  return {
    title: itemTitle || 'Untitled',
    link: item.link,
    pubDate: pubDate,
    description: html,
    thumbnail: img,
    source: sourceName,
    author: (item as any).author,
    genreType: looksLikeNews ? 'news' : 'generic',
    type: categories && categories.length> 0? categories[0] : '',
    sourceDays,
    extraInfo: '',
    categories,
    body: item.content
  }

  
}
function getImageFromHtml(item: RssItem, html: string): string {
  let img = ''
    if (item.thumbnail) return item.thumbnail
    if ((item as any).media?.thumbnail) return (item as any).media.thumbnail
    if ((item as any)['media:thumbnail']?.url)
      return (item as any)['media:thumbnail'].url

    
      const match = html.match(/<img[^>]+>/i)

      if (match) {
        const imgTag = match[0]

        const dataImageMatch = imgTag.match(/data-image=["'](.*?)["']/i)
        if (dataImageMatch) {
          return dataImageMatch[1]
        } else {
          const srcMatch = imgTag.match(/src=["'](.*?)["']/i)
          if (srcMatch) 
            return srcMatch[1]
        }
      }

    if ((item as any).enclosure?.link) {
      return (item as any).enclosure.link
    }

    if ((item as any)['media:content']?.url) {
      return (item as any)['media:content'].url
    }
    return ''
  }