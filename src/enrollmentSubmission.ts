export const paymentSlipMaxSize = 8 * 1024 * 1024;
export const paymentSlipAccept = '.png,.jpg,.jpeg,.webp,.pdf,image/png,image/jpeg,image/webp,application/pdf';

export type EnrollmentProvider = 'supabase' | 'formspree';

export function getEnrollmentTransport(supabaseUrl: string, storageSetting: string, formspreeEndpoint: string) {
  // The private intake must be deployed before explicitly switching production to it.
  return storageSetting === 'supabase'
    ? { provider: 'supabase' as const, endpoint: supabaseUrl ? `${supabaseUrl.replace(/\/$/, '')}/functions/v1/enroll` : '' }
    : { provider: 'formspree' as const, endpoint: formspreeEndpoint };
}

export function getPaymentSlipError(file: Pick<File, 'name' | 'type' | 'size'>): string | undefined {
  if (!file.size) return 'This payment slip is empty. Please choose the original screenshot or PDF.';
  if (file.size > paymentSlipMaxSize) return 'Payment slip is too large. Please choose a file no larger than 8 MB.';
  const types = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
  const genericType = !file.type || file.type === 'application/octet-stream';
  if (!types.includes(file.type) && !(genericType && /\.(png|jpe?g|webp|pdf)$/i.test(file.name))) {
    return 'Please attach a PNG, JPG, WebP, or PDF payment slip. Convert HEIC photos to JPG first.';
  }
}

function getSubmissionError(status: number, payload: unknown): string {
  const data = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {};
  const errors = Array.isArray(data.errors) ? data.errors : [];
  const detail = [typeof data.error === 'string' ? data.error : '', ...errors.map((error) => typeof error?.message === 'string' ? error.message : '')].filter(Boolean).join(' ');
  if (errors.some((error) => error?.code === 'NO_FILE_UPLOADS')) {
    return 'Payment slip upload is not enabled on this enrollment form. Please contact the admin. Your details and attached file are still here.';
  }
  if (status === 413) {
    return 'The upload service rejected the payment slip size. Please attach a smaller PNG, JPG, WebP, or PDF (maximum 8 MB).';
  }
  if (status === 429) return 'Too many requests. Please wait a few minutes before trying again. Your details and slip are still here.';
  if (status === 404) {
    return 'The enrollment service is unavailable. Please contact the admin to check the enrollment form configuration.';
  }
  if (detail) return detail.slice(0, 400);
  return `Enrollment could not be confirmed (HTTP ${status}). Your details and slip are still here. Please contact the admin before resubmitting.`;
}

export async function submitEnrollmentRequest(endpoint: string, formData: FormData, requestId: string, provider: EnrollmentProvider = 'supabase'): Promise<string> {
  if (!endpoint) throw new Error('Enrollment storage is not configured. Please contact the admin.');
  let response: Response;
  try {
    // Let the browser set the multipart boundary. Never retry without the attached file.
    response = await fetch(endpoint, {
      method: 'POST',
      headers: provider === 'supabase'
        ? { Accept: 'application/json', 'X-Enrollment-Id': requestId }
        : { Accept: 'application/json' },
      body: formData,
      signal: AbortSignal.timeout(45_000),
    });
  } catch (error) {
    const timedOut = error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name);
    throw new Error(timedOut
      ? 'Sending took too long. Delivery is not confirmed. Your details and slip are still here; please check with the admin before trying again.'
      : 'The connection was interrupted. Delivery is not confirmed. Your details and slip are still here; please check your connection and contact the admin before resubmitting.');
  }

  const payload: unknown = await response.json().catch(() => null);
  const data = payload && typeof payload === 'object' ? payload as Record<string, unknown> : null;
  if (!response.ok || data?.ok === false || data?.error || (Array.isArray(data?.errors) && data.errors.length)) {
    throw new Error(getSubmissionError(response.status, payload));
  }
  const confirmed = provider === 'supabase'
    ? data?.ok === true && data.enrollment_id === requestId
    : data?.ok === true || typeof data?.next === 'string';
  if (!confirmed) {
    throw new Error('The upload service did not confirm receipt. Your details and slip are still here. Please check with the admin before trying again.');
  }
  return provider === 'supabase' ? requestId : '';
}
