# Full Stack Digital Marketer Registration

Dedicated public route: `/register/full-stack-digital-marketer`. The Courses page links to it. It is a registration form, not a student account creation or automatic payment confirmation flow.

Facts from the supplied poster: starts 7 December 2026; live session or self-paced video class; 42 lessons, 40 labs, 14 weeks, 84 hours; 900,000 MMK for either format, or 3 x 300,000 MMK. The first five students may receive 10% off (810,000 MMK). Availability, eligibility, installment dates and the final payable amount require manual administrator confirmation; no remaining-seat counter is fabricated.

The form collects validated name, email, country phone/Viber number, preferred contact, learning format, payment preference, optional early-bird request and note, plus course-contact consent. It posts text-only to the existing Formspree destination, optionally overridden with `VITE_FORMSPREE_REGISTRATION_ENDPOINT`. The course and learning format are included in the subject and message. It does not upload slips or enable the paused Supabase intake. Failed submissions retain form state, and success is shown only after the service confirms acceptance. No registration details are saved in localStorage or sent to analytics.

The timetable is not provided in the poster, so no weekdays or session times are invented. The team follows up after registration. The supplied poster is served locally at `/full-stack-digital-marketer-2026.png`.

Verification: `node --test tests/*.test.mjs` and `npm run build`; check the direct URL, refresh/back navigation, mobile layout, field validation, both format/payment options and confirmed/error submission states with a mocked service. Do not create real enrollment requests during smoke tests.
