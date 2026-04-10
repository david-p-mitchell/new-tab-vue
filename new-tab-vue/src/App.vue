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
      <CIWidget :articles="items" />
    </div>

    <div>
      <DevotionalWidget />
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

import { fetchEvangelicalTimesFeed } from './composables/feeds/useETFeed'
import { fetchCINews } from './composables/feeds/useCIFeed'
import { ref, onMounted } from 'vue'
import type { NewsArticle } from './types/newsArticle'

const items = ref<NewsArticle[]>([])

onMounted(async () => {
  const etItems = await fetchEvangelicalTimesFeed()
  const ci = await fetchCINews()
  items.value = [...etItems.filter(item => item.type === 'news'), ...ci]
  console.log('News items loaded:', items.value)
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