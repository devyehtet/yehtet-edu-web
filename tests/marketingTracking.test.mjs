import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../src/marketingTracking.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const course = { id: 'digital-media-planning-buying', name: 'Digital Media Planning & Buying', fee: 650000 };

function setup(hostname = 'www.yehtetedu.com', failScript = false) {
  const scripts = [];
  const window = { location: { hostname } };
  const context = { exports: {}, window, document: {
    createElement: () => ({}),
    head: { appendChild(script) { if (failScript) throw new Error('Blocked'); scripts.push(script); } },
  } };
  vm.runInNewContext(compiled, context);
  return {
    ...context.exports, window, scripts,
    google: () => Array.from(window.dataLayer || [], (command) => Array.from(command)),
    pixel: () => Array.from(window.fbq?.queue || []).filter((command) => command[0] === 'trackSingle'),
  };
}

test('production public routes initialize once and deduplicate repeated React effects', () => {
  const tracker = setup();
  tracker.trackPublicPage('/');
  tracker.trackPublicPage('/');
  tracker.trackPublicPage(`/courses/${course.id}`, course);
  tracker.trackPublicPage(`/courses/${course.id}`, course);
  assert.equal(tracker.scripts.length, 1);
  assert.equal(tracker.metaPixelId, '1429780235198509');
  assert.equal(tracker.window.fbq.disablePushState, true);
  assert.equal(tracker.window.fbq.queue.find((command) => command[0] === 'init')[1], tracker.metaPixelId);
  assert.deepEqual(tracker.pixel().map((event) => event[2]), ['PageView', 'PageView', 'ViewContent']);
  assert.deepEqual(tracker.google().map((event) => event[1]), ['view_item']);
  assert.equal(tracker.google()[0][2].send_to, 'G-ZGY0ME7M3H');
  assert.equal(tracker.google()[0][2].items[0].item_id, course.id);
  assert.equal(tracker.window.fbq.queue[0][1], 'autoConfig');
  assert.equal(tracker.window.fbq.queue[0][2], false);
});

test('enrollment entry and confirmed submission have distinct events, never Purchase', () => {
  const tracker = setup();
  tracker.trackPublicPage(`/enroll/${course.id}`, course);
  tracker.trackCourseEvent('generate_lead', { ...course, email: 'must-not-be-forwarded@example.com', phone: 'private', paymentReference: 'private' });
  assert.deepEqual(tracker.google().map((event) => event[1]), ['begin_checkout', 'generate_lead']);
  assert.deepEqual(tracker.pixel().map((event) => event[2]), ['PageView', 'InitiateCheckout', 'Lead']);
  const lead = tracker.google()[1][2];
  assert.equal(lead.value, undefined);
  assert.equal(lead.course_id, course.id);
  assert.doesNotMatch(JSON.stringify([tracker.google(), tracker.pixel()]), /must-not-be-forwarded|private|Purchase|paymentReference/);
});

test('private and unknown routes do not load Pixel or emit events', () => {
  const tracker = setup();
  for (const path of ['/login', '/admin', '/private', '/student-dashboard', '/lesson-player', '/courses/unknown']) tracker.trackPublicPage(path, course);
  assert.equal(tracker.scripts.length, 0);
  assert.equal(tracker.google().length, 0);
});

test('local and preview environments do not pollute production funnel', () => {
  for (const host of ['127.0.0.1', 'localhost', 'preview.vercel.app']) {
    const tracker = setup(host);
    tracker.trackPublicPage('/');
    tracker.trackCourseEvent('generate_lead', course);
    assert.equal(tracker.scripts.length, 0);
    assert.equal(tracker.google().length, 0);
  }
});

test('back navigation counts a new visit without another script', () => {
  const tracker = setup('yehtetedu.com');
  tracker.trackPublicPage(`/courses/${course.id}`, course);
  tracker.trackPublicPage('/courses');
  tracker.trackPublicPage(`/courses/${course.id}`, course);
  assert.equal(tracker.google().length, 2);
  assert.equal(tracker.scripts.length, 1);
});

test('blocked analytics cannot throw into the enrollment workflow', () => {
  const tracker = setup('www.yehtetedu.com', true);
  assert.doesNotThrow(() => tracker.trackCourseEvent('generate_lead', course));
});
