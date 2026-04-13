const CACHE_TTL = 3 * 60 * 60 * 1000 // 3 hours

export function getCachedFeed(cacheKey: string) {
  if (typeof window === 'undefined') return null

  const raw = localStorage.getItem(cacheKey)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)

    if (Date.now() > parsed.expires) {
      localStorage.removeItem(cacheKey)
      return null
    }

    return parsed.data
  } catch {
    localStorage.removeItem(cacheKey)
    return null
  }
}

export function setCachedFeed(cacheKey: string, data: any) {
  if (typeof window === 'undefined') return

  localStorage.setItem(
    cacheKey,
    JSON.stringify({
      data,
      expires: Date.now() + CACHE_TTL,
    })
  )
}