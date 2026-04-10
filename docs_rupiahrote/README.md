# RupiahRoute Docs

Documentation site for **RupiahRoute** — a smart DeFi routing engine built on the Initia MiniEVM appchain. This site covers the frontend, smart contracts, architecture, and integration guides.

Part of the [`initia/`](../) monorepo alongside `fe_rupiahrote/` (frontend) and `sc_RupiahRote/` (smart contracts).

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js App Router | 16.2.3 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS v4 | 4.x |
| Diagrams | Mermaid.js | 11.x |
| Runtime | React 19 | 19.x |

---

## Getting Started

```bash
cd docs_rupiahrote
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
docs_rupiahrote/
├── app/
│   ├── layout.tsx              # Root layout (Header, Sidebar, TOC)
│   ├── globals.css             # Theme variables + Tailwind v4
│   ├── page.tsx                # Introduction (home)
│   ├── quickstart/page.tsx     # Quick Start guide
│   ├── architecture/page.tsx   # System architecture + diagrams
│   ├── contracts/              # Smart contract docs
│   │   ├── page.tsx            # Overview
│   │   ├── router/page.tsx     # RupiahRouter
│   │   ├── faucet/page.tsx     # TokenFaucet
│   │   └── deployment/page.tsx # Deployment guide
│   ├── frontend/               # Frontend docs
│   │   ├── page.tsx            # Overview + project structure
│   │   ├── swap/page.tsx       # Swap & routing
│   │   ├── features/page.tsx   # All feature pages
│   │   └── wallet/page.tsx     # Wallet integration
│   └── guides/                 # Integration guides
│       ├── tokens/page.tsx     # Token list
│       ├── dex/page.tsx        # DEX comparison
│       └── initia/page.tsx     # Initia integration
├── app/components/
│   ├── Header.tsx              # Top nav with logo + GitHub link
│   ├── Sidebar.tsx             # Left navigation sidebar
│   ├── TableOfContents.tsx     # Right TOC (auto-extracts headings)
│   ├── Mermaid.tsx             # Client-side Mermaid diagram renderer
│   └── ParticleBackground.tsx  # Canvas particle animation (hero)
└── public/
    └── logo.png                # RupiahRoute logo
```

---

## Pages

| Route | Description |
|---|---|
| `/` | Introduction, key features, supported tokens, project structure |
| `/quickstart` | Step-by-step guide to run the project locally |
| `/architecture` | System overview, data flow diagrams, frontend layer, state management |
| `/contracts` | Smart contract overview |
| `/contracts/router` | RupiahRouter — AMM, routing, limit orders, batch swap |
| `/contracts/faucet` | TokenFaucet — testnet utility contract |
| `/contracts/deployment` | Foundry deployment scripts and addresses |
| `/frontend` | Frontend overview, tech stack, component list |
| `/frontend/swap` | Swap page layout, route generation, DEX quotes |
| `/frontend/features` | Limit orders, batch swap, bridge, send, faucet, dashboard |
| `/frontend/wallet` | Wallet connection, wagmi config, anti-auto-connect |
| `/guides/tokens` | Supported token list with addresses and decimals |
| `/guides/dex` | External DEX aggregator comparison |
| `/guides/initia` | Initia chain integration notes |

---

## Editing Content

All pages are plain `.tsx` files in `app/`. Each page exports a default React component returning an `<article className="prose">` wrapper.

**Adding a new page:**
1. Create `app/<section>/page.tsx`
2. Add the route to the `NAV` array in `app/components/Sidebar.tsx`

**Adding a diagram:**  
Use the `<Mermaid>` component for flowcharts and sequence diagrams:

```tsx
import { Mermaid } from "../components/Mermaid";

<Mermaid chart={`graph TB
  A --> B
`} />
```

**Styled layout diagrams** (replacing ASCII art) use plain `div`/`JSX` with inline styles matching the site's purple theme — see any `not-prose` block in existing pages for the pattern.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server at `localhost:3000` |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |
