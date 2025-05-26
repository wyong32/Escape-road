<template>
  <div
    ref="containerRef"
    class="smart-image-container"
    :style="containerStyle"
  >
    <img
      v-if="shouldLoad"
      :src="imageSrc"
      :alt="alt"
      :title="title"
      :loading="loadingStrategy"
      :decoding="decodingStrategy"
      @load="onImageLoad"
      @error="onImageError"
      :style="imageStyle"
      :class="imageClass"
    />
    <div v-else-if="showPlaceholder" class="image-placeholder" :style="placeholderStyle">
      <div class="placeholder-content">
        <i class="fas fa-image"></i>
        <span>{{ placeholderText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { scriptOptimizer } from '../utils/scriptOptimizer.js'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  width: {
    type: [String, Number],
    default: '100%'
  },
  height: {
    type: [String, Number],
    default: '100%'
  },
  lazy: {
    type: Boolean,
    default: true
  },
  priority: {
    type: String,
    default: 'normal', // high, normal, low
    validator: (value) => ['high', 'normal', 'low'].includes(value)
  },
  placeholder: {
    type: Boolean,
    default: true
  },
  placeholderText: {
    type: String,
    default: 'Loading...'
  }
})

const emit = defineEmits(['load', 'error'])

const shouldLoad = ref(false)
const isLoaded = ref(false)
const hasError = ref(false)
const observer = ref(null)
const containerRef = ref(null)

// 计算属性
const imageSrc = computed(() => {
  try {
    return new URL(`../assets/images/${props.src}`, import.meta.url).href
  } catch (error) {
    console.warn(`Failed to resolve image: ${props.src}`, error)
    return props.src
  }
})

const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: '#f0f0f0',
  borderRadius: '8px'
}))

const imageStyle = computed(() => ({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'opacity 0.3s ease'
}))

const imageClass = computed(() => ({
  'image-loaded': isLoaded.value,
  'image-error': hasError.value
}))

const placeholderStyle = computed(() => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f8f9fa',
  color: '#6c757d'
}))

const showPlaceholder = computed(() => {
  return props.placeholder && !shouldLoad.value && !isLoaded.value
})

const loadingStrategy = computed(() => {
  if (props.priority === 'high') return 'eager'
  return props.lazy ? 'lazy' : 'eager'
})

const decodingStrategy = computed(() => {
  return props.priority === 'high' ? 'sync' : 'async'
})

// 检查是否为大文件
const isLargeImage = computed(() => {
  const largeImages = ['game18.png', 'game19.jpg', 'game20.png']
  return largeImages.includes(props.src)
})

// 事件处理
const onImageLoad = () => {
  isLoaded.value = true
  hasError.value = false
  emit('load')
}

const onImageError = () => {
  hasError.value = true
  emit('error')
}

// 延迟加载逻辑
const startLoading = () => {
  if (isLargeImage.value) {
    // 大文件延迟加载
    scriptOptimizer.defer(() => {
      shouldLoad.value = true
    }, 'low')
  } else if (props.priority === 'high') {
    // 高优先级立即加载
    shouldLoad.value = true
  } else {
    // 普通优先级延迟加载
    scriptOptimizer.defer(() => {
      shouldLoad.value = true
    }, 'normal')
  }
}

// Intersection Observer 设置
const setupIntersectionObserver = () => {
  if (!props.lazy || !('IntersectionObserver' in window)) {
    startLoading()
    return
  }

  observer.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startLoading()
          observer.value?.unobserve(entry.target)
        }
      })
    },
    {
      rootMargin: '50px' // 提前50px开始加载
    }
  )

  if (containerRef.value) {
    observer.value.observe(containerRef.value)
  }
}

onMounted(() => {
  if (props.priority === 'high') {
    // 高优先级图片立即加载
    shouldLoad.value = true
  } else if (!props.lazy) {
    // 非懒加载图片立即加载
    shouldLoad.value = true
  } else {
    // 懒加载图片使用 Intersection Observer
    // 添加延迟确保 DOM 已渲染
    setTimeout(() => {
      setupIntersectionObserver()
    }, 100)
  }
})

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect()
  }
})
</script>

<style scoped>
.smart-image-container {
  display: block;
  position: relative;
}

.image-placeholder {
  background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
              linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
              linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  animation: placeholder-shimmer 2s infinite linear;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.placeholder-content i {
  font-size: 24px;
  opacity: 0.5;
}

@keyframes placeholder-shimmer {
  0% {
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  }
  100% {
    background-position: 20px 20px, 20px 30px, 30px 10px, 10px 20px;
  }
}

.image-loaded {
  opacity: 1;
}

.image-error {
  opacity: 0.5;
  filter: grayscale(100%);
}
</style>
