export default function FeaturesPage() {
  return (
    <article className="prose">
      <h1>Features</h1>
      <p>
        Beyond the main swap page, RupiahRoute provides five additional feature tabs: Limit Orders,
        Batch Swap, Bridge, Send, and Faucet, plus a Dashboard for portfolio tracking. Each feature
        has its own page component that interacts with the on-chain TokenFaucet contract.
      </p>

      <hr />

      <h2>Limit Orders</h2>
      <p>
        Route: <code>/limit</code> | Component: <code>LimitOrderCard</code>
      </p>
      <p>
        Allows users to place conditional swap orders that execute when a target price is reached.
        The layout is a two-panel design similar to the swap page.
      </p>

      <h3>Left Panel: Order Form</h3>
      <ul>
        <li><strong>Sell token:</strong> TokenSelector for the input token (default: INIT)</li>
        <li><strong>Buy token:</strong> TokenSelector for the output token (default: USDC)</li>
        <li><strong>Amount:</strong> Numeric input for the sell amount</li>
        <li><strong>Target price:</strong> The price at which the order should execute (parsed to token decimals)</li>
        <li>
          <strong>Expiry selector:</strong> Preset buttons for order duration:
          <code>1h</code>, <code>6h</code>, <code>24h</code> (default), <code>48h</code>, <code>168h</code> (1 week)
        </li>
        <li><strong>Balance check:</strong> Reads on-chain balance via ERC20 <code>balanceOf</code>, disables if insufficient</li>
        <li><strong>Place Order button:</strong> Calls <code>TokenFaucet.placeLimitOrder(tokenIn, tokenOut, amountIn, targetPrice, expiryHours)</code> with 500 GAS fee</li>
      </ul>

      <h3>Right Panel: Active Orders</h3>
      <ul>
        <li>Fetches user&apos;s order count via <code>getUserOrderCount(address)</code></li>
        <li>Loads each order ID via <code>getUserOrderId(address, index)</code></li>
        <li>Fetches order details via <code>getOrder(orderId)</code> returning owner, tokens, amount, target price, expiry, executed, cancelled</li>
        <li>Each active order shows: token pair, amount, target price, expiry countdown, and action buttons (Execute, Cancel)</li>
        <li><strong>Execute:</strong> Calls <code>executeLimitOrder(orderId)</code> when target price is reached</li>
        <li><strong>Cancel:</strong> Calls <code>cancelLimitOrder(orderId)</code> to refund tokens</li>
      </ul>

      <hr />

      <h2>Batch Swap</h2>
      <p>
        Route: <code>/batch</code> | Component: <code>BatchSwapCard</code>
      </p>
      <p>
        Swap a single source token into multiple target tokens in one transaction, with configurable
        allocation percentages.
      </p>

      <h3>Source Token</h3>
      <ul>
        <li>TokenSelector for the input token (default: INIT)</li>
        <li>Numeric input for total amount to swap</li>
        <li>Balance display with insufficient balance warning</li>
      </ul>

      <h3>Allocation Sliders</h3>
      <ul>
        <li>Default allocations: USDC 40%, WETH 30%, TIA 30%</li>
        <li>Each allocation has a TokenSelector and a percentage slider</li>
        <li>
          <strong>100% cap logic:</strong> The total of all sliders is tracked. When the total
          reaches 100%, increasing any slider is blocked. To increase one, the user must first
          decrease another. The total is displayed and highlighted red when exceeded.
        </li>
        <li><strong>Add allocation:</strong> Button to add a new target token (starts at 0%)</li>
        <li><strong>Remove allocation:</strong> Trash icon to remove a target (minimum 2 allocations)</li>
      </ul>

      <h3>Preview Section</h3>
      <ul>
        <li>For each allocation, fetches an on-chain quote via <code>TokenFaucet.getQuote(tokenIn, tokenOut, allocatedAmount)</code></li>
        <li>Shows expected output per target token</li>
        <li>Total gas fee: 500 GAS per batch transaction</li>
      </ul>

      <h3>Execution</h3>
      <p>
        Calls <code>TokenFaucet.batchSwap(tokenIn, tokensOut[], amounts[])</code> where
        <code>tokensOut</code> is the array of target token addresses and <code>amounts</code> is
        each token&apos;s allocated portion of the total input. On success, records activity with
        type <code>&quot;batch&quot;</code>.
      </p>

      <hr />

      <h2>Bridge</h2>
      <p>
        Route: <code>/bridge</code> | Component: <code>BridgeCard</code>
      </p>
      <p>
        Simulates an L1-L2 bridge between Initia L1 and the MiniEVM rollup. The bridge has two modes:
      </p>

      <h3>Deposit Mode (L1 to L2)</h3>
      <ul>
        <li>Transfers tokens from Initia L1 to the MiniEVM rollup</li>
        <li>Calls <code>TokenFaucet.bridgeDeposit(token, amount)</code> with 100 GAS fee</li>
        <li>Mints new tokens on L2 (simulated)</li>
      </ul>

      <h3>Withdraw Mode (L2 to L1)</h3>
      <ul>
        <li>Transfers tokens from MiniEVM rollup back to Initia L1</li>
        <li>Calls <code>TokenFaucet.bridgeWithdraw(token, amount)</code> with 100 GAS fee</li>
        <li>Balance check enforced: insufficient balance disables the button</li>
        <li>Shows current L2 balance of selected token</li>
      </ul>

      <h3>UI Details</h3>
      <ul>
        <li>Mode toggle switches between Deposit and Withdraw with visual direction indicator</li>
        <li>Token selector for choosing which token to bridge</li>
        <li>Amount input with balance display</li>
        <li>Simulated bridge progress animation on submission</li>
        <li>On success, records activity with type <code>&quot;bridge&quot;</code> and metadata <code>bridgeMode: &quot;deposit&quot; | &quot;withdraw&quot;</code></li>
      </ul>

      <hr />

      <h2>Send</h2>
      <p>
        Route: <code>/send</code> | Component: <code>SendCard</code>
      </p>
      <p>
        Send tokens to another user either by raw address or by <code>.init</code> username.
      </p>

      <h3>.init Username Resolution</h3>
      <p>
        The recipient field accepts two formats:
      </p>
      <table>
        <thead>
          <tr><th>Format</th><th>Example</th><th>Resolution</th></tr>
        </thead>
        <tbody>
          <tr><td>Hex address</td><td><code>0x1234...abcd</code></td><td>Used directly (validated with regex <code>/^0x[a-fA-F0-9]&#123;40&#125;$/</code>)</td></tr>
          <tr><td>.init username</td><td><code>alice.init</code></td><td>Resolved on-chain via <code>TokenFaucet.resolveUsername(name)</code></td></tr>
        </tbody>
      </table>

      <h3>Sending Tokens</h3>
      <ul>
        <li><strong>To address:</strong> Calls <code>TokenFaucet.sendToken(token, to, amount)</code> with 100 GAS fee</li>
        <li><strong>To .init name:</strong> Calls <code>TokenFaucet.sendToUsername(token, name, amount)</code> with 100 GAS fee</li>
        <li>TokenSelector for choosing which token to send</li>
        <li>Balance check: reads ERC20 <code>balanceOf</code> with 5-second polling</li>
      </ul>

      <h3>Register Username</h3>
      <p>
        Users can register their own <code>.init</code> username via a separate input field.
        Calls <code>TokenFaucet.registerUsername(name)</code> (no fee, non-payable function).
      </p>

      <h3>Send History</h3>
      <ul>
        <li>Stored in localStorage under <code>send_history_&#123;address&#125;</code> (max 20 records)</li>
        <li>Each record: id, recipient (to), token symbol, amount, timestamp, txHash</li>
        <li>Displayed as a scrollable list with relative timestamps (&quot;5s ago&quot;, &quot;2m ago&quot;, &quot;1h ago&quot;, &quot;3d ago&quot;)</li>
        <li>Loaded on component mount when address is available</li>
      </ul>

      <h3>With vs Without .init</h3>
      <p>
        The component detects the recipient format and adjusts the contract call accordingly. When
        the input ends with <code>.init</code>, it uses <code>sendToUsername</code> which resolves
        the name to an address on-chain before transferring. Without <code>.init</code>, the raw
        address is validated and <code>sendToken</code> is called directly. The send button is
        disabled unless the recipient matches one of these two formats.
      </p>

      <hr />

      <h2>Faucet</h2>
      <p>
        Route: <code>/faucet</code> | Component: <code>FaucetCard</code>
      </p>
      <p>
        Allows users to claim testnet tokens to fund their wallet for testing. The layout has two
        sections: a claim panel and a balance panel.
      </p>

      <h3>Claim Panel</h3>
      <p>
        Lists all five core tokens, each with a &quot;Mint&quot; button:
      </p>
      <table>
        <thead>
          <tr><th>Token</th><th>Mint Amount</th></tr>
        </thead>
        <tbody>
          <tr><td>INIT</td><td>10,000</td></tr>
          <tr><td>USDC</td><td>10,000</td></tr>
          <tr><td>WETH</td><td>5</td></tr>
          <tr><td>TIA</td><td>10,000</td></tr>
          <tr><td>IDRX</td><td>100,000,000</td></tr>
        </tbody>
      </table>
      <ul>
        <li>Each claim calls <code>TokenFaucet.claimToken(tokenAddress)</code> with a 1,000 GAS fee</li>
        <li><strong>GAS balance check:</strong> The component reads the native GAS balance via <code>useBalance()</code> with 5-second polling. If the balance is below the 1,000 GAS claim fee, all Mint buttons are disabled with &quot;Insufficient GAS&quot; text.</li>
        <li><strong>Error feedback:</strong> Three error states are handled:
          <ul>
            <li>User rejected transaction: shows &quot;Transaction rejected&quot;</li>
            <li>Write error: shows &quot;Transaction failed&quot;</li>
            <li>On-chain revert: shows &quot;Transaction reverted on-chain&quot;</li>
          </ul>
          Each error auto-clears after 3 seconds.
        </li>
        <li>Pending state shows a spinning arrow icon with &quot;Minting...&quot; text</li>
        <li>On success, the button resets after 3 seconds and the React Query cache is invalidated to refresh balances</li>
      </ul>

      <h3>Balance Panel</h3>
      <ul>
        <li>Displays current balance for each core token via ERC20 <code>balanceOf</code> (5-second polling)</li>
        <li>
          <strong>Highlight animation:</strong> When a balance increases (detected by comparing
          current value with a <code>useRef</code> of the previous value), the row background
          transitions to <code>bg-green/10</code> for 2 seconds via CSS <code>transition-all duration-500</code>.
        </li>
        <li>
          <strong>+delta float-up animation:</strong> Simultaneously, a <code>+amount</code> label
          appears next to the balance and animates upward with fade using a custom
          <code>floatUpFade</code> keyframe (<code>animate-[floatUpFade_2s_ease_forwards]</code>).
          The delta text disappears after 2 seconds.
        </li>
      </ul>
      <pre><code>{`// Balance change detection in FaucetCard's BalanceRow
useEffect(() => {
  if (prevBalance.current !== undefined && raw > prevBalance.current) {
    const delta = Number(raw - prevBalance.current) / 10 ** token.decimals;
    setHighlight(true);
    setDeltaText(\`+\${deltaFormatted}\`);
    setTimeout(() => { setHighlight(false); setDeltaText(null); }, 2000);
  }
  prevBalance.current = raw;
}, [raw]);`}</code></pre>

      <hr />

      <h2>Dashboard</h2>
      <p>
        Route: <code>/dashboard</code> | Component: <code>DashboardView</code>
      </p>
      <p>
        Provides a comprehensive overview of the user&apos;s portfolio, transaction statistics, and
        activity history. Requires wallet connection (shows a connect prompt if disconnected).
      </p>

      <h3>Layout</h3>

      {/* Dashboard layout diagram */}
      <div className="not-prose rounded-xl overflow-hidden my-5 text-[11px] font-mono" style={{ background: "rgba(12,12,28,0.95)", border: "1px solid rgba(139,92,246,0.2)" }}>

        {/* Title bar */}
        <div className="flex items-center gap-3 px-4 py-2.5" style={{ background: "rgba(159,41,255,0.08)", borderBottom: "1px solid rgba(139,92,246,0.18)" }}>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(239,68,68,0.6)" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(245,158,11,0.6)" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(34,197,94,0.6)" }} />
          </div>
          <span className="text-purple-light font-bold ml-1">DashboardView</span>
          <span className="text-muted">— flex container</span>
          <code className="ml-auto text-[10px] px-2 py-0.5 rounded" style={{ background: "rgba(159,41,255,0.15)", color: "#b44dff" }}>max-w-[960px]</code>
        </div>

        {/* Two-panel body */}
        <div className="flex" style={{ minHeight: 320 }}>

          {/* ── LEFT ── */}
          <div className="p-4 space-y-3" style={{ width: "52%", borderRight: "1px solid rgba(139,92,246,0.18)" }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-purple-light font-bold text-[10px]">LEFT</span>
              <code className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "rgba(159,41,255,0.12)", color: "#b44dff" }}>flex-1</code>
            </div>

            {/* Portfolio */}
            <div className="rounded-lg p-3" style={{ background: "rgba(159,41,255,0.05)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <div className="text-[9px] text-muted mb-2 font-semibold uppercase tracking-wider">Portfolio</div>
              <div className="space-y-1">
                {[
                  { sym: "GAS", name: "Native Gas Token", native: true },
                  { sym: "INIT", name: "Initia" },
                  { sym: "USDC", name: "USD Coin" },
                  { sym: "WETH", name: "Wrapped Ether" },
                  { sym: "TIA",  name: "Celestia" },
                  { sym: "IDRX", name: "IDR Stablecoin" },
                ].map((t) => (
                  <div key={t.sym} className="flex items-center gap-2 px-2 py-1 rounded-lg" style={{ background: "rgba(10,10,26,0.5)" }}>
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[7px] font-bold" style={{ background: t.native ? "rgba(159,41,255,0.25)" : "rgba(139,92,246,0.15)", color: "#b44dff" }}>
                      {t.sym.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <span className="text-[9px] text-foreground font-medium">{t.sym}</span>
                      {t.native && <span className="ml-1.5 text-[8px] px-1 py-0.5 rounded" style={{ background: "rgba(159,41,255,0.15)", color: "#b44dff" }}>native</span>}
                    </div>
                    <span className="text-[9px] text-green">—</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats grid */}
            <div className="rounded-lg p-3" style={{ background: "rgba(10,10,26,0.5)", border: "1px solid rgba(139,92,246,0.1)" }}>
              <div className="text-[9px] text-muted mb-2 font-semibold uppercase tracking-wider">Stats <span className="normal-case font-normal">(3-col grid)</span></div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: "Transactions", color: "rgba(59,130,246,0.3)" },
                  { label: "Gas Spent",    color: "rgba(245,158,11,0.3)" },
                  { label: "Most Used",   color: "rgba(159,41,255,0.3)" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg p-2 text-center" style={{ background: s.color, border: "1px solid rgba(139,92,246,0.12)" }}>
                    <div className="text-[8px] text-muted leading-tight">{s.label}</div>
                    <div className="text-[9px] text-foreground font-bold mt-0.5">—</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div className="flex-1 p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-purple-light font-bold text-[10px]">RIGHT</span>
              <code className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "rgba(159,41,255,0.12)", color: "#b44dff" }}>w-[380px]</code>
            </div>

            {/* Summary */}
            <div className="rounded-lg p-3" style={{ background: "rgba(159,41,255,0.05)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <div className="text-[9px] text-muted mb-2 font-semibold uppercase tracking-wider">Summary</div>
              <div className="space-y-1.5">

                {/* Swaps */}
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.15)" }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(59,130,246,0.8)" }} />
                  <span className="text-[9px] text-muted flex-1">Swaps</span>
                  <span className="text-[9px] font-bold text-foreground">count</span>
                </div>

                {/* Bridge + sub */}
                <div className="rounded-lg p-2" style={{ background: "rgba(159,41,255,0.07)", border: "1px solid rgba(159,41,255,0.15)" }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(159,41,255,0.8)" }} />
                    <span className="text-[9px] text-muted flex-1">Bridge</span>
                    <span className="text-[9px] font-bold text-foreground">count</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 ml-3">
                    <div className="rounded px-1.5 py-1 text-center" style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.15)" }}>
                      <div className="text-[8px] text-green font-bold">N</div>
                      <div className="text-[7px] text-muted">Deposits</div>
                    </div>
                    <div className="rounded px-1.5 py-1 text-center" style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.15)" }}>
                      <div className="text-[8px] font-bold" style={{ color: "#f59e0b" }}>N</div>
                      <div className="text-[7px] text-muted">Withdrawals</div>
                    </div>
                  </div>
                </div>

                {/* Sends */}
                <div className="rounded-lg p-2" style={{ background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.15)" }}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(6,182,212,0.8)" }} />
                    <span className="text-[9px] text-muted flex-1">Sends</span>
                    <span className="text-[9px] font-bold text-foreground">count</span>
                  </div>
                  <div className="ml-3 text-[8px] text-muted">↳ N unique recipients</div>
                </div>

                {/* Limit + Batch */}
                {[
                  { label: "Limit Orders", color: "rgba(99,102,241,0.8)", bg: "rgba(99,102,241,0.07)", border: "rgba(99,102,241,0.15)" },
                  { label: "Batch Swaps",  color: "rgba(245,158,11,0.8)",  bg: "rgba(245,158,11,0.07)",  border: "rgba(245,158,11,0.15)" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: item.bg, border: `1px solid ${item.border}` }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-[9px] text-muted flex-1">{item.label}</span>
                    <span className="text-[9px] font-bold text-foreground">count</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-lg p-3" style={{ background: "rgba(10,10,26,0.6)", border: "1px solid rgba(139,92,246,0.1)" }}>
              <div className="text-[9px] text-muted mb-2 font-semibold uppercase tracking-wider">Recent Activity</div>
              <div className="space-y-1">
                {["Swap · confirmed", "Bridge · pending", "Send · confirmed"].map((row) => (
                  <div key={row} className="flex items-center gap-2 px-2 py-1 rounded" style={{ background: "rgba(159,41,255,0.04)" }}>
                    <div className="w-1 h-1 rounded-full" style={{ background: "rgba(139,92,246,0.5)" }} />
                    <span className="text-[8px] text-muted flex-1">{row}</span>
                  </div>
                ))}
                <div className="text-[8px] text-center text-muted pt-0.5">scrollable · max 50 entries</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3>Portfolio</h3>
      <ul>
        <li><strong>Native GAS balance:</strong> Fetched via wagmi <code>useBalance()</code> with 10-second polling</li>
        <li><strong>ERC20 balances:</strong> Each core token (INIT, USDC, WETH, TIA, IDRX) is read via <code>balanceOf</code> with 10-second polling</li>
        <li>Balances greater than zero are displayed in green; zero balances in muted gray</li>
        <li>Each row shows token logo (from initia-registry), symbol, name, and formatted balance</li>
      </ul>

      <h3>Stats Grid</h3>
      <p>
        Three metric cards in a horizontal grid, computed from the activity log:
      </p>
      <ul>
        <li><strong>Transactions:</strong> Total count of confirmed activities</li>
        <li><strong>Gas Spent:</strong> Estimated total GAS consumed (500 GAS per swap/limit/batch/bridge, 100 GAS per send)</li>
        <li><strong>Most Used:</strong> The activity type with the highest count</li>
      </ul>

      <h3>Activity Breakdown</h3>
      <p>
        The right panel&apos;s Summary section shows per-type transaction counts with color-coded
        indicators:
      </p>
      <table>
        <thead>
          <tr><th>Type</th><th>Color</th><th>Extra Detail</th></tr>
        </thead>
        <tbody>
          <tr><td>Swaps</td><td>Blue (<code>bg-blue-500</code>)</td><td>Count only</td></tr>
          <tr><td>Bridge</td><td>Purple (<code>bg-purple</code>)</td><td>Split into Deposits and Withdrawals (uses <code>meta.bridgeMode</code>)</td></tr>
          <tr><td>Sends</td><td>Cyan (<code>bg-cyan-500</code>)</td><td>Unique recipient count</td></tr>
          <tr><td>Limit Orders</td><td>Indigo (<code>bg-indigo-500</code>)</td><td>Count only</td></tr>
          <tr><td>Batch</td><td>Amber (<code>bg-amber-500</code>)</td><td>Count only</td></tr>
        </tbody>
      </table>

      <h3>Recent Activity</h3>
      <p>
        Below the summary, the <code>ActivityHistory</code> component renders a scrollable list of
        recent transactions (up to 50, stored in localStorage). Each entry shows:
      </p>
      <ul>
        <li>Activity type icon and label</li>
        <li>Token pair and amounts</li>
        <li>Relative timestamp</li>
        <li>Transaction status (pending, confirmed, failed)</li>
        <li><strong>Clickable detail popups:</strong> Clicking an entry opens a popup showing full details including txHash, slippage, price impact, and metadata</li>
      </ul>
      <p>
        The activity list refreshes every 5 seconds via a <code>setInterval</code> that re-reads
        from localStorage.
      </p>
    </article>
  );
}
