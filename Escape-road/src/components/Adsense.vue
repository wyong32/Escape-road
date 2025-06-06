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

const pushAd = () => {
  nextTick(() => {
    try {
      // Push an empty object to let AdSense know to process a new ad slot.
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense push error:', e);
    }
  });
};

// Watch for route changes. When the path changes, update the key of the <ins> element.
// This forces Vue to destroy the old ad slot and create a new, "clean" one.
// AdSense will see this new <ins> as an unfilled slot and load a new ad.
watch(
  () => route.path,
  () => {
    // A small delay can sometimes help ensure everything is ready for the new ad.
    setTimeout(() => {
      adKey.value += 1; // Force re-render of the <ins> element
      pushAd();         // Push the ad to the newly created slot
    }, 100);
  }
);

// This handles the very first ad load when the component is mounted.
onMounted(() => {
  pushAd();
});
</script> 