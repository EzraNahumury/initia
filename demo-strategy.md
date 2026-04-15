# Demo Strategy

Where and how to show RupiahRoute to win attention — judges, users, partners.

---

## Primary target: INITIATE Hackathon

**Deadline:** April 15, 2026
**Deliverables:** demo video + live URL + GitHub
**Prize pool:** $25K + Mac Mini + path to EIR program

### What judges evaluate
1. **Working product** — does the swap actually execute on-chain?
2. **Initia-native features** — precompiles, 100ms blocks, Interwoven bridge
3. **Market angle** — Indonesia-first positioning, IDR gateway
4. **Technical depth** — smart contracts, keeper pattern, route comparison
5. **Polish + presentation** — landing page, demo video, pitch deck

### Submission checklist
- [ ] Landing page deployed (`landing_page_rp` → Vercel)
- [ ] App deployed (`fe_rupiahrote` → Vercel, env pointing at deployed contracts)
- [ ] Contracts deployed (Initia testnet or local with clear setup docs)
- [ ] Demo video recorded (3 min, script below)
- [ ] README with setup + architecture diagram
- [ ] GitHub public, MIT license, clean commit history

---

## Demo video script — 3:00 total

### 0:00–0:15 — Hook
Land on landing page hero. Voiceover: *"Swapping $100 shouldn't cost $10 in gas. We fixed that."*
**Visual:** cinematic zoom into cave scene.

### 0:15–0:45 — Problem
Scroll through the Problem section (scroll-locked reveal). Narration hits each stat: *"$10 per swap. 5+ DEXs. 300 million Indonesians locked out of DeFi."*

### 0:45–1:30 — Live demo
Switch to `fe_rupiahrote`. Connect wallet. Swap 1000 IDRX → WETH.
- Show the route comparison panel (Initia AMM + LiFi + OpenOcean + KyberSwap + ParaSwap)
- Execute. Finalize in ~7s on camera.
- Voiceover: *"One click. Best route wins. 7 seconds. 5 cents of gas."*

### 1:30–2:15 — Unique features
Quick cuts:
- Limit order form (set target price, keeper executes)
- Batch swap (allocate percentages, atomic rebalance)
- Send to `.init` username (Cosmos precompile resolves)
Voiceover: *"Limit orders settle via on-chain keepers. Batch swaps rebalance atomically. Username transfers resolved on-chain."*

### 2:15–2:45 — Why Initia
Roadmap section + architecture highlight. Narration: *"We don't just live on Initia — we couldn't exist without it. 100ms finality. Native bridging. Full fee capture. Precompiles no other L2 has."*

### 2:45–3:00 — CTA
Landing page CTA. Voiceover: *"Try it. Ship IDR liquidity to global DeFi."*
Show URLs: `[app]`, `[docs]`, `[github]`.

---

## Distribution channels

### Launch day (priority 1)
| Channel | What to post | Tone |
|---------|-------------|------|
| **Hackathon portal** | Submit first. Never after. | Formal |
| **Initia Discord** `#showcase` | Full post: video + screenshots + GitHub + live URL | Builder-to-builder |
| **Twitter/X thread** | Hook (problem) → features → 15s demo clip → CTA. Tag `@initiaFDN`, hackathon hashtag | Punchy, emoji-light |

### Week 1 (priority 2)
- **Indonesian crypto Telegram** — Crypto Indonesia, Bitcoin Indonesia, Tokocrypto community. Post in Bahasa first.
- **Reddit** — r/CosmosNetwork (best fit), r/ethdev (frame as hackathon project, not shill), r/CryptoCurrency (only if we have traction to reference)
- **Product Hunt** — queue for 12:01 AM PT on a Tuesday. Category: Crypto & Web3.
- **Web3 Indonesia** — Telegram groups, Twitter Indonesia KOLs, local meetups

### Ongoing
- **YouTube** — 3-min polished cut + 15-min technical walkthrough. SEO: "RupiahRoute", "Initia DeFi", "Indonesia DEX".
- **Dev.to / Medium article** — deep dive on Cosmos precompile integration + keeper pattern. Positions team as technical.
- **Crypto media cold pitch** — Cointelegraph Indonesia, CoinDesk SEA. Angle: *"first DeFi-native Indonesian on-ramp."*

---

## Personal outreach (before public launch)

| Who | How | What to say |
|-----|-----|-------------|
| Initia core engineers | Discord DM | "1-min teaser, would love feedback before I submit" |
| EIR program coordinator | Discord / email | Explicit interest, ask what they look for |
| Indonesian crypto KOLs | Twitter DM | Early access, feedback request, offer cross-promo |
| Hackathon judges (if public) | Twitter polite | *"Hope you enjoy the submission"* — never push, just be present |

**Rule:** never spam. Each DM should take 30 seconds to write and reference something specific about the recipient.

---

## Demo environment checklist

Before hitting record:
- [ ] Local Initia node up (`weave start`) or testnet configured
- [ ] All contracts deployed (RupiahRouter, TokenFaucet, MockERC20s ×5)
- [ ] Pools seeded with realistic liquidity
- [ ] Browser: full-screen, no bookmark bar, incognito (no wallet clutter)
- [ ] Wallet: named test account (e.g. `alice.init`), funded with all 5 tokens
- [ ] OBS or Loom configured at 1080p 30fps, cursor highlight on
- [ ] Second screen for script / speaker notes
- [ ] Cleared browser cache so landing animations play at full fidelity
- [ ] Network throttling off (we want the 7-second swap to actually look like 7 seconds)

---

## Post-hackathon narrative

**If we win or finalist:**
- Pivot announcement posts to: *"Built during INITIATE, now applying for EIR"*
- Launch public beta, invite judges first
- Open a Discord for early users

**If we don't win:**
- *"Shipped during INITIATE. Keep building."*
- Public testnet launch regardless
- Iterate on judge feedback, try for next Initia grant round
