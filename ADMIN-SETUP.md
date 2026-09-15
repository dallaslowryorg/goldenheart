# Golden Heart v33 — Admin Setup

v32 added the Cloudflare-backed dog admin panel. The first v32 deployment successfully created the D1 database but failed while adding the new R2 binding. **v33 fixes that binding configuration. If your GitHub repository already contains the v32 files, use the v33 patch only.**

## What v32 adds

- `/admin` dog-directory dashboard
- Add dogs
- Edit dog profiles
- Delete dogs
- Hide/show dogs without deleting them
- Upload/replace dog photos
- Cloudflare D1 database for dog profile data
- Cloudflare R2 bucket for new admin-uploaded photos
- Public dog pages read the live D1 directory, with the bundled v31 roster retained as a fail-safe if the API is unavailable
- Admin API refuses access unless Cloudflare Access authenticated the request

## 1. Deploy v33

Apply the **v33 patch** to the repository that already contains v32, then let Cloudflare deploy it. The D1 database created during the failed v32 build is now pinned by ID, and the R2 binding now uses the explicit bucket name `goldenheart-dog-images`.

After deployment, open the Worker in Cloudflare and confirm under **Bindings** that you see:

- `DB` — D1 database
- `DOG_IMAGES` — R2 bucket
- `ASSETS` — static assets

Wrangler should create/bind the named R2 bucket on this deployment. If Cloudflare reports that `goldenheart-dog-images` does not exist rather than provisioning it, create an R2 bucket with that exact name in the dashboard and retry the build. Do **not** create another D1 database; `goldenheart-db` already exists.

## 2. Protect the admin paths with Cloudflare Access

Do **not** protect the entire Golden Heart Worker, because the public website must remain public. Create a hostname/path-based Access application for the admin routes only.

In **Zero Trust → Access → Applications**, create a self-hosted application and protect these paths on the current site:

- `goldenheart.slowry.workers.dev/admin*`
- `goldenheart.slowry.workers.dev/api/admin/*`

When the custom domain is connected later, add the equivalent `goldenheartservicedogs.com/admin*` and `goldenheartservicedogs.com/api/admin/*` paths.

For the Allow policy, add **your email address only for the initial test**. Enable **One-time PIN** as a login method if it is not already enabled. Cloudflare will email a short-lived code when you sign in.

Nicole's email can be added to the same Access Allow policy later. Nothing in the website code has to change.

## 3. Test the panel

Go to:

`https://goldenheart.slowry.workers.dev/admin`

Sign in with the email you allowed in Access. The first request initializes the D1 schema and, if the database is empty, imports the current dog roster automatically.

Test in this order:

1. Open an existing dog and make a small text change.
2. Save and open `/dogs` in another tab to confirm it appears.
3. Upload a replacement photo to a test dog.
4. Add a temporary test dog.
5. Delete the temporary test dog.

## Security notes

- `/api/admin/*` returns 401 unless Cloudflare Access authenticated the request.
- Mutation requests are same-origin checked.
- The optional `ADMIN_EMAILS` Worker variable can add a second code-level allowlist, but it is intentionally blank because the Access policy is the primary authorization layer. v34 also defines `ACCESS_TEAM_DOMAIN` so the Worker can validate the Access browser session when `ctx.access` is unavailable behind Cloudflare Static Assets.
- Public visitors can read `/api/dogs`; they cannot write to it.
- New photos are stored in R2 and served from `/media/...`.

## Backup / rollback

The v31 hard-coded roster remains bundled in `public/assets/js/dogs.js` as a public-site fallback. D1 becomes the live source once available. Before future structural database changes, export D1 or take a Cloudflare backup if available in your account.
