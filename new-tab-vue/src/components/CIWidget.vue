<template>
  <div class="ci-news">

    <div v-if="loading" class="news-status">Loading news...</div>
    <div v-else-if="error" class="news-error">Unable to load news</div>

    <div v-else class="news-layout">

      <!-- LEFT: Article list -->
      <div class="news-list">
        <div
          v-for="(article, i) in articles"
          :key="i"
          class="news-card"
          @click="selectedArticle = article"
        >
            <a :href="article.link" target="_blank" class="news-card-link">
          <div class="news-card-text">
            <div class="news-list-header">
                <span class="news-date">{{ article.date }}</span>
                <h3 class="news-list-title">{{ article.title }}</h3>
            </div>
          </div>
        </a>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const loading = ref(true)
const error = ref(false)
const articles = ref([])
const selectedArticle = ref(null)

let currentUtterance = null
const speakingArticle = ref(null)

const FEED_URL = 'https://www.christian.org.uk/news/england-wales/rssfeed/'

function cacheGet(key) {
  try {
    const cached = localStorage.getItem(key)
    if (!cached) return null
    const { value, expiry } = JSON.parse(cached)
    if (Date.now() > expiry) { localStorage.removeItem(key); return null }
    return value
  } catch { return null }
}

function cacheSet(key, value, ttlMs) {
  try {
    localStorage.setItem(key, JSON.stringify({ value, expiry: Date.now() + ttlMs }))
  } catch {}
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

function readingTime(html) {
  const el = document.createElement('div')
  el.innerHTML = html
  const words = (el.textContent || el.innerText || '').trim().split(/\s+/).length
  return Math.ceil(words / 200)
}

function stripImages(html) {
  return html.replace(/<img[^>]*>/gi, '')
}

async function loadNews() {
  const cacheKey = 'ci_news_feed'
  const cached = cacheGet(cacheKey)
  if (cached) return cached

  const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(FEED_URL)}`
  const res = await fetch(api)
  if (!res.ok) throw new Error('Feed request failed')
  const data = await res.json()
  if (!data.items?.length) throw new Error('No articles found')

  const items = data.items.map(item => ({
    title: item.title || '',
    date: formatDate(item.pubDate),
    body: stripImages(item.description || item.content || ''),
    link: item.link || FEED_URL,
    thumbnail: item.thumbnail || item.enclosure?.link || null,
    duration: readingTime(item.description || item.content || '')
  }))

  cacheSet(cacheKey, items, 30 * 60 * 1000) // 30 min cache
  return items
}

onMounted(async () => {
  try {
    const items = await loadNews()
    articles.value = items
    selectedArticle.value = items[0] ?? null
  } catch (e) {
    error.value = true
    console.error('CI News feed error:', e)
  } finally {
    loading.value = false
  }
})

function toggleSpeak(article) {
  if (speakingArticle.value === article) {
    speechSynthesis.paused ? speechSynthesis.resume() : speechSynthesis.pause()
  } else {
    speechSynthesis.cancel()
    speakingArticle.value = article
    const text = article.body.replace(/<[^>]*>/g, ' ')
    currentUtterance = new SpeechSynthesisUtterance(text)
    currentUtterance.rate = 1
    currentUtterance.pitch = 1
    currentUtterance.lang = 'en-GB'
    const voices = speechSynthesis.getVoices()
    const preferred = voices.find(v => v.lang.startsWith('en-GB')) || voices.find(v => v.lang.startsWith('en'))
    if (preferred) currentUtterance.voice = preferred
    currentUtterance.onend = () => { speakingArticle.value = null }
    speechSynthesis.speak(currentUtterance)
  }
}

function isSpeaking(article) {
  return speakingArticle.value === article && (speechSynthesis.speaking || speechSynthesis.paused)
}
</script>

<style scoped>
.ci-news {
  margin-top: 12px;
  width: 100%;
}

/* ── Layout ── */
.news-layout {
  gap: 0;
  min-height: 200px;
  max-height: 200px;
}

/* ── Left list ── */
.news-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 525px;
  min-width: 180px;
  flex-shrink: 0;
  padding-right: 12px;
  border-right: 1px solid #1e293b;
  overflow-y: auto;
  max-height: 175px;
}

.news-list::-webkit-scrollbar { width: 4px; }
.news-list::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
.news-list::-webkit-scrollbar-track { background: transparent; }

.news-card {
  background: #1e293b;
  border-radius: 8px;
  padding: 1px 4px;
  border-left: 3px solid #334155;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  flex-shrink: 0;
}

.news-card:hover {
  background: #263347;
}

.news-card.active {
  background: #263347;
  border-left-color: #f97316;
}

.news-date {
  font-size: 9px;
  font-weight: 600;
  color: #acacac;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 45px;
  max-height: 25px;
}

.news-card-link{
  text-decoration: none;
}

.news-card-text {
  display: flex;
  flex-direction: column;
  
  text-align: left;
}

.news-list-header {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}
.news-list-title {
  font-size: 11px;
  font-weight: 600;
  color: #cbd5e1;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-body {
  font-size: 10px;
  color: #94a3b8;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-decoration: none;
}

/* ── Right detail ── */


.detail-link:hover { color: #fb923c; }

/* ── Status / Error ── */
.news-status {
  color: #94a3b8;
  font-style: italic;
  font-size: 13px;
}

.news-error {
  color: #f87171;
  font-style: italic;
  font-size: 13px;
}
</style>