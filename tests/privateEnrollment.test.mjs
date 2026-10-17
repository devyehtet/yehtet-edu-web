import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../supabase/functions/enroll/index.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const context = { exports: {}, Request, Response, FormData, File, Uint8Array, TextEncoder, AbortSignal, crypto, console: { error() {} } };
vm.runInNewContext(compiled, context);
const { handleEnrollment } = context.exports;
const id = '19c9a754-08bd-4ac4-a03c-9479b47728f0';
const env = { url: 'https://project.example', serviceKey: 'SERVER-ONLY-TEST-KEY' };
const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0]);
function form(overrides = {}, file = new File([png], 'personal-name.png', { type: 'image/png' })) {
  const data = new FormData();
  const fields = {
    name: 'TEST ONLY Student', email: 'student@example.com', phone: '+95 9900000000',
    course: 'Digital Marketing Beginner to Professional', contact_preference: 'Email',
    payment_status: 'Payment already sent', payment_plan: 'Full payment',
    payment_account: 'Myanmar - KBZ Pay', note: 'TEST ONLY - NOT A REAL ENROLLMENT',
    ...overrides,
  };
  for (const [key, value] of Object.entries(fields)) data.append(key, value);
  if (file) data.append('payment_slip', file);
  return data;
}
function request(data = form(), overrides = {}) {
  return new Request('https://project.example/functions/v1/enroll', {
    method: 'POST', body: data,
    headers: { origin: 'https://www.yehtetedu.com', 'x-enrollment-id': id, 'x-forwarded-for': '192.0.2.1', ...overrides },
  });
}
function backend({ reservation = 'reserved', uploadStatus = 200, completeStatus = 200 } = {}) {
  const calls = [];
  return { calls, fetcher: async (url, init) => {
    calls.push({ url, ...init });
    assert.equal(init.headers.apikey, env.serviceKey);
    if (url.endsWith('/rpc/reserve_enrollment')) return Response.json(reservation);
    if (url.includes('/storage/v1/object/')) return Response.json({}, { status: uploadStatus });
    if (init.method === 'PATCH') return Response.json(completeStatus === 200 ? [{ id }] : {}, { status: completeStatus });
    throw new Error('Unexpected backend call');
  } };
}

test('persists a private slip then confirms its enrollment, never returning a URL or secret', async () => {
  const { calls, fetcher } = backend();
  const response = await handleEnrollment(request(), env, fetcher);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, enrollment_id: id });
  assert.equal(calls.length, 3);
  const reserved = JSON.parse(calls[0].body);
  assert.equal(reserved.p_details.course_fee, 620000);
  assert.equal(reserved.p_details.email, 'student@example.com');
  assert.ok(!JSON.stringify(reserved).includes('192.0.2.1'));
  assert.ok(!reserved.p_slip_path.includes('personal-name'));
  assert.ok(calls[1].url.endsWith(`/enrollment-slips/${id}/slip.png`));
  assert.ok(!calls[1].url.includes('/public/'));
  assert.equal(calls[1].body.byteLength, png.length);
  assert.equal(JSON.parse(calls[2].body).state, 'submitted');
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});

test('accepts unpaid enrollment without a slip but requires one when payment was sent', async () => {
  const service = backend();
  assert.equal((await handleEnrollment(request(form({ payment_status: 'Need payment instructions' }, null)), env, service.fetcher)).status, 200);
  assert.equal(service.calls.length, 2);
  const missing = await handleEnrollment(request(form({}, null)), env, backend().fetcher);
  assert.equal(missing.status, 422);
});

test('server rejects invalid contact details, fake types, empty and oversized slips before storing anything', async () => {
  for (const data of [form({ name: '0' }), form({ email: 'bad' }), form({ phone: '0' }), form({ course: 'Other' }), form({}, new File(['not an image'], 'fake.png', { type: 'image/png' })), form({}, new File([], 'empty.pdf')), form({}, new File([new Uint8Array(8 * 1024 * 1024 + 1)], 'large.png'))]) {
    const service = backend();
    const result = await handleEnrollment(request(data), env, service.fetcher);
    assert.ok([413, 422].includes(result.status));
    assert.equal(service.calls.length, 0);
  }
});

test('fees are authoritative and arbitrary client metadata never enters the stored record', async () => {
  const service = backend();
  await handleEnrollment(request(form({ tuition_fee: '1', role: 'admin', slip_url: 'https://attacker.example', course: 'Digital Media Planning & Buying' })), env, service.fetcher);
  const details = JSON.parse(service.calls[0].body).p_details;
  assert.equal(details.course_fee, 650000);
  assert.equal(details.role, undefined);
  assert.equal(details.slip_url, undefined);
});

test('idempotent retries confirm existing receipt without another upload', async () => {
  const service = backend({ reservation: 'submitted' });
  const result = await handleEnrollment(request(), env, service.fetcher);
  assert.equal(result.status, 200);
  assert.equal(service.calls.length, 1);
});

test('rate limits and concurrent or conflicting retries cannot upload', async () => {
  for (const [reservation, status] of [['rate_limited', 429], ['busy', 409], ['conflict', 409]]) {
    const service = backend({ reservation });
    assert.equal((await handleEnrollment(request(), env, service.fetcher)).status, status);
    assert.equal(service.calls.length, 1);
  }
});

test('failed upload or finalization is never acknowledged as received', async () => {
  for (const options of [{ uploadStatus: 500 }, { completeStatus: 500 }]) {
    const service = backend(options);
    const result = await handleEnrollment(request(), env, service.fetcher);
    assert.equal(result.status, 503);
    assert.equal(JSON.parse(service.calls.at(-1).body).state, 'failed');
    assert.ok(!(await result.text()).includes(env.serviceKey));
  }
});

test('no public GET/list/download route or cross-origin intake is exposed', async () => {
  const service = backend();
  assert.equal((await handleEnrollment(new Request('https://project.example/functions/v1/enroll', { headers: { origin: 'https://www.yehtetedu.com' } }), env, service.fetcher)).status, 405);
  assert.equal((await handleEnrollment(request(form(), { origin: 'https://attacker.example' }), env, service.fetcher)).status, 403);
  assert.equal((await handleEnrollment(request(form(), { 'x-enrollment-id': '../../path' }), env, service.fetcher)).status, 400);
  assert.equal(service.calls.length, 0);
});

test('oversized streams and malformed multipart fail closed', async () => {
  const service = backend();
  const malformed = new Request('https://project.example/functions/v1/enroll', { method: 'POST', headers: { origin: 'https://www.yehtetedu.com', 'x-enrollment-id': id, 'content-type': 'multipart/form-data; boundary=missing' }, body: 'bad multipart' });
  assert.equal((await handleEnrollment(malformed, env, service.fetcher)).status, 400);
  const tooBig = request(form(), { 'content-length': String(9 * 1024 * 1024) });
  assert.equal((await handleEnrollment(tooBig, env, service.fetcher)).status, 413);
  assert.equal(service.calls.length, 0);
});

test('schema has no anonymous database or storage read/write grants', () => {
  const sql = readFileSync(new URL('../supabase/migrations/202610170001_private_enrollments.sql', import.meta.url), 'utf8');
  assert.match(sql, /enrollment_requests enable row level security/);
  assert.match(sql, /revoke all on public.enrollment_requests from public, anon, authenticated/);
  assert.match(sql, /as restrictive[\s\S]*bucket_id <> 'enrollment-slips'/);
  assert.match(sql, /'enrollment-slips', 'enrollment-slips', false/);
  assert.ok(!/grant .* to (anon|authenticated)/i.test(sql));
});
