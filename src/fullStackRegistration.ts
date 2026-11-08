import { enrollmentPhoneCountries, formatEnrollmentPhone, isValidEnrollmentName, isValidEnrollmentPhone } from './enrollmentContact';

export const fullStackCourse = {
  id: 'full-stack-digital-marketer',
  name: 'Full Stack Digital Marketer',
  path: '/register/full-stack-digital-marketer',
  startDate: '2026-12-07',
  fee: 900000,
  installment: 300000,
  earlyBirdFee: 810000,
  poster: '/full-stack-digital-marketer-2026.png',
} as const;

export type FullStackRegistration = {
  mode: 'live' | 'video';
  name: string;
  email: string;
  country: string;
  phone: string;
  contact: 'Viber' | 'Email' | 'Phone call';
  plan: 'full' | 'installments';
  earlyBird: boolean;
  note: string;
  consent: boolean;
  website: string;
};

export type RegistrationErrors = Partial<Record<keyof FullStackRegistration, string>>;

export function validateFullStackRegistration(values: FullStackRegistration): RegistrationErrors {
  const errors: RegistrationErrors = {};
  if (!['live', 'video'].includes(values.mode)) errors.mode = 'Choose a learning format.';
  if (!isValidEnrollmentName(values.name) || values.name.trim().length > 100) errors.name = 'Please enter your full name (2-100 characters).';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()) || values.email.trim().length > 254) errors.email = 'Please enter a valid email address.';
  if (!enrollmentPhoneCountries.some((country) => country.key === values.country)) errors.country = 'Choose your phone country.';
  if (!isValidEnrollmentPhone(values.phone, values.country) || !/^[+\d\s().-]+$/.test(values.phone.trim())) errors.phone = 'Please check your phone number and country code.';
  if (!['Viber', 'Email', 'Phone call'].includes(values.contact)) errors.contact = 'Choose a contact method.';
  if (!['full', 'installments'].includes(values.plan)) errors.plan = 'Choose a payment plan.';
  if (values.note.length > 1000) errors.note = 'Please keep your note within 1,000 characters.';
  if (!values.consent) errors.consent = 'Please allow us to contact you about this registration.';
  if (values.website) errors.website = 'Registration could not be sent. Please contact the school.';
  return errors;
}

export function createFullStackRegistrationPayload(values: FullStackRegistration): FormData {
  if (Object.keys(validateFullStackRegistration(values)).length) throw new Error('Please check your registration details.');
  const fields = {
    _subject: `Course registration - ${fullStackCourse.name} - ${values.mode === 'live' ? 'Live Session' : 'Video Class'}`,
    course: fullStackCourse.name,
    course_id: fullStackCourse.id,
    intake_start: fullStackCourse.startDate,
    learning_mode: values.mode === 'live' ? 'Live Session' : 'Video Class',
    name: values.name.trim().replace(/\s+/g, ' '),
    email: values.email.trim().toLowerCase(),
    phone: formatEnrollmentPhone(values.phone, values.country),
    phone_country: values.country,
    contact_preference: values.contact,
    standard_course_fee: `${fullStackCourse.fee} MMK`,
    payment_plan: values.plan === 'full' ? 'Full payment' : '3 x 300,000 MMK',
    early_bird_request: values.earlyBird ? 'Requested - first 5 students only, subject to admin confirmation' : 'Not requested',
    early_bird_offer: `${fullStackCourse.earlyBirdFee} MMK if eligible; not an automatic discount`,
    payment_status: 'Not verified - registration only',
    contact_consent: 'Agreed to contact for this course registration only',
    note: values.note.trim(),
  };
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.append(key, value);
  data.append('message', Object.entries(fields).filter(([key]) => key !== '_subject').map(([key, value]) => `${key}: ${value}`).join('\n'));
  return data;
}
