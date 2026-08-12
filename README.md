# Khardz Kutz n' Co.

**You grow. We mow.**

A fully responsive static website for Kawiti's lawn-mowing service, designed for GitHub Pages.

## Pages

- `index.html` — premium homepage and interactive Kutz selector
- `services.html` — service levels, add-ons, comparison and policies
- `quote.html` — workload-based scope builder without fake fixed pricing
- `booking.html` — multi-step request with required location and safety details
- `results.html` — supplied before/after mower graphic and finish standards
- `about.html` — Kawiti and the Khardz Kutz brand story
- `hub.html` — device-local booking dashboard demo
- `404.html` — custom missing-page experience

## Booking rules included

- First and last names are required; middle name is optional.
- A written service address is required before the request can be saved.
- Customers can select multiple mowing services and optional add-ons.
- Gate, preferred entrance and restricted-area notes become required when relevant.
- Dogs must be declared and securely contained away from the work area.
- Customers acknowledge property safety, access and negotiated-pricing policies.
- Pricing is negotiated around lawn size, access, slope, growth, clipping removal and workload.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` deploys the repository root whenever `main` changes. In the repository settings, choose **Pages → Build and deployment → Source: GitHub Actions** once. The workflow then publishes updates automatically.

The booking and Kutz Hub currently use browser `localStorage` as a transparent static-site demo. No request is transmitted to Kawiti until a real email, messaging or database backend is connected.
