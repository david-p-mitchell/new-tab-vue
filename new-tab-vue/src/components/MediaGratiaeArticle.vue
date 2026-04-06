<template>
  <div class="media-gratiae-devotional">

    <div v-if="loading" class="devos-status">Loading devotionals...</div>
    <div v-else-if="error" class="devos-error">Unable to load devotionals</div>

    <div v-else class="devos-list">
      <div
        v-for="devo in visibleDevotionals"
        :key="devo.period"
        class="media-gratiae-devo-card"
        :class="devo.period"
      >
        <div class="media-gratiae-devo-header-wrapper">
          <div class="media-gratiae-devo-header">
            <i :class="devo.period === 'morning' ? 'fa-solid fa-sun' : 'fa-solid fa-moon'"></i>
            <span class="media-gratiae-devo-period">{{ "Truth For Life" }} - {{ devo.duration }} minute read</span>
          </div>
          <button class="tts-button" @click="toggleSpeak(devo)">
            {{ isSpeaking(devo) ? '⏸️' : '🔊' }}
          </button>
        </div>

        <h3 class="media-gratiae-devo-title">{{ devo.title }}</h3>

        <div class="media-gratiae-devo-body-container">
          <div v-html="devo.body" class="media-gratiae-devo-body"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const loading = ref(true)
const error = ref(false)
const devotionals = ref([])

// TTS state
let currentUtterance = null
const speakingDevo = ref(null)

const FEEDS = [
  { url: 'https://feeds.feedburner.com/alistairbeggdailydevotional' },
]

function splitIntoParagraphs(text) {
  return text.replace(/<\/p>/gi, '</p><br/>');
}


function cacheGet(key) {
  const cached = localStorage.getItem(key)
  if (!cached) return null
  const { value, expiry } = JSON.parse(cached)
  if (Date.now() > expiry) {
    localStorage.removeItem(key)
    return null
  }
  return value
}

function cacheSet(key, value, ttlMs) {
  const obj = { value, expiry: Date.now() + ttlMs }
  localStorage.setItem(key, JSON.stringify(obj))
}

function readingTime(html) {
  const tempEl = document.createElement('div')
  tempEl.innerHTML = html
  const text = tempEl.textContent || tempEl.innerText || ""
  const wordCount = text.trim().split(/\s+/).length
  const wordsPerMinute = 200
  return Math.ceil(wordCount / wordsPerMinute)
}

async function loadDevo(url, period) {
  const cacheKey = `devos_${period}`
  let devo = cacheGet(cacheKey)
  //if (devo) return devo

  const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`
  const res = await fetch(api)
  if (!res.ok) throw new Error('Feed request failed')
  const data = await res.json()
  const item = data.items?.[0]
  if (!item) throw new Error('No devotional found')
  let rawHtml = item.description || item.content || ''
  const duration = readingTime(rawHtml)
    const body = splitIntoParagraphs(rawHtml)
  devo = {
    period,
    title: item.title || '',
    body,
    link: item.link || url,
    duration
  }

  cacheSet(cacheKey, devo, 24*60*60*1000)
  return devo
}

onMounted(async () => {
  try {
    const results = await Promise.all(FEEDS.map(f => loadDevo(f.url, f.period)))
    devotionals.value = results
  } catch (e) {
    error.value = true
    console.error('Devotional feed error:', e)
  } finally {
    loading.value = false
  }
})

const visibleDevotionals = computed(() => {
  const hour = new Date().getHours()
  return devotionals.value
})

// --- TTS Functions ---
function toggleSpeak(devo) {
  if (speakingDevo.value === devo) {
    if (speechSynthesis.paused) {
      speechSynthesis.resume()
    } else {
      speechSynthesis.pause()
    }
  } else {
    speechSynthesis.cancel()
    speakingDevo.value = devo

    const text = devo.body.replace(/<[^>]*>/g, ' ')
    currentUtterance = new SpeechSynthesisUtterance(text)
    currentUtterance.rate = 1
    currentUtterance.pitch = 1
    currentUtterance.lang = 'en-US'

    const voices = speechSynthesis.getVoices()
    const maleVoice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('male'))
    if (maleVoice) currentUtterance.voice = maleVoice

    currentUtterance.onend = () => {
      speakingDevo.value = null
    }

    speechSynthesis.speak(currentUtterance)
  }
}

function isSpeaking(devo) {
  return speakingDevo.value === devo && (speechSynthesis.speaking || speechSynthesis.paused)
}
</script>

<style>
.media-gratiae-devotional {
  display: flex;
  flex-direction: column;
  min-width: 260px;
  max-width: 500px;
  
}

.media-gratiae-devotional h2 {
  font-size: 1rem;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 2px;
}

.media-gratiae-devos-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.media-gratiae-devo-card {
  background: #1e293b;
  border-radius: 8px;
  padding: 12px;
  border-left: 3px solid #334155;
  transition: border-color 0.2s;
}

.media-gratiae-devo-card.morning { border-left-color: #f59e0b; }
.media-gratiae-devo-card.evening { border-left-color: #818cf8; }

.media-gratiae-devo-header-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.media-gratiae-devo-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.tts-button {
  background: #475569;
  color: #f1f5f9;
  border: none;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.tts-button:hover {
  background: #64748b;
}

.media-gratiae-devo-period {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
}

.media-gratiae-devo-title {
  font-size: 12px;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.media-gratiae-devo-body-container {
  max-height: 250px;
  overflow-y: auto;
  padding-right: 4px;
  max-width: 33ch;
  text-align: left;
}

.media-gratiae-devo-body-container::-webkit-scrollbar {
  width: 6px;
}

.media-gratiae-devo-body-container::-webkit-scrollbar-thumb {
  background-color: #475569;
  border-radius: 3px;
}

.media-gratiae-devo-body-container::-webkit-scrollbar-track {
  background-color: #1e293b;
}

.media-gratiae-devo-body {
  font-size: 11px;
  color: #94a3b8;
  line-height: 2;
  margin-bottom: 8px;
}

.media-gratiae-devo-body a {
    text-decoration: none;
    color: inherit; /* optional: keeps link color the same as surrounding text */
}

.media-gratiae-devo-body img {
  max-width: 10ch;
}

.media-gratiae-devo-link {
  font-size: 10px;
  color: #60a5fa;
  text-decoration: none;
  font-weight: 600;
}

.media-gratiae-devo-link:hover { color: #93c5fd; }

.media-gratiae-devos-status {
  color: #94a3b8;
  font-style: italic;
  font-size: 13px;
}

.media-gratiae-devos-error {
  color: #f87171;
  font-style: italic;
  font-size: 13px;
}
</style>