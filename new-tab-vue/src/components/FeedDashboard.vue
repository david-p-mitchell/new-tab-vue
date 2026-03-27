<template>
  <div class="dashboard">
    <h2>Christian Feeds</h2>
    <p v-if="loading" class="feed-status">Loading feeds...</p>
    <p v-else-if="error" class="feed-error">Unable to load feeds</p>
    <div v-else class="card-grid">
      <FeedCard
        v-for="post in posts"
        :key="post.link"
        :post="post"
        @remove="removePost"
        @clicked="markClicked"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import FeedCard from './FeedCard.vue'
import { useFeedProcessor } from '../composables/useFeedProcessor.js'
import { useFeedStorage } from '../composables/useFeedStorage.js'

const { normalizePost, processPosts } = useFeedProcessor()
const { saveSeenPosts, saveClickedPost, saveRemovedCard } = useFeedStorage()

const posts = ref([])
const loading = ref(true)
const error = ref(false)

const FEED_SOURCES = [
  { url: 'https://www.challies.com/feed/',                          name: 'Challies',      days: 3  },
  { url: 'https://www.thegospelcoalition.org/feed/',               name: 'TGC',           days: 3  },
  { url: 'https://www.evangelical-times.org/rss/',                 name: 'ET',            days: 5  },
  { url: 'https://www.crossway.org/articles/rss/',                 name: 'Crossway',      days: 3  },
  { url: 'https://www.christian.org.uk/news/england-wales/rssfeed/', name: 'CI',          days: 7  },
  { url: 'https://www.mediagratiae.org/blog?format=rss',           name: 'Media Gratiae', days: 14 },
  { url: 'https://www.ligonier.org/rss.xml',                       name: 'Ligonier',      days: 2  },
]

async function loadFeed(url, sourceName, days) {
  try {
    const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`
    const res = await fetch(api)
    if (!res.ok) throw new Error()
    const data = await res.json()
    if (!data.items) throw new Error()
    return data.items.slice(0, 20).map(item => normalizePost(item, sourceName, days))
  } catch {
    console.warn(`Feed failed: ${url}, skipping.`)
    return []
  }
}

async function loadAllFeeds() {
  loading.value = true
  error.value = false
  try {
    const allArrays = await Promise.all(
      FEED_SOURCES.map(f => loadFeed(f.url, f.name, f.days))
    )
    const processed = processPosts(allArrays.flat())
    saveSeenPosts(processed.map(p => p.link))
    posts.value = processed
  } catch (e) {
    error.value = true
    console.error(e)
  } finally {
    loading.value = false
  }
}

function removePost(link) {
  saveRemovedCard(link)
  posts.value = posts.value.filter(p => p.link !== link)
}

function markClicked(link) {
  saveClickedPost(link)
}

onMounted(loadAllFeeds)
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  max-width: 800px;
}

.dashboard h2 {
  font-size: 1rem;
  font-weight: 600;
  color: #94a3b8;
  
  margin-bottom: 12px;
}

.card-grid {
  display: flex;
  flex-direction: row;
  gap: 6px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding-bottom: 12px;
}

.feed-status {
  color: #94a3b8;
  font-style: italic;
}

.feed-error {
  color: #f87171;
  font-style: italic;
}
</style>