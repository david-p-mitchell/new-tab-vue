<template>
<div class="wd-hourly-wrap">
          <div class="wd-hourly-scroll">
            <div
              v-for="(h, i) in hourly.slice(0,4)"
              :key="i"
              class="wd-hour-card"
              :class="{ now: h.isNow }"
            >
              <p class="wd-hour-time">{{ h.time }}</p>
              <div class="wd-hour-icon" v-html="h.icon"></div>
              <p class="wd-hour-temp">{{ h.tempC }}°</p>
              <div class="wd-hour-bar-wrap">
                <div class="wd-hour-bar" :style="{ width: h.barPct + '%' }"></div>
                
              </div>
              <p class="wd-hour-precip-perc">{{ h.barPct }}%</p>
              <p class="wd-hour-precip" v-if="h.precip > 0">{{ h.precip }}mm</p>
            </div>
          </div>
        </div>
</template>

<script setup lang="ts">
interface HourlyItem {
  time: string;
  isNow: boolean;
  tempC: number;
  icon: string;
  precip: number;
  barPct: number;
}

defineProps<{
  hourly: HourlyItem[];
}>();
</script>

<style scoped>
/* ── HOURLY ── */
.wd-hourly-wrap { overflow: hidden; margin-bottom: 4px; }
.wd-hourly-scroll {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.2) transparent;
}
.wd-hourly-scroll::-webkit-scrollbar { height: 4px; }
.wd-hourly-scroll::-webkit-scrollbar-track { background: transparent; }
.wd-hourly-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }

.wd-hour-card {
  flex-shrink: 0;
  padding: 0 4px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 14px;
  padding: 2px 3px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: background 0.2s;
}
.wd-hour-card.now {
  background: rgba(255,255,255,0.22);
  border-color: rgba(255,255,255,0.4);
}
.wd-hour-time { font-size: 8px; font-weight: 500; opacity: 0.75; line-height: 0.7; }
.wd-hour-icon { line-height: 0; }
.wd-hour-temp { font-size: 8px; font-weight: 600; line-height: 1; }

.wd-hour-bar-wrap {
  width: 36px;
  height: 4px;
  background: rgba(255,255,255,0.15);
  border-radius: 999px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}
.wd-hour-bar {
  height: 100%;
  background: rgba(255,255,255,0.65);
  border-radius: 999px;
  transition: height 0.3s;
}
.wd-hour-precip-perc { font-size: 8px; opacity: 0.6; line-height: 1.2; }
.wd-hour-precip { font-size: 7px; opacity: 0.6; line-height: 1.2; }
.invisible { visibility: hidden; }
</style>