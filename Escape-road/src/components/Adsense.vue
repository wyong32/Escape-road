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
  try {
    // This is the command that tells AdSense to find and fill an ad slot.
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch (e) {
    console.error('AdSense push error:', e);
  }
};

// This watcher handles ad refreshing when navigating between pages in the SPA.
watch(
  () => route.path,
  (newPath, oldPath) => {
    if (newPath === oldPath) {
      return;
    }
    // Changing the key forces Vue to unmount the old <ins> and mount a new one.
    // This ensures AdSense always sees a "fresh" slot to fill.
    adKey.value += 1;
    // We wait for the DOM to update with the new <ins> element before pushing the ad.
    nextTick(() => {
      pushAd();
    });
  }
);

// This handles the very first ad load when the component is initially mounted.
onMounted(() => {
  // We use a timeout here as a safeguard to ensure the global AdSense script
  // loaded in App.vue has had enough time to initialize before we push the first ad.
  setTimeout(() => {
    pushAd();
  }, 200);
});
</script> 