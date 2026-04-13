<template>
  <div class="ci-news">

    <div v-if="loading" class="news-status">Loading news...</div>
    <div v-else-if="error" class="news-error">Unable to load news</div>

    <div v-else class="news-layout">

      <!-- LEFT: Article list -->
      <div class="news-list">
        <div
          v-for="(article, i) in sortedArticles"
          :key="i"
          class="news-card"
          :class="{ 'source-et': article.source === 'ET', 'source-ci': article.source === 'CI' }"
        >
          <a :href="article.link" target="_blank" class="news-card-link">
            <div class="news-card-text">

              <div class="news-list-header">

                <!-- META BLOCK (date + type responsive wrap) -->
                <div class="news-meta">
                  <div class="news-date-container">
                    {{ formatDate(article.pubDate) }}
                  </div>

                  <div v-if="article.source !== 'CI' && getNewsType(article) !== ''" class="news-type">
                    {{ getNewsType(article) }}
                  </div>
                </div>

                <h3 class="news-list-title">
                  {{ article.title }}
                </h3>

              </div>
            </div>
          </a>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { RssPostItem } from '../types/rssFeedItem'
import type { NewsArticle } from '../types/newsArticle'

const props = defineProps<{
  articles: NewsArticle[]
}>()

const loading = ref(false)
const error = ref(false)

let currentUtterance: SpeechSynthesisUtterance | null = null
const speakingArticle = ref<NewsArticle | null>(null)

  const sortedArticles = computed(() => {
  return [...props.articles].sort((a, b) => {
    const dateA = new Date(a.pubDate || 0).getTime()
    const dateB = new Date(b.pubDate || 0).getTime()

    return dateB - dateA // newest first
  })
})

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''

  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr

  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short'
  })
}

function getNewsType(newsArticle: NewsArticle) {
  if (newsArticle.categories) {
    const newsCategories = newsArticle.categories.filter(cat =>
      cat.toLowerCase().includes("news")
    )

    if (newsCategories.length > 0)
      return newsCategories[0].toLowerCase().replace("news", "")

    return ''
  }
}
</script>

<style scoped>
.ci-news {
  width: 100%;
  max-height:inherit;
}

/* ── Layout ── */
.news-layout {
  gap: 0;
  max-height: inherit;
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
  max-height: inherit;
}

.news-list::-webkit-scrollbar {
  width: 4px;
}

.news-list::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 3px;
}

.news-list::-webkit-scrollbar-track {
  background: transparent;
}

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

/* ET highlight */
.news-card.source-et {
  border-left-color: #ef4444;
}

.news-card.source-ci {
  border-left-color: #00B4DB;
}

.news-card-link {
  text-decoration: none;
  display: block;
  color: inherit;
}

.news-card-text {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.news-list-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 4px 0;
  gap: 2px;
}

/* NEW: responsive meta block */
.news-meta {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: baseline;
}

.news-date-container,
.news-type {
  font-size: 9px;
  font-weight: 600;
  color: #acacac;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  line-height: 1.2;
  min-width:35px;
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
</style>