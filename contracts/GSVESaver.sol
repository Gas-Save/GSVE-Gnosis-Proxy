// SPDX-License-Identifier: MIT
pragma solidity ^0.5.3;

interface IGasToken {
    /**
     * @dev return number of tokens freed up.
     */
    function freeFromUpTo(address from, uint256 value) external returns (uint256); 
    function allowance(address owner, address spender) external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);

}

contract GSVESaver {

    /**
    * @dev GSVE moddifier that burns W/GST2 or W/Chi 
    * burn happens if the caller has provided the gnosis proxy with gas token allowances
    * No comparing of W/GST1 as this adds way too much complexity and overhead!
    * Probably a more elegant way of doing this, but it works ;)
    */
    modifier discountGas(bool discount) {
        uint256 gasStart = gasleft();
        _;
        address token1;
        uint256 amount1; 

        //compare CHI vs GST2
        (token1, amount1) = compareAllowance(0x0000000000004946c0e9F43F4Dee607b0eF1fA1c, 0x0000000000b3F879cb30FE243b4Dfee438691c04);
        
        address token2;
        uint256 amount2; 
        //compare wchi vs wgst2
        (token2, amount2) = compareAllowance(0x04Bb5e8d692E665ca02c99C754BE2E41b6D35259, 0x4f6c4eB915b96442f030C819be29b0e143db65D9);

        address token;
        uint256 amount; 
        (token, amount) = compareAllowance(token1, token2);

        if(amount > 0){
            uint256 gasSpent = 21000 + gasStart - gasleft() + 16 * msg.data.length;
            IGasToken(token).freeFromUpTo(msg.sender,  (gasSpent + 16000) / 24000);
        }
        else{

        }
    }

    /**
    * @dev helper that compares two allowances and gets the best gas token
    */
    function compareAllowance(address one, address two) internal view returns (address token, uint256 value) {
        uint256 allowanceOne = getAvailability(one);
        uint256 allowanceTwo = getAvailability(two); 
        if(allowanceOne > allowanceTwo) {
            return (one, allowanceOne);
        }
        else{
            return (two, allowanceTwo);
        }
    }

    /**
    * @dev helper that gets lowest of balance and allowance.
    */
    function getAvailability(address token) internal view returns (uint256 ) {
        return min(IGasToken(token).allowance(msg.sender, address(this)), IGasToken(token).balanceOf(msg.sender));
    }

    /**
     * @dev Returns the smallest of two numbers.
     */
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}