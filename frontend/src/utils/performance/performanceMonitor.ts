/**
 * Performance monitoring utilities for measuring component and API performance
 */

// Interface for performance metrics
export interface PerformanceMetrics {
  componentName: string;
  renderTime?: number;
  loadTime?: number;
  apiCallTime?: number;
  totalTime?: number;
  memoryUsage?: number;
  timestamp: number;
}

// Global store for performance metrics
const performanceMetrics: PerformanceMetrics[] = [];

/**
 * Start measuring component render time
 * @param componentName Name of the component being measured
 * @returns A function to call when rendering is complete
 */
export const startMeasuringRender = (componentName: string): () => PerformanceMetrics => {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    const metrics: PerformanceMetrics = {
      componentName,
      renderTime,
      timestamp: Date.now(),
    };
    
    performanceMetrics.push(metrics);
    
    // Log metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} render time: ${renderTime.toFixed(2)}ms`);
    }
    
    return metrics;
  };
};

/**
 * Measure API call performance
 * @param apiName Name of the API being called
 * @param apiCall The API call function to measure
 * @returns The result of the API call
 */
export const measureApiCall = async <T>(
  apiName: string,
  apiCall: () => Promise<T>
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const result = await apiCall();
    const endTime = performance.now();
    const apiCallTime = endTime - startTime;
    
    const metrics: PerformanceMetrics = {
      componentName: apiName,
      apiCallTime,
      timestamp: Date.now(),
    };
    
    performanceMetrics.push(metrics);
    
    // Log metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${apiName} API call time: ${apiCallTime.toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    const apiCallTime = endTime - startTime;
    
    const metrics: PerformanceMetrics = {
      componentName: apiName,
      apiCallTime,
      timestamp: Date.now(),
    };
    
    performanceMetrics.push(metrics);
    
    // Log error metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[Performance] ${apiName} API call failed after ${apiCallTime.toFixed(2)}ms`, error);
    }
    
    throw error;
  }
};

/**
 * Get all collected performance metrics
 * @returns Array of performance metrics
 */
export const getPerformanceMetrics = (): PerformanceMetrics[] => {
  return [...performanceMetrics];
};

/**
 * Clear all performance metrics
 */
export const clearPerformanceMetrics = (): void => {
  performanceMetrics.length = 0;
};

/**
 * Get performance metrics for a specific component
 * @param componentName Name of the component
 * @returns Array of performance metrics for the component
 */
export const getComponentMetrics = (componentName: string): PerformanceMetrics[] => {
  return performanceMetrics.filter(metric => metric.componentName === componentName);
};

/**
 * Calculate average metrics for a component
 * @param componentName Name of the component
 * @returns Average metrics or null if no metrics exist
 */
export const getAverageComponentMetrics = (componentName: string): Partial<PerformanceMetrics> | null => {
  const metrics = getComponentMetrics(componentName);
  
  if (metrics.length === 0) {
    return null;
  }
  
  const renderTimes = metrics.filter(m => m.renderTime !== undefined).map(m => m.renderTime!);
  const apiCallTimes = metrics.filter(m => m.apiCallTime !== undefined).map(m => m.apiCallTime!);
  const loadTimes = metrics.filter(m => m.loadTime !== undefined).map(m => m.loadTime!);
  const totalTimes = metrics.filter(m => m.totalTime !== undefined).map(m => m.totalTime!);
  
  return {
    componentName,
    renderTime: renderTimes.length > 0 ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length : undefined,
    apiCallTime: apiCallTimes.length > 0 ? apiCallTimes.reduce((a, b) => a + b, 0) / apiCallTimes.length : undefined,
    loadTime: loadTimes.length > 0 ? loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length : undefined,
    totalTime: totalTimes.length > 0 ? totalTimes.reduce((a, b) => a + b, 0) / totalTimes.length : undefined,
  };
};

/**
 * Create a performance report for all components
 * @returns Performance report as a string
 */
export const createPerformanceReport = (): string => {
  const componentNames = [...new Set(performanceMetrics.map(m => m.componentName))];
  
  let report = '# Performance Report\n\n';
  
  componentNames.forEach(name => {
    const avgMetrics = getAverageComponentMetrics(name);
    
    if (avgMetrics) {
      report += `## ${name}\n`;
      if (avgMetrics.renderTime !== undefined) {
        report += `- Average Render Time: ${avgMetrics.renderTime.toFixed(2)}ms\n`;
      }
      if (avgMetrics.apiCallTime !== undefined) {
        report += `- Average API Call Time: ${avgMetrics.apiCallTime.toFixed(2)}ms\n`;
      }
      if (avgMetrics.loadTime !== undefined) {
        report += `- Average Load Time: ${avgMetrics.loadTime.toFixed(2)}ms\n`;
      }
      if (avgMetrics.totalTime !== undefined) {
        report += `- Average Total Time: ${avgMetrics.totalTime.toFixed(2)}ms\n`;
      }
      report += '\n';
    }
  });
  
  return report;
};