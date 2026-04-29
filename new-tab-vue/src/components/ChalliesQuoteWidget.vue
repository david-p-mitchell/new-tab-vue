<template>
    <img class="challies-image" v-if="!imageFailed" :src="challiesImage" @error="imageFailed = true" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchChalliesImageFeed } from '../composables/feeds/challies/useChalliesImageFeed'
import type { RssItem } from '../types/rssFeedItem'
const challiesImages = ref<RssItem[]>([])
const challiesImage = ref<string>('')
const imageFailed = ref<boolean>(false)

const props = defineProps<{
  size: string
}>()

onMounted(async () => {
  const challies = await fetchChalliesImageFeed()
  challiesImages.value = challies
  const chosenImage = challiesImages.value[Math.floor(Math.random() * challiesImages.value.length)]
  const newUrl = chosenImage.thumbnail!
  .replace("/Th/", `/${props.size}/`)
  .replace("-Th.jpg", `-${props.size}.jpg`);
  challiesImage.value = newUrl
})
</script>
<style scoped>
.challies-image {
  max-height: 400px;
  object-fit: contain;
  border-radius: 8px;
}
</style>