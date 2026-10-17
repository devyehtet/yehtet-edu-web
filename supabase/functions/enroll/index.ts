const MAX_FILE = 8 * 1024 * 1024;
const MAX_BODY = MAX_FILE + 64 * 1024;
const BUCKET = 'enrollment-slips';
const ORIGINS = ['https://www.yehtetedu.com', 'https://yehtetedu.com'];
const COURSES: Record<string, number> = {
  'Digital Marketing Beginner to Professional': 620000,
  'Digital Media Planning & Buying': 650000,
};

class IntakeError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

function text(form: FormData, key: string, max = 160): string {
  const value = form.get(key);
  if (value !== null && typeof value !== 'string') throw new IntakeError(422, `Invalid ${key}.`);
  const result = (value || '').trim();
  if (result.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(result)) throw new IntakeError(422, `Invalid ${key}.`);
  return result;
}

function choice(form: FormData, key: string, allowed: string[]): string {
  const value = text(form, key);
  if (!allowed.includes(value)) throw new IntakeError(422, `Please check ${key.replaceAll('_', ' ')}.`);
  return value;
}

export function validateEnrollment(form: FormData) {
  const name = text(form, 'name', 100).replace(/\s+/g, ' ');
  const email = text(form, 'email', 254).toLowerCase();
  const phone = text(form, 'phone', 32);
  const phoneDigits = phone.replace(/\D/g, '');
  if (name.length < 2 || !/\p{L}/u.test(name)) throw new IntakeError(422, 'Please enter your full name.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new IntakeError(422, 'Please check your email address.');
  if (!/^\+[1-9][\d\s()-]{6,24}$/.test(phone) || phoneDigits.length < 8 || phoneDigits.length > 15) throw new IntakeError(422, 'Please check your country phone number.');
  const course = choice(form, 'course', Object.keys(COURSES));
  return {
    name, email, phone, course, course_fee: COURSES[course],
    contact_preference: choice(form, 'contact_preference', ['Phone call', 'Viber', 'Telegram', 'Messenger', 'Email']),
    payment_status: choice(form, 'payment_status', ['Ready to pay', 'Payment already sent', 'Need payment instructions', 'Need installment support']),
    payment_plan: choice(form, 'payment_plan', ['Full payment', 'Installment / partial payment', 'Admin guidance needed']),
    payment_account: choice(form, 'payment_account', ['Myanmar - KBZ Pay', 'Thailand - SCB Bank']),
    payment_reference: text(form, 'payment_reference', 300), note: text(form, 'note', 2000),
  };
}

export function detectSlipType(bytes: Uint8Array): { type: string; extension: string } | null {
  const starts = (...prefix: number[]) => prefix.every((byte, i) => bytes[i] === byte);
  if (starts(137, 80, 78, 71, 13, 10, 26, 10)) return { type: 'image/png', extension: 'png' };
  if (starts(255, 216, 255)) return { type: 'image/jpeg', extension: 'jpg' };
  if (starts(37, 80, 68, 70, 45)) return { type: 'application/pdf', extension: 'pdf' };
  if (starts(82, 73, 70, 70) && bytes[8] === 87 && bytes[9] === 69 && bytes[10] === 66 && bytes[11] === 80) return { type: 'image/webp', extension: 'webp' };
  return null;
}

async function readBoundedBody(request: Request): Promise<Uint8Array> {
  if (Number(request.headers.get('content-length')) > MAX_BODY) throw new IntakeError(413, 'Payment slip must be no larger than 8 MB.');
  const reader = request.body?.getReader();
  if (!reader) throw new IntakeError(400, 'The enrollment form is empty.');
  const parts: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > MAX_BODY) {
      await reader.cancel();
      throw new IntakeError(413, 'Payment slip must be no larger than 8 MB.');
    }
    parts.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) { bytes.set(part, offset); offset += part.length; }
  return bytes;
}

async function digest(bytes: Uint8Array): Promise<string> {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new Uint8Array(bytes).buffer))].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function handleEnrollment(request: Request, env: { url: string; serviceKey: string }, fetcher: typeof fetch = fetch): Promise<Response> {
  const origin = request.headers.get('origin') || '';
  const cors = { 'Access-Control-Allow-Origin': ORIGINS.includes(origin) ? origin : ORIGINS[0], 'Vary': 'Origin', 'Cache-Control': 'no-store' };
  const reply = (status: number, body: unknown) => Response.json(body, { status, headers: cors });
  if (!ORIGINS.includes(origin)) return reply(403, { error: 'This enrollment origin is not allowed.' });
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...cors, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'content-type, x-enrollment-id, apikey, authorization' } });
  if (request.method !== 'POST') return reply(405, { error: 'Only enrollment submission is supported.' });
  if (!env.url || !env.serviceKey) return reply(503, { error: 'Enrollment storage is temporarily unavailable.' });
  const id = request.headers.get('x-enrollment-id') || '';
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) return reply(400, { error: 'Please reopen the enrollment form and try again.' });
  if (!request.headers.get('content-type')?.startsWith('multipart/form-data;')) return reply(415, { error: 'Please attach the form as multipart data.' });
  const serverHeaders = { apikey: env.serviceKey, Authorization: `Bearer ${env.serviceKey}` };
  const backend = (path: string, init: RequestInit) => fetcher(`${env.url}${path}`, { ...init, headers: { ...serverHeaders, ...init.headers }, signal: AbortSignal.timeout(20_000) });
  let reserved = false;
  let uploaded = false;
  let path: string | null = null;
  try {
    const body = await readBoundedBody(request);
    let form: FormData;
    try { form = await new Response(new Uint8Array(body).buffer, { headers: { 'Content-Type': request.headers.get('content-type')! } }).formData(); }
    catch { throw new IntakeError(400, 'The attachment could not be read. Please choose the original screenshot or PDF.'); }
    const details = validateEnrollment(form);
    const files = form.getAll('payment_slip');
    if (files.length > 1) throw new IntakeError(422, 'Please attach only one payment slip.');
    const file = files[0];
    if (file && !(file instanceof File)) throw new IntakeError(422, 'Please attach the payment slip file, not a link.');
    if (details.payment_status === 'Payment already sent' && !file) throw new IntakeError(422, 'Please attach your payment slip.');
    let bytes: Uint8Array | null = null;
    let fileType: ReturnType<typeof detectSlipType> = null;
    if (file instanceof File) {
      if (!file.size || file.size > MAX_FILE) throw new IntakeError(413, 'Payment slip must be between 1 byte and 8 MB.');
      bytes = new Uint8Array(await file.arrayBuffer());
      fileType = detectSlipType(bytes);
      if (!fileType) throw new IntakeError(422, 'The file is not a supported PNG, JPG, WebP, or PDF. Please convert HEIC photos to JPG.');
      path = `${id}/slip.${fileType.extension}`;
    }
    const encoder = new TextEncoder();
    const hash = await digest(encoder.encode(JSON.stringify(details) + (bytes ? await digest(bytes) : '')));
    const ip = request.headers.get('x-forwarded-for')?.split(',').pop()?.trim() || 'unknown';
    const rateKey = await digest(encoder.encode(env.serviceKey + ':' + ip));
    const reservation = await backend('/rest/v1/rpc/reserve_enrollment', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_id: id, p_hash: hash, p_rate_key: rateKey, p_details: details, p_slip_path: path, p_slip_type: fileType?.type || null, p_slip_size: bytes?.length || null }),
    });
    if (!reservation.ok) throw new Error('Reservation failed');
    const result = await reservation.json();
    if (result === 'submitted') return reply(200, { ok: true, enrollment_id: id });
    if (result === 'rate_limited') return reply(429, { error: 'Too many enrollment attempts. Please try again later or contact the admin.' });
    if (result === 'busy') return reply(409, { error: 'This enrollment is still processing. Please wait two minutes before retrying.' });
    if (result !== 'reserved') return reply(409, { error: 'The request details changed. Please reopen the form or contact the admin.' });
    reserved = true;
    if (path && bytes && fileType) {
      const upload = await backend(`/storage/v1/object/${BUCKET}/${path}`, { method: 'POST', headers: { 'Content-Type': fileType.type, 'x-upsert': 'true' }, body: new Uint8Array(bytes).buffer });
      if (!upload.ok) throw new Error('Private upload failed');
      uploaded = true;
    }
    const complete = await backend(`/rest/v1/enrollment_requests?id=eq.${id}&state=eq.uploading`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify({ state: 'submitted', updated_at: new Date().toISOString() }),
    });
    if (!complete.ok || (await complete.json()).length !== 1) throw new Error('Enrollment completion failed');
    return reply(200, { ok: true, enrollment_id: id });
  } catch (error) {
    if (reserved) {
      // Keep any successfully uploaded slip private for recovery; retry uses the same ID and bytes.
      await backend(`/rest/v1/enrollment_requests?id=eq.${id}&state=eq.uploading`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: 'failed', updated_at: new Date().toISOString() }),
      }).catch(() => undefined);
    }
    if (error instanceof IntakeError) return reply(error.status, { error: error.message });
    console.error('Enrollment intake unavailable', { id, stage: uploaded ? 'complete' : reserved ? 'upload' : 'reserve' });
    return reply(503, { error: 'Enrollment could not be confirmed. Your details and slip are still selected. Please retry with the same form or contact the admin.' });
  }
}

if (typeof Deno !== 'undefined') Deno.serve((request: Request) => handleEnrollment(request, {
  url: Deno.env.get('SUPABASE_URL') || '', serviceKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
}));
