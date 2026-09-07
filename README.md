# Maison Adé — Luxury Makeup & Beauty Studio (Demo)

A premium, fully responsive **frontend demo** for a Nigerian makeup and beauty studio — built to show a client what a complete website and business management platform could look like.

This is a **client presentation prototype**. It uses only HTML5, CSS3 and vanilla JavaScript (ES6+), with `localStorage` simulating a real backend (bookings, clients, activity, notifications, etc). The architecture is organized so it can later be rebuilt as a React + Node/Express application without a full rewrite.

---

## 1. Project Overview

- **`index.html`** — the public marketing site (hero, services, booking, gallery, packages, testimonials, FAQ, contact).
- **`admin.html`** — a studio management dashboard (login-protected) for the business owner.
- Both pages share the same `localStorage` "database," so a booking made on the public site instantly appears in the admin dashboard.

## 2. Features

**Public site**
- Cinematic animated hero, sticky/blurring navbar, animated mobile menu
- Animated stat counters (IntersectionObserver)
- Service cards with a detail modal
- Interactive booking form with validation, demo booking references (`LUX-YYYY-###`), and a confirmation modal with a WhatsApp link
- Filterable masonry gallery with a fullscreen lightbox (keyboard + swipe support)
- Packages, auto-advancing testimonial slider, animated FAQ accordion
- Contact form with validation, floating WhatsApp button, dark/light theme toggle (persisted)

**Admin dashboard**
- Demo-authenticated login
- Overview KPIs, bar charts, a status donut chart and popular-services bars — all hand-built in CSS/SVG/JS (no external chart library)
- Appointment management (confirm / complete / cancel / delete), a visual monthly calendar, client management, a daily business activity log, an analytics page with date-range filters, services CRUD, gallery CRUD, and business settings
- Notification dropdown, toast notifications, and a responsive sidebar that becomes a drawer on mobile

## 3. Folder Structure

```
beauty-studio/
├── index.html
├── admin.html
├── css/
│   ├── style.css      → public site styles
│   └── admin.css       → dashboard styles
├── js/
│   ├── script.js       → public site logic + demo data + config
│   └── admin.js         → dashboard logic
├── assets/
│   ├── images/
│   └── icons/
└── README.md
```

## 4. Running Locally

No build step is required.

1. Download/unzip the `beauty-studio` folder.
2. Open `index.html` directly in a browser, **or** serve it locally for the most reliable experience:
   ```bash
   cd beauty-studio
   python3 -m http.server 8000
   ```
3. Visit `http://localhost:8000/index.html` for the public site and `http://localhost:8000/admin.html` for the dashboard.

## 5. Replacing Studio Information

All business details live in one place: `STUDIO_CONFIG` at the top of `js/script.js`.

```js
const STUDIO_CONFIG = {
  name: "Maison Adé",
  phone: "+2348000000000",
  whatsapp: "2348000000000",
  email: "hello@maisonade.com",
  address: "...",
  instagram: "...", facebook: "...", tiktok: "..."
};
```

Update these values and the address/telephone in the structured-data script and footer in `index.html`.

## 6. Replacing Images

- Public site images (hero, about, services, gallery, testimonials) currently use Unsplash placeholder URLs inside `js/script.js` (`SERVICES`, `GALLERY_ITEMS`, `TESTIMONIALS`).
- Replace each `img`/`src` value with the client's real photography.
- Gallery images can also be added/removed live from **Admin → Gallery**, which writes to `localStorage`.

## 7. Changing the WhatsApp Number

Update `whatsapp` (digits only, no `+`) inside `STUDIO_CONFIG` in `js/script.js`. This single value powers the floating WhatsApp button, the booking confirmation "WhatsApp Us" button, and any future WhatsApp links.

## 8. Changing Services

- On the public site, services are defined in the `SERVICES` array in `js/script.js`.
- In the admin dashboard, go to **Services** to add, edit, enable/disable or delete a service — changes are saved to `localStorage` under the `ma_services` key.
- In production, `ma_services` should be replaced by a real services table fetched from your backend.

## 9. How Demo Bookings Work

1. A visitor submits the booking form on the public site.
2. `js/script.js` validates the form, generates a reference like `LUX-2026-004`, and saves the booking to `localStorage` (`ma_bookings`), along with a matching entry in `ma_notifications`.
3. The booking immediately appears in **Admin → Appointments**, **Calendar**, and the **Overview** dashboard, all of which read from the same `ma_bookings` key.

**No data is sent to a real server.** This is intentional — it's a frontend-only prototype.

## 10. How Admin Login Works

Demo credentials (hardcoded in `js/admin.js` as `ADMIN_CREDENTIALS`):

```
Email:    admin@beautystudio.com
Password: admin123
```

On success, `localStorage.ma_admin_auth` is set to `"true"` and the dashboard unlocks. This is a **demo-only** auth check with no real security — see Section 11.

## 11. How `localStorage` Is Used

| Key | Purpose |
|---|---|
| `ma_bookings` | All appointment/booking records |
| `ma_clients` | Client directory |
| `ma_activities` | Daily business activity log |
| `ma_services` | Editable service catalog |
| `ma_gallery` | Editable gallery images |
| `ma_notifications` | Admin notification feed |
| `ma_messages` | Contact form submissions |
| `ma_settings` | Business info edited in Admin → Settings |
| `ma_admin_auth` | Demo authentication flag |
| `ma_theme` | Public site light/dark preference |
| `ma_seeded` | Guards one-time demo data seeding |

## 12. What Needs to Be Replaced for Production

- [ ] Replace every `localStorage` read/write with real API calls (see `// TODO:` comments throughout `js/script.js` and `js/admin.js`)
- [ ] Replace demo admin authentication with real server-side auth (sessions/JWT, hashed passwords)
- [ ] Replace the Google Maps placeholder in the Contact section with a live embed URL
- [ ] Replace Unsplash placeholder imagery with licensed studio photography
- [ ] Connect the booking form and contact form to a real notification pipeline (email/SMS/WhatsApp API)
- [ ] Replace gallery "image URL" fields with a real upload/storage service (e.g. S3, Cloudinary)

## 13. Future React / Backend Upgrade Plan

The demo is structured to make a future upgrade straightforward:

1. **Config → environment variables**: `STUDIO_CONFIG` maps directly to a `.env`/settings table.
2. **Demo data arrays → API responses**: `SERVICES`, `GALLERY_ITEMS`, `TESTIMONIALS`, and the admin `DB` helper all mirror the shape of future REST/GraphQL responses — they can be swapped for `fetch` calls with minimal markup changes.
3. **Section-based components**: each HTML section (`hero`, `services`, `booking`, `gallery`, etc.) is self-contained and maps cleanly to a future React component.
4. **`DB` helper in `admin.js`**: currently wraps `localStorage.getItem/setItem`; swapping its internals for `fetch` calls against a real API is the main integration point for the dashboard.
5. **Auth**: the login form is already isolated from the rest of the app shell, ready to be replaced with real session-based or token-based authentication.

---

Built as a client-presentation prototype. Replace all demo data, credentials and placeholder content before any production use.
