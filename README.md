# Heavy Hitter Transport LLC — Website

A premium, production-ready one-page site for **Heavy Hitter Transport LLC**
(NYC box-truck transportation / delivery / moving). Static HTML/CSS/JS —
no build step, no framework, deploys straight to GitHub Pages.

**Live site:** https://c4319454.github.io/heavy-hitter-transport/

## File structure

```
/
├── index.html              # the entire one-page site
├── assets/
│   ├── css/styles.css      # all styles (CSS variables for brand colors)
│   ├── js/main.js          # nav, mobile menu, FAQ accordion, reveal animation, quote form
│   └── images/
│       ├── hero-truck.jpg      # hero photo — real Heavy Hitter truck photo (cropped/blurred/enhanced)
│       └── truck-detail.jpg    # truck spec section photo — real Heavy Hitter truck photo
├── favicon.svg
├── robots.txt
├── sitemap.xml
└── README.md
```

## 1. Change the phone number

Open `assets/js/main.js` and edit the two variables near the top:

```js
var PHONE_DISPLAY = "(347) 832-5320"; // what visitors SEE
var PHONE_TEL     = "+13478325320";   // what tel:/sms: links USE
```

Every `data-phone-display`, `data-tel-link`, and `data-sms-link` element on the
page (nav, hero, quote section, call CTA, footer, mobile bottom bar) updates
automatically from these two values — you never have to hunt through the HTML.

Also update the phone number inside the `LocalBusiness`-style structured data
block near the top of `index.html` (`"telephone": "+13478325320"`).

## 2. Change the email

Same file, same block:

```js
var EMAIL_ADDRESS = "dprashad21@gmail.com";
```

All `data-email-display` / `data-mail-link` elements update automatically.
Also update `"email": "dprashad21@gmail.com"` in the structured data block in `index.html`.

## 3. Change pricing (the $700 package and Tri-State rate)

The site now distinguishes two pricing zones — keep both in sync if either changes:

- **$700 flat** — full truckload, pickup and delivery entirely within NYC's five
  boroughs.
- **$700+, negotiable** — jobs reaching into the upper Tri-State area
  (Long Island, Nassau, Suffolk, Westchester, NJ, CT), priced by mileage and load size.

In `index.html`, search for the **FEATURED OFFER** section (`id="offer"`):

- The big number is inside `<div class="amount"><sup>$</sup>700</div>` — edit `700`.
- The `<p class="offer-scope">` box right below the price explains the 5-borough
  vs. Tri-State split — edit the wording/number if the Tri-State starting rate changes.
- The included items are the `<ul class="offer-grid">` list — add/remove `<li>` lines.
- The disclosure paragraph right below the CTA button is the legal/pricing caveat —
  keep it visible; don't delete it, just edit the wording if your terms change.
- The same pricing split also appears in: the **Service Area** section's
  `<p class="area-note">`, and the FAQ answers ("How much is the standard day
  package?", "Where do you operate?" and "Is the $700 price guaranteed for every
  job?") — update those too if either number changes.

## 4. Replace the truck photographs

The current photos in `assets/images/` (`hero-truck.jpg`, `truck-detail.jpg`) are
real photos of the actual Heavy Hitter Transport truck, cropped to frame it, with
the visible license plate and an unrelated third-party decal on the door blurred
out, brightness/contrast lifted (they were night flash shots), and padded with
black bars to fit the site's layout without further cropping the truck. Drop in
new/better photos any time by replacing these two files (keep the same filenames
so you don't have to touch the HTML):

- `hero-truck.jpg` — the big hero background photo (recommend ≥1600px wide, landscape)
- `truck-detail.jpg` — the closer detail shot in the "The Truck" section (recommend ≥1200px wide)

If you use different filenames, update the two `<img src="...">` tags in
`index.html` (hero section and `id="truck"` section) to match, and update the
`alt` text to describe the real photo. If a new photo shows a visible license
plate or any signage that isn't Heavy Hitter's own, blur or crop it out before
publishing, the same way the current photos were handled.


## 5. Change service areas

Two places in `index.html`:

- **Hero trust strip** (`<div class="trust-strip">`) — short badges like "5 Boroughs", "Tri-State Service".
- **Service Area section** (`id="service-area"`) — the `<ul class="area-list">` list of boroughs/counties/regions.

Also update the `areaServed` array in the structured-data `<script type="application/ld+json">`
block near the top of `index.html` so search engines see the same list.

## 6. Connect the quote form

GitHub Pages only serves static files — there is no server-side form handler
built in, and none is faked. Out of the box, the form (`#quote-form` in
`index.html`, handled in `assets/js/main.js`) does this:

1. Validates required fields in the browser.
2. If `FORM_ENDPOINT` (top of `main.js`) is **empty** (the default), it opens
   a pre-filled `mailto:` link to `EMAIL_ADDRESS` containing everything the
   visitor entered — a real, working fallback that needs no backend.
3. If you set `FORM_ENDPOINT` to a real URL, it instead does a `fetch()` POST
   with the form data as JSON to that URL.

To wire up a real backend without writing server code, pick one of:

- **Formspree** (https://formspree.io) — create a form, get an endpoint like
  `https://formspree.io/f/xxxxxxx`, paste it into `FORM_ENDPOINT`.
- **Getform** (https://getform.io) — same idea, different provider.
- **Your own serverless function** (Cloudflare Worker, AWS Lambda, etc.) if
  you want the leads to land in your own database/CRM.

After setting `FORM_ENDPOINT`, test the form once submitted data actually
reaches wherever you expect it before relying on it for real leads.

## 7. Publish / update on GitHub Pages

This repo already has GitHub Pages enabled, serving from the `main` branch,
root folder (`/`). To publish a change:

```bash
git add .
git commit -m "Update site content"
git push origin main
```

GitHub Pages rebuilds automatically within a minute or two of the push — no
extra step needed. Check build status under the repo's **Settings → Pages**,
or **Actions** tab if it's building via a workflow.

To set up Pages from scratch on a fresh copy of this repo:

1. Push this code to a GitHub repository (public, so Pages can serve it for
   free — private repos need GitHub Pro/Team for Pages).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Branch: `main`, folder: `/ (root)`. Save.
5. GitHub prints the live URL (usually `https://<username>.github.io/<repo>/`)
   within a minute.

### Using a custom domain (optional)

1. Buy/point a domain's DNS (A record to GitHub Pages IPs, or CNAME to
   `<username>.github.io`) at this site.
2. In **Settings → Pages → Custom domain**, enter the domain and save —
   GitHub creates a `CNAME` file in the repo automatically.
3. Update `<link rel="canonical">`, the Open Graph/Twitter URLs, and the
   `url` field in the structured-data block in `index.html`, plus
   `robots.txt` and `sitemap.xml`, to the new domain.

## Legitimacy note

This site intentionally does **not** include reviews, ratings, testimonials,
customer counts, years-in-business claims, awards, or license/DOT/MC numbers
that weren't supplied. Phone and email are the real business contact details.
USDOT, MC, and insurance numbers are not yet finalized, so they are simply
omitted from the Business Info section for now rather than shown as
placeholders — add them there once they're available. Never replace any of
these with invented numbers.
