<template>
  <div class="wd-daily-wrap">
    <div class="wd-daily-scroll">
      <div
        v-for="(d, i) in daily.slice(1,4)"
        :key="i"
        class="wd-day-card"
        :class="{ today: i === 0 }"
      >
        <p class="wd-day-name">{{ d.label }}</p>

        <div class="wd-day-icon" v-html="d.icon"></div>

        <p class="wd-day-cond">{{ d.condition }}</p>

        <div class="wd-day-range">
          <span class="wd-day-lo">{{ convertTemp(d.loC) }}°</span>
          <div class="wd-day-bar-wrap">
            <div
              class="wd-day-bar"
              :style="dayFillStyle(d)"
            ></div>
          </div>
          <span class="wd-day-hi">{{ convertTemp(d.hiC) }}°</span>
        </div>

        <p class="wd-day-precip" v-if="d.precip > 0">
          {{ d.precip }}mm
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DailyItem {
  label: string;
  icon: string;
  condition: string;
  loC: number;
  hiC: number;
  precip: number;
}

defineProps<{
  daily: DailyItem[];
  convertTemp: (c: number) => number | string;
  dayFillStyle: (d: DailyItem) => Record<string, string>;
}>();
</script>

<style scoped>

/* ── DAILY WRAP ── */

.wd-daily-wrap {
  overflow: hidden;
  margin-bottom: 6px;
}

.wd-daily-scroll {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.2) transparent;
}

.wd-daily-scroll::-webkit-scrollbar { height: 4px; }
.wd-daily-scroll::-webkit-scrollbar-track { background: transparent; }
.wd-daily-scroll::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
}

/* ── CARD ── */

.wd-day-card {
  flex-shrink: 0;
  padding: 0 2px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: background 0.2s;
  line-height: 1.3;
}

.wd-day-card.today {
  background: rgba(255,255,255,0.22);
  border-color: rgba(255,255,255,0.4);
}

/* ── TEXT ── */

.wd-day-name {
  font-size: 9px;
  font-weight: 600;
  opacity: 0.8;
  line-height: 1;
}

.wd-day-icon {
  line-height: 0;
}

.wd-day-cond {
  font-size: 8px;
  opacity: 0.6;
  text-align: center;
  line-height: 1;
}

/* ── TEMP RANGE BAR ── */

.wd-day-range {
  display: flex;
  align-items: center;
  gap: 4px;
}

.wd-day-lo,
.wd-day-hi {
  font-size: 8px;
  font-weight: 600;
}

.wd-day-lo {
  opacity: 0.6;
}

.wd-day-bar-wrap {
  width: 32px;
  height: 4px;
  background: rgba(255,255,255,0.15);
  border-radius: 999px;
  overflow: hidden;
}

.wd-day-bar {
  height: 100%;
  background: rgba(255,255,255,0.65);
  border-radius: 999px;
}

/* ── PRECIP ── */

.wd-day-precip {
  font-size: 7px;
  opacity: 0.6;
  line-height: 1;
}

</style>