// composables/useFeedStorage.ts

type RemovedCard = {
  link: string
  time: number
}

export function useFeedStorage() {
  function getSeenPosts(): string[] {
    const stored = localStorage.getItem('seenPosts')
    return stored ? JSON.parse(stored) : []
  }

  function saveSeenPosts(ids: string[]): void {
    const seen = new Set(getSeenPosts())
    ids.forEach((id) => seen.add(id))

    localStorage.setItem(
      'seenPosts',
      JSON.stringify([...seen].slice(-500))
    )
  }

  function getClickedPosts(): string[] {
    const stored = localStorage.getItem('clickedPosts')
    return stored ? JSON.parse(stored) : []
  }

  function saveClickedPost(link: string): void {
    const clicked = new Set(getClickedPosts())
    clicked.add(link)

    localStorage.setItem(
      'clickedPosts',
      JSON.stringify([...clicked].slice(-500))
    )
  }

  function getRemovedCards(): Set<string> {
    const stored: RemovedCard[] = JSON.parse(
      localStorage.getItem('removedCards') || '[]'
    )

    const now = Date.now()

    const valid = stored.filter(
      (r) => now - r.time <= 24 * 60 * 60 * 1000
    )

    localStorage.setItem('removedCards', JSON.stringify(valid))

    return new Set(valid.map((r) => r.link))
  }

  function saveRemovedCard(link: string): void {
    const stored: RemovedCard[] = JSON.parse(
      localStorage.getItem('removedCards') || '[]'
    )

    const now = Date.now()

    const filtered = stored.filter(
      (r) => now - r.time <= 24 * 60 * 60 * 1000
    )

    filtered.push({ link, time: now })

    localStorage.setItem(
      'removedCards',
      JSON.stringify(filtered.slice(-500))
    )
  }

  return {
    getSeenPosts,
    saveSeenPosts,
    getClickedPosts,
    saveClickedPost,
    getRemovedCards,
    saveRemovedCard,
  }
}