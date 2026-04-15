"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAccount, useBalance, useWriteContract, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { CORE_TOKENS, type Token } from "@/lib/contract";
import { FAUCET_ABI, ERC20_BALANCE_ABI } from "@/lib/abis";
import { HiBeaker, HiArrowPath, HiWallet, HiExclamationTriangle } from "react-icons/hi2";

const FAUCET_ADDRESS = (process.env.NEXT_PUBLIC_FAUCET_CONTRACT ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

const CLAIM_FEE = 1000n * 10n ** 18n; // 1000 GAS

const MINT_AMOUNTS: Record<string, string> = {
  INIT: "10,000",
  USDC: "10,000",
  WETH: "5",
  TIA: "10,000",
  IDRX: "100,000,000",
};

/* ── Single token row in faucet ── */

function TokenFaucetRow({ token, address, onMinted, hasEnoughGas }: { token: Token; address: `0x${string}`; onMinted: () => void; hasEnoughGas: boolean }) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { writeContract, data: txHash, isPending, error: writeError, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError: isConfirmError } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isSuccess) {
      onMinted();
      const timer = setTimeout(() => reset(), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onMinted, reset]);

  useEffect(() => {
    if (writeError) {
      const msg = writeError.message?.includes("User rejected") || writeError.message?.includes("denied")
        ? "Transaction rejected"
        : "Transaction failed";
      setErrorMsg(msg);
      const timer = setTimeout(() => {
        setErrorMsg(null);
        reset();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [writeError, reset]);

  useEffect(() => {
    if (isConfirmError) {
      setErrorMsg("Transaction reverted on-chain");
      const timer = setTimeout(() => {
        setErrorMsg(null);
        reset();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmError, reset]);

  const handleClaim = () => {
    setErrorMsg(null);
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
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full overflow-hidden bg-purple/10 flex items-center justify-center shrink-0">
          {token.logoURI ? (
            <img src={token.logoURI} alt={token.symbol} className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <span className="font-bold text-purple-light text-[8px]">{token.symbol.charAt(0)}</span>
          )}
        </div>
        <div className="min-w-0">
          <div className="text-[8px] font-bold text-white truncate">{token.name}</div>
          {errorMsg && (
            <div className="text-[7px] text-red-400 flex items-center gap-1 mt-0.5">
              <HiExclamationTriangle className="w-3 h-3 shrink-0" /> {errorMsg}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleClaim}
          disabled={busy || !hasEnoughGas}
          className={`px-4 py-2 rounded-xl text-[8px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
            busy
              ? "bg-purple/30 text-white/50 cursor-not-allowed"
              : !hasEnoughGas
                ? "bg-purple/20 text-white/30 cursor-not-allowed"
                : "bg-purple text-white hover:bg-purple-light glow-purple-sm active:scale-[0.97]"
          }`}
          style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.6), -1px -1px 0 rgba(0,0,0,0.3)" }}
        >
          {busy ? (
            <span className="flex items-center gap-1.5"><HiArrowPath className="w-3.5 h-3.5 animate-spin" /> Minting...</span>
          ) : !hasEnoughGas ? (
            "Insufficient GAS"
          ) : (
            `Mint ${MINT_AMOUNTS[token.symbol] ?? "1,000"} ${token.symbol}`
          )}
        </button>
      </div>
    </div>
  );
}

/* ── Balance row in wallet view ── */

function BalanceRow({ token, address }: { token: Token; address: `0x${string}` }) {
  const { data: balance, isError } = useReadContract({
    address: token.address,
    abi: ERC20_BALANCE_ABI,
    functionName: "balanceOf",
    args: [address],
    query: { refetchInterval: 5000 },
  });

  const [highlight, setHighlight] = useState(false);
  const [deltaText, setDeltaText] = useState<string | null>(null);
  const prevBalance = useRef<bigint | undefined>(undefined);

  const raw = balance ?? 0n;
  const num = Number(raw) / 10 ** token.decimals;
  const formatted = num > 0
    ? num.toLocaleString(undefined, { maximumFractionDigits: token.decimals <= 2 ? 0 : 2 })
    : "0";

  useEffect(() => {
    if (prevBalance.current !== undefined && raw > prevBalance.current) {
      const delta = Number(raw - prevBalance.current) / 10 ** token.decimals;
      const deltaFormatted = delta.toLocaleString(undefined, { maximumFractionDigits: token.decimals <= 2 ? 0 : 2 });
      setHighlight(true);
      setDeltaText(`+${deltaFormatted}`);
      const timer = setTimeout(() => {
        setHighlight(false);
        setDeltaText(null);
      }, 2000);
      prevBalance.current = raw;
      return () => clearTimeout(timer);
    }
    prevBalance.current = raw;
  }, [raw, token.decimals]);

  return (
    <div className={`flex items-center justify-between py-2.5 px-3 rounded-lg transition-all duration-500 ${highlight ? "bg-green/10" : "hover:bg-purple/5"}`}>
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full overflow-hidden bg-purple/10 flex items-center justify-center shrink-0">
          {token.logoURI ? (
            <img src={token.logoURI} alt={token.symbol} className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <span className="font-bold text-purple-light text-[7px]">{token.symbol.charAt(0)}</span>
          )}
        </div>
        <span className="text-[8px] font-semibold text-white">{token.symbol}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {deltaText && (
          <span className="text-[6px] font-medium text-white animate-[floatUpFade_2s_ease_forwards]">{deltaText}</span>
        )}
        {isError ? (
          <span className="text-[7px] font-medium text-red" title="Balance refresh failed">refresh failed</span>
        ) : (
          <span className={`text-[8px] font-bold transition-colors duration-500 ${num > 0 ? "text-green" : "text-text-sub"}`}>
            {formatted}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Main Faucet Card ── */

export function FaucetCard() {
  const { address, isConnected } = useAccount();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: gasBalance } = useBalance({ address, query: { refetchInterval: 5000 } });

  const hasEnoughGas = gasBalance ? gasBalance.value >= CLAIM_FEE : false;

  const handleMinted = useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);

  if (!isConnected) {
    return (
      <div className="glass rounded-2xl glow-purple-sm p-10 text-center max-w-[520px] w-full mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-purple/10 flex items-center justify-center mx-auto mb-4">
          <HiBeaker className="w-6 h-6 text-text-muted" />
        </div>
        <h2 className="text-[10px] font-bold mb-1 text-white">Faucet</h2>
        <p className="text-text-muted text-[8px]">{t("common.connectWallet")} to claim testnet tokens</p>
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
            <h2 className="text-[10px] font-bold text-white">Faucet</h2>
            <p className="text-[7px] text-text-muted">Mint testnet tokens to try out RupiahRoute</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 px-1">
          <span className="text-[7px] text-text-muted bg-bg px-2.5 py-1 rounded-lg border border-border">
            Fee: <span className="text-amber font-semibold">1,000 GAS</span> per claim
          </span>
        </div>

        <div className="space-y-2">
          {CORE_TOKENS.map((token) => (
            <TokenFaucetRow key={token.symbol} token={token} address={address!} onMinted={handleMinted} hasEnoughGas={hasEnoughGas} />
          ))}
        </div>
      </div>

      {/* ── Right: Wallet balances ── */}
      <div className="glass rounded-2xl glow-purple-sm p-5 w-[300px] shrink-0">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-lg bg-purple/10 flex items-center justify-center">
            <HiWallet className="w-3.5 h-3.5 text-purple-light" />
          </div>
          <h3 className="text-[8px] font-bold text-white">Your Token Balances</h3>
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
