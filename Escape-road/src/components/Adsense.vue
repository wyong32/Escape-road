<template>
  <ins
    class="adsbygoogle"
    style="display: block"
    :data-ad-client="adClient"
    :data-ad-slot="adSlot"
    :data-ad-format="adFormat"
    :data-full-width-responsive="fullWidthResponsive"
  ></ins>
</template>

<script setup>
import { onMounted, nextTick, watch } from 'vue';
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

const loadAd = () => {
  nextTick(() => {
    try {
      // 检查 adsbygoogle 是否可用
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } else {
        // 如果脚本还未加载，则进行加载
        loadAdsenseScript();
      }
    } catch (e) {
      console.error('AdSense push error:', e);
    }
  });
};

const loadAdsenseScript = () => {
  // 防止重复加载
  if (document.querySelector('script[src*="adsbygoogle.js"]')) {
    // 如果脚本已经存在，但adsbygoogle对象还没准备好，稍后再试
    if (!window.adsbygoogle) {
        const interval = setInterval(() => {
            if (window.adsbygoogle) {
                clearInterval(interval);
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        }, 50);
    }
    return;
  }
  
  const script = document.createElement('script');
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${props.adClient}`;
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.onload = () => {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  };
  script.onerror = () => {
    console.error('Failed to load AdSense script.');
  };
  document.head.appendChild(script);
};

onMounted(() => {
  loadAd();
});

// 监听路由变化，因为在SPA中切换页面内容时，需要重新加载广告
watch(
  () => route.path,
  () => {
    loadAd();
  }
);
</script> 