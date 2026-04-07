#!/bin/bash
# Deploy RupiahRouter.sol ke Initia MiniEVM Rollup (local)
# Jalankan setelah: weave init && weave start

set -e

RPC_URL=${RPC_URL:-"http://localhost:8545"}

echo "=== Deploying RupiahRouter to MiniEVM ==="
echo "RPC: $RPC_URL"

# Check if rollup is running
if ! curl -s "$RPC_URL" > /dev/null 2>&1; then
  echo "ERROR: Rollup not running at $RPC_URL"
  echo "Run 'weave start' first"
  exit 1
fi

# Get deployer key from weave artifacts or env
if [ -z "$DEPLOYER_KEY" ]; then
  echo "Set DEPLOYER_KEY environment variable"
  echo "Example: export DEPLOYER_KEY=0x..."
  exit 1
fi

# Deploy contract
echo "Deploying..."
forge script script/RupiahRouter.s.sol \
  --rpc-url "$RPC_URL" \
  --private-key "$DEPLOYER_KEY" \
  --broadcast \
  --legacy

echo ""
echo "=== Done! ==="
echo "Copy the contract address above and set it in fe_rupiahrote/.env.local:"
echo "  NEXT_PUBLIC_ROUTER_CONTRACT=<address>"
echo "  NEXT_PUBLIC_USE_LOCAL_ROLLUP=true"
