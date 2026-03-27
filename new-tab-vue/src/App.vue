<template>
  <div class="container">
    <ClockWidget />
    <SearchBar />
    <QuickLinks />
    <div class="bottom-row">
      <FeedDashboard class="feeds-col" />
      <SpurgeonDevotional />
    </div>
  </div>
</template>

<script setup>
import ClockWidget from './components/ClockWidget.vue'
import SearchBar from './components/SearchBar.vue'
import QuickLinks from './components/QuickLinks.vue'
import FeedDashboard from './components/FeedDashboard.vue'
import SpurgeonDevotional from './components/SpurgeonDevotional.vue'
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Sora:wght@300;400;600&display=swap');
@import '@fortawesome/fontawesome-free/css/all.min.css';

.bottom-row {
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: flex-start;
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
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}
</style>