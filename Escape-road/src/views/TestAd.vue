<template>
  <div class="test-container">
    <h1>AdSense Test Page</h1>
    <p>This page is designed to test AdSense functionality in a clean environment.</p>
    <p>
      If you can see an ad below, it means the fundamental ad loading and component logic is working correctly.
    </p>
    <hr />

    <div class="ad-wrapper">
      <p>Top Ad Slot:</p>
      <Adsense
        ad-client="ca-pub-5437957765171705"
        ad-slot="2049492927"
        style="width: 728px; height: 90px; border: 1px solid #ccc;"
      />
    </div>

    <hr />
    <p>
      <router-link to="/">Go back to Home</router-link>
    </p>
  </div>
</template>

<script setup>
import Adsense from '../components/Adsense.vue';
</script>

<style scoped>
.test-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  font-family: sans-serif;
  line-height: 1.6;
}
.ad-wrapper {
  margin: 40px 0;
  padding: 20px;
  border: 2px dashed #f00;
  text-align: center;
}
</style> 