# ManMandir Bridal Studio

The application in this repository is a React 19 + TypeScript + Vite single-page app using Supabase for data, authentication and storage. The production Vercel project should use `app/` as its Root Directory; `app/vercel.json` provides the SPA route rewrite.

## Local development

```sh
cd app
npm ci
cp .env.example .env.local
npm run dev
```

Set the client-side environment variables in `.env.local` (and in Vercel):

```dotenv
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<public-anon-key>
```

Never place the Supabase service-role key in a `VITE_` variable or client-side file.

## Validation

```sh
cd app
npm run check:mock
npm run build
```

`npm run build` runs the mock-content guard before TypeScript and Vite production compilation.

## Supabase rollout for the PRD features

The repository includes additive migrations `supabase/migrations/08_prd_sales_reviews_stores_settings.sql` and `09_review_security.sql`. They are ordered and must be applied to the intended Supabase project before deploying the related app code/functions. The Git push does **not** apply migrations, alter database rows or deploy Edge Functions. Review the target project and back up as appropriate, then apply the two migrations in order using the Supabase CLI or SQL Editor. The migration assumes the existing `public.admins` table has `id` and `active` columns and the existing `public.hero_videos` table is present.

Deploy these Edge Functions from `app/` after configuring their secrets:

```sh
supabase functions deploy submit-review
supabase functions deploy report-review
supabase functions deploy create-review-photo-upload
supabase functions deploy create-admin-content-upload
supabase functions deploy delete-review
```

Required Edge Function secrets/configuration:

- `ALLOWED_ORIGIN`: comma-separated exact origins, for example `https://www.example.com,https://example.com`; do not use wildcards.
- `IP_HASH_SALT`: a private random value of at least 16 characters. Review submissions, reports and photo-upload signing fail closed without it.
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`: Supabase project values. The service-role key must remain server-side.
- `RESEND_API_KEY` and `REVIEW_NOTIFICATION_EMAIL`: optional admin email notifications; if omitted or unavailable, review submission still succeeds and the admin bell continues to show pending reviews.
- `RESEND_FROM_EMAIL`: optional verified Resend sender. If unset, the function uses Resend's test sender, which is not suitable for normal production delivery.

The connected Supabase audit found no admin rows at audit time. An active authenticated admin (`public.admins.id` matching the Auth user ID and `active = true`) is required to use the new admin management screens. No admin record is seeded by this code.

## Data and release safety

The public catalog hides the 39 punctuation-only product titles and four `White dress` records identified in the approved audit without deleting or changing them. The migration creates new feature tables/policies additively and does not seed sales, stores, settings or reviews. No production migration, storage upload, data cleanup, deployment or live database write is performed by the repository changes alone.
