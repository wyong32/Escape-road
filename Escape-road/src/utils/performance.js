// 性能监控工具
export class PerformanceMonitor {
  constructor() {
    this.metrics = {}
    this.observer = null
    this.init()
  }

  init() {
    // 监控 Core Web Vitals
    this.observeWebVitals()
    // 监控资源加载
    this.observeResourceTiming()
    // 监控长任务
    this.observeLongTasks()
  }

  observeWebVitals() {
    // 监控 LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.metrics.lcp = lastEntry.startTime
        // LCP 记录完成
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // 监控 FID (First Input Delay) / INP (Interaction to Next Paint)
      const fidObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          this.metrics.fid = entry.processingStart - entry.startTime
          // FID 记录完成
        }
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      // 监控 CLS (Cumulative Layout Shift)
      let clsValue = 0
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        }
        this.metrics.cls = clsValue
        // CLS 记录完成
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    }
  }

  observeResourceTiming() {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          // 监控图片加载时间
          if (entry.initiatorType === 'img') {
            const loadTime = entry.responseEnd - entry.startTime
            // 记录图片加载性能但不输出到控制台
            this.metrics.imageLoads = this.metrics.imageLoads || []
            this.metrics.imageLoads.push({
              name: entry.name,
              duration: loadTime,
              size: entry.transferSize
            })
          }
        }
      })
      resourceObserver.observe({ entryTypes: ['resource'] })
    }
  }

  observeLongTasks() {
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          // 记录长任务但不在生产环境输出警告
          this.metrics.longTasks = this.metrics.longTasks || []
          this.metrics.longTasks.push({
            duration: entry.duration,
            startTime: entry.startTime
          })
        }
      })
      longTaskObserver.observe({ entryTypes: ['longtask'] })
    }
  }

  // 获取当前性能指标
  getMetrics() {
    return {
      ...this.metrics,
      // 添加导航时间
      navigationTiming: this.getNavigationTiming(),
      // 添加内存使用情况（如果支持）
      memory: this.getMemoryUsage()
    }
  }

  getNavigationTiming() {
    if ('performance' in window && 'timing' in performance) {
      const timing = performance.timing
      return {
        dns: timing.domainLookupEnd - timing.domainLookupStart,
        tcp: timing.connectEnd - timing.connectStart,
        ttfb: timing.responseStart - timing.navigationStart,
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
        loadComplete: timing.loadEventEnd - timing.navigationStart
      }
    }
    return null
  }

  getMemoryUsage() {
    if ('memory' in performance) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      }
    }
    return null
  }

  // 报告性能数据（可以发送到分析服务）
  reportMetrics() {
    const metrics = this.getMetrics()
    // 性能数据已收集，可发送到分析服务

    // 这里可以发送到 Google Analytics 或其他分析服务
    if (typeof gtag !== 'undefined') {
      gtag('event', 'web_vitals', {
        custom_parameter_lcp: metrics.lcp,
        custom_parameter_fid: metrics.fid,
        custom_parameter_cls: metrics.cls
      })
    }

    return metrics
  }
}

// 创建全局实例
export const performanceMonitor = new PerformanceMonitor()

// 页面加载完成后报告指标
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceMonitor.reportMetrics()
    }, 1000)
  })
}
