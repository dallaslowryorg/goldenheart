# Golden Heart v32 — Admin Setup

This revision adds the Cloudflare-backed dog admin panel. **Use the full-site ZIP for v32** because the Worker configuration and backend structure changed.

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

## 1. Deploy v32

Upload the **full v32 site** to the GitHub repository and let Cloudflare deploy it. `wrangler.jsonc` now requests D1 (`DB`) and R2 (`DOG_IMAGES`) bindings. Current Wrangler supports automatic provisioning when these bindings do not yet have resource IDs/names.

After deployment, open the Worker in Cloudflare and confirm under **Bindings** that you see:

- `DB` — D1 database
- `DOG_IMAGES` — R2 bucket
- `ASSETS` — static assets

If Cloudflare does not automatically create either resource, create a D1 database and an R2 bucket from the dashboard and bind them using those exact binding names.

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
- The optional `ADMIN_EMAILS` Worker variable can add a second code-level allowlist, but it is intentionally blank in v32 because the Access policy is the primary authorization layer.
- Public visitors can read `/api/dogs`; they cannot write to it.
- New photos are stored in R2 and served from `/media/...`.

## Backup / rollback

The v31 hard-coded roster remains bundled in `public/assets/js/dogs.js` as a public-site fallback. D1 becomes the live source once available. Before future structural database changes, export D1 or take a Cloudflare backup if available in your account.
