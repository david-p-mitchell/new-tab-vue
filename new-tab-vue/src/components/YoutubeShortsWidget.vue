<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

export interface YoutubeVideo {
  id: string
  title: string,
  pubDate: string
}

const props = defineProps<{
  videos: YoutubeVideo[] | null
}>()

const shuffled = ref<YoutubeVideo[]>([])

// currently selected video
const selectedVideo = ref<YoutubeVideo | null>(null)

// pick a random video

function randomise() {
    if(!props.videos) return
  shuffled.value = shuffle(props.videos)
  selectedVideo.value = shuffled.value[0]
}
// initialise on load
onMounted(() => {
    if(props.videos !== null && props.videos.length > 0)  randomise()
})

watch(
  () => props.videos,
  () => {
    console.log(props.videos)
    randomise()
  },
  { immediate: true, deep: true }
)

function shuffle(array: YoutubeVideo[]) {
  return [...array].sort(() => Math.random() - 0.5)
}





// computed embed URL
const embedUrl = computed(() => {
  if (!selectedVideo.value) return ''
  return `https://www.youtube.com/embed/${selectedVideo.value.id}?autoplay=0&rel=0`
})
</script>

<template>
  <div class="short-wrapper">

    <button class="reroll-btn" @click="randomise">
      🎲 Randomise
    </button>
    <div class="yt-meta-container">
    <p class="yt-title">{{ selectedVideo?.title  }}</p>
    <span class="yt-date">{{ " (" + selectedVideo?.pubDate + ")" }}</span>
    </div>

    <iframe
      v-if="selectedVideo"
      class="short-iframe"
      :src="embedUrl"
      :title="selectedVideo.title"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    />
  </div>
</template>

<style scoped>
.short-wrapper {
  width: 100%;
  max-width: 360px;
  aspect-ratio: 9 / 16;
  position: relative;
  max-height: 300px;
  max-width:170px;
}

.reroll-btn {
  top: 8px;
  left: 8px;
  z-index: 2;
  padding: 6px 10px;
  font-size: 12px;
  border-radius: 6px;
  background: black;
  color: white;
  border: none;
  cursor: pointer;
  opacity: 0.8;
  max-height: 300px;
  max-width:170px;
}

.short-iframe {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  max-height: 300px;
  max-width:170px;
}

.yt-meta-container {
    line-height: 0.5;
}
.yt-title {
    font-size: 0.5rem;
    line-height: 1;
}

.yt-date {
    font-size: 0.5rem;
}
</style>