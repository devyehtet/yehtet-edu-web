import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const compile = (source, context) => vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, context);
const updates = { exports: {} };
compile(readFileSync(new URL('../src/lessonVideoUpdates.ts', import.meta.url), 'utf8'), updates);
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const tree = ts.createSourceFile('App.tsx', app, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const literals = {};
for (const node of tree.statements) if (ts.isVariableStatement(node)) for (const declaration of node.declarationList.declarations) {
  if (ts.isIdentifier(declaration.name) && declaration.initializer && ts.isStringLiteral(declaration.initializer)) literals[declaration.name.text] = declaration.initializer.text;
}
function extract(names) {
  return tree.statements.filter((node) => ts.isFunctionDeclaration(node) ? names.includes(node.name?.text) : ts.isVariableStatement(node) && node.declarationList.declarations.some((decl) => names.includes(decl.name.getText(tree)))).map((node) => node.getText(tree)).join('\n');
}
const curriculum = { ...literals, exports: {} };
compile(extract(['digitalMarketingLessons', 'modules', 'stableLessonIdsByTitle']) + '\nexports.lessons=digitalMarketingLessons; exports.modules=modules; exports.ids=stableLessonIdsByTitle;', curriculum);
const course = literals.defaultCourseTitle;
const google = { id: 'm4-l2', title: 'The Google Ads Ecosystem', courseTitle: course, moduleIndex: 3, videoUrl: updates.exports.googleAdsEcosystemVideoUrl, resource: 'Existing worksheet', requiredWatchPercentage: 80 };
const neighbor = { ...google, id: 'm4-l3', title: 'Search Intent and Keyword Strategy', videoUrl: 'https://vimeo.com/123456789' };
const normalizer = { ...literals, ...updates.exports, exports: {}, lessonCatalog: [google, neighbor], defaultLessonVideoUrls: [], lessonDurationsByTitle: {},
  getCourseLessons: (title, lessons) => lessons.filter((lesson) => lesson.courseTitle === title),
  normalizeLessonVideoUrl: (url) => url,
  isStaleMediaPlanningBuyingCourseIntroductionVideoUrl: () => false,
  normalizeLessonRecord: (value) => value,
};
compile(extract(['retiredLessonIds', 'retiredLessonTitles', 'reindexLessons', 'normalizeStoredLessons']) + '\nexports.normalize=normalizeStoredLessons;', normalizer);

test('removes only the requested lesson from the curriculum without moving module boundaries', () => {
  assert.equal(curriculum.exports.lessons.length, 55);
  assert.equal(curriculum.exports.lessons.includes('TikTok Targeting and Scaling Strategy'), false);
  assert.equal(curriculum.exports.modules[3].lessons[0], google.title);
  assert.equal(curriculum.exports.modules[3].lessons.length, 10);
  assert.equal(curriculum.exports.modules[4].lessons[0], 'Advanced Optimization Beyond A/B Testing');
  assert.equal(curriculum.exports.modules[4].lessons.length, 10);
  assert.equal(curriculum.exports.ids[google.title], 'm4-l2');
  assert.equal(curriculum.exports.ids[neighbor.title], 'm4-l3');
});

test('migrates stale cloud/device video once while preserving watch rules resources and neighboring videos', () => {
  const result = normalizer.exports.normalize([{ ...google, videoUrl: 'https://vimeo.com/111111111', requiredWatchPercentage: 90 }, neighbor]);
  assert.equal(result[0].videoUrl, updates.exports.googleAdsEcosystemVideoUrl);
  assert.equal(result[0].id, google.id);
  assert.equal(result[0].resource, 'Existing worksheet');
  assert.equal(result[0].requiredWatchPercentage, 90);
  assert.equal(result[1].videoUrl, neighbor.videoUrl);
  assert.equal(result[0].globalIndex, 0);
  assert.equal(result[1].globalIndex, 1);
});

test('retired stored lesson cannot reappear by its old ID or an alternate ID/title', () => {
  const result = normalizer.exports.normalize([{ ...google, id: 'm4-l1', title: 'TikTok Targeting and Scaling Strategy' }, { ...google, id: 'custom-retired', title: 'TikTok Targeting and Scaling Strategy' }]);
  assert.equal(result.length, 2);
  assert.ok(result.every((lesson) => lesson.title !== 'TikTok Targeting and Scaling Strategy'));
});

test('later admin video changes survive after the published revision was applied', () => {
  const first = normalizer.exports.normalize([{ ...google, videoUrl: 'https://vimeo.com/111111111' }]);
  const edited = { ...first[0], videoUrl: 'https://vimeo.com/222222222' };
  assert.equal(normalizer.exports.normalize([edited])[0].videoUrl, edited.videoUrl);
  assert.equal(Object.keys(updates.exports.getPublishedVideoUpdate('Other course', google.id)).length, 0);
});
