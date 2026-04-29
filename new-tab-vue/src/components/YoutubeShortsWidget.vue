<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

export interface YoutubeVideo {
  id: string
  title: string,
  pubDate: string,
  thumbnail:string
}

const props = defineProps<{
  videos: YoutubeVideo[] | null
}>()

const shuffled = ref<YoutubeVideo[]>([])

// currently selected video
const selectedVideo = ref<YoutubeVideo | null>(null)
const selectedVideos = ref<YoutubeVideo[] | null>(null)

// pick a random video

function randomise() {
    if(!props.videos) return
  shuffled.value = shuffle(props.videos)
  
  selectedVideo.value = shuffled.value[0]
  selectedVideos.value = shuffled.value.slice(0, 3)
}
// initialise on load
onMounted(() => {
    if(props.videos !== null && props.videos.length > 0)  randomise()
})

watch(
  () => props.videos,
  () => {
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
  return `https://www.youtube.com/watch/${selectedVideo.value.id}?autoplay=0&rel=0`
})
</script>

<template>
  <div>
    <button class="reroll-btn" @click="randomise">
      🎲 Randomise
    </button>

    <div class="video-grid">
      <div
        v-for="video in selectedVideos"
        :key="video.id"
        class="video-card"
      >
        <a
          :href="`https://www.youtube.com/watch?v=${video.id}`"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            :src="video.thumbnail"
            :alt="video.title"
            class="thumbnail"
          />
        </a>

        <p class="yt-title">{{ video.title }}</p>
        <span class="yt-date">{{ video.pubDate }}</span>
      </div>
    </div>
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
  border-radius: 12px;
  max-height: 125px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 2px;
}

.video-card {
  border-radius: 12px;
}

.thumbnail {
  width: 100%;
  max-height:60px;
  object-fit: cover;
  border-radius: 12px;
}

.yt-title {
  font-size: 0.6rem;
  line-height: 1;
  margin: 0;
}

.yt-date {
  font-size: 0.6rem;
  color: gray;
}
</style>