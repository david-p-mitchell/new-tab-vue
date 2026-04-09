<template>
    <div class="wd-stat-grid">
        <div class="wd-stat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>
            <p class="wd-stat-val">{{ feelsLike }}°</p>
        </div>
        <div class="wd-stat">
            <p>Humidity</p>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
            <p class="wd-stat-val">{{ humidity }}%</p>
            
            
        </div>
        <div class="wd-stat">
            <p>Wind</p>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>
            <p class="wd-stat-val">{{ wind }} <small>km/h</small></p>
        </div>
        <div class="wd-stat">
            <p>UV   </p>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            
            <p class="wd-stat-val">{{ uvIndex }}</p>
        </div>
        <div class="wd-stat">
            <p>Sunrise</p>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="9" x2="12" y2="2"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/></svg>
            <p class="wd-stat-val">{{ sunrise }}</p>
            
        </div>
        <div class="wd-stat">
            <p>Sunset</p>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="9" x2="12" y2="2"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/></svg>
            <p class="wd-stat-val">{{ sunset }}</p>
        </div>
    </div>
</template>
<script setup>
defineProps({
    feelsLike: Number,
    humidity: Number,
    wind: Number,
    uvIndex: Number,
    sunrise: String,
    sunset: String
})
</script>

<style scoped>
.wd-stat-grid {
  display: flex;
}
.wd-stat {
  display: flex;
  flex-direction: column;   /* Stack vertically */
  align-items: center;      /* Center horizontally */
  justify-content: center;
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  text-align: center;
  line-height: 0.9;
  margin:0 2px;
}

.wd-stat svg {
  width: 13px;
  height: 18px;
  opacity: 0.7;
  
}

.wd-stat-val {
  font-size: 11px;
  font-weight: 500;
}

.wd-stat p {
  font-size: 10px;
  opacity: 0.6;
  margin:0;
  padding:0;
}
</style>