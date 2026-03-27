<template>
  <div class="clock">{{ time }}</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const time = ref('')

function updateClock() {
  time.value = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

let interval
onMounted(() => {
  updateClock()
  interval = setInterval(updateClock, 1000)
})
onUnmounted(() => clearInterval(interval))
</script>

<style scoped>
.clock {
  font-family: 'JetBrains Mono', monospace;
  font-size: 2rem;
  text-align: center;
  margin-bottom: 16px;
  letter-spacing: 0.05em;
  color: #e2e8f0;
}
</style>