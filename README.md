# Golden Heart Service Dogs Website

Static Cloudflare Workers site for **Golden Heart Service Dogs, LLC**.

**Current revision: v7**

## Revision History

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
- Added **7 confirmed veteran client placements** as a separate program count
- Kept **4 veteran organization placements** separate from direct veteran client placements
- Marked Ruby, Remington, Ruger, Whiskey, Max, and Murphy as public veteran-placement profiles
- Included one additional confirmed veteran placement in the total without publishing a public photo/profile
- Added a **Veteran Placement** tag to applicable dog cards while preserving each dog’s actual program stage
- Reworked the Veterans page with veteran-impact counts, public veteran team profiles, and a separate veteran-organization placement section
- Updated the homepage Veterans section with the confirmed **7 / 4** impact counts
- Clarified the Our Dogs page so “Veteran Organization Placement” is not confused with a direct veteran client placement

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
- `public/training.html` — puppy, obedience, therapy-dog training
- `public/process.html` — intake through Forever Care
- `public/about.html` — Golden Heart and Nicole Ingraham
- `public/faq.html` — FAQ
- `public/contact.html` — initial inquiry form shell
- `public/support.html` — partnerships/sponsorships

## Important launch items still needed

1. **Connect the contact form to a secure endpoint.** It is intentionally non-functional in this build. The JS prevents submission and explains that an endpoint is required.
2. Add Golden Heart's confirmed **email, phone, service area, business hours, Facebook, and Instagram**.
3. Add Nicole Ingraham's full **founder story / biography**.
4. Confirm policy for clients **beyond 900 miles**.
5. Confirm publication permission for all client/handler photos and stories, especially images involving minors.
6. Replace starter Privacy / Terms pages with approved final policies.
7. Do **not** collect bank statements, medical records, or other sensitive documents through the public contact form. Use a secure document process after initial contact.
8. The supplied materials identify the business as an **LLC**. The site uses “sponsor” and “support” language and does not claim tax-deductible charitable donations.

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
