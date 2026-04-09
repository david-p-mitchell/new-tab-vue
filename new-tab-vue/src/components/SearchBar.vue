<template>
  <div class="search-wrapper">
    <input
      name="search"
      v-model="query"
      @input="fetchSuggestions"
      @keydown.enter="doSearch"
      @keydown.esc="suggestions = []"
      placeholder="Search the web..."
      autofocus
      class="search-input"
    />
    <div v-if="suggestions.length" class="suggestions">
      <div
        v-for="s in suggestions"
        :key="s"
        class="suggestion-item"
        @click="selectSuggestion(s)"
      >{{ s }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const query = ref('')
const suggestions = ref([])

async function fetchSuggestions() {
  if (!query.value) { suggestions.value = []; return }
  try {
    const res = await fetch(
  `https://api.allorigins.win/raw?url=${encodeURIComponent(
    `https://suggestqueries.google.com/complete/search?client=firefox&q=${query.value}`
  )}`
)
    const data = await res.json()
    suggestions.value = data[1] || []
  } catch (e) {
    console.error('Suggest error:', e)
  }
}

function selectSuggestion(s) {
  query.value = s
  suggestions.value = []
  window.location.href = `https://www.google.com/search?q=${encodeURIComponent(s)}`
}

function doSearch() {
  if (query.value) {
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query.value)}`
  }
}
</script>

<style scoped>
.search-wrapper {
  position: relative;
  max-width: 600px;
  margin: 15px auto;
}

.search-input {
  width: 100%;
  padding: 10px 14px;
  font-size: 16px;
  font-family: 'Sora', sans-serif;
  box-sizing: border-box;
  border-radius: 8px;
  border: none;
  outline: none;
  background: #1e293b;
  color: white;
}

.search-input::placeholder {
  color: #64748b;
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;

  background: #1e293b;
  border: 1px solid #334155;
  border-top: none;

  border-radius: 0 0 8px 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 50;
}

.suggestion-item {
  padding: 8px 12px;
  cursor: pointer;
  color: #cbd5e1;
  font-size: 14px;
}

.suggestion-item:hover {
  background: #334155;
}
</style>