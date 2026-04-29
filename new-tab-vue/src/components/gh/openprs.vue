<template>
  <div class="pr-board" v-if="items.length > 0">
    <header class="board-header">
      <div class="header-top">
        <div class="author-badge">
          <img
            v-if="avatarUrl"
            :src="avatarUrl"
            :alt="author"
            class="avatar"
          />
          <div v-else class="avatar-placeholder">{{ author[0].toUpperCase() }}</div>
          <div class="author-info">
            <span class="author-label">pull requests</span>
            <span class="author-name"></span>
            
          </div>
        </div>
        <div class="stats-pill" v-if="!loading && !error">
          <span class="dot"></span>
          {{ items.length }} open
        </div>
        <button class="refresh-btn" @click="fetchPRs" :disabled="loading" title="Refresh">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ spinning: loading }">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
          </button>
      </div>
      <div class="header-rule"></div>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="state-container">
      <div class="spinner-track">
        <div class="spinner-fill"></div>
      </div>
      <p class="state-text">Fetching open pull requests…</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="state-container error-state">
      <svg class="state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p class="state-text">{{ error }}</p>
      <button class="retry-btn" @click="fetchPRs">Retry</button>
    </div>

    <!-- Empty -->
    <div v-else-if="items.length === 0" class="state-container">
      <svg class="state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 12h8M12 8v8"/>
      </svg>
      <p class="state-text">No open pull requests found.</p>
    </div>

    <!-- PR List -->
    <ul v-else class="pr-list">
      <li
        v-for="(pr, index) in items"
        :key="pr.id"
        class="pr-card"
        :style="{ '--index': index }"
      >

        <div class="pr-body">
            <div style="display:flex; width:100%; justify-content: space-between; align-items: center;">
                <div class="pr-meta-top">
                    <span class="pr-repo">{{ repoFromUrl(pr.repository_url) }}</span>
                    
                </div>
                <div style="margin-left:4px;">
                  <a :href="pr.html_url" target="_blank" rel="noopener noreferrer" class="pr-title">
                    {{ pr.title }}
                  </a>
                </div>
                <!-- <time class="pr-date" :datetime="pr.updated_at">
                    {{ formatDate(pr.updated_at) }}
                </time> -->
                <a :href="pr.html_url" target="_blank" rel="noopener noreferrer" class="pr-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M7 17L17 7M7 7h10v10"/>
                    </svg>
                </a>
            </div>
            <div style="display: flex;">
                
                <div class="pr-labels" v-if="pr.labels && pr.labels.length">
                <span
                    v-for="label in pr.labels"
                    :key="label.id"
                    class="label-chip"
                    :style="{ '--label-color': `#${label.color}` }"
                >
                    {{ label.name }}
                </span>
                </div>
            </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const author = (import.meta.env as Record<string, string>).VITE_GH_AUTHOR
import type { GitHubPRItem, GitHubSearchResponse, GitHubUser } from '../../types/GithubTypes'

/**
 * State
 */
const items = ref<GitHubPRItem[]>([])
const loading = ref<boolean>(true)
const error = ref<string | null>(null)
const avatarUrl = ref<string | null>(null)

/**
 * Fetch PRs
 */
async function fetchPRs(): Promise<void> {
  loading.value = true
  error.value = null

  try {
    const url = `https://api.github.com/search/issues?q=is:pr+is:open+assignee:${author}+archived:false`

    const res = await fetch(url, {
      headers: { Accept: 'application/vnd.github+json' }
    })

    if (!res.ok) {
      throw new Error(`GitHub API responded with ${res.status}`)
    }

    const data: GitHubSearchResponse = await res.json()
    
    items.value = data.items || []

    // avatar logic
    if (items.value.length > 0 && items.value[0].user?.avatar_url) {
      avatarUrl.value = items.value[0].user.avatar_url
    } else {
      const userRes = await fetch(`https://api.github.com/users/${author}`)

      if (userRes.ok) {
        const userData: GitHubUser = await userRes.json()
        avatarUrl.value = userData.avatar_url
      }
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      error.value = e.message
    } else {
      error.value = 'Failed to fetch pull requests.'
    }
  } finally {
    loading.value = false
  }
}

/**
 * Helper
 */
function repoFromUrl(url: string): string {
  if (!url) return ''
  
  let tempUrl = url.replace('https://api.github.com/repos/', '')
  if(tempUrl.includes('EnonBaptistChurch/ebcc-web-nuxt-static')) {
    tempUrl = 'Church Website'
  }
  if(tempUrl.includes('EnonBaptistChurch')) {
    tempUrl = tempUrl.replace('EnonBaptistChurch', 'EBC')
  }
  else if(tempUrl.includes(author)) {
    tempUrl = tempUrl.replace(author + '/', 'me/')
  }
  return tempUrl || ''
}

/**
 * Lifecycle
 */
onMounted(fetchPRs)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,300&display=swap');

/* ── Root ── */
.pr-board {
  --bg: #0d0f11;
  --surface: #13171b;
  --border: #1e2428;
  --accent: #c8f04a;
  --accent-dim: rgba(200, 240, 74, 0.12);
  --text-primary: #edf0f2;
  --text-secondary: #667580;
  --text-muted: #3d4850;
  --font-mono: 'DM Mono', monospace;
  --font-display: 'Fraunces', serif;
  --radius: 4px;

  background: var(--bg);
  color: var(--text-primary);
  font-family: var(--font-mono);
  padding: 4px 4px;
  max-width: 550px;  
  max-height: inherit;
}

/* ── Header ── */

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
}

.author-badge {
  display: flex;
  align-items: center;
  gap: 14px;
}

.avatar,
.avatar-placeholder {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--border);
}

.avatar-placeholder {
  background: var(--accent-dim);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-family: var(--font-display);
}

.author-info {
  display: flex;
  flex-direction: column;
  line-height: 1;
  font-size: 0.2rem;
  margin:0;
}

.author-label {
  font-size: 10px;
  text-transform: uppercase;
}

.author-name {
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.stats-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--accent-dim);
  color: var(--accent);
  font-size: 12px;
  padding: 2px 4px;
  border-radius: 20px;
  border: 1px solid rgba(200, 240, 74, 0.2);
  line-height: 1;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.header-rule {
  height: 1px;
  background: linear-gradient(90deg, var(--accent) 0%, var(--border) 40%, transparent 100%);
}

/* ── States ── */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  gap: 16px;
}

.state-icon {
  width: 40px;
  height: 40px;
  color: var(--text-muted);
}

.state-text {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

.error-state .state-icon {
  color: #ff6b6b;
}

.spinner-track {
  width: 120px;
  height: 2px;
  background: var(--border);
  border-radius: 2px;
  overflow: hidden;
}

.spinner-fill {
  height: 100%;
  width: 40%;
  background: var(--accent);
  border-radius: 2px;
  animation: slide 1.2s ease-in-out infinite;
}

@keyframes slide {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(350%); }
}

.retry-btn {
  background: var(--surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
  padding: 8px 18px;
  border-radius: var(--radius);
  font-family: var(--font-mono);
  font-size: 12px;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.retry-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

/* ── PR List ── */
.pr-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
  max-height: 250px;
  height:50%;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.pr-list::-webkit-scrollbar {
  width: 4px;
}

.pr-card {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  padding: 2px 0px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: border-color 0.2s, background 0.2s;
  animation: fadeUp 0.4s ease both;
  animation-delay: calc(var(--index) * 60ms);
  position: relative;
  width: 100%;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pr-card:hover {
  border-color: rgba(200, 240, 74, 0.3);
  background: #161b20;
}

.pr-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--accent);
  border-radius: var(--radius) 0 0 var(--radius);
  opacity: 0;
  transition: opacity 0.2s;
}

.pr-card:hover::before {
  opacity: 1;
}

.pr-index {
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.08em;
  padding-top: 3px;
  flex-shrink: 0;
  width: 22px;
  text-align: right;
}

.pr-body {
  flex: 1;
  min-width: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.pr-meta-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pr-repo {
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}

.pr-number {
  font-size: 11px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.pr-title {
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 300;
  color: var(--text-primary);
  text-decoration: none;
  line-height: 1.4;
  display: block;
  transition: color 0.2s;
}

.pr-title:hover {
  color: var(--accent);
}

.pr-meta-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.pr-labels {
  display: flex;
  flex-wrap: wrap;
  line-height: 1.2;
}

.label-chip {
  font-size: 10px;
  padding: 2px 2px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--label-color) 15%, transparent);
  color: var(--label-color);
  border: 1px solid color-mix(in srgb, var(--label-color) 30%, transparent);
  text-transform: lowercase;
}

.pr-date {
  font-size: 11px;
  color: var(--text-muted);
  flex-shrink: 0;
  margin-left: auto;
}

.pr-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s, color 0.2s;
  color: var(--text-secondary);
  margin-top: 2px;
}

.pr-arrow svg {
  width: 16px;
  height: 16px;
}

.pr-card:hover .pr-arrow {
  opacity: 1;
  color: var(--accent);
}

/* ── Footer ── */
.board-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--border);
  font-size: 11px;
  color: var(--text-muted);
}

.refresh-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  color: var(--accent);
}

.refresh-btn svg {
  width: 14px;
  height: 14px;
}

.refresh-btn svg.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ── Responsive ── */
@media (max-width: 480px) {
  .pr-board {
    padding: 32px 16px;
  }
  .pr-card {
    padding: 16px 14px;
  }
  .pr-index {
    display: none;
  }
  .author-name {
    font-size: 16px;
  }
}
</style>