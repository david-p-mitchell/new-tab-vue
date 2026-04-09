<template>
    <div class="wd-hilow">
            <p class="wd-hilow-lo">{{ todayLo }}°</p>
            <div class="wd-hilow-track">
              <div class="wd-hilow-fill" :style="hilowStyle"></div>
              <div class="wd-hilow-dot" :style="{ left: hilowDotPos }"></div>
            </div>
            <p class="wd-hilow-hi">{{ todayHi }}°</p>
          </div>
</template>

<script setup>
defineProps({
  todayHi: { type: String, required: true },
  todayLo: { type: String, required: true },
  hilowStyle: { type: Object, required: true},
  hilowDotPos: { type: String, required: true }
})
</script>

<style scoped>
/* ── HI/LOW BAR ── */
.wd-hilow {
  display: flex;
  align-items: center;
  gap: 3px;
  width:95%;
  margin: 0 auto;
  line-height: 1.5;
}
.wd-hilow-lo, .wd-hilow-hi { font-size: 9px; font-weight: 500; min-width: 24px; }
.wd-hilow-hi { text-align: right; }
.wd-hilow-track {
  flex: 1;
  height: 2px;
  background: rgba(255,255,255,0.2);
  border-radius: 999px;
  position: relative;
}
.wd-hilow-fill {
  position: absolute;
  inset-block: 0;
  background: rgba(255,255,255,0.55);
  border-radius: 999px;
  left: 0; right: 0;
}
.wd-hilow-dot {
  position: absolute;
  top: 50%; transform: translate(-50%, -50%);
  width: 5px; height: 5px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(255,255,255,0.4);
}
</style>