type EventName =
  | 'COURSE_VIEW' | 'ENROLL_SUBMIT' | 'ENROLL_CONFIRMED'
  | 'CERT_ISSUED' | 'CERT_UPLOADED'
  | 'REMINDER_SESSION' | 'REMINDER_CERT_EXPIRY';

export function track(event: EventName, payload: Record<string, any> = {}) {
  try {
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({ event, ...payload });
    } else {
      console.log('[track]', event, payload);
    }
  } catch {
    // Silent fail
  }
}

// Helper to track page views
export function trackPageView(page: string) {
  track('COURSE_VIEW' as EventName, { page });
}

// Export types for use in other files
export type { EventName };