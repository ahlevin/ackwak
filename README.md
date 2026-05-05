# ackwak.com

A no-nonsense personal wealth calculator with three views:

1. **Net Worth** — where you stand today
2. **Retirement Readiness** — when you can comfortably retire
3. **Job Loss Runway** — how long you could last without your job

Built with React + Vite. All inputs and calculations run in the browser — no data is sent anywhere.

---

## Local development

Requires Node.js 18+ and npm.

```bash
# Install dependencies
npm install

# Run dev server (auto-opens at http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview the production build locally
npm run preview
```

The build output goes to `dist/`.

## Deployment

This project is a static site. The `dist/` folder is everything you need to host.

The site uses **hash-based routing** (e.g. `/#calculator` for the calculator). This means it works on any static host without server-side configuration.

### Deploying with Cloudflare Pages (recommended)

1. Push this repo to GitHub
2. Sign in at [pages.cloudflare.com](https://pages.cloudflare.com)
3. Create a project → Connect GitHub → select this repo
4. Build settings:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: 18 or later (set as env var `NODE_VERSION=20` if needed)
5. Deploy. Cloudflare gives you a `*.pages.dev` URL.
6. Add custom domain (`ackwak.com`) in the Pages settings — Cloudflare wires up DNS if you've moved your nameservers to Cloudflare (recommended).

### Deploying with GitHub Pages

A workflow file is included at `.github/workflows/deploy.yml`. After enabling Pages in repo settings (Settings → Pages → Source: GitHub Actions), every push to `main` builds and deploys automatically.

For a custom domain (ackwak.com), add a `CNAME` file to the `public/` folder containing:
```
ackwak.com
```
Then point your domain at GitHub Pages following [their custom-domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).

### Deploying with Vercel

1. Import the repo at [vercel.com/new](https://vercel.com/new)
2. Vercel auto-detects Vite — no configuration needed
3. Add custom domain in project settings

## Project structure

```
ackwak-site/
├── src/
│   ├── App.jsx              Landing page + routing
│   ├── main.jsx             React entry
│   ├── index.css            Tailwind + base styles
│   ├── excelExport.js       Excel import/export for scenarios
│   ├── printView.js         Print-friendly summary generator
│   └── components/
│       └── RetirementReadiness.jsx   The three-tab calculator
├── public/                  Static assets (favicons, etc.)
├── index.html               HTML shell
├── vite.config.js           Vite build config
├── tailwind.config.js       Tailwind utility config
└── package.json
```

## Routing

The app uses URL hash routing. There's no server-side routing.

- `/` — landing page
- `/#calculator` — opens the three-tab calculator (Net Worth / Retirement / Job Loss)
- `/#app` — alias for `#calculator`

## Privacy

The calculator runs entirely in the browser. No analytics, no telemetry, no data collection. Saved scenarios live in the browser's `localStorage` and never leave the device. Excel and JSON exports are file downloads handled locally.

## License

(Add your license here — e.g. "All rights reserved" or an open-source license like MIT)
