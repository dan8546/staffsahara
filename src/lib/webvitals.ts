import { onLCP, onCLS, onINP } from 'web-vitals';
import { track } from '@/lib/analytics';

export function initWebVitals() {
  try {
    onLCP((metric) => track('WEB_VITAL', { metric: 'LCP', value: metric.value }));
    onCLS((metric) => track('WEB_VITAL', { metric: 'CLS', value: metric.value }));
    onINP((metric) => track('WEB_VITAL', { metric: 'INP', value: metric.value }));
  } catch (error) {
    console.warn('Web Vitals not available:', error);
  }
}