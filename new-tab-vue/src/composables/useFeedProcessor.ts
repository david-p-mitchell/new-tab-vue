// composables/useFeedProcessor.ts
import { useFeedStorage } from './useFeedStorage'
import type { RssPostItem, RssItem } from '../types/rssFeedItem'
import { normalizePost } from '@/utils/normalizePost'


export function useFeedProcessor() {
  const { getSeenPosts, getClickedPosts, getRemovedCards } = useFeedStorage()

  function removeDuplicates(posts: RssPostItem[]): RssPostItem[] {
    const seen = new Set<string>()

    return posts.filter((post) => {
      const key = post.link.split('?')[0]
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  function limitChalliesALaCarte(posts: RssPostItem[]): RssPostItem[] {
    let kept = 0

    return posts.filter((post) => {
      if (
        post.source === 'Challies' &&
        post.title?.toLowerCase().includes('a la carte')
      ) {
        if (kept === 0 && Math.random() < 0.5) {
          kept++
          return true
        }
        return false
      }

      if (
        post.source === 'Media Gratiae' &&
        post.type === 'The Whole Counsel'
      ) {
        return false
      }

      return true
    })
  }

  function limitPerSource(posts: RssPostItem[], limit = 3): RssPostItem[] {
    const counts: Record<string, number> = {}

    return posts.filter((post) => {
      counts[post.source] = counts[post.source] || 0
      if (counts[post.source] >= limit) return false
      counts[post.source]++
      return true
    })
  }

  function rankPosts(posts: RssPostItem[]): RssPostItem[] {
    const seen = new Set(getSeenPosts())
    const clicked = new Set(getClickedPosts())
    const removed = getRemovedCards()

    const now = Date.now()

    return posts
      .filter((post) => !removed.has(post.link))
      .map((post) => {
        const ageHours =
          (now - new Date(post.pubDate).getTime()) / (1000 * 60 * 60)
        let withinSourceDays :boolean = true;
        if(post.sourceDays)
          withinSourceDays = ageHours <= post.sourceDays * 24
        const isSeen = seen.has(post.link)
        const isClicked = clicked.has(post.link)
        post.seen = isSeen
        let score = 0

        if (withinSourceDays) score += 3
        if (!isSeen) score += 2
        if(post.sourceDays)
        score += Math.max(0, 1 - ageHours / (post.sourceDays * 24))
        else score +=1;

        if (
          post.source === 'Challies' &&
          post.title?.toLowerCase().includes('a la carte')
        ) {
          score -= 1
        }

        if (isClicked) score -= 1.5

        score += Math.random()

        return { post, score }
      })
      .sort((a, b) => b.score - a.score)
      .map((x) => x.post)
  }

  function processPosts(rawPosts: RssPostItem[], limit: number=5): RssPostItem[] {
    const now = new Date()

    const recent = rawPosts.filter((post) => {
      const postDate = new Date(post.pubDate)
      const cutoff = new Date()
      if(post.sourceDays)
      cutoff.setDate(now.getDate() - post.sourceDays)
      else cutoff.setDate(now.getDate() - 3)
      return postDate >= cutoff
    })

    return limitPerSource(
      rankPosts(limitChalliesALaCarte(removeDuplicates(recent)))
    )
      .slice(0, limit)
      .sort(
        (a, b) =>
          new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      )
  }

  return { normalizePost, processPosts }
}