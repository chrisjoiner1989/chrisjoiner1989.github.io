/**
 * Performance Monitoring with Web Vitals
 * Tracks Core Web Vitals and custom performance metrics
 *
 * Metrics tracked:
 * - LCP (Largest Contentful Paint): Loading performance
 * - FID (First Input Delay): Interactivity
 * - CLS (Cumulative Layout Shift): Visual stability
 * - TTFB (Time to First Byte): Server response time
 * - FCP (First Contentful Paint): Initial render
 * - Custom metrics: Search time, Bible load time, etc.
 */

class PerformanceMonitor {
  constructor() {
    this.STORAGE_KEY = 'mountBuilderPerformance';
    this.metrics = this.loadMetrics();
    this.sessionMetrics = {
      startTime: Date.now(),
      pageViews: 0,
      interactions: 0,
      errors: 0
    };

    this.thresholds = {
      LCP: { good: 2500, needsImprovement: 4000 },
      FID: { good: 100, needsImprovement: 300 },
      CLS: { good: 0.1, needsImprovement: 0.25 },
      TTFB: { good: 800, needsImprovement: 1800 },
      FCP: { good: 1800, needsImprovement: 3000 }
    };
  }

  /**
   * Initialize performance monitoring
   */
  init() {
    // Track Core Web Vitals if supported
    this.trackCoreWebVitals();

    // Track page load time
    this.trackPageLoad();

    // Track navigation performance
    this.trackNavigation();

    // Track errors
    this.trackErrors();

    // Track resource usage
    this.trackResources();

    console.log('Performance monitoring initialized');
  }

  /**
   * Track Core Web Vitals using Performance Observer API
   */
  trackCoreWebVitals() {
    // LCP - Largest Contentful Paint
    this.observeMetric('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1];
      const lcp = lastEntry.renderTime || lastEntry.loadTime;
      this.recordMetric('LCP', lcp);
    });

    // FID - First Input Delay
    this.observeMetric('first-input', (entries) => {
      const firstInput = entries[0];
      const fid = firstInput.processingStart - firstInput.startTime;
      this.recordMetric('FID', fid);
    });

    // CLS - Cumulative Layout Shift
    let clsValue = 0;
    this.observeMetric('layout-shift', (entries) => {
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.recordMetric('CLS', clsValue);
    });

    // Additional paint timing
    this.observeMetric('paint', (entries) => {
      entries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          this.recordMetric('FCP', entry.startTime);
        }
      });
    });
  }

  /**
   * Observe a specific performance metric
   */
  observeMetric(type, callback) {
    try {
      if (!PerformanceObserver) return;

      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });

      observer.observe({
        type: type,
        buffered: true
      });
    } catch (e) {
      // PerformanceObserver not supported or type not available
      console.log(`Performance metric ${type} not available`);
    }
  }

  /**
   * Track page load performance
   */
  trackPageLoad() {
    if (!performance.timing) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = performance.timing;

        // TTFB - Time to First Byte
        const ttfb = timing.responseStart - timing.requestStart;
        this.recordMetric('TTFB', ttfb);

        // DOM Content Loaded
        const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
        this.recordMetric('DOMContentLoaded', domContentLoaded);

        // Page Load Complete
        const loadComplete = timing.loadEventEnd - timing.navigationStart;
        this.recordMetric('PageLoad', loadComplete);

        // DNS Lookup Time
        const dnsTime = timing.domainLookupEnd - timing.domainLookupStart;
        this.recordMetric('DNSLookup', dnsTime);

      }, 0);
    });
  }

  /**
   * Track navigation timing
   */
  trackNavigation() {
    this.sessionMetrics.pageViews++;

    // Track which pages are visited
    const pageName = this.getPageName();
    if (!this.metrics.pageViews) this.metrics.pageViews = {};
    this.metrics.pageViews[pageName] = (this.metrics.pageViews[pageName] || 0) + 1;

    this.saveMetrics();
  }

  /**
   * Track JavaScript errors
   */
  trackErrors() {
    window.addEventListener('error', (event) => {
      this.sessionMetrics.errors++;

      if (!this.metrics.errors) this.metrics.errors = [];

      this.metrics.errors.push({
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        timestamp: new Date().toISOString(),
        page: this.getPageName()
      });

      // Keep only last 50 errors
      if (this.metrics.errors.length > 50) {
        this.metrics.errors = this.metrics.errors.slice(-50);
      }

      this.saveMetrics();
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.sessionMetrics.errors++;

      if (!this.metrics.errors) this.metrics.errors = [];

      this.metrics.errors.push({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        timestamp: new Date().toISOString(),
        page: this.getPageName()
      });

      this.saveMetrics();
    });
  }

  /**
   * Track resource loading
   */
  trackResources() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const resources = performance.getEntriesByType('resource');

        let totalSize = 0;
        let totalDuration = 0;
        const resourceTypes = {};

        resources.forEach(resource => {
          totalDuration += resource.duration;

          // Categorize by type
          const type = resource.initiatorType || 'other';
          if (!resourceTypes[type]) {
            resourceTypes[type] = { count: 0, duration: 0 };
          }
          resourceTypes[type].count++;
          resourceTypes[type].duration += resource.duration;

          // Estimate size if available
          if (resource.transferSize) {
            totalSize += resource.transferSize;
          }
        });

        this.recordMetric('ResourceCount', resources.length);
        this.recordMetric('TotalResourceTime', totalDuration);

        if (totalSize > 0) {
          this.recordMetric('TotalTransferSize', totalSize);
        }

      }, 0);
    });
  }

  /**
   * Record a performance metric
   */
  recordMetric(name, value) {
    if (!this.metrics[name]) {
      this.metrics[name] = [];
    }

    this.metrics[name].push({
      value: value,
      timestamp: Date.now()
    });

    // Keep only last 100 entries per metric
    if (this.metrics[name].length > 100) {
      this.metrics[name] = this.metrics[name].slice(-100);
    }

    this.saveMetrics();

    // Log to console in development
    if (this.isDevelopment()) {
      const rating = this.getRating(name, value);
      console.log(`📊 ${name}: ${this.formatValue(name, value)} (${rating})`);
    }
  }

  /**
   * Custom timing measurement
   */
  startTiming(label) {
    if (performance.mark) {
      performance.mark(`${label}-start`);
    }
    return {
      end: () => this.endTiming(label)
    };
  }

  /**
   * End custom timing measurement
   */
  endTiming(label) {
    if (performance.mark && performance.measure) {
      try {
        performance.mark(`${label}-end`);
        performance.measure(label, `${label}-start`, `${label}-end`);

        const measure = performance.getEntriesByName(label)[0];
        if (measure) {
          this.recordMetric(label, measure.duration);
          return measure.duration;
        }
      } catch (e) {
        console.error('Error measuring performance:', e);
      }
    }
    return null;
  }

  /**
   * Get rating for a metric value
   */
  getRating(name, value) {
    const threshold = this.thresholds[name];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.needsImprovement) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Format metric value for display
   */
  formatValue(name, value) {
    if (name === 'CLS') {
      return value.toFixed(3);
    } else if (name.includes('Size')) {
      return `${(value / 1024).toFixed(2)} KB`;
    } else {
      return `${Math.round(value)} ms`;
    }
  }

  /**
   * Get statistics for a metric
   */
  getStats(metricName) {
    const data = this.metrics[metricName];
    if (!data || data.length === 0) return null;

    const values = data.map(d => d.value);
    const sorted = [...values].sort((a, b) => a - b);

    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p75: sorted[Math.floor(sorted.length * 0.75)],
      p95: sorted[Math.floor(sorted.length * 0.95)]
    };
  }

  /**
   * Get performance report
   */
  getReport() {
    const report = {
      session: this.sessionMetrics,
      coreWebVitals: {},
      pageLoad: {},
      resources: {},
      pageViews: this.metrics.pageViews || {},
      errors: this.metrics.errors ? this.metrics.errors.slice(-10) : []
    };

    // Core Web Vitals
    ['LCP', 'FID', 'CLS', 'FCP', 'TTFB'].forEach(metric => {
      const stats = this.getStats(metric);
      if (stats) {
        report.coreWebVitals[metric] = {
          ...stats,
          rating: this.getRating(metric, stats.avg)
        };
      }
    });

    // Page Load Metrics
    ['PageLoad', 'DOMContentLoaded'].forEach(metric => {
      const stats = this.getStats(metric);
      if (stats) {
        report.pageLoad[metric] = stats;
      }
    });

    // Resource Metrics
    ['ResourceCount', 'TotalResourceTime', 'TotalTransferSize'].forEach(metric => {
      const stats = this.getStats(metric);
      if (stats) {
        report.resources[metric] = stats;
      }
    });

    return report;
  }

  /**
   * Export performance data
   */
  exportData() {
    const report = this.getReport();
    const json = JSON.stringify(report, null, 2);

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `performance-report-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Clear all performance data
   */
  clearData() {
    this.metrics = {};
    this.saveMetrics();
  }

  /**
   * Get current page name
   */
  getPageName() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    return page.replace('.html', '');
  }

  /**
   * Check if in development mode
   */
  isDevelopment() {
    return window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1';
  }

  /**
   * Load metrics from localStorage
   */
  loadMetrics() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.error('Error loading performance metrics:', e);
      return {};
    }
  }

  /**
   * Save metrics to localStorage
   */
  saveMetrics() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.metrics));
    } catch (e) {
      console.error('Error saving performance metrics:', e);
    }
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    performanceMonitor.init();
  });
} else {
  performanceMonitor.init();
}

// Make it globally available
window.performanceMonitor = performanceMonitor;

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceMonitor;
}
