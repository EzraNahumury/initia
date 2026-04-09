export interface ActivityRecord {
  id: string;
  type: "swap" | "bridge" | "send" | "batch" | "limit";
  timestamp: number;
  txHash?: string;
  tokenIn: { symbol: string; amount: string };
  tokenOut: { symbol: string; amount: string };
  recipient?: string;
  priceImpact?: number;
  slippage?: number;
  status: "pending" | "confirmed" | "failed";
  /** Extra context per type */
  meta?: {
    bridgeMode?: "deposit" | "withdraw";
    limitExpiry?: number;
    batchAllocations?: string;
  };
}

const MAX_RECORDS = 50;

function storageKey(address: string) {
  return `rr_activity_${address.toLowerCase()}`;
}

export function getActivities(address: string): ActivityRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(address));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addActivity(address: string, record: ActivityRecord): void {
  const list = getActivities(address);
  list.unshift(record);
  if (list.length > MAX_RECORDS) list.length = MAX_RECORDS;
  localStorage.setItem(storageKey(address), JSON.stringify(list));
}

export function updateActivityStatus(
  address: string,
  id: string,
  status: ActivityRecord["status"],
  txHash?: string,
): void {
  const list = getActivities(address);
  const item = list.find((r) => r.id === id);
  if (item) {
    item.status = status;
    if (txHash) item.txHash = txHash;
    localStorage.setItem(storageKey(address), JSON.stringify(list));
  }
}
