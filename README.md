# Golden Heart Service Dogs Website

Static Cloudflare Workers site for **Golden Heart Service Dogs, LLC**.

**Current revision: v36**

## Revision History


### v36 — D1 Schema Initialization Fix
- Fixed the first-run D1 schema error `incomplete input: SQLITE_ERROR` shown when creating the `dogs` table.
- Root cause: D1 `exec()` splits multiple SQL queries on newline boundaries, while the previous schema passed a multi-line `CREATE TABLE` statement through `exec()`.
- Schema creation now runs each complete `CREATE TABLE` / `CREATE INDEX` statement separately through D1 prepared statements.
- Verified the resulting schema locally with SQLite and rechecked Worker JavaScript syntax.
- No Access-policy, R2, dog-profile, photo, or public-site content changes.
- **Deployment: patch only.**


### v35 — First-Run D1 Initialization Hardening
- Fixed a first-run race condition in the admin panel where `/api/admin/me` and `/api/admin/dogs` could initialize/seed D1 at the same time.
- `/api/admin/me` no longer touches D1, so only the dog-directory request performs first-run initialization.
- Seed inserts now use `INSERT OR IGNORE`, making initial seeding idempotent if two requests ever reach an empty database concurrently.
- Admin API errors now display the server-provided detail message, making future D1/R2 setup issues much easier to diagnose.
- No schema, R2, Access-policy, or public-site data changes.
- **Deployment: patch only.**


### v34 — Cloudflare Access + Static Assets Authentication Fix
- Fixed the admin authentication bridge for the Worker Static Assets architecture.
- Cloudflare documents that `ctx.access` is not passed from the Static Assets router to the user Worker; the admin now falls back to the authenticated `CF_Authorization` session and Cloudflare `get-identity` endpoint.
- Added the Cloudflare Access team domain as `ACCESS_TEAM_DOMAIN`.
- No D1 or R2 changes; existing data/bindings remain intact.
- **Deployment: patch only.**


### v33 — Cloudflare Binding Provisioning Fix
- **Patch-only update** when the repository already contains v32. The failed v32 build log confirms the v32 admin files are already present in the repository.
- Pinned the D1 `DB` binding to the database Cloudflare successfully created during the failed v32 deployment.
- Added the explicit R2 bucket name `goldenheart-dog-images` to the `DOG_IMAGES` binding so Wrangler provisions/binds a real bucket instead of attempting to inherit a binding that did not exist on the previous Worker version.
- Updated the admin setup notes for the corrected first deployment.

### v32 — Cloudflare Dog Admin (D1 + R2 + Access)
- **Full-site upload required for this revision** because the project changes from static-assets-only to a Worker + static-assets application.
- Added `/admin` as a mobile-friendly dog-directory management panel.
- Added create, edit, hide/show, photo replacement, and delete controls for dog profiles.
- Added a Cloudflare D1-backed live dog directory and automatic first-run import of the existing v31 roster.
- Added an R2-backed image upload pipeline for photos uploaded through the admin panel; browser-side resizing converts normal photos to optimized WebP before upload when supported.
- Added authenticated admin API endpoints; they refuse access unless Cloudflare Access has authenticated the request.
- Added same-origin checks for create/update/delete/upload requests.
- Updated the public dog roster to load current D1 data from `/api/dogs`, while retaining the existing bundled roster as a fail-safe if the database/API is unavailable.
- Added `ADMIN-SETUP.md` with the one-time Cloudflare D1, R2, and Access configuration steps.
- Access authorization is intentionally configured in Cloudflare rather than hard-coded, so the initial test can allow Scott's email and Nicole can be added later without another code revision.


### v31 — Expanded Client Testimonials
- Added seven approved client/family testimonials to the Client Stories page: Quincey Contrill & Oakley, Scott & Ruby, Solomon & Whiskey, Jeremy & Remington, Debbie & Winnie, Sheila & Lucy, and Jerry & Ruger.
- Added the seven supplied testimonial photos as optimized WebP assets.
- Added responsive testimonial cards with program/location context and expandable full-text sections for longer testimonials.
- Preserved the supplied meaning and voice while cleaning minor punctuation/spacing for web readability.
- Kept Mara & Alfredo as the lead full story and Brielle & Bear as the media-story feature.


### v29 — First Client Story: Mara P. & Alfredo
- Added the first approved Golden Heart client testimonial featuring Mara P. and Alfredo.
- Added the supplied client/team photo as an optimized web image without altering the original composition.
- Added a new **Client Stories** page with the full testimonial, Oklahoma attribution, PTSD / psychiatric-service-dog context, and nine-month team-training journey.
- Added a featured testimonial section to the homepage with a short excerpt and link to the full story.
- Added **Client Stories** to the shared footer and to the XML sitemap.
- Kept the testimonial date as **June 8, 2026** without a weekday because the supplied weekday/date combination was internally inconsistent.


### v28 — Nicole Policy Clarifications, Hours & Service-Dog Focus
- Added confirmed business hours: Monday–Friday, 8:00 AM–5:00 PM Central Time, with additional appointments available by request outside regular hours.
- Reframed Nicole Ingraham's credentials section around more than a decade of practical hands-on experience and learning under experienced professional trainers rather than unverified formal-certification claims.
- Removed therapy-dog training from current public offerings across the homepage, Training page, FAQ, Contact page, inquiry-form categories, and supporting metadata.
- Clarified long-distance travel: U.S. placements beyond approximately 900 miles are custom quoted; the $5,500–$8,000 range applies to international travel/placement logistics when applicable.
- Added pediatric-placement guidance: children and minors are evaluated individually; a parent/legal guardian participates, and clients under age 13 or those needing additional assistance have a designated secondary handler.
- Added careful medical-alert language emphasizing individual evaluation, demonstrated dog ability, temperament, training, and handler-specific need rather than guaranteed alert types.
- Expanded Forever Care through service-dog retirement, including the typical 8–11 year retirement range, case-by-case retirement decisions, successor-dog planning, and the preference for retired dogs to remain with their handler when appropriate.
- Added business hours to Contact and FAQ content and to homepage structured data.
- Recorded `goldenheartservicedogs.com` as Nicole's approved target domain; canonical URLs remain on the current Workers domain until the custom domain is actually registered and connected.
- Dog-profile self-editing remains a future CMS/admin option; the current site is a static Cloudflare/GitHub build and has no public admin dashboard.

### v27 — Official Facebook Link
- Added Golden Heart Service Dogs’ official Facebook page to the shared site footer.
- Added a Facebook contact card to the Get Started page.
- Added the official Facebook URL to the homepage Organization structured data via `sameAs`.
- No program, pricing, dog-status, or placement data changed in this revision.

### v26 — Veterans Page Photo Formatting
- Standardized the Veterans-page feature image to a true portrait-first 4:5 frame.
- Rebuilt the Public Access photo section as three equal portrait cards instead of a landscape mosaic.
- Removed the repeated Ruby image from the Public Access section and replaced it with a separate training image.
- Reformatted Graduation Milestones as consistent 3:4 portrait cards using `object-fit: contain` so graduation photos are not aggressively cropped.
- Removed the tablet-only horizontal milestone-card treatment on the Veterans page.
- Added mobile rules so veteran-team and graduation photos remain full-width portrait images without landscape recropping.

### v25 — Honey Pending Service-Dog Profile
- Added Honey to the Our Dogs directory with the newly supplied portrait.
- Added confirmed details: female, 7 months old, current status **Pending**.
- Added her confirmed training focus: **Medical Alert** and **Psychiatric Support**.
- Added a separate Pending roster category, filter, count, badge style, and status-guide explanation so Honey is not inaccurately shown as Available or Matched.

### v24 — Forever Care Photo Replacement
- Replaced the homepage Forever Care image with the newly supplied photo of three young Golden Retrievers.
- Removed Ruby from that homepage feature image so the section now uses a warmer general Golden Heart training image rather than an individual graduate portrait.
- Updated the image alt text to describe the three Golden Retrievers accurately.
- Ruby’s Our Dogs profile, veteran-placement classification, and Veterans-page imagery remain unchanged.

### v23 — Macaroni Available Candidate Profile
- Added Macaroni to the Our Dogs directory with the newly supplied portrait.
- Added confirmed details: male, 11 months old, available for pairing/contract.
- Added his current program assessment as a **Level 2 candidate with possible Level 3 potential**, subject to final client needs, task complexity, and training fit.
- Available-dog counts now update automatically through the existing dynamic roster logic.

### v22 — Dumbledore Photo Update
- Replaced Dumbledore's Our Dogs profile image with the newer supplied portrait.
- No changes were made to Dumbledore's availability or profile details.

### v21 — Ruby Forever Care Photo Update
- Replaced the resting/office photo of Ruby with a happier confirmed Ruby graduation portrait.
- Updated the homepage Forever Care image to show Ruby wearing her graduation cap and Grad Squad bandana.
- Updated the same Ruby image used in the Veterans public-access photo mosaic so the older resting photo is no longer shown publicly.
- Left Ruby’s Our Dogs graduate profile and veteran-placement classification unchanged.

### v20 — Veteran Placement Total Restored to 7
- Kept Max correctly classified as a non-veteran client match.
- Restored the confirmed veteran-client placement total to **7** based on the clarified overall Golden Heart count.
- The five veteran-placement dogs with public profiles remain Ruby, Whiskey, Murphy, Remington, and Ruger.
- Two additional confirmed veteran placements are included in the total without public dog profile cards.
- Veteran-organization placements remain a separate total of **4**.
- Updated the homepage, Veterans page, dynamic program count, and revision documentation.

### v19 — Max Veteran-Placement Classification Correction
- Corrected Max on the Our Dogs page: he is paired with a client in Connecticut but is **not** a veteran placement.
- Removed the Veteran Placement tag from Max and changed his status to “Paired with Client • 75% Complete.”
- Updated Max’s profile language to refer to his person/handler without identifying the client as a veteran.
- Temporarily reduced the veteran-client placement total from 7 to **6** based on the list then available; v20 restores the confirmed overall total to **7** after clarification.
- Veterans page at that revision showed five public veteran-placement dog profiles plus one additional placement; v20 updates the non-public remainder to two while keeping Max excluded from veteran classification.
- Veteran-organization placements remain unchanged at 4.

### v18 — Expanded Dog Profiles: Max, Liberty, Flounder, Rango & Oakley
- Added Liberty to the Our Dogs roster with her supplied photo and confirmed profile: Golden Retriever, female, 1½ years old, midway through her program, Michigan, with PTSD, psychiatric-support, and autism-support training focus.
- Updated Flounder with the newly supplied photo and confirmed profile: Golden Retriever, male, 11 months old, midway through his program, Florida, with PTSD, psychiatric-support, and autism-support training focus.
- Updated Rango with the newly supplied handler photo and confirmed graduate profile: Golden Retriever, male, 1½ years old, 2026 graduate in Alabama, with PTSD, psychiatric-support, and autism-support training focus.
- Updated Oakley with the newly supplied photo and confirmed profile: Golden Retriever, female, 1½ years old, approximately 80% through her program in Oklahoma, with psychiatric-support and autism-support training focus.
- Reconfirmed Max's supplied lake-side portrait and existing profile: Golden Retriever, male, 1 year old, approximately 75% through his program, transitioning to Connecticut full-time with his person next month, with PTSD, psychiatric-support, detection, bedbug-detection, and educational work.
- Matched/transitioning roster count now includes Liberty automatically through the dynamic dog-directory count.


### v17 — Max Profile & Transition Update
- Replaced Max's Our Dogs / Veterans roster image with the newly supplied lake-side service-dog portrait.
- Added Max's confirmed breed and sex: Golden Retriever, male, age 1 year.
- Updated Max to approximately 75% through his program and scheduled to transition to Connecticut full-time with his person next month.
- Added Max's confirmed training focus: PTSD, psychiatric support, detection, bedbug detection, and educational work.
- Expanded dog cards to support optional breed, program-progress, and training-focus details when confirmed for an individual dog.

### v16 — Service-Dog Program Detail, Pairing & Forever Care
- Updated all three service-dog program ranges to Nicole's current figures: Level One $7,500–$10,500, Level Two $12,500–$16,000, and Level Three $18,000–$22,000.
- Added detailed examples of Level One, Level Two, and Level Three task work while preserving case-by-case medical, mobility, and alert limitations.
- Added a clear explanation that program level is based on actual task/training complexity, environment, dog abilities, and handler preparation—not diagnosis alone.
- Added program-inclusion details covering obedience, public access, environmental exposure, disability-specific tasks, handler education, transition work, appropriate veterinary care, and ongoing support.
- Added Golden Heart's four typical payment structures, intake-before-payment policy, halfway-program non-refundable policy, and program-property language, with a clear statement that the signed contract controls.
- Added confirmed training-timeframe guidance: several months to more than a year, with many dogs requiring roughly 8–10 months or longer and specialized placements potentially exceeding a year.
- Added the confirmed policy that Golden Heart does not train client-owned dogs for the service-dog program; dogs are selected and provided through Golden Heart.
- Expanded the pairing process with current documentation requirements and stronger warnings not to submit sensitive documents through the public website form.
- Added placement-troubleshooting, return/retraining/reassignment language, and more detailed Forever Care / refresher-training guidance.
- Expanded Nicole Ingraham's training-background section while clarifying that Golden Heart's current public services remain focused on service dogs and occasional therapy-dog training.
- Expanded the initial website inquiry form to collect basic fit information (service needs, routine, household, prior service-dog experience) without requesting sensitive documents.
- Updated the homepage brand promise to the confirmed message: “Train. Place. Support.” and “Every dog has a purpose. Every team deserves support.”


### v15 — Inquiry Form Infrastructure & Routing
- Prepared the website inquiry form for Formspree while keeping it safely inactive until a Formspree endpoint is supplied.
- Set `gldnheartservicedogs@gmail.com` as the documented destination for website inquiries.
- Added one central `GH.formEndpoint` setting in `public/assets/js/site.js`; once a Formspree form is created, only that endpoint needs to be added to activate submissions.
- Added AJAX form submission with accessible sending, success, and failure states.
- Added a spam honeypot field and preserved the warning not to send bank statements, medical records, or other sensitive documents through the initial inquiry form.
- Added inquiry-type routing for Service Dog, Therapy Dog, Veteran, Partnership, and General inquiries.
- Updated relevant site buttons to preselect the appropriate inquiry type when visitors reach the contact page.
- Kept phone and email fallbacks visible whenever the web endpoint is unavailable.
- Corrected stale README descriptions for the Training and Partnership pages.

### v14 — Nicole-Confirmed Business, Training & Service-Area Information
- Added Golden Heart public contact information: `gldnheartservicedogs@gmail.com`, `918-402-2071`, and Tulsa, Oklahoma base location.
- Expanded Nicole Ingraham's public biography with more than a decade of hands-on dog-training experience and her confirmed training philosophy.
- Corrected the Training page and homepage to reflect Golden Heart's actual scope: service-dog training and occasional therapy-dog training only; no standalone puppy or general pet-obedience programs.
- Expanded service-area language to reflect nationwide availability and case-by-case international placements.
- Added confirmed Tulsa-based travel guidance: $3,500 within 500 miles, $4,200 within 900 miles, individual quotes beyond approximately 900 miles, and international travel typically around $5,500–$8,000 depending on distance and logistics.
- Added long-distance transition options including delivery, in-person team training, remote follow-up, and additional transition arrangements.
- Reworked the Partnership page to remove donation/sponsorship solicitation and clearly state that Golden Heart Service Dogs, LLC is a for-profit business that is not currently accepting charitable donations or sponsorships.
- Updated Contact and FAQ content to match the confirmed business model, service area, long-distance process, and training scope.
- Added phone/email contact links to the footer, Privacy page, and Accessibility page.
- Expanded homepage structured data with Golden Heart's email, phone, Tulsa base location, founder title, and service area.
- The website inquiry form remains visually available but still requires a secure form-processing endpoint before direct submissions can be delivered.



### v13 — Sitewide QA, Accessibility & SEO Launch Polish
- Added page-specific canonical URLs, Open Graph metadata, Twitter card metadata, and index directives across public pages.
- Added `sitemap.xml`, a web app manifest, Apple touch icon support, and a sitemap reference in `robots.txt`.
- Added Organization / WebSite structured data to the homepage.
- Tightened page titles and meta descriptions for search clarity while keeping claims within confirmed Golden Heart information.
- Improved mobile navigation accessibility with dynamic open/close labels, Escape-key support, click-outside closing, and body scroll locking.
- Improved reduced-motion behavior and sticky-header anchor positioning.
- Added clearer ARIA relationships to the Our Dogs filters and roster.
- Added image decoding/loading hints and high-priority loading for the homepage hero.
- Made the currently unconnected inquiry form state more explicit so visitors are not led to believe a submission was sent.
- Removed the duplicate footer call-to-action from the Get Started page.
- Standardized the current Whiskey and Ruger roster image assets across the Our Dogs and Veterans sections to prevent stale/reversed image references.
- Replaced the visual infinity symbol in the Veterans impact section with accessible text (`Ongoing`).
- Verified JavaScript syntax, HTML parsing, internal links, image references, duplicate IDs, alt text, page titles, descriptions, and social metadata.
- SEO URLs currently use `https://goldenheart.slowry.workers.dev`; update canonical, sitemap, and social URLs when the final custom domain is connected.


### v12 — Our Dogs Whiskey / Ruger Photo Swap
- Swapped the **Whiskey** and **Ruger** image assignments specifically in the **Our Dogs** roster.
- Whiskey now uses the photo that was previously displayed on Ruger’s card.
- Ruger now uses the photo that was previously displayed on Whiskey’s card.
- No other dog records were changed in this revision.


### v11 — Whiskey / Ruger Dog Page Asset Correction
- Rebuilt the **Our Dogs** Whiskey and Ruger image assets directly from the original user-labeled photos.
- Whiskey now points to a new cache-busted `whiskey-v11.webp` asset showing the formal veteran graduation team photo.
- Ruger now points to a new cache-busted `ruger-v11.webp` asset showing Ruger in the graduation cap / Grad Squad photo.
- Updated `dogs.js` to use the new versioned filenames so Cloudflare/browser image caching cannot keep the two photos reversed after deployment.

### v10 — Nicole Ingraham Founder Photo
- Replaced the temporary graduation image on the About page with the supplied photo of Nicole Ingraham with two Golden Retrievers.
- Added the optimized site asset `public/assets/images/site/nicole-ingraham.webp`.
- Updated the About-page image alt text to identify Nicole and describe the photo accurately.



### v9 — Whiskey / Ruger Dog Page Correction
- Corrected the Whiskey and Ruger identities on the **Our Dogs** page after confirming the two photos were reversed.
- Whiskey now uses the formal veteran graduation team photo.
- Ruger now uses the reddish-gold graduation-cap photo.
- Corrected the homepage graduation asset filename and alt text so the Ruger image is no longer identified as Whiskey.
- Verified the Veterans page references now resolve to the correct Whiskey and Ruger photos.

### v8 — Whiskey / Ruger Identity Correction (superseded by v9)
- An initial attempt was made to correct the Whiskey / Ruger identity mapping.
- The mapping was later confirmed to still be reversed and was corrected in v9.


## v1 — Initial Website Build

Created the first complete Golden Heart Service Dogs website for deployment through Cloudflare Workers.

Included:
- Home page
- Service Dogs program and pricing page
- Our Dogs roster with availability/status filters
- Veterans page
- Training page
- Golden Heart Process page
- About page
- FAQ
- Contact / Get Started page shell
- Support / Partnership page
- Privacy, Terms, and Accessibility starter pages
- Golden Heart branding, logo, dog photos, and responsive navigation
- Cloudflare Workers static-assets configuration

## v2 — Dog Photo Framing Adjustments

Added per-dog photo framing controls for images that were being cropped poorly in the dog-card layout.

Adjusted framing for dogs including:
- Dumbledore
- Oakley
- Winston
- Lily
- Winnie
- Alfredo
- Rango
- Ruby
- Whiskey
- Murphy

Also added mild image correction for Oakley and Winston.

## v3 — Portrait Dog Card Layout

Reworked the Our Dogs photo presentation after the first framing pass still cropped portrait and graduation photos too aggressively.

Changes:
- Switched dog cards to portrait-oriented image frames
- Changed photo behavior from aggressive `cover` cropping to full-photo `contain` presentation
- Removed unnecessary per-photo zoom overrides
- Preserved the complete graduation and handler photos
- Improved presentation of portrait-oriented dog images across desktop and mobile

## v4 — Visual Polish and Responsive Layout

Refined the site layout and homepage presentation.

Changes:
- Tightened dog-card spacing and card-height consistency
- Improved status badges and stage labels
- Added responsive 4/3/2/1-column behavior for dog grids
- Improved mobile dog-filter navigation
- Improved hero image positioning and responsive text sizing
- Added a homepage “From Prospect to Partner” visual section
- Limited homepage Available Dogs to a featured selection while keeping the full roster on Our Dogs
- Replaced testimonial-like brand copy with clearer Golden Heart messaging

## v5 — Public Content Cleanup

Cleaned internal drafting language from the public website and rewrote several sections for launch-quality presentation.

Changes:
- Removed internal notes such as “website vision,” “materials provided,” and “before launch” language
- Reworked Nicole Ingraham / About Golden Heart public copy
- Cleaned Service Dogs and out-of-state travel language
- Refined Training and Golden Heart Process content
- Reworked Veterans content and graduation presentation
- Rewrote FAQ answers to stay within confirmed Golden Heart information
- Reworked Partner With Us content
- Cleaned Privacy, Terms, and Accessibility starter pages
- Removed unfinished footer notes
- Improved page-specific SEO descriptions
- Verified internal links and asset references

## v6 — Our Dogs Directory Refinement

Refined the Our Dogs experience so visitors can understand the roster and each dog’s stage at a glance.

Changes:
- Added live roster counts for Available, Matched / Transitioning, Partner Placements, and Graduates
- Improved dog-status filtering with accessible pressed states and URL hash support
- Added direct filter links such as `#available`, `#matched`, `#partner`, and `#graduate`
- Replaced the unfinished birthdays placeholder with a clear “Understanding the Journey” status guide
- Added a stronger call to action for prospective clients after the dog directory
- Improved dog-directory spacing and mobile presentation
- Kept the full-photo portrait card treatment introduced in v3


## v7 — Veteran Placement Classification & Impact

Corrected the distinction between dogs paired directly with veteran clients and dogs placed with veteran organizations, and updated the site to reflect the confirmed Golden Heart veteran placement count.

Changes:
- Added **7 confirmed veteran client placements** as a separate program count. v19 temporarily reduced the total after Max was clarified as a non-veteran match; v20 restores the confirmed overall total to **7** while keeping Max excluded.
- Kept **4 veteran organization placements** separate from direct veteran client placements
- Marked Ruby, Remington, Ruger, Whiskey, Max, and Murphy as public veteran-placement profiles at that revision; Max was later removed from the veteran-placement classification in v19.
- Included one additional confirmed veteran placement in the total without publishing a public photo/profile
- Added a **Veteran Placement** tag to applicable dog cards while preserving each dog’s actual program stage
- Reworked the Veterans page with veteran-impact counts, public veteran team profiles, and a separate veteran-organization placement section
- Updated the homepage Veterans section with the confirmed **7 / 4** impact counts
- Clarified the Our Dogs page so “Veteran Organization Placement” is not confused with a direct veteran client placement

## v30 — Brielle & Bear Media Story

Added the supplied Brielle and Bear media to Client Stories.

Changes:
- Added Brielle & Bear as a 2026 Golden Heart graduate team on the Client Stories page
- Added the supplied Brielle/Bear photo
- Added the supplied video with the audio track removed
- Converted the video to browser-friendly MP4 with fast-start playback
- Added responsive portrait-first media formatting for desktop and mobile
- Did not invent testimonial wording or training details that were not supplied

## Deploy

Cloudflare build settings:

- **Build command:** leave blank
- **Deploy command:** `npx wrangler deploy`
- **Root directory:** `/`

The included `wrangler.jsonc` deploys the `public/` directory as Workers Static Assets.

## Site structure

- `public/index.html` — Home
- `public/service-dogs.html` — program levels, pricing, travel
- `public/dogs.html` — available, matched, partner placements, graduates
- `public/veterans.html` — veteran-focused section
- `public/training.html` — service-dog training and limited therapy-dog training
- `public/process.html` — intake through Forever Care
- `public/about.html` — Golden Heart and Nicole Ingraham
- `public/stories.html` — client testimonials and success stories
- `public/faq.html` — FAQ
- `public/contact.html` — Formspree-ready initial inquiry form with phone/email fallback
- `public/support.html` — professional, veteran-organization, referral, and community partnerships

## Important launch items still needed

1. **Add the Formspree endpoint.** Create the Formspree form with delivery to `gldnheartservicedogs@gmail.com`, then paste its endpoint into `GH.formEndpoint` in `public/assets/js/site.js`. The form is already wired for submission once that value is present.
2. Add Golden Heart's confirmed **business hours and social-media links** when available.
3. Continue expanding individual graduate stories/testimonials as approved content becomes available.
4. Add any remaining confirmed intake, payment, and Forever Care policy details.
5. Graduation photos currently supplied for the site are approved for website use. Confirm permission separately for any future non-graduation client photos or stories before publishing them.
6. Replace starter Privacy / Terms pages with approved final policies.
7. Do **not** collect bank statements, medical records, or other sensitive documents through the public contact form. Use a secure document process after initial contact.
8. Golden Heart Service Dogs, LLC is a **for-profit business**. The public site does not solicit charitable donations or sponsorships.

## Editing dogs

Dog records live in:

`public/assets/js/dogs.js`

Edit a dog's status there and the Our Dogs page updates automatically.

## Brand colors

- Gold `#b58a2a`
- Cream `#fbf7ed`
- Deep green `#35584a`
- Charcoal `#292720`
- Red accent `#9e4137`
