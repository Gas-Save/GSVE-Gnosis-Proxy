pragma solidity ^0.5.3;

interface IGasToken {
    /**
     * @dev return number of tokens freed up.
     */
    function freeFromUpTo(address from, uint256 value) external returns (uint256); 
    function allowance(address owner, address spender) external view returns (uint256);

}
/// @title Proxy - Generic proxy contract allows to execute all transactions applying the code of a master contract.
/// @author Stefan George - <stefan@gnosis.io>
/// @author Richard Meissner - <richard@gnosis.io>
/// @author Gas Save Protocol - GasSave.org
contract Proxy {

    // masterCopy always needs to be first declared variable, to ensure that it is at the same location in the contracts to which calls are delegated.
    // To reduce deployment costs this variable is internal and needs to be retrieved via `getStorageAt`
    address internal masterCopy;

    /// @dev Constructor function sets address of master copy contract.
    /// @param _masterCopy Master copy address.
    constructor(address _masterCopy)
        public
    {
        require(_masterCopy != address(0), "Invalid master copy address provided");
        masterCopy = _masterCopy;
    }


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
        uint256 ammount1; 
        address token2;
        uint256 ammount2; 

        //compare CHI vs GST2
        (token1, ammount1) = compareAllowance(0x0000000000004946c0e9F43F4Dee607b0eF1fA1c, 0x0000000000b3F879cb30FE243b4Dfee438691c04);
        
        //compare wchi vs wgst2
        (token2, ammount2) = compareAllowance(0x7738C2a90eED0d3Df85B80FfE5867E56eB7d7953, 0x6CAe6b3487558944D5902bbF74502877265f5430);

        address token;
        uint256 amount; 
        (token, amount) = compareAllowance(token1, token2);

        if(amount > 0){
            uint256 gasSpent = 21000 + gasStart - gasleft() + 16 * msg.data.length;
            IGasToken(token).freeFromUpTo(msg.sender,  (gasSpent + 16000) / 24000);
        }
    }

    /**
    * @dev GSVE moddifier that burns W/GST2 or W/Chi 
    * burn happens if the caller has provided the gnosis proxy with gas token allowances
    * No comparing of W/GST1 as this adds way too much complexity and overhead!
    * Probably a more elegant way of doing this, but it works ;)
    */
    function compareAllowance(address one, address two) public view returns (address token, uint256 value) {
        uint256 allowanceOne = IGasToken(one).allowance(msg.sender, address(this));
        uint256 allowanceTwo = IGasToken(two).allowance(msg.sender, address(this)); 
        if(allowanceOne > allowanceTwo) {
            return (one, allowanceOne);
        }
        else{
            return (two, allowanceTwo);
        }
    }

    /// @dev Fallback function forwards all transactions and returns all received return data.
    function () 
        external
        payable
        discountGas(true)
    {
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            let masterCopy := and(sload(0), 0xffffffffffffffffffffffffffffffffffffffff)
            // 0xa619486e == keccak("masterCopy()"). The value is right padded to 32-bytes with 0s
            if eq(calldataload(0), 0xa619486e00000000000000000000000000000000000000000000000000000000) {
                mstore(0, masterCopy)
                return(0, 0x20)
            }
            calldatacopy(0, 0, calldatasize())
            let success := delegatecall(gas, masterCopy, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            if eq(success, 0) { revert(0, returndatasize()) }
            return(0, returndatasize())
        }
    }
}
