# Community Problems & Public Service Website

A Bengali-first community problem reporting website for a local public representative in Bangladesh. Residents can describe a local problem, optionally attach a photo and contact details, and the public can see only aggregate statistics. An authenticated admin dashboard lets approved representatives review reports, search and filter them, update status, and export CSV.

The landing page follows the supplied hand-drawn reference: painted red/green/yellow diagonal brush strokes, a top-left introduction, portrait on the left, slogan on the right, a centered call to action, and understated community statistics.

## Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 3
- React Router 7
- React Hook Form + Zod
- Supabase (Postgres, Auth, Storage)
- Lucide icons

## Features

### Public site

- Responsive Bengali landing page with a hand-painted SVG banner
- Editable content in `src/content/site.ts`
- Portrait and banner placeholders that can be replaced with real images
- Dedicated problem submission page at `/submit`
- Bengali validation for title, description, category, area, name, and phone
- Optional JPG/PNG/WebP image up to 5 MB, with preview and client-side validation
- Loading, success, duplicate, and error states
- Idempotent submissions: retries and repeated clicks cannot create duplicate rows
- Hidden honeypot field for basic spam protection
- Privacy page explaining what is collected and who can see it
- Aggregate-only public statistics; no individual report or contact detail is public

### Admin dashboard

- Email/password login through Supabase Auth
- Server-side admin authorization using the `public.admins` allow-list and Row Level Security
- Report list with pagination
- Search by title, description, or area
- Filters for category, status, area, and date range
- Status updates: received, in progress, resolved
- Private contact details visible only to admins
- Signed, time-limited image URLs
- CSV export of filtered reports
- Mobile-friendly layout

### Honest offline behavior

If `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` is missing or still contains the example values:

- The landing page shows an honest “statistics are not enabled yet” notice instead of zero or invented numbers.
- The form still validates locally but never claims that a report was saved.
- The admin page shows setup instructions instead of a fake dashboard.
- No data is written anywhere.

## Quick start

```bash
npm install
cp .env.example .env
# Fill in the two Supabase values in .env
npm run dev
```

Open `http://localhost:5173`.

Without a `.env`, the site runs in its honest “backend not configured” mode. That is expected.

### Environment variables

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Both values are public browser configuration. The anon key is safe to expose **only because** the database uses Row Level Security and the public write path is a restricted RPC.

Never put a Supabase **service-role** key in a `VITE_` variable or anywhere in this repository. A service-role key bypasses RLS.

## Supabase setup

### 1. Create a project

Create a project at [supabase.com](https://supabase.com) and copy the Project URL and anon/public key from **Project Settings → API**.

### 2. Run the migration

Open **SQL Editor** in the Supabase dashboard and run the complete contents of:

```text
supabase/migrations/20261024000000_initial_schema.sql
```

This creates:

- `public.reports` — reports with private contact fields
- `public.admins` — allow-list of admin Auth users
- `public.is_admin()` — server-side authorization helper
- `public.submit_report(...)` — the only public write path
- `public.get_public_stats()` — aggregate-only statistics
- The private `report-images` Storage bucket and its policies
- RLS policies and indexes

The script is idempotent enough to re-run during development, but review it before applying to a production project.

### 3. Create an admin user

1. In Supabase, open **Authentication → Users** and create a user with email/password.
2. Copy the user’s UUID.
3. In **SQL Editor**, run:

```sql
insert into public.admins (user_id)
values ('paste-the-auth-user-uuid-here');
```

4. Disable public sign-ups in **Authentication → Providers → Email** (or the current Auth settings). Admin accounts should be created deliberately, not through the public site.

You can now sign in at `/admin`.

### 4. Verify the security boundaries

- Open the site in a private window. The form should submit successfully.
- The public statistics should increment by one report and one submitter.
- Visit `/admin` in the private window. It should ask for login, not show reports.
- Sign in as the admin. Reports and contact details should be visible.
- Try reading `public.reports` with the anon key from a script. It must return no rows because there is no anonymous SELECT policy.
- Try inserting directly into `public.reports` with the anon key. It must fail because writes go through `submit_report()`.
- Image objects in `report-images` must not be publicly readable; admins receive short-lived signed URLs.

## How the security model works

- **No anonymous INSERT policy** exists on `public.reports`. The public form calls `submit_report()`, a `SECURITY DEFINER` function with fixed inputs and server-side validation.
- **No anonymous SELECT policy** exists on reports, so contact details and individual reports are not exposed through the API.
- **Admin reads and updates** require an authenticated user whose UUID is in `public.admins`. The check is enforced by RLS, not by hiding UI.
- **The admins table** has RLS enabled and no policies; `is_admin()` is the supported membership check.
- **The `report-images` bucket is private.** Anonymous visitors may only upload new, uniquely named images; they cannot list, read, overwrite, or delete objects. Only admins can read or delete.
- **Uploads are restricted** to JPEG, PNG, and WebP and 5 MB at both the client and bucket level.
- **Idempotency:** each form session generates a UUID. The database has a unique constraint on `client_submission_id`; retries return the existing outcome instead of inserting twice.
- **Image paths are bound to the submission id**, so a caller cannot attach an arbitrary known image path.
- **CSV export** is admin-only, and formula-like cell values are prefixed to reduce spreadsheet injection risk.

## Editing public content

Most copy and placeholders are centralized in:

```text
src/content/site.ts
```

You can change:

- Candidate name and intro text
- Slogan
- Call-to-action text and button label
- Statistics labels and empty-state note
- Portrait image path and alt text
- Optional banner artwork path
- Contact phone/email
- Privacy summary and retention text
- Internal links

### Replacing the portrait

1. Add an image to `public/images/` (recommended 4:5 aspect ratio).
2. Set `portraitImage: '/images/portrait.jpg'` in `src/content/site.ts`.
3. Update `portraitAlt` with a meaningful Bengali description.

The designed placeholder remains in use while `portraitImage` is empty.

### Replacing the banner

Add a wide painted image to `public/images/` and set `bannerImage` in `src/content/site.ts`. If it is empty, the included `public/banner.svg` is used.

Do not add a political party, election symbol, constituency, biography, achievement, or public claim unless it is supplied and approved by the site owner. The current content intentionally contains only the copy from the reference.

## Commands

```bash
npm run dev        # local development
npm run typecheck  # TypeScript project check
npm run build      # production build
npm run preview    # preview the production build
```

The production output is written to `dist/`.

## Deployment

### Vercel

1. Import the repository.
2. Framework preset: Vite.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the project environment variables.
6. Deploy.

`vercel.json` contains the SPA rewrite so `/submit`, `/privacy`, and `/admin` work on direct navigation.

### Netlify

1. Build command: `npm run build`.
2. Publish directory: `dist`.
3. Add the same two environment variables.
4. Deploy.

`public/_redirects` provides the SPA fallback.

### Other static hosts

Configure a fallback so unknown paths serve `index.html`. The app uses client-side routing.

## Project structure

```text
src/
  components/
    admin/       admin gate, dashboard, filters, report detail, login
    home/        brush banner, portrait card, statistics
    layout/      page shell, footer, scroll restoration
    submit/      report form
    ui/          notice, spinner, status badge
  content/       editable site copy
  lib/           Supabase client, API, validation, formatting, IDs
  pages/         home, submit, privacy, admin, 404
  types/         report types and category/status definitions
supabase/
  migrations/    database schema, RLS, RPCs, storage policies
public/
  banner.svg     painted hero artwork
  favicon.svg
  _redirects     Netlify SPA fallback
```

## Operational notes before launch

- **Rate limiting:** the app includes idempotency and a honeypot, but production abuse protection should also be configured at the platform edge (for example Supabase API rate limits, Cloudflare, or a CAPTCHA such as Turnstile if needed). Postgres RLS is not a substitute for traffic control.
- **Image orphans:** if a network failure happens after an image upload but before the report is saved, the client attempts cleanup. Anonymous users cannot delete storage objects, so a failed cleanup can leave an unreferenced object. Periodically review the bucket or add an admin-only cleanup job.
- **Legal review:** review the privacy page, retention wording, and data-handling practice with the site owner before public launch.
- **Admin accounts:** create them deliberately in Supabase Auth, add their UUIDs to `public.admins`, and disable public sign-ups.
- **Backups:** enable database backups appropriate to the project’s plan.
- **No fake data:** statistics are calculated from `public.reports`. There are no seed rows, hardcoded counts, or demo reports.

## License

Private project. Add a license only if the owner intends to publish it as open source.
