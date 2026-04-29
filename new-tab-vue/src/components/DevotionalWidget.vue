<template>
  <div class="devotional">

    <div v-if="loading" class="devos-status">Loading devotionals...</div>
    <div v-else-if="error" class="devos-error">Unable to load devotionals</div>

    <div v-else class="devos-layout">

      <!-- TOP: Slots -->
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
            <span class="devo-duration" v-if="devo.duration">
              {{ devo.duration }} min read
            </span>
          </div>

          <h5 class="devo-list-title">{{ devo.title }}</h5>
          <h5 v-if="devo.pubDate" class="devo-pub-date">{{ devo.pubDate }}</h5>
        </div>
      </div>

      <!-- DETAIL -->
      <div class="devos-detail" v-if="selectedDevo">
        <audio v-if="selectedDevo.audiostream" :src="selectedDevo.audiostream" controls class="devo-audio" />
        <div>
          <span class="detail-period-badge" :class="selectedDevo.period">
            {{ selectedDevo.title }}
          </span>
        </div>

        <div ref="scrollBox" class="detail-body-container">
          
          <img
            v-if="selectedDevo.img"
            :src="selectedDevo.img"
            alt="Devo image"
            class="devo-card-image"
          />
          

          <p class="detail-verse">{{ selectedDevo.bibleVerse }}</p>
          <p class="detail-verse-ref">{{ selectedDevo.bibleRef }}</p>

          <div class="detail-body" v-html="selectedDevo.body"></div>
        </div>

        <a
          :href="selectedDevo.link"
          target="_blank"
          class="detail-link"
        >
          Read on source site →
        </a>
      </div>

      <div class="devos-detail devos-detail--empty" v-else>
        <p>Select a devotional to read</p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchT4LFeed, T4LDevotional } from '@/composables/feeds/devotional/uset4lFeed.js'
import { fetchMediaGratiaeFeed } from '@/composables/feeds/devotional/useMediaGratiaeFeed.js'
import { type Devotional } from '@/types/devoPost.js'

const loading = ref(true)
const error = ref(false)

const devotionals = ref<Devotional[]>([])
const selectedDevo = ref<Devotional | null>(null)

onMounted(async () => {
  try {
    const results = await Promise.allSettled([
      fetchT4LFeed(),
      fetchMediaGratiaeFeed()
    ])

    const tempDevotionals: Devotional[] = []

    for (const r of results) {
      if (r.status === 'fulfilled') {
        tempDevotionals.push( ...r.value.map(item => ({...item, type: 'generic' }))
        )
      } else {
        console.warn('Feed failed:', r.reason)
      }
    }

    devotionals.value = tempDevotionals
    selectedDevo.value = tempDevotionals[0] ?? null
  } catch (e) {
    error.value = true
    console.error(e)
  } finally {
    loading.value = false
  }
})

// function toggleSpeak(devo: Devotional | null) {
//   if (!devo) return

//   if (speakingDevo.value === devo) {
//     speechSynthesis.paused
//       ? speechSynthesis.resume()
//       : speechSynthesis.pause()

//     return
//   }

//   speechSynthesis.cancel()
//   speakingDevo.value = devo

//   const text = devo.body.replace(/<[^>]*>/g, ' ')

//   currentUtterance = new SpeechSynthesisUtterance(text)
//   currentUtterance.rate = 1
//   currentUtterance.pitch = 1
//   currentUtterance.lang = 'en-US'

//   currentUtterance.onend = () => {
//     speakingDevo.value = null
//   }

//   speechSynthesis.speak(currentUtterance)
// }

// function isSpeaking(devo: Devotional | null): boolean {
//   return (
//     !!devo &&
//     speakingDevo.value === devo &&
//     (speechSynthesis.speaking ||
//       speechSynthesis.paused)
//   )
// }

</script>

<style scoped>
.devotional {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
}

/* Layout */
.devos-layout {
  display: flex;
  flex-direction: column;
  max-width: 600px;
  
}

/* Top slots */
.devos-list {
  display: flex;
  flex-direction: row;
  gap: 6px;
  width: 100%;
  min-width: 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #1e293b;
  overflow-x: auto;
}

.devos-card {
  background: #1e293b;
  border-radius: 8px;
  min-width: 180px;
  flex-shrink: 0;
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

.devos-card.morning {
  border-left-color: #f59e0b;
}

.devos-card.morning.active {
  border-left-color: #fbbf24;
}

.devos-card.evening {
  border-left-color: #818cf8;
}

.devos-card.evening.active {
  border-left-color: #a5b4fc;
}

.devos-card.daily.active {
  border-left-color: #34d399;
}

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
  margin: 0 0 6px;
  line-height: 1;
}

.devo-pub-date {
  font-size: 9px;
  font-weight: 600;
  color: #94a3b8;
  margin: 0;
  line-height: 1;
}

.devo-duration {
  font-size: 9px;
  color: #f1f5f9;
}

/* Detail */
.devos-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;   /* critical fix */
  padding-left: 0;
  overflow: hidden;
  max-height: 300px;
}

.devos-detail--empty {
  align-items: center;
  justify-content: center;
  color: #475569;
  font-style: italic;
  font-size: 13px;
}

.detail-period-badge {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #64748b;
}

.detail-body-container {
  flex: 1;
  min-height: 0;   /* critical fix */
  overflow-y: auto;
  padding-right: 6px;
  max-height: 300px;
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

.detail-body {
  font-size: 12px;
  color: #94a3b8;
  line-height: 2;
  min-height: 200px;
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

.detail-link:hover {
  color: #93c5fd;
}

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

.devo-audio {
  width: 100%;
  height: 36px;
  margin-bottom: 8px;
  border-radius: 8px;
  opacity: 0.92;
}
</style>