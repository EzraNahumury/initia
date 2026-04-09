// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {TokenFaucet} from "../src/TokenFaucet.sol";

contract DeployFaucet is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_KEY");
        vm.startBroadcast(deployerKey);

        TokenFaucet faucet = new TokenFaucet();

        (address init_, address usdc_, address weth_, address tia_, address idrx_) = faucet.getTokens();

        console.log("=== TokenFaucet Deployed ===");
        console.log("Faucet:", address(faucet));
        console.log("INIT:", init_);
        console.log("USDC:", usdc_);
        console.log("WETH:", weth_);
        console.log("TIA :", tia_);
        console.log("IDRX:", idrx_);
        console.log("============================");

        vm.stopBroadcast();
    }
}
