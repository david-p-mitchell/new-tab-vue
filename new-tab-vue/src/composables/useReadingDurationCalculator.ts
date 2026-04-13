export function readingTime(html) {
  const el = document.createElement('div')
  el.innerHTML = html
  const words = (el.textContent || el.innerText || '').trim().split(/\s+/).length
  return Math.ceil(words / 200)
}