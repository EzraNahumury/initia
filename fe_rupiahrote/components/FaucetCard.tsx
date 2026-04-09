"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { useTranslation } from "react-i18next";
import { CORE_TOKENS, type Token } from "@/lib/contract";
import { HiBeaker, HiCheckCircle, HiArrowPath, HiWallet } from "react-icons/hi2";

const FAUCET_ADDRESS = (process.env.NEXT_PUBLIC_FAUCET_CONTRACT ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

const CLAIM_FEE = 1000n * 10n ** 18n; // 1000 GAS

const FAUCET_ABI = [
  { name: "claimToken", type: "function", stateMutability: "payable", inputs: [{ name: "token", type: "address" }], outputs: [] },
] as const;

const ERC20_BALANCE_ABI = [
  { name: "balanceOf", type: "function", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
] as const;

const MINT_AMOUNTS: Record<string, string> = {
  INIT: "10,000",
  USDC: "10,000",
  WETH: "5",
  TIA: "10,000",
  IDRX: "100,000,000",
};

/* ── Single token row in faucet ── */

function TokenFaucetRow({ token, address, onMinted }: { token: Token; address: `0x${string}`; onMinted: () => void }) {
  const [mintSuccess, setMintSuccess] = useState(false);
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isSuccess) {
      setMintSuccess(true);
      onMinted();
      setTimeout(() => setMintSuccess(false), 3000);
    }
  }, [isSuccess, onMinted]);

  const handleClaim = () => {
    writeContract({
      address: FAUCET_ADDRESS,
      abi: FAUCET_ABI,
      functionName: "claimToken",
      args: [token.address],
      value: CLAIM_FEE,
    });
  };

  const busy = isPending || isConfirming;

  return (
    <div className="flex items-center justify-between p-3.5 rounded-xl border border-purple/15 hover:border-purple/30 transition-colors" style={{ background: "rgba(18,18,42,0.5)" }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full overflow-hidden bg-purple/10 flex items-center justify-center shrink-0">
          {token.logoURI ? (
            <img src={token.logoURI} alt={token.symbol} className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <span className="font-bold text-purple-light text-sm">{token.symbol.charAt(0)}</span>
          )}
        </div>
        <div>
          <div className="text-[13px] font-bold text-white">{token.name}</div>
        </div>
      </div>

      <button
        onClick={handleClaim}
        disabled={busy}
        className={`px-4 py-2 rounded-xl text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
          mintSuccess
            ? "bg-green text-white"
            : busy
              ? "bg-purple/30 text-white/50 cursor-not-allowed"
              : "bg-purple text-white hover:bg-purple-light glow-purple-sm active:scale-[0.97]"
        }`}
      >
        {mintSuccess ? (
          <span className="flex items-center gap-1.5"><HiCheckCircle className="w-3.5 h-3.5" /> Claimed!</span>
        ) : busy ? (
          <span className="flex items-center gap-1.5"><HiArrowPath className="w-3.5 h-3.5 animate-spin" /> Minting...</span>
        ) : (
          `Mint ${MINT_AMOUNTS[token.symbol] ?? "1,000"} ${token.symbol}`
        )}
      </button>
    </div>
  );
}

/* ── Balance row in wallet view ── */

function BalanceRow({ token, address }: { token: Token; address: `0x${string}` }) {
  const { data: balance } = useReadContract({
    address: token.address,
    abi: ERC20_BALANCE_ABI,
    functionName: "balanceOf",
    args: [address],
    query: { refetchInterval: 5000 },
  });

  const raw = balance ?? 0n;
  const num = Number(raw) / 10 ** token.decimals;
  const formatted = num > 0
    ? num.toLocaleString(undefined, { maximumFractionDigits: token.decimals <= 2 ? 0 : 2 })
    : "0";

  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-purple/5 transition-colors">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full overflow-hidden bg-purple/10 flex items-center justify-center shrink-0">
          {token.logoURI ? (
            <img src={token.logoURI} alt={token.symbol} className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <span className="font-bold text-purple-light text-[10px]">{token.symbol.charAt(0)}</span>
          )}
        </div>
        <span className="text-[13px] font-semibold text-white">{token.symbol}</span>
      </div>
      <span className={`text-[13px] font-bold ${num > 0 ? "text-green" : "text-text-sub"}`}>
        {formatted}
      </span>
    </div>
  );
}

/* ── Main Faucet Card ── */

export function FaucetCard() {
  const { address, isConnected } = useAccount();
  const { t } = useTranslation();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleMinted = () => setRefreshKey((k) => k + 1);

  if (!isConnected) {
    return (
      <div className="glass rounded-2xl glow-purple-sm p-10 text-center max-w-[520px] w-full">
        <div className="w-14 h-14 rounded-2xl bg-purple/10 flex items-center justify-center mx-auto mb-4">
          <HiBeaker className="w-6 h-6 text-text-muted" />
        </div>
        <h2 className="text-[16px] font-bold mb-1 text-white">Faucet</h2>
        <p className="text-text-muted text-[13px]">{t("common.connectWallet")} to claim testnet tokens</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 w-full max-w-[860px] mx-auto items-start">
      {/* ── Left: Faucet mint ── */}
      <div className="glass rounded-2xl glow-purple p-5 flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-purple/10 flex items-center justify-center">
            <HiBeaker className="w-4.5 h-4.5 text-purple-light" />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-white">Faucet</h2>
            <p className="text-[11px] text-text-muted">Mint testnet tokens to try out RupiahRoute</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 px-1">
          <span className="text-[11px] text-text-muted bg-bg px-2.5 py-1 rounded-lg border border-border">
            Fee: <span className="text-amber font-semibold">1,000 GAS</span> per claim
          </span>
        </div>

        <div className="space-y-2">
          {CORE_TOKENS.map((token) => (
            <TokenFaucetRow key={token.symbol} token={token} address={address!} onMinted={handleMinted} />
          ))}
        </div>
      </div>

      {/* ── Right: Wallet balances ── */}
      <div className="glass rounded-2xl glow-purple-sm p-5 w-[300px] shrink-0" key={refreshKey}>
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-lg bg-purple/10 flex items-center justify-center">
            <HiWallet className="w-3.5 h-3.5 text-purple-light" />
          </div>
          <h3 className="text-[13px] font-bold text-white">Your Token Balances</h3>
        </div>

        <div className="space-y-0.5">
          {CORE_TOKENS.map((token) => (
            <BalanceRow key={token.symbol} token={token} address={address!} />
          ))}
        </div>
      </div>
    </div>
  );
}
