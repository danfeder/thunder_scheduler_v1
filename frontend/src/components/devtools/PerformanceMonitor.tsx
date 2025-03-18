import React, { useEffect, useState } from 'react';
import { getPerformanceMetrics, createPerformanceReport, PerformanceMetrics } from '../../utils/performance/performanceMonitor';

interface PerformanceMonitorProps {
  showInProduction?: boolean;
  refreshInterval?: number;
}

/**
 * Component for displaying performance metrics in development mode
 * This can be toggled on/off with a button
 */
export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  showInProduction = false,
  refreshInterval = 5000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [report, setReport] = useState<string>('');

  // Only show in development mode unless explicitly enabled for production
  const shouldShow = process.env.NODE_ENV === 'development' || showInProduction;

  useEffect(() => {
    if (!shouldShow || !isVisible) return;

    // Update metrics on interval
    const intervalId = setInterval(() => {
      setMetrics(getPerformanceMetrics());
      setReport(createPerformanceReport());
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [shouldShow, isVisible, refreshInterval]);

  if (!shouldShow) return null;

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
    if (!isVisible) {
      // Update metrics immediately when showing
      setMetrics(getPerformanceMetrics());
      setReport(createPerformanceReport());
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleVisibility}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {isVisible ? 'Hide' : 'Show'} Performance
      </button>

      {isVisible && (
        <div className="mt-2 p-4 bg-white shadow-lg rounded-lg max-h-96 overflow-auto w-96">
          <h3 className="text-lg font-bold mb-2">Performance Metrics</h3>
          
          <div className="mb-4">
            <h4 className="font-semibold">Summary</h4>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
              {report || 'No metrics collected yet'}
            </pre>
          </div>
          
          <div>
            <h4 className="font-semibold">Raw Metrics</h4>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
              {metrics.length > 0 
                ? JSON.stringify(metrics, null, 2) 
                : 'No metrics collected yet'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;