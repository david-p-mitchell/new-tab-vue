<template>
    <div class="wd-bg-layer"></div>

    <div class="wd-shell">

      <!-- ── LEFT PANEL ── -->
      <aside class="wd-left">
        <header class="wd-header">
                <div style="display:flex; align-items:center; justify-content:space-between; padding-top:7px;">
          <div class="wd-location" @click="startEdit" v-if="!editingCity">
            <svg class="wd-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
            <p class="wd-city">{{ city }}</p>
            <svg class="wd-edit" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            
          </div>
          
          <div class="wd-location" v-else>
            <svg class="wd-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
            <input
              class="wd-city-input"
              v-model="cityInput"
              ref="cityInputRef"
              @keyup.enter="fetchWeather"
              @blur="fetchWeather"
              placeholder="Search city…"
              autocomplete="off" spellcheck="false"
            />
          </div>
          <NowOverview :mainIcon="mainIcon" :temp="temp" :unit="unit" :condition="condition" />

            <CurrentStats :feelsLike="feelsLike" :humidity="humidity" :wind="wind" :uvIndex="uvIndex" :sunrise="sunrise" :sunset="sunset" />
          </div>
        </header>

        <div v-if="loading" class="wd-loading">
          <div class="wd-spinner"></div>
          <p>Loading…</p>
        </div>

        <div v-else-if="error" class="wd-error">
          <p>{{ error }}</p>
          <button class="wd-retry" @click="fetchWeather">Retry</button>
        </div>

        <template v-else>
          

          
          <TodayRange :todayHi="todayHi" :todayLo="todayLo" :hilowStyle="hilowStyle" :hilowDotPos="hilowDotPos" />
        </template>
        <div class="wd-forecasts">
            <HourlyForecast :hourly="hourly" />
            <DailyForecast :daily="daily" :convertTemp="convertTemp" :dayFillStyle="dayFillStyle" />
         </div>
      </aside>

    </div>
</template>

<script lang="ts">
import { defineComponent, nextTick } from 'vue';

import CurrentStats from './weather/CurrentStats.vue';
import NowOverview from './weather/NowOverview.vue';
import TodayRange from './weather/TodayRange.vue';
import DailyForecast from './weather/DailyForecast.vue';
import HourlyForecast from './weather/HourlyForecast.vue';

type WeatherUnit = 'C' | 'F';

interface HourlyItem {
  time: string;
  isNow: boolean;
  tempC: number;
  icon: string;
  precip: number;
  barPct: number;
}

interface DailyItem {
  label: string;
  icon: string;
  condition: string;
  hiC: number;
  loC: number;
  precip: number;
}

export default defineComponent({
  name: 'WeatherDashboard',

  components: {
    CurrentStats,
    NowOverview,
    TodayRange,
    DailyForecast,
    HourlyForecast,
  },

  data() {
    return {
      city: 'Chatham',
      cityInput: '',
      editingCity: false as boolean,
      unit: 'C' as WeatherUnit,
      tab: 'hourly',
      loading: false,
      error: null as string | null,
      now: new Date(),
      timer: null as ReturnType<typeof setInterval> | null,

      // current
      rawTempC: null as number | null,
      rawFeelsC: null as number | null,
      humidity: null as number | null,
      rawWindKph: null as number | null,
      weatherCode: 0,
      condition: '',
      rawUV: null as number | null,
      rawVisibility: null as number | null,
      rawPressure: null as number | null,
      rawDewC: null as number | null,
      rawCloudCover: null as number | null,

      // today
      todayHiC: null as number | null,
      todayLoC: null as number | null,
      sunriseStr: '--',
      sunsetStr: '--',

      // forecasts
      hourly: [] as HourlyItem[],
      daily: [] as DailyItem[],
    };
  },

  computed: {
    temp(): string | number {
      return this.rawTempC !== null ? this.convertTemp(this.rawTempC) : '--';
    },

    feelsLike(): string | number {
      return this.rawFeelsC !== null ? this.convertTemp(this.rawFeelsC) : '--';
    },

    wind(): string | number {
      return this.rawWindKph !== null ? Math.round(this.rawWindKph) : '--';
    },

    uvIndex(): string | number {
      return this.rawUV !== null ? Math.round(this.rawUV) : '--';
    },

    visibility(): string {
      return this.rawVisibility !== null
        ? (this.rawVisibility / 1000).toFixed(1)
        : '--';
    },

    pressure(): string | number {
      return this.rawPressure !== null ? Math.round(this.rawPressure) : '--';
    },

    dewPoint(): string | number {
      return this.rawDewC !== null ? this.convertTemp(this.rawDewC) : '--';
    },

    cloudCover(): string | number {
      return this.rawCloudCover !== null ? Math.round(this.rawCloudCover) : '--';
    },

    sunrise(): string {
      return this.sunriseStr;
    },

    sunset(): string {
      return this.sunsetStr;
    },

    todayHi(): string | number {
      return this.todayHiC !== null ? this.convertTemp(this.todayHiC) : '--';
    },

    todayLo(): string | number {
      return this.todayLoC !== null ? this.convertTemp(this.todayLoC) : '--';
    },

    timeStr(): string {
      return this.now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });
    },

    dateStr(): string {
      return this.now.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    },

    skyTheme(): string {
      const c = this.weatherCode;
      if (!c || c <= 1) return 'sky-clear';
      if (c <= 3) return 'sky-cloudy';
      if (c <= 48) return 'sky-fog';
      if (c <= 67) return 'sky-rain';
      if (c <= 77) return 'sky-snow';
      if (c <= 82) return 'sky-shower';
      return 'sky-storm';
    },

    mainIcon(): string {
      return this.codeToSvg(this.weatherCode, 22);
    },

    hilowStyle(): Record<string, string> {
      if (this.todayHiC === null || this.todayLoC === null) return {};
      return { left: '0%', right: '0%' };
    },

    hilowDotPos(): string {
      if (
        this.rawTempC === null ||
        this.todayHiC === null ||
        this.todayLoC === null
      )
        return '50%';

      const range = this.todayHiC - this.todayLoC;
      if (range === 0) return '50%';

      const pct = ((this.rawTempC - this.todayLoC) / range) * 100;
      return Math.min(100, Math.max(0, pct)).toFixed(1) + '%';
    },
  },

  mounted() {
    this.fetchWeather();
    this.timer = setInterval(() => {
      this.now = new Date();
    }, 30000);
  },

  beforeUnmount() {
    if (this.timer) clearInterval(this.timer);
  },

  methods: {
    convertTemp(c: number | null | undefined): string | number {
      if (c === null || c === undefined) return '--';
      return this.unit === 'C'
        ? Math.round(c)
        : Math.round((c * 9) / 5 + 32);
    },

    startEdit(): void {
      this.cityInput = this.city;
      this.editingCity = true;

      nextTick(() => {
        const el = this.$refs.cityInputRef as HTMLInputElement | undefined;
        el?.focus();
      });
    },

    dayFillStyle(d: DailyItem): Record<string, string> {
      if (this.daily.length === 0) return {};

      const allLo = Math.min(...this.daily.map(x => x.loC));
      const allHi = Math.max(...this.daily.map(x => x.hiC));
      const range = allHi - allLo || 1;

      const left = ((d.loC - allLo) / range) * 100 + '%';
      const right = ((allHi - d.hiC) / range) * 100 + '%';

      return { left, right };
    },

    async fetchWeather(): Promise<void> {
      const target = (this.cityInput || '').trim() || this.city;

      this.editingCity = false;
      this.loading = true;
      this.error = null;

      try {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            target
          )}&countryCode=GB&count=4&language=en&format=json`
        );

        const geo = await geoRes.json();
        if (!geo.results?.length) throw new Error(`Could not find "${target}"`);

        const { name, latitude: lat, longitude: lon } = geo.results[0];
        this.city = name;

        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
          `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,uv_index,visibility,surface_pressure,dew_point_2m,cloud_cover` +
          `&hourly=temperature_2m,weather_code,precipitation,wind_speed_10m` +
          `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset,uv_index_max` +
          `&forecast_days=7&timezone=auto&models=ukmo_seamless`;

        const wxRes = await fetch(url);
        const wx = await wxRes.json();
        const cur = wx.current;

        this.rawTempC = cur.temperature_2m;
        this.rawFeelsC = cur.apparent_temperature;
        this.humidity = Math.round(cur.relative_humidity_2m);
        this.rawWindKph = cur.wind_speed_10m;
        this.weatherCode = cur.weather_code;
        this.condition = this.codeToLabel(cur.weather_code);
        this.rawUV = cur.uv_index;
        this.rawVisibility = cur.visibility;
        this.rawPressure = cur.surface_pressure;
        this.rawDewC = cur.dew_point_2m;
        this.rawCloudCover = cur.cloud_cover;

        this.todayHiC = wx.daily.temperature_2m_max[0];
        this.todayLoC = wx.daily.temperature_2m_min[0];
        this.sunriseStr = this.formatTime(wx.daily.sunrise[0]);
        this.sunsetStr = this.formatTime(wx.daily.sunset[0]);

        const nowHour = new Date().getHours();
        const temps = wx.hourly.temperature_2m;
        const allHourlyTemps = temps.filter(Boolean);

        const minT = Math.min(...allHourlyTemps);
        const maxT = Math.max(...allHourlyTemps);

        this.hourly = wx.hourly.time
          .slice(nowHour, nowHour + 24)
          .map((t: string, idx: number) => {
            const i = nowHour + idx;
            const tempC = wx.hourly.temperature_2m[i];

            const barPct =
              maxT === minT
                ? 50
                : Math.round(
                    ((tempC - minT) / (maxT - minT)) * 70 + 15
                  );

            const dt = new Date(t);

            return {
              time:
                idx === 0
                  ? 'Now'
                  : dt.getHours().toString().padStart(2, '0') + ':00',
              isNow: idx === 0,
              tempC,
              icon: this.codeToSvg(wx.hourly.weather_code[i], 22),
              precip:
                Math.round((wx.hourly.precipitation?.[i] || 0) * 10) / 10,
              barPct,
            };
          });

        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        this.daily = wx.daily.time.map((t: string, i: number) => {
          const d = new Date(t);

          return {
            label: i === 0 ? 'Today' : dayLabels[d.getDay()],
            icon: this.codeToSvg(wx.daily.weather_code[i], 22),
            condition: this.codeToLabel(wx.daily.weather_code[i]),
            hiC: wx.daily.temperature_2m_max[i],
            loC: wx.daily.temperature_2m_min[i],
            precip:
              Math.round(
                (wx.daily.precipitation_sum?.[i] || 0) * 10
              ) / 10,
          };
        });
      } catch (e: any) {
        this.error = e?.message || 'Failed to load weather';
      } finally {
        this.loading = false;
      }
    },

    formatTime(isoStr: string): string {
      if (!isoStr) return '--';
      const d = new Date(isoStr);
      return d.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });
    },

    codeToLabel(code: number): string {
      const map: Record<number, string> = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Icy fog',
        51: 'Light drizzle',
        53: 'Drizzle',
        55: 'Heavy drizzle',
        61: 'Light rain',
        63: 'Rain',
        65: 'Heavy rain',
        71: 'Light snow',
        73: 'Snow',
        75: 'Heavy snow',
        77: 'Snow grains',
        80: 'Light showers',
        81: 'Showers',
        82: 'Heavy showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm w/ hail',
        99: 'Severe thunderstorm',
      };

      return map[code] ?? 'Unknown';
    },

    codeToSvg(code: number, size = 40): string {
      const s = size;
      const sw = size > 40 ? 1.4 : 1.8;

      if (!code || code <= 1) return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round"><circle cx="12" cy="12" r="5" fill="currentColor" fill-opacity="0.18"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/></svg>`
      if (code <= 3) return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round"><path d="M18 10a4 4 0 0 0-7.93-.8A3 3 0 1 0 7 16h11a3 3 0 0 0 0-6z" fill="currentColor" fill-opacity="0.14"/></svg>`
      if (code <= 48) return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round"><path d="M3 12h18M3 7h4M17 7h4M3 17h4M17 17h4" opacity="0.5"/><path d="M18 10a4 4 0 0 0-7.93-.8A3 3 0 1 0 7 16h11a3 3 0 0 0 0-6z" fill="currentColor" fill-opacity="0.1"/></svg>`
      if (code >= 95) return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round"><path d="M18 10a4 4 0 0 0-7.93-.8A3 3 0 1 0 7 16h11a3 3 0 0 0 0-6z" fill="currentColor" fill-opacity="0.12"/><polyline points="13,14 11,18 14,18 12,22"/></svg>`
      if (code >= 71 && code <= 77) return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round"><path d="M18 10a4 4 0 0 0-7.93-.8A3 3 0 1 0 7 16h11a3 3 0 0 0 0-6z" fill="currentColor" fill-opacity="0.12"/><circle cx="9" cy="20" r="0.8" fill="currentColor"/><circle cx="12" cy="20" r="0.8" fill="currentColor"/><circle cx="15" cy="20" r="0.8" fill="currentColor"/></svg>`
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round"><path d="M18 10a4 4 0 0 0-7.93-.8A3 3 0 1 0 7 16h11a3 3 0 0 0 0-6z" fill="currentColor" fill-opacity="0.12"/><line x1="8" y1="19" x2="8" y2="21"/><line x1="12" y1="19" x2="12" y2="21"/><line x1="16" y1="19" x2="16" y2="21"/></svg>`
    },
  },
});
</script>

<style scoped>
/* @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Playfair+Display:wght@400;500&display=swap'); */

/* ── RESET ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
button { cursor: pointer; background: none; border: none; font-family: inherit; }

/* ── ROOT ── */
.wd-root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
  transition: background 1s ease;
}

.wd-bg-layer {
  position: absolute;
  inset: 0;
  opacity: 0.18;
  background-image: radial-gradient(ellipse at 20% 20%, rgba(255,255,255,0.6) 0%, transparent 60%),
                    radial-gradient(ellipse at 80% 80%, rgba(255,255,255,0.3) 0%, transparent 50%);
  pointer-events: none;
}

/* SKY THEMES */
.sky-clear  { background: linear-gradient(135deg, #0f4c96 0%, #1a73c8 40%, #4fa3e3 100%); color: #fff; }
.sky-cloudy { background: linear-gradient(135deg, #3d5467 0%, #607d8b 50%, #90a4ae 100%); color: #fff; }
.sky-fog    { background: linear-gradient(135deg, #546e7a 0%, #78909c 50%, #b0bec5 100%); color: #fff; }
.sky-rain   { background: linear-gradient(135deg, #1a3a5c 0%, #2c5f8a 50%, #5b89b4 100%); color: #fff; }
.sky-shower { background: linear-gradient(135deg, #1e3f5a 0%, #3a6a8a 50%, #6895b4 100%); color: #fff; }
.sky-snow   { background: linear-gradient(135deg, #546e7a 0%, #90a4ae 50%, #cfd8dc 100%); color: #fff; }
.sky-storm  { background: linear-gradient(135deg, #0d1b2a 0%, #1c2e40 50%, #2e4460 100%); color: #fff; }

/* ── SHELL ── */
.wd-shell {
  
  grid-template-columns: 450px 1fr;
  gap: 16px;
  width: 100%;
  max-width: 960px;
  position: relative;
  z-index: 1;
}

/* ── PANELS ── */
.wd-left, .wd-right {
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.22);
  border-radius: 20px;
  padding: 2px 6px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  max-width: 450px;
  width: 100%;
}

/* ── HEADER ── */

.wd-location {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  margin-bottom: 6px;
}

.wd-pin { width: 14px; height: 14px; opacity: 0.7; flex-shrink: 0; }
.wd-edit { width: 12px; height: 12px; opacity: 0.5; margin-left: 2px; }

.wd-city {
  font-size: 15px;
  font-weight: 500;
  border-bottom: 1px dashed rgba(255,255,255,0.45);
}
.wd-location:hover .wd-city { border-color: rgba(255,255,255,0.9); }

.wd-city-input {
  background: rgba(255,255,255,0.18);
  border: 1px solid rgba(255,255,255,0.45);
  border-radius: 8px;
  color: #fff;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  padding: 4px 10px;
  outline: none;
  width: 180px;
}
.wd-city-input::placeholder { color: rgba(255,255,255,0.55); }

.wd-datetime { display: flex; flex-direction: column; gap: 1px; }
.wd-time { font-size: 28px; font-weight: 300; line-height: 0.2; letter-spacing: -0.5px; }
.wd-date { font-size: 12px; opacity: 0.65; }

/* ── HERO ── */
.wd-loading {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 40px 0; opacity: 0.8; font-size: 14px;
}
.wd-spinner {
  width: 26px; height: 26px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff; border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.wd-error { text-align: center; padding: 32px 0; }
.wd-error p { font-size: 14px; opacity: 0.85; margin-bottom: 12px; }
.wd-retry {
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.4);
  border-radius: 8px;
  color: #fff; 
  font-size: 13px;
  padding: 6px 16px;
}

.wd-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
}


.wd-unit-switch {
  display: flex;
  gap: 2px;
  background: rgba(255,255,255,0.15);
  border-radius: 10px;
  padding: 3px;
  width: fit-content;
  margin-bottom: 18px;
}
.wd-unit-switch button {
  color: rgba(255,255,255,0.65);
  font-size: 9px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 8px;
  transition: background 0.2s, color 0.2s;
}
.wd-unit-switch button.on {
  background: rgba(255,255,255,0.25);
  color: #fff;
}

.wd-forecasts {
    display: flex;
    justify-content: space-between;
}



/* ── RESPONSIVE ── */
@media (max-width: 720px) {
  .wd-shell { grid-template-columns: 1fr; }
  .wd-extra-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>