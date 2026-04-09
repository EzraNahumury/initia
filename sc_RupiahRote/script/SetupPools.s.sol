// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {RupiahRouter} from "../src/RupiahRouter.sol";
import {MockERC20} from "../src/mocks/MockERC20.sol";

/// @title Setup mock tokens + seed liquidity pools
/// @notice Run after deploying RupiahRouter:
///   forge script script/SetupPools.s.sol --rpc-url http://localhost:8545 --broadcast --legacy
contract SetupPools is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_KEY");
        address payable router = payable(vm.envAddress("ROUTER_ADDRESS"));
        address user = vm.envAddress("USER_ADDRESS");

        vm.startBroadcast(deployerKey);

        // 1. Deploy mock ERC20 tokens
        MockERC20 init = new MockERC20("Initia", "INIT", 18);
        MockERC20 usdc = new MockERC20("USD Coin", "USDC", 6);
        MockERC20 weth = new MockERC20("Wrapped Ether", "WETH", 18);
        MockERC20 tia  = new MockERC20("Celestia", "TIA", 6);
        MockERC20 idrx = new MockERC20("IDRX Stablecoin", "IDRX", 2);

        console.log("=== Tokens Deployed ===");
        console.log("INIT:", address(init));
        console.log("USDC:", address(usdc));
        console.log("WETH:", address(weth));
        console.log("TIA :", address(tia));
        console.log("IDRX:", address(idrx));

        // 2. Mint tokens to deployer (for pool seeding)
        address deployer = vm.addr(deployerKey);
        init.mint(deployer, 1_000_000 * 1e18);
        usdc.mint(deployer, 1_000_000 * 1e6);
        weth.mint(deployer, 500 * 1e18);
        tia.mint(deployer,  1_000_000 * 1e6);
        idrx.mint(deployer, 10_000_000_000 * 1e2); // 10B IDRX

        // 3. Mint tokens to user wallet
        init.mint(user, 10_000 * 1e18);
        usdc.mint(user, 10_000 * 1e6);
        weth.mint(user, 5 * 1e18);
        tia.mint(user,  10_000 * 1e6);
        idrx.mint(user, 100_000_000 * 1e2);

        // 4. Approve router for deployer tokens
        init.approve(router, type(uint256).max);
        usdc.approve(router, type(uint256).max);
        weth.approve(router, type(uint256).max);
        tia.approve(router, type(uint256).max);
        idrx.approve(router, type(uint256).max);

        // 5. Create liquidity pools
        RupiahRouter r = RupiahRouter(router);

        // Pool 1: INIT/USDC (1 INIT = ~0.985 USDC)
        // Seed: 100,000 INIT + 98,500 USDC
        uint256 p1 = r.createPool(address(init), address(usdc), 100_000 * 1e18, 98_500 * 1e6);
        console.log("Pool INIT/USDC:", p1);

        // Pool 2: INIT/WETH (1 INIT = ~0.00052 ETH, so 1 ETH = ~1923 INIT)
        // Seed: 192,300 INIT + 100 WETH
        uint256 p2 = r.createPool(address(init), address(weth), 192_300 * 1e18, 100 * 1e18);
        console.log("Pool INIT/WETH:", p2);

        // Pool 3: USDC/WETH (1 ETH = ~1893 USDC)
        // Seed: 189,300 USDC + 100 WETH
        uint256 p3 = r.createPool(address(usdc), address(weth), 189_300 * 1e6, 100 * 1e18);
        console.log("Pool USDC/WETH:", p3);

        // Pool 4: INIT/TIA (1 INIT = ~0.95 TIA)
        // Seed: 100,000 INIT + 95,000 TIA
        uint256 p4 = r.createPool(address(init), address(tia), 100_000 * 1e18, 95_000 * 1e6);
        console.log("Pool INIT/TIA :", p4);

        console.log("=== Pools Seeded ===");
        console.log("Pool count:", r.poolCount());

        vm.stopBroadcast();
    }
}
