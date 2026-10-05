# Ye Htet - Digital Edu LMS

A local React + Vite + Tailwind prototype for a Digital Marketing LMS website.

## Run locally in VS Code

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal, usually:

```bash
http://localhost:5173
```

## Data server

Run `supabase-schema.sql` in the Supabase SQL Editor after every schema change. The app stores non-sensitive shared lessons/meetings, lesson comments, and student progress in Supabase. Student passwords and tuition payments are kept out of anonymous cloud sync.

## Deployment environment

Set these variables in your hosting provider:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_ADMIN_USERNAME=...
VITE_ADMIN_PASSWORD=...
VITE_STUDENT_DEFAULT_PASSWORD=...
```

The local development server still supports the previous test credentials on `localhost`, but production builds require the environment variables above.
