<template>
  <div class="wd-hourly-wrap">
    <div class="wd-hourly-scroll">
      <div
        v-for="(h, i) in hourly.slice(0,6)"
        :key="i"
        class="wd-hour-card"
        :class="[
          { now: h.isNow },
          weatherClassFromIcon(h.condition)
        ]"
      >
        <p class="wd-hour-time">{{ h.time }}</p>

        <div class="wd-hour-icon" v-html="h.icon"></div>

        <p class="wd-hour-temp">{{ h.tempC }}°</p>

        <div class="wd-hour-bar-wrap">
          <div
            class="wd-hour-bar"
            :style="{ width: h.barPct + '%' }"
          ></div>
        </div>

        <p class="wd-hour-precip-perc">{{ h.barPct }}%</p>

        <!-- <p class="wd-hour-precip" v-if="h.precip > 0">
          {{ h.precip }}mm
        </p> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WeatherCondition } from '../WeatherWidget.vue';
interface HourlyItem {
  time: string;
  isNow: boolean;
  tempC: number;
  icon: string;
  precip: number;
  barPct: number;
  condition: WeatherCondition;
}

defineProps<{
  hourly: HourlyItem[];
}>();

function weatherClassFromIcon(condition: WeatherCondition): string {
  console.log('Determining weather class for condition:', condition);

  if (condition === 'sunny') return 'sunny';
  if (condition === 'cloudy') return 'cloudy';
  if (condition === 'rainy') return 'rainy';
  if (condition === 'stormy') return 'stormy';
  if (condition === 'snowy') return 'snowy';
  if (condition === 'foggy') return 'foggy';

  return 'default';
}
</script>

<style scoped>
/* ── HOURLY WRAP ── */
.wd-hourly-wrap {
  overflow: hidden;
  margin-bottom: 4px;
}

.wd-hourly-scroll {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.2) transparent;
}

.wd-hourly-scroll::-webkit-scrollbar {
  height: 4px;
}

.wd-hourly-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.wd-hourly-scroll::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
}

/* ── CARD BASE ── */
.wd-hour-card {
  flex-shrink: 0;
  padding: 2px 4px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.2s ease;
}

.wd-hour-card.now {
  background: rgba(255,255,255,0.22);
  border-color: rgba(255,255,255,0.4);
  transform: scale(1.05);
}

/* ── TEXT ── */
.wd-hour-time {
  font-size: 8px;
  font-weight: 500;
  opacity: 0.75;
  line-height: 0.7;
}

.wd-hour-icon {
  line-height: 0;
}

.wd-hour-temp {
  font-size: 8px;
  font-weight: 600;
  line-height: 1;
}

/* ── BAR ── */
.wd-hour-bar-wrap {
  width: 36px;
  height: 4px;
  background: rgba(255,255,255,0.15);
  border-radius: 999px;
  overflow: hidden;
}

.wd-hour-bar {
  height: 100%;
  background: rgba(255,255,255,0.65);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.wd-hour-precip-perc {
  font-size: 8px;
  opacity: 0.6;
  line-height: 1.2;
}

/* ── WEATHER THEMES ── */
.wd-hour-card.sunny {
  background: linear-gradient(180deg, #f6c453, #d88d1d);
}

.wd-hour-card.cloudy {
  background: linear-gradient(180deg, #7c8796, #5e6875);
}

.wd-hour-card.rainy {
  background: linear-gradient(180deg, #4a74b5, #2f4e84);
}

.wd-hour-card.stormy {
  background: linear-gradient(180deg, #3a3a44, #1f1f25);
}

.wd-hour-card.snowy {
  background: linear-gradient(180deg, #e6f2ff, #cfe2f3);
  color: #1e2d3f;
}

.wd-hour-card.foggy {
  background: linear-gradient(180deg, #9ca3af, #6b7280);
}

.wd-hour-card.default {
  background: rgba(255,255,255,0.08);
}
</style>