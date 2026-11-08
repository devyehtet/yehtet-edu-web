import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

function compile(path, dependencies = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const context = { exports: {}, FormData, require: (key) => {
    if (!(key in dependencies)) throw new Error(`Unexpected dependency ${key}`);
    return dependencies[key];
  } };
  vm.runInNewContext(compiled, context);
  return context.exports;
}
const contact = compile('../src/enrollmentContact.ts');
const { fullStackCourse, validateFullStackRegistration, createFullStackRegistrationPayload } = compile('../src/fullStackRegistration.ts', { './enrollmentContact': contact });
const valid = { mode: 'live', name: 'Test Student', email: 'STUDENT@example.com', country: 'Myanmar', phone: '09900000000', contact: 'Viber', plan: 'full', earlyBird: false, note: '', consent: true, website: '' };

test('poster facts and dedicated route do not inherit an existing course fee or intake', () => {
  assert.equal(fullStackCourse.path, '/register/full-stack-digital-marketer');
  assert.equal(fullStackCourse.startDate, '2026-12-07');
  assert.equal(fullStackCourse.fee, 900000);
  assert.equal(fullStackCourse.installment * 3, fullStackCourse.fee);
  assert.equal(fullStackCourse.earlyBirdFee, fullStackCourse.fee * 0.9);
});

test('validates student identity and contact consent before submitting', () => {
  assert.equal(Object.keys(validateFullStackRegistration(valid)).length, 0);
  for (const [key, value] of [['name', '0'], ['email', 'student@'], ['phone', '0'], ['phone', 'not-a-phone'], ['country', 'Unknown'], ['consent', false], ['mode', 'other'], ['plan', 'other'], ['contact', 'other'], ['note', 'x'.repeat(1001)], ['website', 'spam.example']]) {
    assert.ok(validateFullStackRegistration({ ...valid, [key]: value })[key], key);
    assert.throws(() => createFullStackRegistrationPayload({ ...valid, [key]: value }));
  }
});

test('live and video registrations share the advertised fee with distinct learning modes', () => {
  for (const [mode, title] of [['live', 'Live Session'], ['video', 'Video Class']]) {
    const data = createFullStackRegistrationPayload({ ...valid, mode });
    assert.equal(data.get('learning_mode'), title);
    assert.equal(data.get('course'), 'Full Stack Digital Marketer');
    assert.equal(data.get('standard_course_fee'), '900000 MMK');
    assert.equal(data.get('email'), 'student@example.com');
    assert.equal(data.get('phone'), '+95 9900000000');
    assert.match(data.get('_subject'), new RegExp(title));
  }
});

test('installments and early-bird requests never assert that payment or eligibility was confirmed', () => {
  const data = createFullStackRegistrationPayload({ ...valid, plan: 'installments', earlyBird: true });
  assert.equal(data.get('payment_plan'), '3 x 300,000 MMK');
  assert.match(data.get('early_bird_request'), /subject to admin confirmation/);
  assert.match(data.get('early_bird_offer'), /810000.*not an automatic discount/);
  assert.equal(data.get('standard_course_fee'), '900000 MMK');
  assert.equal(data.get('payment_status'), 'Not verified - registration only');
  assert.equal(data.has('payment_slip'), false);
  assert.equal(data.has('password'), false);
});

test('shared phone formatting preserves existing enrollment behavior across supported countries', () => {
  for (const [country, phone, formatted] of [['Myanmar', '09 9000 0000', '+95 990000000'], ['Thailand', '081 234 5678', '+66 812345678'], ['UAE', '050 123 4567', '+971 501234567'], ['Singapore', '8123 4567', '+65 81234567'], ['Other', '+44 7700 900000', '+447700900000']]) {
    assert.equal(contact.isValidEnrollmentPhone(phone, country), true);
    assert.equal(contact.formatEnrollmentPhone(phone, country), formatted);
  }
  assert.equal(contact.isValidEnrollmentName('Test Student'), true);
  assert.equal(contact.isValidEnrollmentName('12'), false);
});

test('registration route stays public and uses text-only transport independently of the paused private rollout', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.match(app, /'Full Stack Registration': 'register\/full-stack-digital-marketer'/);
  assert.match(app, /FullStackRegistrationPage endpoint=\{registrationFormEndpoint\}/);
  const page = readFileSync(new URL('../src/FullStackRegistrationPage.tsx', import.meta.url), 'utf8');
  assert.match(page, /submitEnrollmentRequest\(endpoint, createFullStackRegistrationPayload\(values\), crypto.randomUUID\(\), 'formspree'\)/);
  assert.ok(!page.includes('localStorage'));
  assert.ok(!page.includes('type="file"'));
});
