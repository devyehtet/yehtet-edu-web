# Private Enrollment Uploads

The private enrollment flow is staged but **not enabled** while the owner has paused public endpoint activation. Production keeps the existing Formspree transport unless `VITE_ENROLLMENT_STORAGE=supabase` is explicitly set. The existing Formspree account cannot accept attachments on its current plan; this restriction remains until private intake is activated or that plan is upgraded. No failed upload is silently resubmitted without its file.

Once enabled, the public form posts multipart data to the Supabase `enroll` Edge Function. It returns a receipt only after both the enrollment record and any attached slip are saved. A submitted slip is evidence for manual review, not an automatic payment confirmation or account activation.

## Deployment

1. Run `supabase/migrations/202610170001_private_enrollments.sql` in the existing project.
2. Deploy `supabase/functions/enroll/index.ts` as `enroll`. Disable gateway JWT verification for this **public intake-only** function, as configured in `supabase/config.toml`. It exposes no list/read/download operations.
3. The runtime automatically supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Do not copy the service key to Vercel, frontend variables, source code, or browser storage.
4. Only after function deployment, owner approval and verification, set `VITE_ENROLLMENT_STORAGE=supabase` in Vercel and redeploy. Keep the existing `VITE_SUPABASE_URL`. This flag is non-sensitive; no new frontend secrets are required. Do not set it while endpoint activation is paused.

## Privacy and Limits

- `enrollment_requests` has RLS enabled and no anonymous/authenticated grants. Only the server role and project administrators can access records.
- `enrollment-slips` is a **private** bucket. A restrictive storage policy also blocks browser roles, including any unrelated permissive bucket policies.
- Slips use random request IDs in their paths, not names/emails. No public or signed download link is returned to visitors.
- PNG, JPG, WebP and PDF signatures are checked on the server, with an 8 MiB file limit and a bounded multipart body.
- Atomic database rate limits allow 5 attempts per source IP/hour and 100 total/day. Counters use a keyed hash, not raw IP addresses, and expire after two days. Origin restrictions are not authentication; the global limit bounds anonymous abuse.
- Retries use the same request ID and payload hash to avoid duplicate records/uploads. Failed or stale requests can be retried; successful ones return the existing receipt.
- Enrollment/payment data never enters analytics events or anonymous shared app-state tables.

## Admin Review

Admin Panel > Payments has links to the authenticated Supabase dashboard. In Table Editor select `enrollment_requests`, filter `state = submitted`, and inspect the contact/payment details. The matching `slip_path` is in Storage > `enrollment-slips`. Use the dashboard's authenticated preview/download. Application order is `created_at` descending.

The LMS's existing browser-only admin login is **not** used as permission to read private financial documents. Review requires the owner's Supabase project login. Email notifications are not configured for this new intake; review the server inbox directly. Files and applications are not automatically deleted; the owner controls retention.

## Verification

Run `node --test tests/*.test.mjs` and `npm run build`. Run `supabase/tests/private_enrollment.sql` after the migration for rollback-only database assertions. Verify one clearly labeled test enrollment with a non-sensitive image, confirm the row reaches `submitted`, and verify anonymous REST and public storage URL access fail. Test retries, unsupported/oversized files, required slip validation, and a failed upload without a success screen. Do not test with real payment documents or populate a public seed file.
