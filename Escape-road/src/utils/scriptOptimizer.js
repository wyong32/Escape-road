// 脚本优化工具
export class ScriptOptimizer {
  constructor() {
    this.deferredTasks = []
    this.isIdle = false
    this.init()
  }

  init() {
    // 监听页面加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.onDOMReady())
    } else {
      this.onDOMReady()
    }

    // 监听页面完全加载
    if (document.readyState !== 'complete') {
      window.addEventListener('load', () => this.onPageLoad())
    } else {
      this.onPageLoad()
    }
  }

  onDOMReady() {
    this.processDeferredTasks()
  }

  onPageLoad() {
    this.isIdle = true
    this.scheduleIdleTasks()
  }

  // 延迟执行非关键任务
  defer(task, priority = 'normal') {
    this.deferredTasks.push({ task, priority })
    if (this.isIdle) {
      this.processDeferredTasks()
    }
  }

  // 处理延迟任务
  processDeferredTasks() {
    if (this.deferredTasks.length === 0) return

    // 按优先级排序
    this.deferredTasks.sort((a, b) => {
      const priorities = { high: 3, normal: 2, low: 1 }
      return priorities[b.priority] - priorities[a.priority]
    })

    // 使用 requestIdleCallback 或 setTimeout 执行任务
    this.scheduleIdleTasks()
  }

  scheduleIdleTasks() {
    // 优先使用 Scheduler API (Chrome 94+)
    if ('scheduler' in window && 'postTask' in window.scheduler) {
      this.processTasksWithScheduler()
    } else if ('MessageChannel' in window) {
      this.processTasksWithMessageChannel()
    } else if ('requestIdleCallback' in window) {
      this.processTasksWithIdleCallback()
    } else {
      this.processTasksWithTimeout()
    }
  }

  processTasksWithScheduler() {
    const processChunk = async () => {
      // 每次只处理1个任务，确保不会产生长任务
      if (this.deferredTasks.length > 0) {
        const { task } = this.deferredTasks.shift()
        try {
          task()
        } catch (error) {
          console.error('Deferred task error:', error)
        }

        // 如果还有任务，使用 scheduler.postTask 继续处理
        if (this.deferredTasks.length > 0) {
          window.scheduler.postTask(processChunk, { priority: 'background' })
        }
      }
    }

    window.scheduler.postTask(processChunk, { priority: 'background' })
  }

  processTasksWithMessageChannel() {
    const channel = new MessageChannel()
    const port1 = channel.port1
    const port2 = channel.port2

    port1.onmessage = () => {
      // 每次只处理一个任务，确保不产生长任务
      if (this.deferredTasks.length > 0) {
        const { task } = this.deferredTasks.shift()
        try {
          task()
        } catch (error) {
          console.error('Deferred task error:', error)
        }

        // 如果还有任务，继续调度
        if (this.deferredTasks.length > 0) {
          port2.postMessage(null)
        }
      }
    }

    // 开始处理
    port2.postMessage(null)
  }

  processTasksWithIdleCallback() {
    const processChunk = (deadline) => {
      // 限制每次处理的任务数量，避免长时间阻塞
      let taskCount = 0
      const maxTasks = 1 // 每次只处理1个任务，确保不产生长任务

      while (deadline.timeRemaining() > 2 && this.deferredTasks.length > 0 && taskCount < maxTasks) {
        const { task } = this.deferredTasks.shift()
        try {
          task()
          taskCount++
        } catch (error) {
          console.error('Deferred task error:', error)
        }
      }

      if (this.deferredTasks.length > 0) {
        requestIdleCallback(processChunk)
      }
    }

    requestIdleCallback(processChunk)
  }

  processTasksWithTimeout() {
    const processChunk = () => {
      // 每次只处理一个任务，确保不产生长任务
      if (this.deferredTasks.length > 0) {
        const { task } = this.deferredTasks.shift()
        try {
          task()
        } catch (error) {
          console.error('Deferred task error:', error)
        }

        // 如果还有任务，继续调度
        if (this.deferredTasks.length > 0) {
          setTimeout(processChunk, 0) // 立即让出控制权
        }
      }
    }

    setTimeout(processChunk, 0)
  }

  // 分块处理大型数据
  processInChunks(items, processor, chunkSize = 100) {
    return new Promise((resolve) => {
      let index = 0
      const results = []

      const processChunk = () => {
        const chunk = items.slice(index, index + chunkSize)
        chunk.forEach(item => {
          results.push(processor(item))
        })

        index += chunkSize

        if (index < items.length) {
          // 让出控制权给浏览器
          setTimeout(processChunk, 0)
        } else {
          resolve(results)
        }
      }

      processChunk()
    })
  }

  // 优化动画
  optimizeAnimation(callback) {
    let ticking = false

    return function(...args) {
      if (!ticking) {
        requestAnimationFrame(() => {
          callback.apply(this, args)
          ticking = false
        })
        ticking = true
      }
    }
  }

  // 防抖函数
  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  // 节流函数
  throttle(func, limit) {
    let inThrottle
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }
}

// 创建全局实例
export const scriptOptimizer = new ScriptOptimizer()

// 导出优化工具函数
export const {
  defer,
  processInChunks,
  optimizeAnimation,
  debounce,
  throttle
} = scriptOptimizer
