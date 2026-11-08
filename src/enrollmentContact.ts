export type EnrollmentPhoneCountry = {
  key: string;
  label: string;
  dialCode: string;
  placeholder: string;
  minDigits: number;
  maxDigits: number;
};

export const enrollmentPhoneCountries: EnrollmentPhoneCountry[] = [
  { key: 'Myanmar', label: 'Myanmar', dialCode: '+95', placeholder: '09 541 4499', minDigits: 7, maxDigits: 11 },
  { key: 'Thailand', label: 'Thailand', dialCode: '+66', placeholder: '081 234 5678', minDigits: 8, maxDigits: 10 },
  { key: 'UAE', label: 'UAE', dialCode: '+971', placeholder: '50 949 1015', minDigits: 8, maxDigits: 10 },
  { key: 'Singapore', label: 'Singapore', dialCode: '+65', placeholder: '8123 4567', minDigits: 8, maxDigits: 8 },
  { key: 'Other', label: 'Other country', dialCode: '+', placeholder: 'Country code + phone number', minDigits: 8, maxDigits: 15 },
];

export function getEnrollmentPhoneCountry(key: string) {
  return enrollmentPhoneCountries.find((country) => country.key === key) || enrollmentPhoneCountries[0];
}

export function isValidEnrollmentName(name: string) {
  const trimmed = name.trim().replace(/\s+/g, ' ');
  return trimmed.length >= 2 && /\p{L}/u.test(trimmed) && !/^\d+$/.test(trimmed);
}

export function isValidEnrollmentPhone(phone: string, key: string) {
  const country = getEnrollmentPhoneCountry(key);
  const digits = phone.replace(/\D/g, '');
  return digits.length >= country.minDigits && digits.length <= country.maxDigits;
}

export function formatEnrollmentPhone(phone: string, key: string) {
  const country = getEnrollmentPhoneCountry(key);
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (country.dialCode === '+') return `+${digits}`;
  return `${country.dialCode} ${digits.replace(/^0+/, '') || digits}`;
}
