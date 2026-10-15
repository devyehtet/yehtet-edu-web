export type AuthenticatedPayment = {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  course: string;
  tuitionFee: number;
  paidAmount: number;
  paidDate: string;
  note?: string;
};

// Read only administrator-owned app_metadata after successful Supabase sign-in.
export function readAuthenticatedPayment(
  value: unknown,
  student: { id: string; name: string; email: string; courses: string[] },
): AuthenticatedPayment | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const payment = value as Record<string, unknown>;
  if (typeof payment.course !== 'string' || !student.courses.includes(payment.course)) return undefined;
  if (typeof payment.tuitionFee !== 'number' || !Number.isSafeInteger(payment.tuitionFee) || payment.tuitionFee <= 0) return undefined;
  if (typeof payment.paidAmount !== 'number' || !Number.isSafeInteger(payment.paidAmount) || payment.paidAmount < 0) return undefined;
  return {
    id: `AUTH-PAY-${student.id}-${payment.course}`,
    studentId: student.id, studentName: student.name, studentEmail: student.email,
    course: payment.course, tuitionFee: payment.tuitionFee, paidAmount: payment.paidAmount,
    paidDate: typeof payment.paidDate === 'string' ? payment.paidDate : '',
    note: typeof payment.note === 'string' ? payment.note.slice(0, 500) : undefined,
  };
}
