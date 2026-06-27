# North GTA Steel — 3D Custom Steel Building Designer

Interactive, client-facing configurator for custom steel buildings. Users adjust
dimensions, roof style, colors, doors/windows, and add-ons and see a live 3D
preview, then submit a **Request Quote**.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn-style Radix UI
primitives · framer-motion · lucide-react · React Three Fiber / three.js
· clsx + tailwind-merge.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Layout

```
app/
  layout.tsx          # fonts + StoreProvider
  page.tsx            # 3-zone responsive shell (config | 3D | quote) + mobile nav
lib/
  building.ts         # domain model, defaults, palette, geometry math (units = feet)
  store.tsx           # useReducer config store via React context
components/
  3d/Building.tsx     # parametric mesh: frame, walls, gable ends, roof, openings, add-ons
  3d/Scene.tsx        # Canvas, lights+shadows, ground grid, OrbitControls, Environment
  3d/Viewport.tsx     # dynamic(ssr:false) loader + on-canvas overlays
  config/             # ConfigPanel (tabs), Controls, Openings manager
  quote/              # QuoteSummary + RequestQuote modal (CTA)
  ui/                 # button, slider, switch, tabs, select, card, label, badge, separator
```

## Customization model

Everything lives in one `BuildingConfig` (`lib/building.ts`):
dimensions (width/length/height/pitch in feet), `roofStyle`
(`regular | boxed | vertical`), wall/roof/trim colors + optional wainscot,
an `openings[]` list (`garage | man | window`, each placed on a wall side at a
0..1 offset), and `addons` (lean-to, skylights, vents, gutters, insulation).
The 3D model and quote summary both derive purely from this object, so any new
option is one field plus one control.

## Request Quote

`components/quote/RequestQuote.tsx` opens an accessible modal. The form uses
**react-hook-form + zod** (`@hookform/resolvers`) for validation. On submit it
POSTs `{ lead, config, summary, meta }` as JSON to the App Router API route
`app/api/quote/route.ts`.

The route re-validates with the **same** zod schema (`lib/quote-schema.ts` — the
server is the source of truth), then forwards to your backend/CRM if
`QUOTE_BACKEND_URL` is set (optional `QUOTE_BACKEND_TOKEN` → `Authorization:
Bearer`). With no backend configured it logs and returns `{ ok: true }` so the
form works end-to-end in dev. Responses: `200` ok · `422` validation_failed
(with `issues`) · `502` backend error · `400` invalid JSON.

```bash
cp .env.example .env.local   # set QUOTE_BACKEND_URL to enable forwarding
```

## Notes

- No pricing is calculated — only a configuration summary, per spec.
- Linear dimensions are in feet and map 1:1 to three.js units.
- The scene auto-frames and clamps orbit distance to the building size.
