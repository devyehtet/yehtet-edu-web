import React, { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Check, CircleCheck, ExternalLink, Mail, MonitorPlay, Send, ShieldCheck, Video } from 'lucide-react';
import { enrollmentPhoneCountries, getEnrollmentPhoneCountry } from './enrollmentContact';
import { createFullStackRegistrationPayload, fullStackCourse, validateFullStackRegistration, type FullStackRegistration, type RegistrationErrors } from './fullStackRegistration';
import { submitEnrollmentRequest } from './enrollmentSubmission';
import { trackCourseEvent } from './marketingTracking';
import './fullStackRegistration.css';

const initialValues: FullStackRegistration = { mode: 'live', name: '', email: '', country: 'Myanmar', phone: '', contact: 'Viber', plan: 'full', earlyBird: false, note: '', consent: false, website: '' };
const money = (amount: number) => `${amount.toLocaleString('en-US')} MMK`;

export default function FullStackRegistrationPage({ endpoint, onBack }: { endpoint: string; onBack: () => void }) {
  const [values, setValues] = useState<FullStackRegistration>({ ...initialValues });
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [sendError, setSendError] = useState('');
  const inFlight = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const country = getEnrollmentPhoneCountry(values.country);
  const update = <K extends keyof FullStackRegistration>(key: K, value: FullStackRegistration[K]) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
    setSendError('');
    setStatus('idle');
  };
  const errorFor = (key: keyof FullStackRegistration) => errors[key] ? <span id={`fs-${key}-error`} className="fs-field-error">{errors[key]}</span> : null;
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current || status === 'success') return;
    const nextErrors = validateFullStackRegistration(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      const first = Object.keys(nextErrors)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    inFlight.current = true;
    setStatus('sending');
    setSendError('');
    try {
      // Text-only registration keeps the paused private-slip rollout untouched.
      await submitEnrollmentRequest(endpoint, createFullStackRegistrationPayload(values), crypto.randomUUID(), 'formspree');
      setStatus('success');
      trackCourseEvent('generate_lead', { id: fullStackCourse.id, name: fullStackCourse.name, fee: fullStackCourse.fee });
    } catch (error) {
      setStatus('error');
      setSendError(error instanceof Error ? error.message : 'Registration could not be confirmed. Your details are still here.');
    } finally {
      inFlight.current = false;
    }
  };

  return (
    <section className="fs-registration" aria-labelledby="fs-title">
      <button className="fs-back" type="button" onClick={onBack}><ArrowLeft size={16} /> All courses</button>
      <header className="fs-heading">
        <div>
          <p className="fs-kicker">December 2026 intake</p>
          <h1 id="fs-title">Full Stack <span>Digital Marketer</span></h1>
          <p className="fs-intro">သင်ယူမယ့်ပုံစံကို ရွေးပြီး အတန်းအတွက် စာရင်းပေးသွင်းနိုင်ပါပြီ။</p>
        </div>
        <div className="fs-start"><CalendarDays size={19} /><div><span>Starts</span><time dateTime={fullStackCourse.startDate}>7 December 2026</time></div></div>
      </header>
      <dl className="fs-course-facts">
        {[['42', 'Lessons'], ['40', 'Labs'], ['14 weeks', 'Duration'], ['84 hours', 'Learning time']].map(([value, label]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>

      <div className="fs-workspace">
        <div>
          {status === 'success' ? (
            <div className="fs-success" role="status" aria-live="polite">
              <CircleCheck size={44} aria-hidden="true" />
              <p className="fs-kicker">Registration received</p>
              <h2>စာရင်းပေးသွင်းမှု ရရှိပါပြီ။</h2>
              <p>ကျေးဇူးတင်ပါတယ်၊ {values.name.trim()}။ အတန်းအချိန်၊ သင်တန်းကြေးနဲ့ အတန်းဝင်ခွင့် အတည်ပြုဖို့ သင်ရွေးထားတဲ့ {values.contact} မှတစ်ဆင့် ဆက်သွယ်ပေးပါမယ်။</p>
              <dl className="fs-summary"><div><dt>Learning format</dt><dd>{values.mode === 'live' ? 'Live Session' : 'Video Class'}</dd></div><div><dt>Contact email</dt><dd>{values.email.trim()}</dd></div><div><dt>Payment plan</dt><dd>{values.plan === 'full' ? 'Full payment' : '3 installments'}</dd></div></dl>
              <p className="fs-helper">Registration is not a payment confirmation or a confirmed seat.</p>
              <button className="fs-submit" type="button" onClick={onBack}>Back to courses <ArrowRight size={18} /></button>
            </div>
          ) : (
            <form ref={formRef} id="full-stack-registration" noValidate onSubmit={submit} aria-busy={status === 'sending'}>
              <fieldset disabled={status === 'sending'} className="fs-form-fields">
                <fieldset className="fs-section">
                  <legend><span>01</span> Learning format</legend>
                  <p className="fs-section-description">Same course. Same price. Choose how you learn.</p>
                  <div className="fs-choices">
                    {(['live', 'video'] as const).map((mode) => {
                      const Icon = mode === 'live' ? Video : MonitorPlay;
                      return <label key={mode} className={`fs-choice fs-mode-${mode}`}>
                        <input type="radio" name="mode" value={mode} checked={values.mode === mode} onChange={() => update('mode', mode)} />
                        <span className="fs-choice-top"><Icon size={22} /><span className="fs-radio-mark" aria-hidden="true">{values.mode === mode && <Check size={13} />}</span></span>
                        <strong>{mode === 'live' ? 'Live Session' : 'Video Class'}</strong>
                        <span>{mode === 'live' ? 'Learn live, in real time' : 'Watch at your own pace'}</span>
                        <b>{money(fullStackCourse.fee)}</b>
                      </label>;
                    })}
                  </div>
                  {errorFor('mode')}
                </fieldset>

                <fieldset className="fs-section">
                  <legend><span>02</span> Student details</legend>
                  <div className="fs-fields-grid">
                    <label>Full name <span aria-hidden="true">*</span><input name="name" autoComplete="name" maxLength={100} value={values.name} onChange={(event) => update('name', event.target.value)} placeholder="သင့်အမည် အပြည့်အစုံ" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'fs-name-error' : undefined} required />{errorFor('name')}</label>
                    <label>Email address <span aria-hidden="true">*</span><input name="email" type="email" inputMode="email" autoComplete="email" maxLength={254} value={values.email} onChange={(event) => update('email', event.target.value)} placeholder="you@example.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'fs-email-error' : undefined} required />{errorFor('email')}</label>
                    <label>Phone country<select name="country" autoComplete="tel-country-code" value={values.country} onChange={(event) => update('country', event.target.value)}>{enrollmentPhoneCountries.map((item) => <option key={item.key} value={item.key}>{item.label} ({item.dialCode})</option>)}</select>{errorFor('country')}</label>
                    <label>Phone / Viber number <span aria-hidden="true">*</span><div className="fs-phone"><span>{country.dialCode}</span><input name="phone" type="tel" inputMode="tel" autoComplete="tel-national" maxLength={24} value={values.phone} onChange={(event) => update('phone', event.target.value)} placeholder={country.placeholder} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'fs-phone-error' : undefined} required /></div>{errorFor('phone')}</label>
                    <label className="fs-wide">Preferred contact<select name="contact" value={values.contact} onChange={(event) => update('contact', event.target.value as FullStackRegistration['contact'])}>{['Viber', 'Email', 'Phone call'].map((item) => <option key={item}>{item}</option>)}</select>{errorFor('contact')}</label>
                  </div>
                </fieldset>

                <fieldset className="fs-section">
                  <legend><span>03</span> Payment preference</legend>
                  <div className="fs-payment-options">
                    <label><input type="radio" name="plan" value="full" checked={values.plan === 'full'} onChange={() => update('plan', 'full')} /><span><strong>Full payment</strong><small>{money(fullStackCourse.fee)}</small></span></label>
                    <label><input type="radio" name="plan" value="installments" checked={values.plan === 'installments'} onChange={() => update('plan', 'installments')} /><span><strong>3 installments</strong><small>3 × {money(fullStackCourse.installment)}</small></span></label>
                  </div>
                  {errorFor('plan')}
                  <label className="fs-offer"><input type="checkbox" name="earlyBird" checked={values.earlyBird} onChange={(event) => update('earlyBird', event.target.checked)} /><span><strong>Request the first-5-students offer</strong><span>10% off · {money(fullStackCourse.earlyBirdFee)}</span><small>ပထမ ၅ ယောက်အတွင်း ပါဝင်မှုနဲ့ ပေးချေရမယ့်ပမာဏကို Admin က အတည်ပြုပေးပါမယ်။</small></span></label>
                  <label className="fs-note">Note <small>(optional)</small><textarea name="note" rows={3} maxLength={1000} value={values.note} onChange={(event) => update('note', event.target.value)} placeholder="မေးလိုတာ သို့မဟုတ် အတန်းနဲ့ပတ်သက်တဲ့ မှတ်ချက်" aria-invalid={Boolean(errors.note)} />{errorFor('note')}</label>
                </fieldset>

                <div className="fs-honeypot" aria-hidden="true"><label>Website<input name="website" value={values.website} onChange={(event) => update('website', event.target.value)} tabIndex={-1} autoComplete="off" /></label></div>
                <label className="fs-consent"><input type="checkbox" name="consent" checked={values.consent} onChange={(event) => update('consent', event.target.checked)} aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? 'fs-consent-error' : undefined} required /><span>ဒီအတန်းစာရင်းသွင်းမှုအတွက် ဆက်သွယ်ပေးရန် သဘောတူပါသည်။</span></label>
                {errorFor('consent')}
                {sendError && <p className="fs-send-error" role="alert">{sendError}</p>}
                {errors.website && <p className="fs-send-error" role="alert">{errors.website}</p>}
                <div className="fs-form-footer"><div><span>Course fee</span><strong>{money(fullStackCourse.fee)}</strong></div><button type="submit" className="fs-submit">{status === 'sending' ? 'Sending registration…' : 'Register for this course'}<Send size={18} /></button></div>
                <p className="fs-helper"><ShieldCheck size={15} /> Your details are used to follow up on this course registration.</p>
              </fieldset>
            </form>
          )}
        </div>

        <aside className="fs-overview" aria-label="Course overview">
          <a href={fullStackCourse.poster} target="_blank" rel="noopener noreferrer" className="fs-poster-link"><img src={fullStackCourse.poster} width="1080" height="1350" alt="Full Stack Digital Marketer course poster: starts 7 December 2026, live or video class, 900,000 MMK" /><span>Course poster <ExternalLink size={14} /></span></a>
          <div className="fs-instructor"><span>Instructor</span><strong>Ye Htet Aung</strong></div>
          <div className="fs-topics"><p>Course focus</p><ul>{['SEO', 'Ads', 'GA4', 'Content'].map((topic) => <li key={topic}><Check size={15} />{topic}</li>)}</ul></div>
          <p className="fs-helper"><Mail size={16} /> အတန်းအချိန်နဲ့ ငွေပေးချေမှုအသေးစိတ်ကို စာရင်းသွင်းပြီးနောက် အတည်ပြုပေးပါမယ်။</p>
        </aside>
      </div>
    </section>
  );
}
