// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {RupiahRouter} from "../src/RupiahRouter.sol";

/// @title RupiahRouter Deployment Script
/// @notice Deploy to Initia MiniEVM: forge script script/RupiahRouter.s.sol --rpc-url $RPC_URL --private-key $DEPLOYER_KEY --broadcast --legacy
contract DeployRupiahRouter is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_KEY");

        vm.startBroadcast(deployerPrivateKey);

        RupiahRouter router = new RupiahRouter();

        console.log("=== RupiahRouter Deployed ===");
        console.log("Contract:", address(router));
        console.log("Owner:", router.owner());
        console.log("=============================");

        vm.stopBroadcast();
    }
}
