<template>
  <div class="dashboard">
    <p v-if="loading" class="feed-status">Loading feeds...</p>
    <p v-else-if="error" class="feed-error">Unable to load feeds</p>
    <div v-else class="card-grid">
      <FeedCard
        v-for="post  in posts"
        :key="post.link"
        :post="post"
        @remove="removePost"
        @clicked="markClicked"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import FeedCard from './FeedCard.vue'
import { useFeedProcessor } from '../composables/useFeedProcessor'
import { useFeedStorage } from '../composables/useFeedStorage'
import type { RSSFeedItem, RssPostItem } from '@/types/rssFeedItem'

import { fetchBannerOfTruthFeed } from '@/composables/feeds/useBannerOfTruthFeed'
import { fetchChalliesFeed } from '@/composables/feeds/challies/useChalliesMainFeed'
import { fetchCrosswayFeed } from '@/composables/feeds/useCrosswayFeed'
import { fetchDesiringGodFeed } from '@/composables/feeds/useDesiringGodFeed'
import { fetchEvangelicalTimesFeed } from '@/composables/feeds/useETFeed'
import { fetchLigonierFeed } from '@/composables/feeds/useLigionierFeed'
import { fetchReformation21Feed } from '@/composables/feeds/useRef21Feed'
import { fetchTgcFeed } from '@/composables/feeds/useTGCFeed'

const { processPosts } = useFeedProcessor()
const { saveSeenPosts, saveClickedPost, saveRemovedCard } = useFeedStorage()

/** State */
const posts = ref<RssPostItem[]>([])
const loading = ref<boolean>(true)
const error = ref<boolean>(false)

/** Load all feeds (IMPORT-BASED VERSION) */
async function loadAllFeeds(): Promise<void> {
  loading.value = true
  error.value = false

  try {
    const results = await Promise.allSettled([
      fetchBannerOfTruthFeed(),
      fetchChalliesFeed(),
      fetchCrosswayFeed(),
      fetchDesiringGodFeed(),
      fetchEvangelicalTimesFeed(),
      fetchLigonierFeed(),
      fetchReformation21Feed(),
      fetchTgcFeed()
    ])

    const allPosts: RssPostItem[] = []

    for (const r of results) {
  if (r.status === 'fulfilled') {
    const result = r.value.filter(post => post.genreType == 'generic')

    allPosts.push(
      ...result.map(item => ({
        ...item,
        type: 'generic', // or derive properly
      }))
    )
  } else {
    console.warn('Feed failed:', r.reason)
  }
}

    const processed = processPosts(allPosts)

    saveSeenPosts(processed.map(p => p.link))
    posts.value = processed

  } catch (e) {
    console.error(e)
    error.value = true
  } finally {
    loading.value = false
  }
}

/** Actions */
function removePost(link: string): void {
  saveRemovedCard(link)
  posts.value = posts.value.filter(p => p.link !== link)
}

function markClicked(link: string): void {
  saveClickedPost(link)
}

/** Lifecycle */
onMounted(loadAllFeeds)
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  max-width: 775px;
  min-width: 775px;
}

.dashboard h2 {
  font-size: 1rem;
  font-weight: 600;
  color: #94a3b8;
}

.card-grid {
  display: flex;
  flex-direction: row;
  gap: 6px;
  scroll-behavior: smooth;
}

.feed-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 4px;
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