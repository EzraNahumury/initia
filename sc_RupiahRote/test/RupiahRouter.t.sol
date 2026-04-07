// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {RupiahRouter} from "../src/RupiahRouter.sol";
import {MockERC20} from "../src/mocks/MockERC20.sol";

contract RupiahRouterTest is Test {
    RupiahRouter public router;
    MockERC20 public init;
    MockERC20 public usdc;
    MockERC20 public eth_;
    MockERC20 public tia;

    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public keeper = makeAddr("keeper");

    uint256 constant INITIAL_BALANCE = 1_000_000e6; // 1M tokens (6 decimals)

    function setUp() public {
        router = new RupiahRouter();

        // Deploy mock tokens
        init = new MockERC20("Initia", "INIT", 6);
        usdc = new MockERC20("USD Coin", "USDC", 6);
        eth_ = new MockERC20("Ethereum", "ETH", 6);
        tia = new MockERC20("Celestia", "TIA", 6);

        // Mint tokens to alice
        init.mint(alice, INITIAL_BALANCE);
        usdc.mint(alice, INITIAL_BALANCE);
        eth_.mint(alice, INITIAL_BALANCE);
        tia.mint(alice, INITIAL_BALANCE);

        // Mint tokens to bob
        init.mint(bob, INITIAL_BALANCE);
        usdc.mint(bob, INITIAL_BALANCE);

        // Alice approves router
        vm.startPrank(alice);
        init.approve(address(router), type(uint256).max);
        usdc.approve(address(router), type(uint256).max);
        eth_.approve(address(router), type(uint256).max);
        tia.approve(address(router), type(uint256).max);
        vm.stopPrank();

        // Bob approves router
        vm.startPrank(bob);
        init.approve(address(router), type(uint256).max);
        usdc.approve(address(router), type(uint256).max);
        vm.stopPrank();
    }

    // ================================================================
    //                       POOL CREATION TESTS
    // ================================================================

    function test_createPool() public {
        vm.prank(alice);
        uint256 poolId = router.createPool(address(init), address(usdc), 100_000e6, 100_000e6);

        assertEq(poolId, 1);
        assertEq(router.poolCount(), 1);

        (address tokenA, address tokenB, uint256 resA, uint256 resB,,) = router.getPoolInfo(poolId);
        assertEq(resA, 100_000e6);
        assertEq(resB, 100_000e6);
        // Tokens should be sorted (lower address first)
        assertTrue(tokenA < tokenB);
    }

    function test_createPool_revertsOnDuplicate() public {
        vm.startPrank(alice);
        router.createPool(address(init), address(usdc), 100_000e6, 100_000e6);

        vm.expectRevert("RR: pool exists");
        router.createPool(address(init), address(usdc), 50_000e6, 50_000e6);
        vm.stopPrank();
    }

    function test_createPool_revertsOnSameToken() public {
        vm.prank(alice);
        vm.expectRevert("RR: identical tokens");
        router.createPool(address(init), address(init), 100_000e6, 100_000e6);
    }

    function test_createPool_revertsOnZeroAmount() public {
        vm.prank(alice);
        vm.expectRevert("RR: zero amount");
        router.createPool(address(init), address(usdc), 0, 100_000e6);
    }

    // ================================================================
    //                       ADD LIQUIDITY TESTS
    // ================================================================

    function test_addLiquidity() public {
        vm.startPrank(alice);
        uint256 poolId = router.createPool(address(init), address(usdc), 100_000e6, 100_000e6);
        uint256 lpBefore = router.getLpBalance(poolId, alice);

        uint256 lpTokens = router.addLiquidity(poolId, 50_000e6, 50_000e6);
        uint256 lpAfter = router.getLpBalance(poolId, alice);

        assertGt(lpTokens, 0);
        assertEq(lpAfter, lpBefore + lpTokens);

        (, , uint256 resA, uint256 resB,,) = router.getPoolInfo(poolId);
        assertEq(resA, 150_000e6);
        assertEq(resB, 150_000e6);
        vm.stopPrank();
    }

    function test_addLiquidity_proportional() public {
        vm.startPrank(alice);
        uint256 poolId = router.createPool(address(init), address(usdc), 100_000e6, 200_000e6);

        // Try to add disproportionate amounts — should use optimal ratio
        router.addLiquidity(poolId, 10_000e6, 50_000e6);

        (, , uint256 resA, uint256 resB,,) = router.getPoolInfo(poolId);
        // Should have added 10_000 init and 20_000 usdc (proportional)
        assertEq(resA, 110_000e6);
        assertEq(resB, 220_000e6);
        vm.stopPrank();
    }

    // ================================================================
    //                      REMOVE LIQUIDITY TESTS
    // ================================================================

    function test_removeLiquidity() public {
        vm.startPrank(alice);
        uint256 poolId = router.createPool(address(init), address(usdc), 100_000e6, 100_000e6);
        uint256 lpBalance = router.getLpBalance(poolId, alice);

        uint256 aliceInitBefore = init.balanceOf(alice);
        uint256 aliceUsdcBefore = usdc.balanceOf(alice);

        // Remove half of LP
        (uint256 amtA, uint256 amtB) = router.removeLiquidity(poolId, lpBalance / 2);

        assertGt(amtA, 0);
        assertGt(amtB, 0);

        // Alice should have received tokens back
        assertEq(init.balanceOf(alice), aliceInitBefore + amtA);
        assertEq(usdc.balanceOf(alice), aliceUsdcBefore + amtB);
        vm.stopPrank();
    }

    function test_removeLiquidity_revertsInsufficientLp() public {
        vm.startPrank(alice);
        uint256 poolId = router.createPool(address(init), address(usdc), 100_000e6, 100_000e6);
        uint256 lpBalance = router.getLpBalance(poolId, alice);

        vm.expectRevert("RR: insufficient lp");
        router.removeLiquidity(poolId, lpBalance + 1);
        vm.stopPrank();
    }

    // ================================================================
    //                         SWAP TESTS
    // ================================================================

    function test_swap_direct() public {
        vm.startPrank(alice);
        router.createPool(address(init), address(usdc), 100_000e6, 100_000e6);
        vm.stopPrank();

        uint256 poolId = router.getPoolId(address(init), address(usdc));

        vm.startPrank(bob);
        uint256 bobUsdcBefore = usdc.balanceOf(bob);
        uint256 amountOut = router.swap(poolId, address(init), 1_000e6, 0);

        assertGt(amountOut, 0);
        assertEq(usdc.balanceOf(bob), bobUsdcBefore + amountOut);
        // With 0.3% fee on 1000 INIT into equal pool, output should be ~997 * 100000 / (100000*10000 + 997*1000) / 10000
        // Approximately 990 USDC (due to price impact)
        assertLt(amountOut, 1_000e6); // Should be less than input (price impact + fee)
        vm.stopPrank();
    }

    function test_swap_revertsOnSlippage() public {
        vm.startPrank(alice);
        router.createPool(address(init), address(usdc), 100_000e6, 100_000e6);
        vm.stopPrank();

        uint256 poolId = router.getPoolId(address(init), address(usdc));

        vm.prank(bob);
        vm.expectRevert("RR: insufficient output");
        router.swap(poolId, address(init), 1_000e6, 999e6); // minOut too high
    }

    function test_getAmountOut_math() public {
        vm.prank(alice);
        uint256 poolId = router.createPool(address(init), address(usdc), 100_000e6, 100_000e6);

        // Formula: amountOut = (amountIn * 9970 * reserveOut) / (reserveIn * 10000 + amountIn * 9970)
        // With 1000e6 in, 100_000e6 reserves:
        // = (1000e6 * 9970 * 100_000e6) / (100_000e6 * 10000 + 1000e6 * 9970)
        // = (9.97e17) / (1.00997e12)
        // ≈ 987,158,034 = ~987.158 USDC
        uint256 out = router.getAmountOut(poolId, address(init), 1_000e6);

        // Verify it's in expected range (~987 USDC)
        assertGt(out, 985e6);
        assertLt(out, 990e6);
    }

    function test_swap_preserves_k() public {
        vm.startPrank(alice);
        uint256 poolId = router.createPool(address(init), address(usdc), 100_000e6, 100_000e6);
        vm.stopPrank();

        (, , uint256 resBeforeA, uint256 resBeforeB,,) = router.getPoolInfo(poolId);
        uint256 kBefore = resBeforeA * resBeforeB;

        vm.prank(bob);
        router.swap(poolId, address(init), 1_000e6, 0);

        (, , uint256 resAfterA, uint256 resAfterB,,) = router.getPoolInfo(poolId);
        uint256 kAfter = resAfterA * resAfterB;

        // k should increase (or stay same) after swap due to fees
        assertGe(kAfter, kBefore);
    }

    // ================================================================
    //                       ROUTING TESTS
    // ================================================================

    function test_findBestRoute_direct() public {
        vm.prank(alice);
        router.createPool(address(init), address(usdc), 100_000e6, 100_000e6);

        RupiahRouter.Route memory route = router.findBestRoute(address(init), address(usdc), 1_000e6);

        assertEq(route.routeType, 0); // direct
        assertEq(route.path.length, 2);
        assertEq(route.path[0], address(init));
        assertEq(route.path[1], address(usdc));
        assertGt(route.expectedOut, 0);
    }

    function test_findBestRoute_multiHop() public {
        vm.startPrank(alice);
        // Create pools with imbalanced reserves to make multi-hop better
        router.createPool(address(init), address(usdc), 100_000e6, 100_000e6);
        router.createPool(address(init), address(eth_), 100_000e6, 50_000e6);
        router.createPool(address(eth_), address(usdc), 50_000e6, 110_000e6);
        vm.stopPrank();

        RupiahRouter.Route memory route = router.findBestRoute(address(init), address(usdc), 10_000e6);

        // The router should find the best path (could be direct or multi-hop)
        assertGt(route.expectedOut, 0);
        assertEq(route.path[0], address(init));
        assertEq(route.path[route.path.length - 1], address(usdc));
    }

    function test_multiHopSwap() public {
        vm.startPrank(alice);
        router.createPool(address(init), address(eth_), 100_000e6, 100_000e6);
        router.createPool(address(eth_), address(usdc), 100_000e6, 100_000e6);
        vm.stopPrank();

        address[] memory path = new address[](3);
        path[0] = address(init);
        path[1] = address(eth_);
        path[2] = address(usdc);

        uint256[] memory poolIds = new uint256[](2);
        poolIds[0] = router.getPoolId(address(init), address(eth_));
        poolIds[1] = router.getPoolId(address(eth_), address(usdc));

        vm.prank(bob);
        uint256 deadline = block.timestamp + 1 hours;
        uint256 finalAmount = router.multiHopSwap(path, poolIds, 1_000e6, 0, deadline);

        assertGt(finalAmount, 0);
        // Two hops with 0.3% fee each: ~1000 * 0.997 * 0.997 * (price impact) ≈ ~974
        assertGt(finalAmount, 950e6);
        assertLt(finalAmount, 1_000e6);
    }

    function test_executeRoute() public {
        vm.startPrank(alice);
        router.createPool(address(init), address(usdc), 100_000e6, 100_000e6);
        vm.stopPrank();

        RupiahRouter.Route memory route = router.findBestRoute(address(init), address(usdc), 1_000e6);

        vm.prank(bob);
        uint256 amountOut = router.executeRoute(route, 0, block.timestamp + 1 hours);

        assertGt(amountOut, 0);
        assertEq(router.userSwapCount(bob), 1);
    }

    function test_getQuote() public {
        vm.prank(alice);
        router.createPool(address(init), address(usdc), 100_000e6, 100_000e6);

        (uint256 expectedOut, uint256 gasEstimate, RupiahRouter.Route memory route) =
            router.getQuote(address(init), address(usdc), 1_000e6);

        assertGt(expectedOut, 0);
        assertGt(gasEstimate, 0);
        assertEq(route.path[0], address(init));
    }

    // ================================================================
    //                     LIMIT ORDER TESTS
    // ================================================================

    function test_placeLimitOrder() public {
        vm.startPrank(alice);
        router.createPool(address(init), address(usdc), 100_000e6, 100_000e6);

        uint256 orderId = router.placeLimitOrder(
            address(init),
            address(usdc),
            1_000e6,
            0.9e18, // target price: 0.9 USDC per INIT
            block.timestamp + 1 days
        );
        vm.stopPrank();

        assertEq(orderId, 1);
        assertEq(router.orderCount(), 1);

        // Tokens should be locked in contract
        assertEq(init.balanceOf(address(router)), 100_000e6 + 1_000e6);
    }

    function test_executeLimitOrder() public {
        vm.startPrank(alice);
        router.createPool(address(init), address(usdc), 100_000e6, 100_000e6);

        // Place order with low target price (should be immediately executable)
        uint256 orderId = router.placeLimitOrder(
            address(init),
            address(usdc),
            1_000e6,
            0.5e18, // target: 0.5 USDC per INIT (easily met since pool is 1:1)
            block.timestamp + 1 days
        );
        vm.stopPrank();

        uint256 aliceUsdcBefore = usdc.balanceOf(alice);

        // Keeper executes
        vm.prank(keeper);
        uint256 amountOut = router.executeLimitOrder(orderId);

        assertGt(amountOut, 0);
        // Alice should receive USDC (minus 0.1% exec fee)
        assertGt(usdc.balanceOf(alice), aliceUsdcBefore);
        // Keeper should receive exec fee
        assertGt(usdc.balanceOf(keeper), 0);
    }

    function test_executeLimitOrder_revertsPriceNotMet() public {
        vm.startPrank(alice);
        router.createPool(address(init), address(usdc), 100_000e6, 100_000e6);

        // Place order with very high target price
        uint256 orderId = router.placeLimitOrder(
            address(init),
            address(usdc),
            1_000e6,
            2e18, // target: 2 USDC per INIT (impossible in 1:1 pool)
            block.timestamp + 1 days
        );
        vm.stopPrank();

        vm.prank(keeper);
        vm.expectRevert("RR: price not met");
        router.executeLimitOrder(orderId);
    }

    function test_cancelLimitOrder() public {
        vm.startPrank(alice);
        router.createPool(address(init), address(usdc), 100_000e6, 100_000e6);

        uint256 aliceInitBefore = init.balanceOf(alice);
        uint256 orderId = router.placeLimitOrder(
            address(init), address(usdc), 1_000e6, 0.9e18, block.timestamp + 1 days
        );

        // Alice's INIT reduced by order amount
        assertEq(init.balanceOf(alice), aliceInitBefore - 1_000e6);

        // Cancel and get refund
        router.cancelLimitOrder(orderId);
        assertEq(init.balanceOf(alice), aliceInitBefore);
        vm.stopPrank();
    }

    function test_cancelLimitOrder_revertsNonOwner() public {
        vm.startPrank(alice);
        router.createPool(address(init), address(usdc), 100_000e6, 100_000e6);
        uint256 orderId = router.placeLimitOrder(
            address(init), address(usdc), 1_000e6, 0.9e18, block.timestamp + 1 days
        );
        vm.stopPrank();

        vm.prank(bob);
        vm.expectRevert("RR: not order owner");
        router.cancelLimitOrder(orderId);
    }

    function test_getActiveOrders() public {
        vm.startPrank(alice);
        router.createPool(address(init), address(usdc), 100_000e6, 100_000e6);

        router.placeLimitOrder(address(init), address(usdc), 500e6, 0.9e18, block.timestamp + 1 days);
        router.placeLimitOrder(address(init), address(usdc), 300e6, 0.8e18, block.timestamp + 1 days);
        router.placeLimitOrder(address(init), address(usdc), 200e6, 0.7e18, block.timestamp + 1 days);

        // Cancel the second one
        router.cancelLimitOrder(2);

        RupiahRouter.LimitOrder[] memory active = router.getActiveOrders(alice);
        assertEq(active.length, 2);
        vm.stopPrank();
    }

    // ================================================================
    //                      BATCH SWAP TESTS
    // ================================================================

    function test_batchSwap() public {
        vm.startPrank(alice);
        router.createPool(address(init), address(usdc), 100_000e6, 100_000e6);
        router.createPool(address(init), address(eth_), 100_000e6, 100_000e6);
        router.createPool(address(init), address(tia), 100_000e6, 100_000e6);
        vm.stopPrank();

        RupiahRouter.BatchSwapParam[] memory swaps = new RupiahRouter.BatchSwapParam[](3);
        swaps[0] = RupiahRouter.BatchSwapParam(address(init), address(usdc), 400e6, 0);
        swaps[1] = RupiahRouter.BatchSwapParam(address(init), address(eth_), 300e6, 0);
        swaps[2] = RupiahRouter.BatchSwapParam(address(init), address(tia), 300e6, 0);

        vm.prank(bob);
        uint256[] memory amountsOut = router.batchSwap(swaps, block.timestamp + 1 hours);

        assertEq(amountsOut.length, 3);
        assertGt(amountsOut[0], 0);
        assertGt(amountsOut[1], 0);
        assertGt(amountsOut[2], 0);

        // Bob should have received all three tokens
        assertGt(usdc.balanceOf(bob), INITIAL_BALANCE); // had initial + swap output
        assertGt(eth_.balanceOf(bob), 0);
        assertGt(tia.balanceOf(bob), 0);
    }

    function test_batchSwap_revertsOnSlippage() public {
        vm.startPrank(alice);
        router.createPool(address(init), address(usdc), 100_000e6, 100_000e6);
        vm.stopPrank();

        RupiahRouter.BatchSwapParam[] memory swaps = new RupiahRouter.BatchSwapParam[](1);
        swaps[0] = RupiahRouter.BatchSwapParam(address(init), address(usdc), 1_000e6, 999e6);

        vm.prank(bob);
        vm.expectRevert("RR: batch swap slippage");
        router.batchSwap(swaps, block.timestamp + 1 hours);
    }

    // ================================================================
    //                       ADMIN TESTS
    // ================================================================

    function test_setSwapFeeRate() public {
        vm.prank(alice);
        uint256 poolId = router.createPool(address(init), address(usdc), 100_000e6, 100_000e6);

        // Owner sets fee
        router.setSwapFeeRate(poolId, 50); // 0.5%

        (, , , , uint256 feeRate,) = router.getPoolInfo(poolId);
        assertEq(feeRate, 50);
    }

    function test_setSwapFeeRate_revertsNonOwner() public {
        vm.prank(alice);
        uint256 poolId = router.createPool(address(init), address(usdc), 100_000e6, 100_000e6);

        vm.prank(alice);
        vm.expectRevert("RR: not owner");
        router.setSwapFeeRate(poolId, 50);
    }

    function test_transferOwnership() public {
        router.transferOwnership(alice);
        assertEq(router.owner(), alice);
    }

    // ================================================================
    //                     DEADLINE TESTS
    // ================================================================

    function test_multiHopSwap_revertsExpired() public {
        vm.startPrank(alice);
        router.createPool(address(init), address(usdc), 100_000e6, 100_000e6);
        vm.stopPrank();

        address[] memory path = new address[](2);
        path[0] = address(init);
        path[1] = address(usdc);
        uint256[] memory poolIds = new uint256[](1);
        poolIds[0] = router.getPoolId(address(init), address(usdc));

        vm.prank(bob);
        vm.expectRevert("RR: expired");
        router.multiHopSwap(path, poolIds, 1_000e6, 0, block.timestamp - 1);
    }

    // ================================================================
    //                     POOL ID LOOKUP
    // ================================================================

    function test_getPoolId_orderIndependent() public {
        vm.prank(alice);
        uint256 poolId = router.createPool(address(init), address(usdc), 100_000e6, 100_000e6);

        // Should return same pool regardless of token order
        assertEq(router.getPoolId(address(init), address(usdc)), poolId);
        assertEq(router.getPoolId(address(usdc), address(init)), poolId);
    }

    function test_getPoolId_returnsZeroForNonexistent() public view {
        assertEq(router.getPoolId(address(init), address(usdc)), 0);
    }
}
