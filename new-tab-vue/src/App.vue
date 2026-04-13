<template>
  <div class="container">
    <div style="
      display: grid;
      grid-template-columns: auto auto 475px;
      align-items: center;
      width: 100%;
    ">

      <!-- Empty left space -->
      <div></div>

      <!-- Center Clock + Search -->
      <div style="text-align: center;">
        <ClockWidget />
        <SearchBar />
        <QuickLinks />
      </div>

      <!-- Weather on right -->
      <div style="justify-self: end;">
        <WeatherWidget />
      </div>

    </div>

    <div class="dashboard-row">
      <FeedDashboard class="feeds-col" />
      <CIWidget :articles="newsItems" />
    </div>

    <div>
      <div style="display: flex; ">
      <DevotionalWidget />
      <img v-if="!imageFailed" :src="challiesImage" @error="imageFailed = true" />
      <YoutubeShortsWidget :videos="ytClips" />
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import ClockWidget from './components/ClockWidget.vue'
import SearchBar from './components/SearchBar.vue'
import QuickLinks from './components/QuickLinks.vue'
import FeedDashboard from './components/FeedDashboard.vue'
import DevotionalWidget from './components/DevotionalWidget.vue'
import CIWidget from './components/CIWidget.vue'
import WeatherWidget from './components/WeatherWidget.vue'
import { fetchChalliesImageFeed } from './composables/feeds/challies/useChalliesImageFeed'
import { fetchEvangelicalTimesFeed } from './composables/feeds/useETFeed'
import { fetchCINews } from './composables/feeds/useCIFeed'
import { useYoutubeFeed, YoutubeVideo } from './composables/feeds/Youtube/useDesiringGodClipFeed'
import { ref, onMounted } from 'vue'
import type { NewsArticle } from './types/newsArticle'
import { RssItem } from './types/rssFeedItem'
import YoutubeShortsWidget from './components/YoutubeShortsWidget.vue'

const newsItems = ref<NewsArticle[]>([])
const challiesImages = ref<RssItem[]>([])
const challiesImage = ref<string>('')
const imageFailed = ref<boolean>(false)
  const ytClips = ref<YoutubeVideo[] | null>(null)

onMounted(async () => {
  const etItems = await fetchEvangelicalTimesFeed()
  const ci = await fetchCINews()
  newsItems.value = [...etItems.filter(item => item.genreType === 'news'), ...ci]
  
  const challies = await fetchChalliesImageFeed()
  challiesImages.value = challies
  const chosenImage = challiesImages.value[Math.floor(Math.random() * challiesImages.value.length)]
  const newUrl = chosenImage.thumbnail!
  .replace("/Th/", "/M/")
  .replace("-Th.jpg", "-M.jpg");
  challiesImage.value = newUrl
  
})
onMounted(async () => {
  const desiringGodClips = await useYoutubeFeed().fetchFeed("PLAcB0f-21Xj0S8NbP6WFTXaAl9Cl9eQG3");
  const jeremyWalkerClips = await useYoutubeFeed().fetchFeed("PLydzd6kZnPWcLX79S68ZxKyuHF9naWwkN")
  const eastbourneGBCClips = await useYoutubeFeed().fetchFeed("PL6lnGA_aT9oQNEdha98cB4vRqAUi5pDB_")
  ytClips.value = [...desiringGodClips, ...jeremyWalkerClips, ...eastbourneGBCClips];
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Sora:wght@300;400;600&display=swap');
@import '@fortawesome/fontawesome-free/css/all.min.css';

.dashboard-row {
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: flex-start;
  max-height: 200px;
  margin-top:12px;
}

.dashboard-row {
  display: flex;
  align-items: stretch; /* key */
}

.feeds-col,
.ci-col {
  flex: 1;
  overflow: hidden; /* optional */
}

.feeds-col {
  flex: 1;
  min-width: 0;
}

body {
  margin: 0;
  font-family: 'Sora', sans-serif;
  background: #0f172a;
  color: white;
}

.container {
  padding: 12px 0;
  max-width: 1400px;
  margin: 0 auto;
}
</style>