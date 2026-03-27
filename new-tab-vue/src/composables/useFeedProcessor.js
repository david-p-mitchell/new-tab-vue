// composables/useFeedProcessor.js
import { useFeedStorage } from './useFeedStorage.js'

export function useFeedProcessor() {
  const { getSeenPosts, getClickedPosts, getRemovedCards } = useFeedStorage()

  function normalizePost(item, sourceName, sourceDays) {
    let img = ''
    if (item.thumbnail) img = item.thumbnail
    if (!img && item.media?.thumbnail) img = item.media.thumbnail
    if (!img && item['media:thumbnail']?.url) img = item['media:thumbnail'].url

    const html = item.description || item.content || ''
    if (!img) {
      const match = html.match(/<img[^>]+>/i)
      if (match) {
        const imgTag = match[0]
        const dataImageMatch = imgTag.match(/data-image=["'](.*?)["']/i)
        if (dataImageMatch) {
          img = dataImageMatch[1]
        } else {
          const srcMatch = imgTag.match(/src=["'](.*?)["']/i)
          if (srcMatch) img = srcMatch[1]
        }
      }
    }
    if (!img && item.enclosure?.link) img = item.enclosure.link
    if (!img && item['media:content']?.url) img = item['media:content'].url
    if (img && !img.match(/\.(jpeg|jpg|gif|png|webp|bmp|svg)/i)) img = ''

    const categories = item.categories
      ? (Array.isArray(item.categories) ? item.categories : [item.categories])
      : []

    const itemTitle = item.title?.includes(':') && item.title.length > 100
      ? item.title.slice(0, item.title.indexOf(':'))
      : item.title

    return {
      title: itemTitle || 'Untitled',
      link: item.link,
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      description: html,
      thumbnail: img,
      source: sourceName,
      author: item.author,
      type: categories.length ? categories[0] : '',
      sourceDays,
      extraInfo: ''
    }
  }

  function removeDuplicates(posts) {
    const seen = new Set()
    return posts.filter(post => {
      const key = post.link.split('?')[0]
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  function limitChalliesALaCarte(posts) {
    let kept = 0
    return posts.filter(post => {
      if (
        post.source === 'Challies' &&
        post.title?.toLowerCase().includes('a la carte')
      ) {
        if (kept === 0 && Math.random() < 0.5) { kept++; return true }
        return false
      }
      if (
        post.source === 'Media Gratiae' &&
        post.type === 'The Whole Counsel'
      ) return false
      return true
    })
  }

  function limitPerSource(posts, limit = 3) {
    const counts = {}
    return posts.filter(post => {
      counts[post.source] = counts[post.source] || 0
      if (counts[post.source] >= limit) return false
      counts[post.source]++
      return true
    })
  }

  function rankPosts(posts) {
    const seen = new Set(getSeenPosts())
    const clicked = new Set(getClickedPosts())
    const removed = getRemovedCards()
    const now = Date.now()

    return posts
      .filter(post => !removed.has(post.link))
      .map(post => {
        const ageHours = (now - new Date(post.pubDate)) / (1000 * 60 * 60)
        const withinSourceDays = ageHours <= post.sourceDays * 24
        const isSeen = seen.has(post.link)
        const isClicked = clicked.has(post.link)
        let score = 0
        if (withinSourceDays) score += 3
        if (!isSeen) score += 2
        score += Math.max(0, 1 - ageHours / (post.sourceDays * 24))
        if (post.source === 'Challies' && post.title?.toLowerCase().includes('a la carte')) score -= 1
        if (isClicked) score -= 1.5
        score += Math.random()
        return { post, score }
      })
      .sort((a, b) => b.score - a.score)
      .map(x => x.post)
  }

  function processPosts(rawPosts) {
    const now = new Date()
    const recent = rawPosts.filter(post => {
      const postDate = new Date(post.pubDate)
      const cutoff = new Date()
      cutoff.setDate(now.getDate() - post.sourceDays)
      return postDate >= cutoff
    })

    return limitPerSource(
      rankPosts(
        limitChalliesALaCarte(
          removeDuplicates(recent)
        )
      )
    )
      .slice(0, 5)
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
  }

  return { normalizePost, processPosts }
}