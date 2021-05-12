// SPDX-License-Identifier: MIT
pragma solidity ^0.5.3;

/**
* @dev interface to allow gsve to be burned for upgrades
*/
interface IGSVEBeacon {
    function initSafe(address owner, address safe) external;
    function getGasTokenAndSaving(address safe) external view returns(address, uint256);
}
