# Golden Heart Service Dogs Website

Static Cloudflare Workers site for **Golden Heart Service Dogs, LLC**.

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

1. **Connect the contact form to a secure endpoint.** It is intentionally non-functional in this starter build. The JS prevents submission and explains that an endpoint is required.
2. Add Golden Heart's confirmed **email, phone, service area, business hours, Facebook, and Instagram**.
3. Add Nicole Ingraham's full **founder story / biography**.
4. Confirm policy for clients **beyond 900 miles**.
5. Confirm publication permission for all client/handler photos and stories, especially images involving minors.
6. Replace starter Privacy / Terms pages with approved final policies.
7. Do **not** collect bank statements, medical records, or other sensitive documents through the public contact form. Use a secure document process after initial contact.
8. The supplied materials identify the business as an **LLC**. The site uses "sponsor" and "support" language and does not claim tax-deductible charitable donations.

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
