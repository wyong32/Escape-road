<template>
  <img
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
</template>

<script setup>
import { ref, computed } from 'vue'

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
  priority: {
    type: String,
    default: 'normal',
    validator: (value) => ['high', 'normal', 'low'].includes(value)
  }
})

const emit = defineEmits(['load', 'error'])

const isLoaded = ref(false)
const hasError = ref(false)

// 计算属性
const imageSrc = computed(() => {
  try {
    return new URL(`../assets/images/${props.src}`, import.meta.url).href
  } catch (error) {
    console.warn(`Failed to resolve image: ${props.src}`, error)
    return props.src
  }
})

const imageStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  objectFit: 'cover',
  transition: 'opacity 0.3s ease',
  aspectRatio: '1 / 1',
  backgroundColor: '#f0f0f0'
}))

const imageClass = computed(() => ({
  'image-loaded': isLoaded.value,
  'image-error': hasError.value
}))

const loadingStrategy = computed(() => {
  if (props.priority === 'high') return 'eager'
  return 'lazy'
})

const decodingStrategy = computed(() => {
  return props.priority === 'high' ? 'sync' : 'async'
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
</script>

<style scoped>
.image-loaded {
  opacity: 1;
}

.image-error {
  opacity: 0.5;
  filter: grayscale(100%);
}
</style>
