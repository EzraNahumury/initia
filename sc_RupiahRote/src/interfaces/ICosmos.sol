// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ICosmos - Initia Cosmos Precompile Interface
/// @notice Precompile at 0x00000000000000000000000000000000000000f1
/// @dev Provides cross-VM interop: ERC20<->denom mapping, address conversion, IBC calls
interface ICosmos {
    /// @notice Convert ERC20 token address to Cosmos denom string
    function to_denom(address erc20Address) external view returns (string memory denom);

    /// @notice Convert Cosmos denom string to ERC20 token address
    function to_erc20(string memory denom) external view returns (address erc20Address);

    /// @notice Convert EVM address to bech32 Cosmos address
    function to_cosmos_address(address evmAddress) external view returns (string memory cosmosAddress);

    /// @notice Convert bech32 Cosmos address to EVM address
    function to_evm_address(string memory cosmosAddress) external view returns (address evmAddress);

    /// @notice Execute a Cosmos SDK message from Solidity (IBC transfer, etc.)
    function execute_cosmos(string memory cosmosMsg) external returns (bool success);

    /// @notice Query Cosmos state from Solidity
    function query_cosmos(string memory path, string memory req) external view returns (string memory result);
}
