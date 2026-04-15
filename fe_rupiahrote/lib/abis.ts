// Shared ABI fragments — imported across feature components to avoid drift when
// the underlying contract changes. FAUCET_ABI is the union of every TokenFaucet
// method called from the frontend.

export const ERC20_BALANCE_ABI = [
  { name: "balanceOf", type: "function", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
] as const;

export const FAUCET_ABI = [
  // Faucet
  { name: "claimToken", type: "function", stateMutability: "payable", inputs: [{ name: "token", type: "address" }], outputs: [] },
  // Swap / quote
  { name: "batchSwap", type: "function", stateMutability: "payable", inputs: [{ name: "tokenIn", type: "address" }, { name: "tokensOut", type: "address[]" }, { name: "amounts", type: "uint256[]" }], outputs: [] },
  { name: "getQuote", type: "function", stateMutability: "view", inputs: [{ name: "tokenIn", type: "address" }, { name: "tokenOut", type: "address" }, { name: "amountIn", type: "uint256" }], outputs: [{ name: "", type: "uint256" }] },
  // Bridge
  { name: "bridgeDeposit", type: "function", stateMutability: "payable", inputs: [{ name: "token", type: "address" }, { name: "amount", type: "uint256" }], outputs: [] },
  { name: "bridgeWithdraw", type: "function", stateMutability: "payable", inputs: [{ name: "token", type: "address" }, { name: "amount", type: "uint256" }], outputs: [] },
  // Send / usernames
  { name: "sendToken", type: "function", stateMutability: "payable", inputs: [{ name: "token", type: "address" }, { name: "to", type: "address" }, { name: "amount", type: "uint256" }], outputs: [] },
  { name: "sendToUsername", type: "function", stateMutability: "payable", inputs: [{ name: "token", type: "address" }, { name: "name", type: "string" }, { name: "amount", type: "uint256" }], outputs: [] },
  { name: "registerUsername", type: "function", stateMutability: "nonpayable", inputs: [{ name: "name", type: "string" }], outputs: [] },
  { name: "resolveUsername", type: "function", stateMutability: "view", inputs: [{ name: "name", type: "string" }], outputs: [{ name: "", type: "address" }] },
  // Limit orders
  { name: "placeLimitOrder", type: "function", stateMutability: "payable", inputs: [{ name: "tokenIn", type: "address" }, { name: "tokenOut", type: "address" }, { name: "amountIn", type: "uint256" }, { name: "targetPrice", type: "uint256" }, { name: "expiryHours", type: "uint256" }], outputs: [] },
  { name: "executeLimitOrder", type: "function", stateMutability: "nonpayable", inputs: [{ name: "orderId", type: "uint256" }], outputs: [] },
  { name: "cancelLimitOrder", type: "function", stateMutability: "nonpayable", inputs: [{ name: "orderId", type: "uint256" }], outputs: [] },
  { name: "getUserOrderCount", type: "function", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { name: "getUserOrderId", type: "function", stateMutability: "view", inputs: [{ name: "user", type: "address" }, { name: "index", type: "uint256" }], outputs: [{ name: "", type: "uint256" }] },
  { name: "getOrder", type: "function", stateMutability: "view", inputs: [{ name: "orderId", type: "uint256" }], outputs: [{ name: "_owner", type: "address" }, { name: "_tokenIn", type: "address" }, { name: "_tokenOut", type: "address" }, { name: "_amountIn", type: "uint256" }, { name: "_targetPrice", type: "uint256" }, { name: "_expiry", type: "uint256" }, { name: "_executed", type: "bool" }, { name: "_cancelled", type: "bool" }] },
] as const;
