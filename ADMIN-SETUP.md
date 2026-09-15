# Golden Heart v47 — Admin Setup

v32 added the Cloudflare-backed dog admin panel. Later revisions completed Access authentication, D1/R2 setup, Handler / Client names, Client Stories management, and dynamic public rendering. **v47 reflects the live production domain while preserving the existing D1/R2 admin architecture and current records.**

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

In **Zero Trust → Access → Applications**, the production admin paths are now protected at:

- `goldenheartservicedogs.com/admin*`
- `goldenheartservicedogs.com/api/admin*`

The original Workers hostname may remain protected as a temporary fallback:

- `goldenheart.slowry.workers.dev/admin*`
- `goldenheart.slowry.workers.dev/api/admin*`

For the Allow policy, add **your email address only for the initial test**. Enable **One-time PIN** as a login method if it is not already enabled. Cloudflare will email a short-lived code when you sign in.

Nicole's email can be added to the same Access Allow policy later. Nothing in the website code has to change.

## 3. Test the panel

Go to:

`https://goldenheartservicedogs.com/admin`

Sign in with the email you allowed in Access. The first dog-directory request initializes the D1 schema and, if the database is empty, imports the current dog roster automatically. v35 keeps `/api/admin/me` database-free and makes seeding idempotent; v36 fixes the schema-creation call so D1 can successfully create the `dogs` table on first load.

Test in this order:

1. Open an existing dog and make a small text change.
2. Save and open `/dogs` in another tab to confirm it appears.
3. Upload a replacement photo to a test dog.
4. Add a temporary test dog.
5. Delete the temporary test dog.


## Dog editor behavior (v44+)

The dog form intentionally hides implementation details that Nicole should not have to manage:

- **Status** is one selector instead of separate internal/public status fields.
- **Program progress** appears only for Available, Pending, and Matched/In Training/Transitioning dogs.
- **Graduation year** appears only for Graduates.
- **Display order** is automatic. Existing dogs keep their current order and new dogs are added after the current roster.
- **Handler / Client name** is optional and can be left blank for available dogs or privacy-sensitive placements.
- **Profile description** is optional. If it is blank when saved, the Worker creates a simple public description from the profile details.
- Switching a dog to Graduate clears obsolete progress text; switching away from Graduate clears the graduation year.

## Security notes

- `/api/admin/*` returns 401 unless Cloudflare Access authenticated the request.
- Mutation requests are same-origin checked.
- The optional `ADMIN_EMAILS` Worker variable can add a second code-level allowlist, but it is intentionally blank because the Access policy is the primary authorization layer. v34 also defines `ACCESS_TEAM_DOMAIN` so the Worker can validate the Access browser session when `ctx.access` is unavailable behind Cloudflare Static Assets.
- Public visitors can read `/api/dogs`; they cannot write to it.
- New photos are stored in R2 and served from `/media/...`.

## Backup / rollback

The v31 hard-coded roster remains bundled in `public/assets/js/dogs.js` as a public-site fallback. D1 becomes the live source once available. Before future structural database changes, export D1 or take a Cloudflare backup if available in your account.


## Client Stories admin (v42+)

The existing Cloudflare Access application already covers the Client Stories admin because `/admin*` and `/api/admin*` are protected. No additional Access application is required.

- Dogs: `/admin`
- Client Stories: `/admin/stories`
- Public stories API: `/api/stories`

The first request after deploying v42 creates and seeds the D1 `stories` table from the currently approved stories. Story images and optional videos uploaded from the admin panel use the existing `DOG_IMAGES` R2 binding under the `stories/` prefix.
