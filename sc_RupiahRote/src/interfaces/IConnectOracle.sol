// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IConnectOracle - Initia Connect/Slinky Oracle Precompile Interface
/// @notice Precompile at 0x031ECb63480983FD216D17BB6e1d393f3816b72F
/// @dev On-chain price feeds for token pairs (e.g. INIT/USD, ETH/USD)
interface IConnectOracle {
    struct Price {
        uint256 price;
        uint64 timestamp;
        uint64 blockHeight;
        uint8 decimals;
    }

    /// @notice Get price for a specific currency pair
    /// @param base Base currency symbol (e.g. "INIT")
    /// @param quote Quote currency symbol (e.g. "USD")
    function get_price(string memory base, string memory quote) external view returns (Price memory);

    /// @notice Get all available price feeds
    function get_all_prices() external view returns (Price[] memory);
}
