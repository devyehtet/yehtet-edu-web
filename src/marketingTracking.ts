// Public course funnel only. Never pass enrollment form values to this module.
export const googleMeasurementId = 'G-ZGY0ME7M3H';
export const metaPixelId = '1464719308887709';

export type TrackingCourse = { id: string; name: string; fee: number };
type Pixel = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push?: Pixel;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    fbq?: Pixel;
    _fbq?: Pixel;
  }
}

let lastPublicPath: string | null = null;

function isProductionSite() {
  return typeof window !== 'undefined'
    && ['yehtetedu.com', 'www.yehtetedu.com'].includes(window.location.hostname);
}

function getPixel() {
  if (window.fbq) return window.fbq;
  const pixel: Pixel = Object.assign(function (...args: unknown[]) {
    if (pixel.callMethod) pixel.callMethod(...args);
    else pixel.queue.push(args);
  }, { queue: [] as unknown[][], loaded: true, version: '2.0' });
  pixel.push = pixel;
  window.fbq = pixel;
  window._fbq = pixel;
  // Disable automatic button/form detection and automatic matching of form data.
  pixel('set', 'autoConfig', false, metaPixelId);
  pixel('init', metaPixelId);
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);
  return pixel;
}

function googleEvent(name: string, parameters: Record<string, unknown>) {
  window.dataLayer = window.dataLayer || [];
  // GTM owns Google Tag initialization; use its existing gtag command queue.
  function command(_type: string, _name: string, _parameters: Record<string, unknown>) {
    window.dataLayer!.push(arguments);
  }
  command('event', name, { send_to: googleMeasurementId, ...parameters });
}

export function trackCourseEvent(event: 'view_item' | 'begin_checkout' | 'generate_lead', course: TrackingCourse) {
  if (!isProductionSite()) return;
  try {
    const item = { item_id: course.id, item_name: course.name, item_category: 'Online course', price: course.fee, quantity: 1 };
    const parameters = event === 'generate_lead'
      ? { course_id: course.id, course_name: course.name, lead_source: 'course_enrollment' }
      : { currency: 'MMK', value: course.fee, items: [item] };
    googleEvent(event, parameters);
    const pixelEvent = { view_item: 'ViewContent', begin_checkout: 'InitiateCheckout', generate_lead: 'Lead' }[event];
    getPixel()('trackSingle', metaPixelId, pixelEvent, {
      content_ids: [course.id], content_name: course.name, content_type: 'product',
      ...(event === 'generate_lead' ? {} : { currency: 'MMK', value: course.fee }),
    });
  } catch {
    // Analytics failures must not interrupt navigation or successful enrollment.
  }
}

export function trackPublicPage(path: string, course?: TrackingCourse) {
  if (!isProductionSite()) return;
  const isPublic = ['/', '/courses', '/teaching-method', '/marketing-resources', '/learning-path'].includes(path)
    || Boolean(course && (path === `/courses/${course.id}` || path === `/enroll/${course.id}`));
  if (!isPublic) {
    lastPublicPath = null;
    return;
  }
  if (path === lastPublicPath) return;
  lastPublicPath = path;
  try { getPixel()('trackSingle', metaPixelId, 'PageView'); } catch { /* Non-blocking. */ }
  // Google page views are already handled by GTM's existing SPA history trigger.
  if (course && path.startsWith('/courses/')) trackCourseEvent('view_item', course);
  if (course && path.startsWith('/enroll/')) trackCourseEvent('begin_checkout', course);
}
