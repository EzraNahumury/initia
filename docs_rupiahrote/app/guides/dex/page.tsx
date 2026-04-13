import { CodeBlock } from "../../components/CodeBlock";

export default function DexComparisonPage() {
  return (
    <article className="prose">
      <h1>DEX Comparison</h1>
      <p>
        RupiahRoute compares swap routes across the Initia ecosystem and four
        major external DEX aggregators, giving users a clear picture of where
        they get the best rate.
      </p>

      <h2>How Route Comparison Works</h2>
      <p>The comparison engine produces two categories of quotes:</p>
      <ul>
        <li>
          <strong>Initia ecosystem routes:</strong> these are simulated from
          CoinGecko price data. The router calculates expected output amounts
          based on current market prices, applying the on-chain pool parameters
          (fee tiers, liquidity depth) to produce realistic estimates.
        </li>
        <li>
          <strong>External DEX quotes:</strong> these are real API calls to
          production aggregator endpoints. Each aggregator returns an actual
          quote based on its own routing algorithm and liquidity sources.
        </li>
      </ul>
      <p>
        Both sets of results are displayed side-by-side so users can see exactly
        how Initia routes compare to established Ethereum mainnet aggregators.
      </p>

      <h2>External Aggregators</h2>
      <p>RupiahRoute fetches quotes from four external DEX aggregators:</p>

      <h3>1. LiFi</h3>
      <ul>
        <li>
          <strong>API:</strong> <code>li.fi</code>
        </li>
        <li>
          <strong>Network:</strong> Ethereum mainnet quotes
        </li>
        <li>
          LiFi is a cross-chain aggregation protocol that finds the best route
          across multiple DEXes and bridges. Quotes reflect real-time Ethereum
          mainnet liquidity.
        </li>
      </ul>

      <h3>2. OpenOcean</h3>
      <ul>
        <li>
          <strong>API:</strong> <code>open-api.openocean.finance</code>
        </li>
        <li>
          OpenOcean aggregates across multiple chains and DEXes, optimizing for
          best price with split routing across liquidity sources.
        </li>
      </ul>

      <h3>3. KyberSwap</h3>
      <ul>
        <li>
          <strong>API:</strong> <code>aggregator-api.kyberswap.com</code>
        </li>
        <li>
          KyberSwap uses a dynamic trade routing engine that splits and routes
          trades across multiple DEXes to find optimal execution.
        </li>
      </ul>

      <h3>4. ParaSwap</h3>
      <ul>
        <li>
          <strong>API:</strong> <code>api.paraswap.io</code>
        </li>
        <li>
          ParaSwap optimizes token swap rates by aggregating liquidity from
          various decentralized exchanges and lending protocols.
        </li>
      </ul>

      <h2>Fetching Strategy</h2>
      <p>
        All four external aggregator APIs are called in parallel using{" "}
        <code>Promise.allSettled</code>. This approach provides several
        benefits:
      </p>
      <ul>
        <li>
          <strong>No single point of failure:</strong> if one or more
          aggregators are down or return errors, the remaining results are still
          displayed. Failures are silently skipped.
        </li>
        <li>
          <strong>Fastest possible response:</strong> since all calls happen
          concurrently, total latency equals the slowest successful response
          rather than the sum of all calls.
        </li>
        <li>
          <strong>Merged results:</strong> successful external quotes are merged
          with the simulated Initia ecosystem fallback quotes into a single
          ranked list.
        </li>
      </ul>
      <CodeBlock>{`// Simplified fetching logic
const results = await Promise.allSettled([
  fetchLiFiQuote(params),
  fetchOpenOceanQuote(params),
  fetchKyberSwapQuote(params),
  fetchParaSwapQuote(params),
]);

// Filter out rejected promises, keep only fulfilled quotes
const externalQuotes = results
  .filter((r) => r.status === "fulfilled")
  .map((r) => r.value);`}</CodeBlock>

      <h2>What Gets Displayed</h2>
      <p>For each quote (both Initia and external), the UI shows:</p>
      <ul>
        <li>
          <strong>Output amount:</strong> the amount of destination token the
          user would receive for their input.
        </li>
        <li>
          <strong>Gas cost (USD):</strong> the estimated transaction fee
          converted to US dollars for easy comparison.
        </li>
        <li>
          <strong>Percentage difference vs best Initia route:</strong> a
          positive or negative percentage showing how much better or worse each
          external quote is compared to the top-ranked Initia ecosystem route.
        </li>
      </ul>

      <h2>Savings Summary</h2>
      <p>
        At the top of the comparison panel, a savings summary highlights how
        much the user saves by using RupiahRoute versus the best available
        external quote. This is calculated as:
      </p>
      <CodeBlock>{`savings = bestExternalOutput - bestInitiaOutput
savingsPercent = (savings / bestExternalOutput) * 100`}</CodeBlock>
      <p>
        When the Initia route offers a better rate, the savings are displayed as
        a positive value with a green highlight. When an external route is
        better, the difference is still shown for transparency.
      </p>

      <h2>Important Note</h2>
      <p>
        External quotes are provided for <strong>comparison and demonstration
        purposes only</strong>. Actual token swaps always execute on the Initia
        appchain via the RupiahRouter smart contract. The external aggregator
        quotes serve to contextualize the value proposition of routing through
        Initia. Users can see real-world rates from established DEXes and
        compare them to what RupiahRoute offers on-chain.
      </p>
    </article>
  );
}
