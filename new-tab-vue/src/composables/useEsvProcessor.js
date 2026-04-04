export async function replaceRefWithESV(ref) {
  const apiKey = 'YOUR_ESV_API_KEY'
    const cacheKey = `esv_${ref}`
    let passage = cacheGet(cacheKey)
    if (!passage) {
      try {
        const res = await fetch(`https://api.esv.org/v3/passage/text/?q=${encodeURIComponent(ref)}`, {
          headers: { Authorization: `Token ${apiKey}` },
        })
        const data = await res.json()
        passage = data.passages?.[0]?.replace(/\n/g, ' ') || ref
        cacheSet(cacheKey, passage, 24*60*60*1000)
      } catch {
        return ref
      }
    }
    return `<strong>${refText}:</strong> ${passage}`
}

function cacheGet(key) {
  const cached = localStorage.getItem(key)
  if (!cached) return null
  const { value, expiry } = JSON.parse(cached)
  if (Date.now() > expiry) { localStorage.removeItem(key); return null }
  return value
}

function cacheSet(key, value, ttlMs) {
  localStorage.setItem(key, JSON.stringify({ value, expiry: Date.now() + ttlMs }))
}