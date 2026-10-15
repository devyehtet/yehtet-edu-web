# Website measurement

- Google Tag Manager: `GTM-PWD8TG8N` (existing container).
- Google Analytics 4: `G-ZGY0ME7M3H` (existing Google Tag in GTM).
- Meta Pixel: `1464719308887709`, dataset **Ye Htet - Digital EDU**, owned by **Ye Htet Aung - Digital**.

GTM remains responsible for Google initialization and its existing SPA page-view trigger. Do not install another Google base tag or add a second history page-view tag. Funnel events use the existing Google Tag command queue with an explicit `send_to`. Meta is loaded by `src/marketingTracking.ts`, not GTM; do not also add its base code to GTM.

| Action | GA4 | Meta |
| --- | --- | --- |
| Public page visit | Existing GTM page-view setup | PageView |
| Public course detail | view_item | ViewContent |
| Open course enrollment URL | begin_checkout | InitiateCheckout |
| Formspree confirms a successful submission | generate_lead | Lead |

Course IDs are stable URL slugs, allowing course-specific audiences. Prices on view/start events are advertised course fees in MMK, not collected revenue. A submission is a lead, not a verified enrollment or payment. No Purchase event is sent.

Explicit funnel parameters contain only public course ID, name, advertised price and currency. Names, emails, phone numbers, payment notes, transaction IDs and attachments are not passed to this module. Automatic Meta configuration is disabled and Automatic Advanced Matching was left off in the setup wizard. Existing platform-level collection and cookie behavior are separate from these explicit parameters.

The new Meta route tracking skips login and authenticated workspaces. Existing GTM page-view behavior is unchanged. New funnel events and Meta initialization are restricted to `yehtetedu.com` and `www.yehtetedu.com`; localhost and Vercel previews do not generate them.

Run `node --test tests/marketingTracking.test.mjs` and `npm run build`. For live verification use GA4 Realtime/DebugView and Meta Events Manager Test Events. Do not submit a fake live enrollment merely to test tracking; mock the Formspree response in an isolated test instead. Ad blockers, browser privacy controls and reporting delays can prevent or delay delivery.
