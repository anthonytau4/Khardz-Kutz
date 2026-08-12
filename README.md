# Khardz Kutz n' Co.

**You grow. We mow.**

A fully responsive static website for Kawiti's lawn-mowing service, designed for GitHub Pages.

The current visual system is built directly from the supplied Khardz logo: black, white, graphite and high-energy mower green. Rounded floating cards have been replaced by sharp, connected, edge-to-edge modules on desktop and mobile.

## Pages

- `index.html` — premium homepage and interactive Kutz selector
- `services.html` — service levels, add-ons, comparison and policies
- `quote.html` — workload-based scope builder without fake fixed pricing
- `booking.html` — multi-step request, photo permission, location and safety details
- `results.html` — before-and-after page with interactive mower graphic and photo wall
- `contact.html` — short booking-help form with Android sharing and copy fallback
- `about.html` — Kawiti and the Khardz Kutz brand story
- `hub.html` — device-local booking dashboard demo
- `404.html` — custom missing-page experience

## Interactive polish

- Full Khardz logo in the navigation
- Selectable service overview panels that feed into booking
- Pin-highlightable information panels with keyboard support
- Draggable results scan
- Live workload and service recommendation builder
- Conditional access and dog-safety booking fields
- Booking-completion meter and device-local request dashboard
- Responsive navigation, theme switching, progress feedback and touch-first controls
- Interactive “Kawiti Mows” grass-dot sign with cursor and swipe response

## Booking rules included

- First and last names are required; middle name is optional.
- A written service address is required before the request can be saved.
- Customers can select multiple mowing services and optional add-ons.
- Gate, preferred entrance and restricted-area notes become required when relevant.
- Dogs must be declared and securely contained away from the work area.
- Customers acknowledge property safety, access and negotiated-pricing policies.
- Customers may optionally allow before-and-after lawn photos on the website.
- Pricing is negotiated around lawn size, access, slope, growth, clipping removal and workload.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` deploys the repository root whenever `main` changes. In the repository settings, choose **Pages → Build and deployment → Source: GitHub Actions** once. The workflow then publishes updates automatically.

The booking and Kutz Hub currently use browser `localStorage` as a transparent static-site demo. No request is transmitted to Kawiti until a real email, messaging or database backend is connected.
