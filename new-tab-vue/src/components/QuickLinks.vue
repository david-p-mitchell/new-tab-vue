<template>
  <div class="links">
    <a v-for="link in links" :key="link.href" :href="link.href" target="_blank">
      <i :class="link.icon"></i> {{ link.label }}
    </a>
  </div>
</template>

<script setup>
const links = [
  { href: 'https://chatgpt.com',                        icon: 'fa-solid fa-robot',        label: 'Chat GPT' },
  { href: 'https://enonbaptistchurch.github.io',         icon: 'fa-brands fa-github',      label: 'Enon Tools' },
  { href: 'https://github.com',                          icon: 'fa-brands fa-github',      label: 'GitHub' },
  { href: 'https://gmail.com',                           icon: 'fa-solid fa-envelope',     label: 'Email' },
  { href: 'https://calendar.google.com',                 icon: 'fa-solid fa-calendar',     label: 'Calendar' },
  { href: 'https://claude.ai',                           icon: 'fa-solid fa-wand-sparkles', label: 'Claude AI' },
]
</script>

<style scoped>
.links {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
  margin-bottom: 4px;
}

.links a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #cbd5e1;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.links a:hover {
  color: #60a5fa;
}
</style>