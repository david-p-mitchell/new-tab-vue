// composables/useFeedStorage.js

export function useFeedStorage() {
  function getSeenPosts() {
    const stored = localStorage.getItem('seenPosts')
    return stored ? JSON.parse(stored) : []
  }

  function saveSeenPosts(ids) {
    const seen = new Set(getSeenPosts())
    ids.forEach(id => seen.add(id))
    localStorage.setItem('seenPosts', JSON.stringify([...seen].slice(-500)))
  }

  function getClickedPosts() {
    const stored = localStorage.getItem('clickedPosts')
    return stored ? JSON.parse(stored) : []
  }

  function saveClickedPost(link) {
    const clicked = new Set(getClickedPosts())
    clicked.add(link)
    localStorage.setItem('clickedPosts', JSON.stringify([...clicked].slice(-500)))
  }

  function getRemovedCards() {
    const stored = JSON.parse(localStorage.getItem('removedCards') || '[]')
    const now = Date.now()
    const valid = stored.filter(r => now - r.time <= 24 * 60 * 60 * 1000)
    localStorage.setItem('removedCards', JSON.stringify(valid))
    return new Set(valid.map(r => r.link))
  }

  function saveRemovedCard(link) {
    const stored = JSON.parse(localStorage.getItem('removedCards') || '[]')
    const now = Date.now()
    const filtered = stored.filter(r => now - r.time <= 24 * 60 * 60 * 1000)
    filtered.push({ link, time: now })
    localStorage.setItem('removedCards', JSON.stringify(filtered.slice(-500)))
  }

  return { getSeenPosts, saveSeenPosts, getClickedPosts, saveClickedPost, getRemovedCards, saveRemovedCard }
}