<template>
  <div class="spurgeon">
    <h2>Morning & Evening</h2>

    <div v-if="loading" class="devos-status">Loading devotionals...</div>
    <div v-else-if="error" class="devos-error">Unable to load devotionals</div>

    <div v-else class="devos-list">
      <div
        v-for="devo in visibleDevotionals"
        :key="devo.period"
        class="devo-card"
        :class="devo.period"
      >
        <div class="devo-header">
          <i :class="devo.period === 'morning' ? 'fa-solid fa-sun' : 'fa-solid fa-moon'"></i>
          <span class="devo-period">{{ devo.thoughtPeriod }}</span>
        </div>

        <h3 class="devo-title">{{ devo.title }}</h3>

        <div class="devo-body-container">
          <div v-html="devo.body" class="devo-body"/>
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

// Example feeds
const FEEDS = [
  { url: 'https://feeds.feedburner.com/hl-devos-spurgeon-morning', period: 'morning' },
  { url: 'https://feeds.feedburner.com/hl-devos-spurgeon-evening', period: 'evening' },
]

// Split text into paragraphs
function splitIntoParagraphs(text, sentencesPerPara = 3) {
  const sentences = text
    .replace(/\n/g, ' ')
    .split(/(?<=[.!?;:])\s+/)
    .filter(s => s.trim().length > 0)

  const paragraphs = []
  for (let i = 0; i < sentences.length; i += sentencesPerPara) {
    paragraphs.push('<p>' + sentences.slice(i, i + sentencesPerPara).join(' ') + '</p><br/>')
  }
  return paragraphs.join('')
}

// Extract Morning/Evening Thought heading
function extractThought(html) {
  const match = html.match(/<h4>(.*?)<\/h4>/i)
  const thoughtPeriod = match ? match[1] : ''
  const body = html.replace(/<h4>.*?<\/h4>/i, '')
  return { thoughtPeriod, body }
}

// Replace Bible references with ESV text
async function replaceReferencesWithESV(html) {
  const referenceRegex = /\b([1-3]?\s?[A-Za-z]+)\s(\d+:\d+(-\d+)?(,\s?\d+:\d+)*)\b/g
  const apiKey = 'YOUR_ESV_API_KEY' // get one from https://api.esv.org
  const matches = [...html.matchAll(referenceRegex)]
  let newHtml = html

  for (const match of matches) {
    const refText = match[0]
    try {
      const res = await fetch(`https://api.esv.org/v3/passage/text/?q=${encodeURIComponent(refText)}`, {
        headers: { Authorization: `Token ${apiKey}` },
      })
      const data = await res.json()
      const passage = data.passages?.[0]?.replace(/\n/g, ' ') || refText
      newHtml = newHtml.replace(refText, `<strong>${refText}:</strong> ${passage}`)
    } catch {
      // leave original text if API fails
      continue
    }
  }
  return newHtml
}

// Load a single devotional
async function loadDevo(url, period) {
  const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`
  const res = await fetch(api)
  if (!res.ok) throw new Error('Feed request failed')
  const data = await res.json()
  const item = data.items?.[0]
  if (!item) throw new Error('No devotional found')

  const rawHtml = item.description || item.content || ''
  const { thoughtPeriod, body: bodyHtml } = extractThought(rawHtml)
  const bodyWithRefs = await replaceReferencesWithESV(bodyHtml)
  const body = splitIntoParagraphs(bodyWithRefs, 3) // 3 sentences per paragraph

  return {
    period,
    title: item.title || '',
    thoughtPeriod: thoughtPeriod || (period === 'morning' ? 'Morning Thought' : 'Evening Thought'),
    body,
    link: item.link || url,
  }
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

// Filter visible devotionals by time
const visibleDevotionals = computed(() => {
  const hour = new Date().getHours()
  return devotionals.value.filter(d =>
    (hour < 12 && d.period === 'morning') || (hour >= 12 && d.period === 'evening')
  )
})
</script>

<style scoped>
.spurgeon {
  display: flex;
  flex-direction: column;
  min-width: 260px;
  max-width: 500px;
}

.spurgeon h2 {
  font-size: 1rem;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 2px;
}

.devos-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.devo-card {
  background: #1e293b;
  border-radius: 8px;
  padding: 12px;
  border-left: 3px solid #334155;
  transition: border-color 0.2s;
}

.devo-card.morning { border-left-color: #f59e0b; }
.devo-card.evening { border-left-color: #818cf8; }

.devo-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.devo-period {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
}

.devo-title {
  font-size: 12px;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.devo-body-container {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 4px;
}

.devo-body-container::-webkit-scrollbar {
  width: 6px;
}

.devo-body-container::-webkit-scrollbar-thumb {
  background-color: #475569;
  border-radius: 3px;
}

.devo-body-container::-webkit-scrollbar-track {
  background-color: #1e293b;
}

.devo-body {
  font-size: 11px;
  color: #94a3b8;
  line-height: 2;
  margin-bottom: 8px;
}

.devo-link {
  font-size: 10px;
  color: #60a5fa;
  text-decoration: none;
  font-weight: 600;
}

.devo-link:hover { color: #93c5fd; }

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