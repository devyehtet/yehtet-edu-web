import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../src/authenticatedPayment.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const context = { exports: {} };
vm.runInNewContext(compiled, context);
const { readAuthenticatedPayment } = context.exports;
const student = { id: 'test-student', name: 'Test Student', email: 'student@example.com', courses: ['Test Course'] };
const payment = { course: 'Test Course', tuitionFee: 620000, paidAmount: 620000, paidDate: null };

test('reads a full payment without inventing a transfer date or copying another identity', () => {
  const result = readAuthenticatedPayment({ ...payment, studentId: 'other-student' }, student);
  assert.equal(result.studentId, student.id);
  assert.equal(result.paidAmount, 620000);
  assert.equal(result.tuitionFee - result.paidAmount, 0);
  assert.equal(result.paidDate, '');
});

test('rejects missing, malformed and unassigned-course payment metadata', () => {
  for (const value of [null, [], {}, { ...payment, course: 'Other Course' }, { ...payment, paidAmount: -1 }, { ...payment, paidAmount: NaN }, { ...payment, tuitionFee: 0 }, { ...payment, paidAmount: '620000' }]) {
    assert.equal(readAuthenticatedPayment(value, student), undefined);
  }
});

test('partial payments preserve the actual outstanding amount', () => {
  const result = readAuthenticatedPayment({ ...payment, paidAmount: 300000 }, student);
  assert.equal(result.tuitionFee - result.paidAmount, 320000);
});
