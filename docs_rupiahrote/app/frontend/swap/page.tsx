export default function SwapRoutingPage() {
  return (
    <article className="prose">
      <h1>Swap &amp; Routing</h1>
      <p>
        The swap page (<code>/</code>) is the default landing page and the most complex view in the
        application. It is rendered by the <code>SwapView</code> component, which combines a swap
        form, route comparison engine, external DEX quotes, and a 3D globe visualization.
      </p>

      <h2>Layout Structure</h2>
      <p>
        SwapView renders a two-panel horizontal layout inside a flex container
        (<code>max-w-[960px]</code>):
      </p>
      <pre><code>{`┌──────────────────────────────────────────────────────────┐
│                     SwapView (flex)                       │
│  ┌───────────────────┐  ┌──────────────────────────────┐ │
│  │  LEFT (420px)      │  │  RIGHT (flex-1)              │ │
│  │                    │  │                              │ │
│  │  SlippageSettings  │  │  Route Comparison            │ │
│  │  ─────────────     │  │  ────────────────            │ │
│  │  You Pay           │  │  When no input:              │ │
│  │  [TokenSelector]   │  │    3D Globe + orbiting       │ │
│  │  [Amount input]    │  │    chain icons               │ │
│  │                    │  │                              │ │
│  │  [Flip button]     │  │  When routes available:      │ │
│  │                    │  │    Initia routes (3)         │ │
│  │  You Get           │  │    External DEX quotes (4)   │ │
│  │  [TokenSelector]   │  │    each clickable to select  │ │
│  │  [Output display]  │  │                              │ │
│  │                    │  │                              │ │
│  │  RecipientToggle   │  │                              │ │
│  │  Rate / Impact     │  │                              │ │
│  │  Min received      │  │                              │ │
│  │  Gas estimate      │  │                              │ │
│  │                    │  │                              │ │
│  │  [Swap Button]     │  │                              │ │
│  │  SwapConfirmModal  │  │                              │ │
│  └───────────────────┘  └──────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘`}</code></pre>

      <h2>Route Generation</h2>
      <p>
        When the user enters an amount, the <code>generateRoutes()</code> function produces three
        simulated Initia ecosystem routes using live CoinGecko prices (with hardcoded fallback rates):
      </p>
      <table>
        <thead>
          <tr><th>Route</th><th>Protocol</th><th>Fee</th><th>Multiplier</th></tr>
        </thead>
        <tbody>
          <tr><td>RupiahRoute (best)</td><td>Direct Pool</td><td>0.3%</td><td><code>rate * 0.997</code></td></tr>
          <tr><td>Multi-hop</td><td>2 Pools</td><td>0.6%</td><td><code>rate * 0.994</code></td></tr>
          <tr><td>L1 InitiaDEX</td><td>Cross-chain</td><td>0.9%</td><td><code>rate * 0.991</code></td></tr>
        </tbody>
      </table>
      <p>
        The live rate is fetched from the CoinGecko <code>/simple/price</code> endpoint. The
        <code>useLivePrices()</code> hook polls every 60 seconds with a 30-second stale time. If the
        API is unavailable, a hardcoded <code>FALLBACK_RATES</code> map provides rates for all
        supported pairs including IDRX (Indonesian Rupiah stablecoin at 1/16,050 USD).
      </p>
      <p>
        Supported tokens for CoinGecko pricing: INIT (initia), USDC, WETH/ETH (ethereum), TIA
        (celestia), USDT (tether), ATOM (cosmos), OSMO (osmosis), INJ (injective-protocol),
        SEI (sei-network), WBTC/BTC (bitcoin). IDRX uses a fixed rate.
      </p>

      <h2>External DEX Quotes</h2>
      <p>
        In parallel with route generation, the app fetches live quotes from four external DEX
        aggregators via <code>dex-quotes.ts</code>:
      </p>
      <table>
        <thead>
          <tr><th>DEX</th><th>Protocol</th><th>Accent Color</th><th>API Endpoint</th></tr>
        </thead>
        <tbody>
          <tr><td>LI.FI</td><td>Aggregator</td><td><code>#AA54FF</code></td><td><code>li.quest/v1/quote</code></td></tr>
          <tr><td>OpenOcean</td><td>Aggregator</td><td><code>#1B6EF3</code></td><td><code>open-api.openocean.finance/v3/1/quote</code></td></tr>
          <tr><td>KyberSwap</td><td>Multi-chain</td><td><code>#31CB9E</code></td><td><code>aggregator-api.kyberswap.com/ethereum/api/v1/routes</code></td></tr>
          <tr><td>ParaSwap</td><td>Aggregator</td><td><code>#0058F7</code></td><td><code>apiv5.paraswap.io/prices</code></td></tr>
        </tbody>
      </table>
      <p>Key implementation details:</p>
      <ul>
        <li>All four fetchers fire in parallel using <code>Promise.allSettled()</code></li>
        <li>Each has an 8-second <code>AbortSignal.timeout</code></li>
        <li>Queries use Ethereum Mainnet token addresses for API compatibility</li>
        <li>Only DEXs that return a valid live quote are included (no fallback/simulated results)</li>
        <li>Results are sorted by <code>outputAmount</code> descending (best rate first)</li>
        <li>React Query manages caching with 15-second stale time and 30-second refetch interval</li>
      </ul>
      <pre><code>{`// lib/dex-quotes.ts - parallel fetch pattern
const promises = ALL_DEXS
  .filter((d) => d.fetcher)
  .map(async (dex) => {
    const result = await fetcherMap[dex.fetcher!](...args);
    return { dex, result };
  });

const liveResults = await Promise.allSettled(promises);
// Only include DEXs with real results
return quotes.sort((a, b) => b.outputAmount - a.outputAmount);`}</code></pre>

      <h2>Route Selection</h2>
      <p>
        The right panel displays all available routes (Initia + external). Each route card is
        clickable. When the user selects a route, the <code>selectedRoute</code> index updates,
        which causes the swap panel to recalculate:
      </p>
      <ul>
        <li><strong>Output amount:</strong> Updated from the selected route&apos;s <code>output</code> field</li>
        <li><strong>Min received:</strong> Recalculated as <code>expectedOut * (100 - slippage) / 100</code></li>
        <li><strong>Exchange rate:</strong> Display string updated (e.g., <code>1 INIT &cong; 0.985000 USDC</code>)</li>
      </ul>
      <p>
        Route selection resets to index 0 (RupiahRoute best) whenever <code>tokenIn</code>,
        <code>tokenOut</code>, or <code>amountIn</code> changes.
      </p>

      <h2>Rolling Number Animation</h2>
      <p>
        When the output amount changes, the displayed number uses a <code>rollIn</code> CSS keyframe
        animation. The output <code>&lt;span&gt;</code> has <code>key=&#123;formattedOut&#125;</code>,
        which forces React to remount it on each value change, triggering the animation:
      </p>
      <pre><code>{`<span
  key={formattedOut}
  className={formattedOut !== "0"
    ? "text-green animate-[rollIn_0.3s_ease-out]"
    : "text-text-muted/30"}
>
  {formattedOut}
</span>`}</code></pre>
      <p>
        The <code>rollIn</code> keyframe is defined in <code>globals.css</code> and translates the
        element from slightly below with opacity 0 to its final position.
      </p>

      <h2>Auto-sizing Font</h2>
      <p>
        Both the input and output fields use dynamic font sizing based on character count to prevent
        overflow with large numbers:
      </p>
      <table>
        <thead>
          <tr><th>Character Count</th><th>Font Size</th></tr>
        </thead>
        <tbody>
          <tr><td>1-7</td><td>28px</td></tr>
          <tr><td>8-10</td><td>22px</td></tr>
          <tr><td>11-14</td><td>18px</td></tr>
          <tr><td>15+</td><td>14px</td></tr>
        </tbody>
      </table>
      <pre><code>{`style={{
  fontSize: value.length > 14 ? 14
          : value.length > 10 ? 18
          : value.length > 7  ? 22
          : 28
}}`}</code></pre>

      <h2>State Persistence</h2>
      <p>
        The swap form persists four values to <code>sessionStorage</code> so the user&apos;s
        selections survive tab switches and soft navigations:
      </p>
      <table>
        <thead>
          <tr><th>Key</th><th>Value</th></tr>
        </thead>
        <tbody>
          <tr><td><code>swap_tokenIn</code></td><td>Selected input token symbol (e.g., &quot;INIT&quot;)</td></tr>
          <tr><td><code>swap_tokenOut</code></td><td>Selected output token symbol (e.g., &quot;USDC&quot;)</td></tr>
          <tr><td><code>swap_amountIn</code></td><td>Entered amount string</td></tr>
          <tr><td><code>swap_slippage</code></td><td>Selected slippage tolerance number</td></tr>
        </tbody>
      </table>
      <p>
        On mount, the component reads these values from sessionStorage and initializes state
        accordingly. On every state change, the values are written back via a <code>useEffect</code>.
      </p>

      <h2>Price Impact</h2>
      <p>
        Price impact is calculated by comparing the best route output against the ideal output
        (amount * spot rate with zero fees):
      </p>
      <pre><code>{`const idealOutput = amountIn * spotRate;
const priceImpact = ((idealOutput - bestRouteOutput) / idealOutput) * 100;`}</code></pre>
      <p>The impact is displayed via the <code>PriceImpactBadge</code> component:</p>
      <ul>
        <li><strong>Green</strong> (<code>&lt;1%</code>): Normal, no warning</li>
        <li><strong>Yellow</strong> (<code>1-5%</code>): Caution badge</li>
        <li><strong>Red</strong> (<code>&ge;5%</code>): Danger badge + <code>PriceImpactWarning</code> banner shown below the swap details</li>
      </ul>

      <h2>Swap Execution Flow</h2>
      <ol>
        <li>User clicks &quot;Swap&quot; button (enabled when connected, amount entered, sufficient balance)</li>
        <li><code>SwapConfirmModal</code> opens showing all details (tokens, amounts, impact, slippage, gas, route)</li>
        <li>User confirms &mdash; <code>TokenFaucet.swap()</code> called via wagmi <code>writeContract</code> with 500 GAS fee</li>
        <li>Transaction pending state shown (spinner, &quot;Swapping...&quot; text)</li>
        <li>On success: activity recorded via <code>addActivity()</code>, XP awarded via <code>awardXP()</code>, input cleared, success toast shown for 3 seconds</li>
      </ol>

      <h2>3D Globe</h2>
      <p>
        When no amount is entered, the right panel displays an interactive 3D globe built with
        Three.js / <code>@react-three/fiber</code> and the <code>three-globe</code> library. The
        globe shows animated arcs between 25+ real-world city coordinates representing cross-chain
        transaction flows. It auto-rotates at 0.5 speed with cyan/blue/indigo arc colors. The globe
        is dynamically imported (<code>next/dynamic</code>) with SSR disabled.
      </p>
    </article>
  );
}
