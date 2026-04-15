# Pitch Deck Outline

**12 slides · 3–5 minute delivery · target: hackathon judges, Initia EIR panel, early VCs**

Every slide below has a **headline**, **copy/points**, **visual direction**, and **speaker notes**.

---

## Slide 1 — Title

**Headline:** RUPIAHROUTE
**Subhead:** Smart DeFi Router on Initia
**Tagline:** *One interface. One click. Best route.*

**Visual:** Cinematic hero still from landing page (3D globe or cave shot). Logo top-left. Team names small at bottom.
**Speaker note (5s):** Let the visual land. *"Built during INITIATE Hackathon."*

---

## Slide 2 — The Problem

**Headline:** DEFI IS BROKEN FOR REAL USERS

**Three stats (big, centered):**
- `$10` per $100 swap — Ethereum gas eats retail
- `5+` DEXs to check — fragmented liquidity, MEV takes the rest
- `300M+` locked out — Indonesia has no IDR on-ramp

**Visual:** Side-by-side gas comparison (Ethereum $3–10 vs L2 $0.05). Indonesian flag icon next to "excluded" label. Red accent color.
**Speaker note (20s):** Lead with the `$10`. Pause. Then *"the world's 4th-largest country has zero on-ramps."* That lands harder than any chart.

---

## Slide 3 — Solution

**Headline:** ONE ENGINE. EVERY ROUTE. SEVEN SECONDS.

**Copy:** RupiahRoute queries 5 quote sources in parallel — our on-chain Initia AMM, LiFi, OpenOcean, KyberSwap, ParaSwap — ranks by net output, executes atomically.

**Visual:** Screenshot of the live route comparison panel. All 5 sources ranked, best highlighted in green. Arrow pointing to the chosen route.
**Speaker note (15s):** Point at the comparison UI. *"User sees everything, picks, executes. Takes seven seconds."*

---

## Slide 4 — Why Initia Specifically

**Headline:** BUILT FOR INITIA. NOT PORTED TO IT.

**Four pillars (2×2 grid):**
- **100ms blocks** — 75× faster than Ethereum. Limit orders actually execute.
- **Interwoven bridge** — L1 ↔ L2 native, no third-party bridge risk.
- **Cosmos precompiles** — `.init` username resolution, Slinky oracle feeds. Not available anywhere else.
- **Full revenue capture** — app owns 100% of sequencer + MEV value.

**Visual:** Initia stack diagram (L1 → MiniEVM → precompiles → our contracts). Red X over "other L2s", green check over each pillar.
**Speaker note (30s):** This is the slide judges care most about. Hit *"couldn't build this anywhere else"* explicitly. This is what earns Initia-specific credit.

---

## Slide 5 — Live Demo

**Headline:** 7 SECONDS, END TO END

**Copy:** Live execution. Pre-funded wallet, pre-seeded pools.

**Action sequence:**
1. Open `fe_rupiahrote`, connect wallet
2. Swap 1000 IDRX → WETH
3. Show route comparison (4-5 sources ranked)
4. Execute — narrate the 7-second finalization
5. Show updated balance

**Visual:** Live demo or pre-recorded fallback video.
**Speaker note (60s):** THE moment. If the demo works clean, judges will remember this over every slide. **Always have a fallback recording ready** in case connection drops.

---

## Slide 6 — Beyond the Swap

**Headline:** FULL DEFI STACK — ON-CHAIN, NOT BOLTED ON

**Six-tile grid:**
| Feature | One-liner |
|---------|-----------|
| LIMIT ORDERS | Keeper-based, 0.1% executor fee, decentralized |
| BATCH SWAP | Portfolio rebalance atomically in 1 tx |
| SEND TO USERNAME | `.init` resolved via Cosmos precompile |
| ROUTE COMPARISON | 4 external DEX aggregators in parallel |
| TRILINGUAL UX | EN · ID · ZH, IDR formatting native |
| IDR GATEWAY | First DeFi-native Indonesian on-ramp |

**Visual:** Bento grid (screenshot from landing or mocked up), each tile in its own accent color.
**Speaker note (20s):** Don't go deep on each — the grid *signals breadth*. Linger 2–3 seconds on the unusual ones (username, route comparison).

---

## Slide 7 — Market Opportunity

**Headline:** 300 MILLION USERS. ZERO COMPETITORS.

**TAM / SAM / SOM:**
- **TAM:** Global DeFi $100B+ and growing
- **SAM:** SE Asia DeFi ~$8B, +40% YoY
- **SOM:** Indonesia IDR-native DeFi — **currently $0**. We're first.

**Visual:** Map of SEA, Indonesia highlighted and pulsing. Funnel diagram for TAM/SAM/SOM. Show competitor logos in US/EU — but leave Indonesia empty except for our logo.
**Speaker note (20s):** The `$0` is the mic-drop. Say it deliberately: *"Indonesian DeFi. Currently. Zero dollars."*

---

## Slide 8 — Business Model

**Headline:** PROFITABLE FROM DAY ONE

**Revenue streams:**
- `0.3%` swap fee → retained in pool k-invariant
- `0.1%` limit order executor fee → incentivizes keepers
- `100%` sequencer + MEV value → captured on-chain (vs Uniswap on Ethereum: 0%)

**Projections:**
| TVL | Annual volume | Protocol revenue |
|-----|--------------|-----------------|
| $1M | $10M | $30K |
| $10M | $100M | $300K |
| $100M | $1B | $3M |

**Visual:** Revenue waterfall. Pie chart of fee distribution (LPs / treasury / keepers / sequencer).
**Speaker note (25s):** Emphasize sequencer capture — *"that's what separates an Initia app from an Ethereum app."*

---

## Slide 9 — Tech Moat

**Headline:** WHAT COMPETITORS CAN'T COPY IN A WEEK

**Four bullets:**
- On-chain multi-source routing with external DEX API fallback
- Keeper-pattern limit orders (decentralized, no centralized relayer)
- Cosmos precompile integration (`.init` username, Slinky oracle)
- Full Indonesian localization — Bahasa, IDR formatting, local context

**Visual:** Architecture diagram — frontend → `RupiahRouter` contract → on-chain pools + 4 external APIs + Cosmos precompiles + Interwoven bridge. Color-coded.
**Speaker note (20s):** Point at each integration. *"Each took weeks. Cloning this isn't a weekend project."*

---

## Slide 10 — Roadmap

**Headline:** MVP → MULTI-L2 → MAINNET → INTELLIGENCE

**Four phases:**
| Phase | When | What |
|-------|------|------|
| **01 LIVE** | Q2 2026 | Smart Swap, Limit, Batch, Bridge, tri-language — deployed |
| **02 NEXT** | Q3 2026 | Multi-L2 routing (Arbitrum, Optimism, Base fallback) |
| **03 PLANNED** | Q4 2026 | Mainnet + EIR admission + audit + raise |
| **04 VISION** | 2027 → | AI route advisor, Telegram bot, confidential swaps |

**Visual:** Timeline with phase cards. Current phase bright green, future phases dimmed purple. Pulsing dots on live marker.
**Speaker note (20s):** Don't linger — judges want the ask coming up.

---

## Slide 11 — Team

**Headline:** BUILT BY [N] ENGINEERS IN 30 DAYS

**Team roster:**
- Name — Role — One-line background (e.g. *"5yr Solidity, ex-[notable protocol]"*)
- GitHub handles + commit-count badge if impressive

**Visual:** Clean headshots OR pixel-art avatars matching landing aesthetic. Role labels underneath.
**Speaker note (10s):** Keep it tight. Judges don't need life stories. Your commits speak louder.

---

## Slide 12 — The Ask

**Headline:** WHAT WE WANT FROM YOU

**Segmented asks:**
- **Hackathon judges:** Rank us top 5. We shipped a working, polished, Initia-native product.
- **Initia team:** EIR interview. We want to ship mainnet with your support.
- **VCs / partners:** Seed conversations. Multi-L2 expansion needs capital.

**CTA row (big buttons):**
- `TRY IT →` [live app URL]
- `READ IT →` [landing page URL]
- `FORK IT →` [GitHub URL]

**Visual:** Big pixel-art "THANK YOU" + RUPIAHROUTE logo. Ends memorable.
**Speaker note (15s):** End with energy. *"We built this because Indonesia deserves DeFi. Help us ship it."*

---

## Delivery notes

### Pacing
- **Total length:** 3–4 min for hackathon. 5–6 min if live demo included.
- **Spend most time on:** slides 4 (Why Initia), 5 (Live Demo), 6 (Features). Everything else is supporting.
- **Land these numbers hard:** `$10`, `300M`, `7 seconds`, `$0 current`. They're the hooks people remember.

### Demo fallback
- **Always have a 30-second screen recording ready** to play instantly if live demo breaks mid-pitch.
- **Never panic-debug on stage.** Play the fallback, finish the pitch, troubleshoot in Q&A.

### Ending
- **Never end on** *"thank you, any questions?"*
- **End on the ask.** Questions will fill the remaining time naturally.

---

## Visual direction (whole deck)

- **Theme:** Dark cyberpunk retro, matching landing page
- **Fonts:**
  - Press Start 2P → headlines
  - Space Grotesk → numbers, stats, big type
  - Inter → body copy
- **Colors:**
  - Background: `#000000`
  - Text: white / white-60%
  - Accents: `#a78bfa` (purple), `#22d3ee` (cyan), `#f59e0b` (amber), `#ec4899` (pink)
- **Motion:** Fade transitions only. No zoom, no slide, no fancy wipes. Let content breathe.
- **Ratio:** 16:9 widescreen, 1920×1080 minimum for projector / screen-share clarity.
- **Consistency:** Same header bar style on every slide. Same "THANK YOU" close. Repeatable rhythm.

---

## Tool recommendations

- **Pitch.com** — cleanest output, built-in share links, analytics for re-engagement
- **Figma Slides** — best for teams already in Figma, easy asset reuse from landing
- **Keynote** — best motion quality if presenting live, worst collaboration
- **Avoid:** PowerPoint (bloated), Google Slides (ugly by default), Canva (template-y)

Export a **PDF backup** for every deck. Projectors eat live links.
