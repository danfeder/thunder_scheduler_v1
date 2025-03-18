import { useEffect, useRef } from 'react';
import { startMeasuringRender, measureApiCall, PerformanceMetrics } from '../utils/performance/performanceMonitor';

/**
 * Hook for monitoring component performance
 * @param componentName Name of the component being monitored
 * @returns Object with performance monitoring utilities
 */
export const usePerformanceMonitoring = (componentName: string) => {
  const renderTimeRef = useRef<number>(0);
  const loadTimeRef = useRef<number>(0);
  const mountTimeRef = useRef<number>(performance.now());
  const metricsRef = useRef<PerformanceMetrics[]>([]);

  // Start measuring render time on mount
  useEffect(() => {
    const endMeasuring = startMeasuringRender(componentName);
    
    // Record when component is fully mounted
    const loadEndTime = performance.now();
    loadTimeRef.current = loadEndTime - mountTimeRef.current;
    
    const metrics = endMeasuring();
    renderTimeRef.current = metrics.renderTime || 0;
    
    // Add load time to metrics
    const updatedMetrics: PerformanceMetrics = {
      ...metrics,
      loadTime: loadTimeRef.current,
      totalTime: loadTimeRef.current,
    };
    
    metricsRef.current.push(updatedMetrics);
    
    // Log metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} load time: ${loadTimeRef.current.toFixed(2)}ms`);
      console.log(`[Performance] ${componentName} total time: ${loadTimeRef.current.toFixed(2)}ms`);
    }
    
    // Measure unmount time
    return () => {
      const unmountStartTime = performance.now();
      const unmountEndTime = performance.now();
      const unmountTime = unmountEndTime - unmountStartTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${componentName} unmount time: ${unmountTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);

  /**
   * Measure the performance of an API call
   * @param apiName Name of the API being called
   * @param apiCall The API call function to measure
   * @returns The result of the API call
   */
  const measureApiCallWithName = async <T>(
    apiName: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    return measureApiCall(`${componentName}:${apiName}`, apiCall);
  };

  /**
   * Get the current performance metrics for this component
   */
  const getMetrics = () => {
    return {
      renderTime: renderTimeRef.current,
      loadTime: loadTimeRef.current,
      totalTime: loadTimeRef.current,
      allMetrics: [...metricsRef.current],
    };
  };

  return {
    measureApiCall: measureApiCallWithName,
    getMetrics,
  };
};

export default usePerformanceMonitoring;