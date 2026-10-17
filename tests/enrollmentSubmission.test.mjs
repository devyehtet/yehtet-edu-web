import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../src/enrollmentSubmission.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
function load(fetcher = () => { throw new Error('Unexpected request'); }) {
  const context = { exports: {}, fetch: fetcher, AbortSignal, Error };
  vm.runInNewContext(compiled, context);
  return context.exports;
}
const slip = { name: 'receipt.jpg', type: 'image/jpeg', size: 512 };
const requestId = '19c9a754-08bd-4ac4-a03c-9479b47728f0';

test('accepts supported slips and mobile files without a MIME type', () => {
  const { getPaymentSlipError, paymentSlipMaxSize } = load();
  for (const file of [slip, { ...slip, type: '' }, { ...slip, type: 'application/octet-stream' }, { ...slip, size: paymentSlipMaxSize }, { name: 'receipt.pdf', type: 'application/pdf', size: 128 }]) {
    assert.equal(getPaymentSlipError(file), undefined);
  }
});

test('rejects empty oversized HEIC and explicitly unsupported files', () => {
  const { getPaymentSlipError, paymentSlipMaxSize } = load();
  assert.match(getPaymentSlipError({ ...slip, size: 0 }), /empty/);
  assert.match(getPaymentSlipError({ ...slip, size: paymentSlipMaxSize + 1 }), /8 MB/);
  assert.match(getPaymentSlipError({ ...slip, name: 'receipt.heic', type: 'image/heic' }), /HEIC/);
  assert.match(getPaymentSlipError({ ...slip, type: 'application/x-msdownload' }), /PNG/);
});

test('sends the original multipart slip once without overriding its boundary', async () => {
  const data = new FormData();
  data.append('name', 'TEST ONLY');
  data.append('payment_slip', new File(['TEST ONLY - NOT A PAYMENT'], 'test-receipt.pdf', { type: 'application/pdf' }));
  let calls = 0;
  const { submitEnrollmentRequest } = load(async (url, options) => {
    calls++;
    assert.equal(url, '/functions/v1/enroll');
    assert.equal(options.body, data);
    assert.equal(options.headers.Accept, 'application/json');
    assert.equal(options.headers['Content-Type'], undefined);
    assert.equal(options.headers['X-Enrollment-Id'], requestId);
    assert.equal(options.body.get('payment_slip').name, 'test-receipt.pdf');
    assert.ok(options.signal);
    return Response.json({ ok: true, enrollment_id: requestId });
  });
  assert.equal(await submitEnrollmentRequest('/functions/v1/enroll', data, requestId), requestId);
  assert.equal(calls, 1);
});

test('keeps the attachment and never retries when storage is unavailable', async () => {
  let calls = 0;
  const data = new FormData();
  data.append('payment_slip', new File(['TEST'], 'test.pdf', { type: 'application/pdf' }));
  const { submitEnrollmentRequest } = load(async () => {
    calls++;
    return Response.json({ error: 'Enrollment storage is unavailable' }, { status: 503 });
  });
  await assert.rejects(submitEnrollmentRequest('/test-only', data, requestId), /storage is unavailable/);
  assert.equal(calls, 1);
  assert.equal(data.get('payment_slip').name, 'test.pdf');
});

test('shows size rate-limit configuration and field validation failures', async () => {
  for (const [status, payload, message] of [
    [413, {}, /smaller/],
    [429, {}, /wait a few minutes/],
    [404, {}, /configuration/],
    [422, { error: 'Please check your email address.' }, /email address/],
    [422, { error: 'Payment slip is required' }, /Payment slip is required/],
    [409, { error: 'Still processing' }, /Still processing/],
    [500, {}, /HTTP 500/],
  ]) {
    const { submitEnrollmentRequest } = load(async () => Response.json(payload, { status }));
    await assert.rejects(submitEnrollmentRequest('/test-only', new FormData(), requestId), message);
  }
});

test('does not report success for HTML, malformed JSON or an API error in HTTP 200', async () => {
  for (const response of [new Response('<html>Unexpected proxy</html>'), Response.json({ ok: false }), Response.json({ ok: true, enrollment_id: 'other' }), Response.json({ error: 'Storage unavailable' })]) {
    const { submitEnrollmentRequest } = load(async () => response);
    await assert.rejects(submitEnrollmentRequest('/test-only', new FormData(), requestId));
  }
});

test('network and timeout errors preserve uncertain delivery and do not auto-retry', async () => {
  for (const name of ['TypeError', 'TimeoutError', 'AbortError']) {
    let calls = 0;
    const { submitEnrollmentRequest } = load(async () => {
      calls++;
      const error = new Error('Private transport detail');
      error.name = name;
      throw error;
    });
    await assert.rejects(submitEnrollmentRequest('/test-only', new FormData(), requestId), /Delivery is not confirmed/);
    assert.equal(calls, 1);
  }
});

test('does not fall back to Formspree when the private endpoint is missing', async () => {
  const { submitEnrollmentRequest } = load();
  await assert.rejects(submitEnrollmentRequest('', new FormData(), requestId), /not configured/);
});

test('keeps production on the existing transport until private intake is explicitly enabled', () => {
  const { getEnrollmentTransport } = load();
  const legacy = 'https://formspree.io/f/test-only';
  assert.equal(getEnrollmentTransport('https://project.example', '', legacy).provider, 'formspree');
  assert.equal(getEnrollmentTransport('https://project.example', '', legacy).endpoint, legacy);
  assert.equal(getEnrollmentTransport('https://project.example/', 'supabase', legacy).endpoint, 'https://project.example/functions/v1/enroll');
  assert.equal(getEnrollmentTransport('', 'supabase', legacy).endpoint, '');
});

test('legacy submissions preserve the attachment and omit private-intake headers', async () => {
  const data = new FormData();
  data.append('payment_slip', new File(['TEST'], 'test.pdf', { type: 'application/pdf' }));
  const { submitEnrollmentRequest } = load(async (_url, options) => {
    assert.equal(options.body.get('payment_slip').name, 'test.pdf');
    assert.equal(options.headers['X-Enrollment-Id'], undefined);
    return Response.json({ ok: true, next: '/thanks' });
  });
  assert.equal(await submitEnrollmentRequest('/test-only', data, requestId, 'formspree'), '');
});

test('legacy plan errors remain visible and do not silently drop the attachment', async () => {
  const { submitEnrollmentRequest } = load(async () => Response.json({ errors: [{ code: 'NO_FILE_UPLOADS' }] }, { status: 400 }));
  await assert.rejects(submitEnrollmentRequest('/test-only', new FormData(), requestId, 'formspree'), /upload is not enabled/);
});
