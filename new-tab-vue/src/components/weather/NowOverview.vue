<template>
    <div class="wd-hero-icon" v-html="mainIcon" />
            <div class="wd-hero-temp">
              <p class="wd-temp-num">{{ temp }}</p>
              <p class="wd-temp-unit">°{{ unit }}</p>
            </div>
            <p class="wd-condition">{{ condition }}</p>
</template>
<script setup lang="ts">
defineProps<{
  mainIcon: string;
  temp: number | string;
  unit: string;
  condition: string;
}>();
</script>

<style scoped>
.wd-hero-icon { opacity: 0.92; flex-shrink: 0; width: 20px; }
.wd-hero-temp {
  display: flex;
  align-items: flex-start;
  line-height: 1;
}
.wd-temp-num {
  font-family: 'Playfair Display', serif;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: -1px;
  margin-bottom: 8px;
}
.wd-temp-unit {
  font-size: 9px;
  font-weight: 300;
  margin-top: 1px;
  margin-left:2px;
  opacity: 0.75;
}

.wd-condition {
  font-size: 10px;
  font-weight: 300;
  opacity: 0.85;
  margin-bottom: 10px;
  margin: 0 6px 6px 6px;
}
</style>