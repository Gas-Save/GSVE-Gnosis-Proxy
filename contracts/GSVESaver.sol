// SPDX-License-Identifier: MIT
pragma solidity ^0.5.3;

import "./IGSVEBeacon.sol";

interface IGasToken {
    /**
     * @dev return number of tokens freed up.
     */
    function freeFromUpTo(address from, uint256 value) external returns (uint256); 
}

contract GSVESaver {
    /**
    * @dev GSVE modifier that burns a specific gas token, based on the address specified in a beacon
    */
    modifier discountGas(bool discount) {
        uint256 gasStart = gasleft();
        _;
        address token;
        uint256 amount; 
        (token, amount) = IGSVEBeacon(0x98DEA83628a522AF9F70c5201DdD60Df78B2fD93).getGasTokenAndSaving(address(this));

        if(token != address(0)){
            uint256 gasSpent = 21000 + gasStart - gasleft() + 16 * msg.data.length;
            IGasToken(token).freeFromUpTo(msg.sender,  (gasSpent + 16000) / amount);
        }
    }
}