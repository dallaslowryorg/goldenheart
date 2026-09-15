# Golden Heart Service Dogs Website

Static Cloudflare Workers site for **Golden Heart Service Dogs, LLC**.

**Current revision: v15**

## Revision History


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
- `public/training.html` — service-dog training and limited therapy-dog training
- `public/process.html` — intake through Forever Care
- `public/about.html` — Golden Heart and Nicole Ingraham
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
