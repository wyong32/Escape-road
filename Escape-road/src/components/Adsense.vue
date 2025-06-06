<template>
  <ins
    :key="adKey"
    class="adsbygoogle"
    style="display: block"
    :data-ad-client="adClient"
    :data-ad-slot="adSlot"
    :data-ad-format="adFormat"
    :data-full-width-responsive="fullWidthResponsive"
  ></ins>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps({
  adClient: {
    type: String,
    required: true,
  },
  adSlot: {
    type: String,
    required: true,
  },
  adFormat: {
    type: String,
    default: 'auto',
  },
  fullWidthResponsive: {
    type: Boolean,
    default: true,
  },
});

const route = useRoute();
const adKey = ref(0);

// This "smart" function requests an ad. It will automatically wait and retry
// if the global AdSense script isn't ready yet.
const pushAd = () => {
  // Check if the adsbygoogle script is loaded and ready.
  if (window.adsbygoogle) {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense push error:', e);
    }
  } else {
    // If not ready, wait a short moment and try again.
    // This handles the race condition on initial page load.
    setTimeout(pushAd, 50);
  }
};

// Watch for route changes to refresh the ad.
watch(
  () => route.path,
  (newPath, oldPath) => {
    // Do nothing if the path hasn't actually changed.
    if (newPath === oldPath) {
      return;
    }
    // Force the <ins> element to re-render by changing its key.
    adKey.value += 1;
    // Wait for the DOM to update, then push the ad to the new slot.
    nextTick(() => {
      pushAd();
    });
  }
);

// This handles the very first ad load when the component is mounted.
onMounted(() => {
  // Wait for the initial DOM to be ready before starting the ad push sequence.
  nextTick(() => {
      pushAd();
  });
});
</script> 