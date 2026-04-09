"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useTranslation } from "react-i18next";
import { parseAmount, TOKENS, type Token } from "@/lib/contract";
import { addActivity } from "@/lib/activity";
import { TokenSelector } from "./TokenSelector";
import { HiCheck, HiCheckCircle, HiXCircle, HiPaperAirplane, HiClock } from "react-icons/hi2";

interface SendRecord {
  id: string;
  to: string;
  token: string;
  amount: string;
  timestamp: number;
  txHash?: string;
}

function getSendHistory(address: string): SendRecord[] {
  try { return JSON.parse(localStorage.getItem(`send_history_${address}`) || "[]"); } catch { return []; }
}

function addSendHistory(address: string, record: SendRecord) {
  const history = getSendHistory(address);
  history.unshift(record);
  localStorage.setItem(`send_history_${address}`, JSON.stringify(history.slice(0, 20)));
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const FAUCET_ADDRESS = (process.env.NEXT_PUBLIC_FAUCET_CONTRACT ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

const SEND_FEE = 100n * 10n ** 18n;

const FAUCET_ABI = [
  { name: "sendToken", type: "function", stateMutability: "payable", inputs: [{ name: "token", type: "address" }, { name: "to", type: "address" }, { name: "amount", type: "uint256" }], outputs: [] },
  { name: "sendToUsername", type: "function", stateMutability: "payable", inputs: [{ name: "token", type: "address" }, { name: "name", type: "string" }, { name: "amount", type: "uint256" }], outputs: [] },
  { name: "registerUsername", type: "function", stateMutability: "nonpayable", inputs: [{ name: "name", type: "string" }], outputs: [] },
  { name: "resolveUsername", type: "function", stateMutability: "view", inputs: [{ name: "name", type: "string" }], outputs: [{ name: "", type: "address" }] },
] as const;

const ERC20_BALANCE_ABI = [
  { name: "balanceOf", type: "function", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
] as const;

export function SendCard() {
  const { address, isConnected } = useAccount();
  const { t } = useTranslation();
  const [recipient, setRecipient] = useState("");
  const [token, setToken] = useState<Token>(TOKENS[1]);
  const [amount, setAmount] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [sendHistory, setSendHistory] = useState<SendRecord[]>([]);

  // Load history
  useEffect(() => {
    if (address) setSendHistory(getSendHistory(address));
  }, [address]);

  const parsedAmount = amount ? parseAmount(amount, token.decimals) : 0n;

  const isInit = recipient.endsWith(".init");
  const isAddr = /^0x[a-fA-F0-9]{40}$/.test(recipient);
  const valid = isInit || isAddr;

  // Balance check
  const { data: tokenBalance } = useReadContract({
    address: token.address,
    abi: ERC20_BALANCE_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });
  const userBalance = tokenBalance ?? 0n;
  const insufficientBalance = parsedAmount > 0n && userBalance < parsedAmount;
  const formattedBalance = Number(userBalance) / 10 ** token.decimals;

  // Resolve .init username
  const { data: resolvedAddr } = useReadContract({
    address: FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "resolveUsername",
    args: [recipient],
    query: { enabled: isInit && recipient.length > 5 },
  });
  const usernameResolved = resolvedAddr && resolvedAddr !== "0x0000000000000000000000000000000000000000";

  // Send
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const busy = isPending || isConfirming;

  const handleSend = useCallback(() => {
    if (!recipient || !amount || !valid || parsedAmount === 0n) return;

    if (isInit) {
      writeContract({
        address: FAUCET_ADDRESS,
        abi: FAUCET_ABI,
        functionName: "sendToUsername",
        args: [token.address, recipient, parsedAmount],
        value: SEND_FEE,
      });
    } else {
      writeContract({
        address: FAUCET_ADDRESS,
        abi: FAUCET_ABI,
        functionName: "sendToken",
        args: [token.address, recipient as `0x${string}`, parsedAmount],
        value: SEND_FEE,
      });
    }
  }, [recipient, amount, token, valid, isInit, parsedAmount, writeContract]);

  useEffect(() => {
    if (isSuccess && address) {
      const record: SendRecord = {
        id: Date.now().toString(36),
        to: recipient || "unknown",
        token: token.symbol,
        amount: amount || "0",
        timestamp: Date.now(),
        txHash: txHash,
      };
      addSendHistory(address, record);
      setSendHistory(getSendHistory(address));
      addActivity(address, {
        id: Date.now().toString(36) + "s",
        type: "send",
        timestamp: Date.now(),
        txHash,
        tokenIn: { symbol: token.symbol, amount: amount || "0" },
        tokenOut: { symbol: token.symbol, amount: amount || "0" },
        recipient: recipient ?? undefined,
        status: "confirmed",
      });
      setAmount("");
      setRecipient("");
    }
  }, [isSuccess]);

  // Register username
  const { writeContract: writeRegister, data: regTxHash, isPending: isRegistering } = useWriteContract();
  const { isLoading: isRegConfirming, isSuccess: isRegSuccess } = useWaitForTransactionReceipt({ hash: regTxHash });

  const handleRegister = () => {
    if (!registerName) return;
    const name = registerName.endsWith(".init") ? registerName : `${registerName}.init`;
    writeRegister({
      address: FAUCET_ADDRESS,
      abi: FAUCET_ABI,
      functionName: "registerUsername",
      args: [name],
    });
  };

  const disabled = !isConnected || !amount || !valid || parsedAmount === 0n || insufficientBalance || busy || (isInit && !usernameResolved);

  return (
    <div className="flex gap-4 items-start">
      {/* Left: Send form */}
      <div className="flex-1 min-w-0 glass rounded-2xl glow-purple-sm p-5 space-y-3">
        <div className="px-1 pb-1">
          <h2 className="text-[10px] font-bold text-text">{t("send.title")}</h2>
          <p className="text-[8px] text-text-muted mt-0.5">{t("send.description")}</p>
        </div>

        {/* Recipient */}
        <div className="rounded-xl bg-bg p-4">
          <span className="text-[8px] text-text-muted">{t("send.recipientLabel")}</span>
          <input type="text" placeholder={t("send.recipientPlaceholder")} value={recipient} onChange={(e) => setRecipient(e.target.value)}
            className="w-full bg-transparent text-[10px] font-semibold outline-none placeholder-text-muted/40 mt-2" />
          {recipient && recipient.length > 2 && (
            <div className="mt-3 pt-3 border-t border-border overflow-hidden">
              {isInit && usernameResolved && (
                <div className="flex items-center gap-1.5 text-[8px] text-green font-medium">
                  <HiCheck className="w-3.5 h-3.5" />@{recipient} → <span className="font-mono text-text-sub">{(resolvedAddr as string)?.slice(0, 8)}...</span>
                </div>
              )}
              {isInit && !usernameResolved && (
                <div className="flex items-center gap-1.5 text-[8px] text-red font-medium">
                  <HiXCircle className="w-3.5 h-3.5" />Username not registered
                </div>
              )}
              {isAddr && (
                <div className="flex items-center gap-1.5 text-[8px] text-green font-medium">
                  <HiCheck className="w-3.5 h-3.5" /><span className="font-mono text-text-sub">{recipient.slice(0, 12)}...{recipient.slice(-6)}</span>
                </div>
              )}
              {!valid && <div className="text-[8px] text-red">Format: teman.init atau 0x...</div>}
            </div>
          )}
        </div>

        {/* Amount */}
        <div className={`rounded-xl bg-bg p-4 border ${insufficientBalance ? "border-red/30" : "border-transparent"}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[8px] text-text-muted">{t("common.amount")}</span>
            <span className={`text-[7px] font-medium ${insufficientBalance ? "text-red" : "text-text-muted"}`}>
              Balance: {formattedBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} {token.symbol}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-transparent text-[28px] font-semibold outline-none placeholder-text-muted/40 min-w-0" />
            <TokenSelector selected={token} onSelect={setToken} />
          </div>
        </div>

        {/* Preview */}
        {valid && amount && (
          <div className="rounded-xl bg-bg p-4 text-center border border-border">
            <div className="text-[8px] text-text-muted">{isInit ? `→ @${recipient}` : `→ ${recipient.slice(0, 8)}...`}</div>
            <div className="text-[28px] font-bold mt-1 text-text">{amount} {token.symbol}</div>
            <div className="text-[7px] text-green mt-1 font-medium">Gas fee: 100 GAS</div>
          </div>
        )}

        {/* Button */}
        <button onClick={handleSend} disabled={disabled}
          className={`w-full py-4 rounded-xl text-[14px] font-bold cursor-pointer transition-all ${
            disabled ? "bg-purple/20 text-text-muted cursor-not-allowed"
            : "bg-purple text-white hover:bg-purple-light glow-purple-sm"
          }`}>
          {!isConnected ? t("common.connectWallet")
            : insufficientBalance ? `Insufficient ${token.symbol}`
            : busy ? t("common.processing")
            : !recipient ? t("send.recipientPlaceholder")
            : !valid ? "Invalid recipient"
            : isInit && !usernameResolved ? "Username not found"
            : `Send ${amount || "0"} ${token.symbol}`}
        </button>

        {isSuccess && (
          <div className="flex items-center justify-center gap-2 text-[8px] text-green bg-green-bg rounded-xl py-3 font-medium">
            <HiCheckCircle className="w-4 h-4" />{t("send.sendSuccess", { username: recipient })}
          </div>
        )}
      </div>

      {/* Right: Register + History */}
      <div className="w-[400px] shrink-0 space-y-3">
      <div className="glass rounded-2xl glow-purple-sm p-5 space-y-3">
        <h3 className="text-[8px] font-bold text-text">Register .init Username</h3>
        <p className="text-[7px] text-text-muted">Claim a username so others can send you tokens easily</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-bg rounded-xl px-3 py-2.5 border border-border">
            <input type="text" placeholder="yourname" value={registerName} onChange={(e) => setRegisterName(e.target.value)}
              className="flex-1 bg-transparent text-[8px] outline-none placeholder-text-muted/40 min-w-0" />
            <span className="text-[8px] text-text-muted font-medium">.init</span>
          </div>
          <button onClick={handleRegister} disabled={!registerName || isRegistering || isRegConfirming}
            className={`px-4 py-2.5 rounded-xl text-[8px] font-semibold transition-all cursor-pointer ${
              !registerName || isRegistering || isRegConfirming
                ? "bg-purple/20 text-text-muted cursor-not-allowed"
                : "bg-purple text-white hover:bg-purple-light"
            }`}>
            {isRegistering || isRegConfirming ? "Registering..." : "Register"}
          </button>
        </div>
        {isRegSuccess && (
          <div className="text-[8px] text-green font-medium">Username registered! Others can now send to {registerName.endsWith(".init") ? registerName : `${registerName}.init`}</div>
        )}

        {/* Without / With .init */}
        <div className="flex gap-2">
          <div className="flex-1 rounded-xl bg-bg border border-red/15 p-3">
            <div className="text-[7px] text-red mb-2">Without .init</div>
            <div className="text-[7px] text-text-muted font-mono leading-relaxed">
              "Send 100 INIT to<br />
              <span className="text-red">0x7fD3...85d69aB2</span>"
            </div>
            <div className="text-[7px] text-text-muted mt-2">Hard to verify, easy to mistype</div>
          </div>
          <div className="flex-1 rounded-xl bg-bg border border-green/30 p-3">
            <div className="text-[7px] text-green mb-2">With .init</div>
            <div className="text-[7px] text-text leading-relaxed">
              "Send 100 INIT to<br />
              <span className="text-green font-semibold">@teman.init</span>"
            </div>
            <div className="text-[7px] text-text-muted mt-2">Simple, readable, human</div>
          </div>
        </div>
      </div>

      {/* Send History */}
      {sendHistory.length > 0 && (
        <div className="glass rounded-2xl glow-purple-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-purple/10 flex items-center justify-center">
              <HiClock className="w-3 h-3 text-purple-light" />
            </div>
            <h3 className="text-[8px] font-bold text-text">Send History</h3>
            <span className="text-[7px] text-text-muted">({sendHistory.length})</span>
          </div>
          <div className="space-y-1.5">
            {sendHistory.slice(0, 10).map((h) => (
              <div key={h.id} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-bg/60 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center shrink-0">
                  <HiPaperAirplane className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[8px] font-medium text-text">
                    {h.amount} {h.token}
                  </div>
                  <div className="text-[7px] text-text-muted">
                    → {h.to.endsWith(".init") ? `@${h.to}` : `${h.to.slice(0, 8)}...${h.to.slice(-4)}`} · {timeAgo(h.timestamp)}
                  </div>
                </div>
                <span className="text-[7px] font-bold text-green bg-green/10 px-1.5 py-0.5 rounded">Sent</span>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
