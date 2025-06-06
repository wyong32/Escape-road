<template>
  <div>
    <ResourcePreloader />
    <RouterView />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import ResourcePreloader from './components/ResourcePreloader.vue'

// Load the Google AdSense script once when the app is first mounted.
onMounted(() => {
  if (document.querySelector('script[src*="adsbygoogle.js"]')) {
    return
  }
  const script = document.createElement('script')
  script.async = true
  script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5437957765171705'
  script.crossOrigin = 'anonymous'
  document.head.appendChild(script)
})
</script>
