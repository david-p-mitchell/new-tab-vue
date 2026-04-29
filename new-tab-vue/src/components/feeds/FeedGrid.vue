<template>

<div class="feed-grid">

  <FeedCard
    v-for="post in posts"
    :key="post.guid"
    :post="post"
  />

</div>

</template>

<script setup>
import { ref, onMounted } from "vue"
import FeedCard from "./FeedCard.vue"

const posts = ref([])

const feeds = [
  {url:"https://www.challies.com/feed/", source:"Challies"},
  {url:"https://www.thegospelcoalition.org/feed/", source:"TGC"}
]

async function loadFeeds(){

  const results = await Promise.all(
    feeds.map(async f => {

      const res = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(f.url)}`
      )

      const data = await res.json()

      return data.items.map(i => ({
        ...i,
        source: f.source
      }))
    })
  )

  posts.value =
    results.flat()
    .sort((a,b)=> new Date(b.pubDate)-new Date(a.pubDate))
}

onMounted(loadFeeds)
</script>