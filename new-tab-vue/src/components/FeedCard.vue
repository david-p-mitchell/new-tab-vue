<template>
  <div class="card">
    <button class="remove-btn" @click.prevent="emit('remove', post.link)">
      &times;
    </button>

    <a
      :href="post.link"
      target="_blank"
      rel="noopener noreferrer"
      @click="emit('clicked', post.link)"
    >
      <img
        v-if="post.thumbnail"
        :src="post.thumbnail"
        :alt="post.title"
        class="card-img"
      />

      <h3>{{ post.title }}</h3>

      <p class="source">
        {{ post.source }}{{ post.categories?.length ? ' - ' + post.categories[0] : '' }}
      </p>

      <p>
        {{ post.author ? post.author + ' - ' : '' }}{{ ukDate }}
      </p>
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RssPostItem } from '@/types/rssFeedItem'
/** Props */
const props = defineProps<{
  post: RssPostItem
}>()

/** Emits */
const emit = defineEmits<{
  (e: 'remove', link: string): void
  (e: 'clicked', link: string): void
}>()

/** Computed date */
const ukDate = computed<string>(() => {
  if(props.post) {
  const date = new Date(props.post.pubDate)

  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(date)
}
return ''
})
</script>

<style scoped>
.card {
  position: relative;
  width: 150px;
  flex: 0 0 auto;
  background: #1e293b;
  color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.15s ease;
  line-height: 1.4;
}

.card:hover {
  transform: translateY(-2px);
}

.card a {
  display: block;
  color: inherit;
  text-decoration: none;
}

.card-img {
  width: 100%;
  height: 80px;
  object-fit: cover;
}

.card h3 {
  font-size: 10px;
  margin: 8px 8px 4px 8px;
}

.card p {
  font-size: 9px;
  color: #cbd5e1;
  margin: 0 8px 4px 8px;
}

.card .source {
  font-size: 10px;
  color: #60a5fa;
  margin: 0 8px 4px 8px;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(248, 113, 113, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: background 0.2s;
}

.remove-btn:hover {
  background: #f87171;
}
</style>