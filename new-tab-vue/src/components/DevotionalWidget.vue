<template>
  <div class="devotional">

    <div v-if="loading" class="devos-status">Loading devotionals...</div>
    <div v-else-if="error" class="devos-error">Unable to load devotionals</div>

    <div v-else class="devos-layout">

      <!-- LEFT: List -->
      <div class="devos-list">
        <div
          v-for="devo in devotionals"
          :key="devo.period"
          class="devos-card"
          :class="[devo.period, { active: selectedDevo === devo }]"
          @click="selectedDevo = devo"
        >
        <div>
          
          <span class="devo-period-badge">{{ devo.period || 'daily' }}</span>
          <span class="devo-duration" v-if="devo.duration"> - </span>
          <span class="devo-duration">{{ devo.duration }} min read</span>
          </div>
          <h5 class="devo-list-title">{{ devo.title }}</h5>
          <h5 v-if="devo.pubDate" class="devo-pub-date">{{ devo.pubDate }}</h5>
          
        </div>
      </div>

      <!-- RIGHT: Detail -->
      <div class="devos-detail" v-if="selectedDevo">
        <div>
          <span class="detail-period-badge" :class="selectedDevo.period">
            {{ selectedDevo.title }}
          </span>
        </div>
        <div class="detail-body-container">
          <img v-if="selectedDevo.img" :src="selectedDevo.img" alt="Devo image" class="devo-card-image" />
            <p class="detail-verse">{{ selectedDevo.bibleVerse }}</p>
            <p class="detail-verse-ref">{{ selectedDevo.bibleRef }}</p>
          <div class="detail-body" v-html="selectedDevo.body"></div>
        </div>
        <a :href="selectedDevo.link" target="_blank" class="detail-link">Read on source site →</a>
      </div>

      <div class="devos-detail devos-detail--empty" v-else>
        <p>Select a devotional to read</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useT4LParser, useT4LSpurgeonParser } from '../composables/useT4LParser.js'
import { useSpurgeonParser } from '../composables/useSpurgeonParser.js'
import { useMediaGratiaeDevotionProcessor } from '../composables/useMediaGratiaeDevotionProcessor.js'

const loading = ref(true)
const error = ref(false)
const devotionals = ref([])
const selectedDevo = ref(null)

let currentUtterance = null
const speakingDevo = ref(null)

const now = new Date();

const formatted = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}/`;
const FEEDS = [
  { url: 'https://feeds.feedburner.com/alistairbeggdailydevotional', period: 'daily' },
  { url: 'https://feeds.feedburner.com/truthforlifedailydevotional', period: 'Spurgeon' },
  { url: 'https://feeds.feedburner.com/hl-devos-spurgeon-morning', period: 'morning' },
  { url: 'https://feeds.feedburner.com/hl-devos-spurgeon-evening', period: 'evening' },
  { url: 'https://www.mediagratiae.org/blog?format=rss', period: 'Media Gratiae' }
]

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



async function loadDevo(url, period) {
  const cacheKey = `devos_${period}`
  let devo = cacheGet(cacheKey)

  const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`
  const res = await fetch(api)
  if (!res.ok) throw new Error('Feed request failed')
  const data = await res.json()
console.log(`Raw feed data for ${period}:`, data)
  if(period === 'Media Gratiae') {
    const recentItems = data.items.filter(item => {
      return item.categories?.[0] !== 'The Whole Counsel' 
    })
    if (recentItems.length === 0) throw new Error('No recent articles found')
    const item = recentItems[0]
      const mgPost = useMediaGratiaeDevotionProcessor(item);
      if (mgPost) {
      devo = { bibleRef: mgPost.bibleRef, bibleVerse: mgPost.bibleVerse, period, pubDate: mgPost.pubDate, img: mgPost.img, title: mgPost.title || '', body: mgPost.content, link: item.link || url, duration: mgPost.duration }
      cacheSet(cacheKey, devo, 24 * 60 * 60 * 1000)
      return devo
      }
  }
  const item = data.items?.[0]
  if (!item) throw new Error('No devotional found')

  if(item.link?.includes('https://www.truthforlife.org/devotionals/alistair-begg/')) {
    
    const t4lPost = useT4LParser(item);
    if (t4lPost) {
      console.log('Parsed T4L post:', t4lPost)
      devo = { bibleRef: t4lPost.bibleRef, bibleVerse: t4lPost.bibleVerse, period, img: t4lPost.img, title: t4lPost.title || '', body: t4lPost.content, link: item.link || url, duration: t4lPost.duration }
      cacheSet(cacheKey, devo, 24 * 60 * 60 * 1000)
      return devo
    }
  }
  else if(period.includes('Spurgeon')) {
    const t4lspurgeonPost = useT4LSpurgeonParser(item);
    if (t4lspurgeonPost) {
      devo = { bibleRef: t4lspurgeonPost.bibleRef, bibleVerse: t4lspurgeonPost.bibleVerse, period, img: t4lspurgeonPost.img, title: t4lspurgeonPost.title || '', body: t4lspurgeonPost.content, link: item.link || url, duration: t4lspurgeonPost.duration }
      cacheSet(cacheKey, devo, 24 * 60 * 60 * 1000)
      return devo
    }
  }
  else {
    const spurgeonPost = useSpurgeonParser(item);
    if (spurgeonPost) {
      devo = { bibleRef: spurgeonPost.bibleRef, bibleVerse: spurgeonPost.bibleVerse, period, img: spurgeonPost.img, title: spurgeonPost.title || '', body: spurgeonPost.content, link: item.link || url, duration: spurgeonPost.duration }
      cacheSet(cacheKey, devo, 24 * 60 * 60 * 1000)
      return devo
    }
  }

  // const rawHtml = item.description || item.content || ''
  // const duration = readingTime(rawHtml)
  // const body = splitIntoParagraphs(rawHtml)
  // devo = { period, title: item.title || '', body, link: item.link || url, duration }
  // cacheSet(cacheKey, devo, 24 * 60 * 60 * 1000)
  // return devo
}

onMounted(async () => {
  try {
    const results = await Promise.all(FEEDS.map(f => loadDevo(f.url, f.period)))
    devotionals.value = results
    selectedDevo.value = results[0] ?? null
  } catch (e) {
    error.value = true
    console.error('Devotional feed error:', e)
  } finally {
    loading.value = false
  }
})

function toggleSpeak(devo) {
  if (speakingDevo.value === devo) {
    speechSynthesis.paused ? speechSynthesis.resume() : speechSynthesis.pause()
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
    currentUtterance.onend = () => { speakingDevo.value = null }
    speechSynthesis.speak(currentUtterance)
  }
}

function isSpeaking(devo) {
  return speakingDevo.value === devo && (speechSynthesis.speaking || speechSynthesis.paused)
}
</script>

<style scoped>
.devotional {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 600px;
  margin-top : 20px;
}


/* ── Layout ── */
.devos-layout {
  display: flex;
  gap: 0;
  min-height: 300px;
  max-height: 300px;
}

/* ── Left list ── */
.devos-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 200px;
  min-width: 180px;
  flex-shrink: 0;
  padding-right: 12px;
  border-right: 1px solid #1e293b;
}

.devos-card {
  background: #1e293b;
  border-radius: 8px;
  padding: 2px;
  margin-bottom:2px;
  border-left: 3px solid #334155;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  display: flex;
  flex-direction: column;
}

.devos-card:hover {
  background: #263347;
}

.devos-card.active {
  background: #263347;
  border-left-color: #60a5fa;
}

.devos-card.morning { border-left-color: #f59e0b; }
.devos-card.morning.active { border-left-color: #fbbf24; }
.devos-card.evening { border-left-color: #818cf8; }
.devos-card.evening.active { border-left-color: #a5b4fc; }
.devos-card.daily.active { border-left-color: #34d399; }

.devo-period-badge {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #64748b;
}

.devo-list-title {
  font-size: 10px;
  font-weight: 600;
  color: #cbd5e1;
  margin: 0;
  margin-bottom:6px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.devo-pub-date {
  font-size: 9px;
  font-weight: 600;
  color: #94a3b8;
  margin: 0;
  line-height: 1.4;
}

.devos-card.active .devo-list-title {
  color: #f1f5f9;
}

.devo-duration {
  font-size: 9px;
  color: #f1f5f9;
}

/* ── Right detail ── */
.devos-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-left: 16px;
  min-width: 0;
  max-width:350px;
  max-height: 350px;
}

.devos-detail--empty {
  align-items: center;
  justify-content: center;
  color: #475569;
  font-style: italic;
  font-size: 13px;
}

.detail-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #1e293b;
}

.detail-header-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.detail-period-badge {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #64748b;
}
.detail-period-badge.morning { color: #f59e0b; }
.detail-period-badge.evening { color: #818cf8; }
.detail-period-badge.daily   { color: #34d399; }

.detail-title {
  font-size: 14px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
  line-height: 1.4;
}

.detail-duration {
  font-size: 9px;
  color: #475569;
}

.tts-button {
  background: #334155;
  color: #cbd5e1;
  border: none;
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
  flex-shrink: 0;
}

.tts-button:hover {
  background: #475569;
}

.detail-body-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 6px;
  max-height: 275px;
}

.devo-card-image {
  max-width: 100%;
  max-height: 80px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 8px;
}

.detail-verse {
  font-size: 11px;
  line-height: 1;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 8px;
}

.detail-verse-ref {
  font-size: 9px;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 8px;
}

.detail-body-container::-webkit-scrollbar { width: 5px; }
.detail-body-container::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
.detail-body-container::-webkit-scrollbar-track { background: transparent; }

.detail-body {
  font-size: 12px;
  color: #94a3b8;
  line-height: 2;
  min-height: 200px;
  max-height: 250px;
  width:35ch;
  text-align: left;
}

.detail-body :deep(a) {
  text-decoration: none;
  color: inherit;
}

.detail-body :deep(img) {
    max-width: 10ch;
    width: 10ch;
    height: auto;
}


.detail-link {
  display: inline-block;
  margin-top: 10px;
  font-size: 10px;
  font-weight: 600;
  color: #60a5fa;
  text-decoration: none;
}

.detail-link:hover { color: #93c5fd; }

/* ── Status / Error ── */
.devos-status {
  color: #94a3b8;
  font-style: italic;
  font-size: 13px;
}

.devos-error {
  color: #f87171;
  font-style: italic;
  font-size: 13px;
}
</style>