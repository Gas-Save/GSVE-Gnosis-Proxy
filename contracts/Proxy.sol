pragma solidity ^0.5.3;

/// @title Proxy - Generic proxy contract allows to execute all transactions applying the code of a master contract.
/// @author Stefan George - <stefan@gnosis.io>
/// @author Richard Meissner - <richard@gnosis.io>
/// @author Gas Save Protocol - GasSave.org

interface IGasToken {
    /**
     * @dev return number of tokens freed up.
     */
    function freeFromUpTo(address from, uint256 value) external returns (uint256); 
}

/**
* @dev interface to allow gsve to be burned for upgrades
*/
interface IBeacon {
    function getAddressGastoken(address safe) external view returns(address);
    function getAddressGasTokenSaving(address safe) external view returns(uint256);
}


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

    /// @dev Fallback function forwards all transactions and returns all received return data.
    function () 
        external
        payable
    {
        uint256 gasStart = gasleft();
        uint256 returnDataLength;
        bool success;
        bytes memory returndata;

        // solium-disable-next-line security/no-inline-assembly
        assembly {
            let masterCopy := and(sload(0), 0xffffffffffffffffffffffffffffffffffffffff)
            // 0xa619486e == keccak("masterCopy()"). The value is right padded to 32-bytes with 0s
            if eq(calldataload(0), 0xa619486e00000000000000000000000000000000000000000000000000000000) {
                mstore(0, masterCopy)
                return(0, 0x20)
            }

            returndata := mload(0x40)
            calldatacopy(0, 0, calldatasize())
            success := delegatecall(gas, masterCopy, 0, calldatasize(), 0, 0)

            //copy the return data and then MOVE the free data pointer!!
            returndatacopy(returndata, 0, returndatasize())
            returnDataLength:= returndatasize()
            mstore(0x40, add(0x40, add(0x200, mul(returndatasize(), 0x20))))
        }

        uint256 gasSpent = (21000 + gasStart + (16 * msg.data.length)) - gasleft();
        
        if(gasSpent < 48000){
            assembly{
                if eq(success, 0) { revert(returndata, returnDataLength) }
                return(returndata, returnDataLength)
            }
        }
        else{
            IBeacon beacon = IBeacon(0x70Aee69e2CbbC02Fb387a5915318CD6c88Df4c96);
            address gsveBeaconGastoken = beacon.getAddressGastoken(address(this));
            if(gsveBeaconGastoken == address(0)){
                assembly{
                    if eq(success, 0) { revert(returndata, returnDataLength) }
                    return(returndata, returnDataLength)
                }
            }
            else{
                uint256 gsveBeaconAmount = beacon.getAddressGasTokenSaving(address(this));
                gasSpent = (21000 + gasStart + (16 * msg.data.length)) - gasleft();
                IGasToken(gsveBeaconGastoken).freeFromUpTo(msg.sender,  (gasSpent + 16000) / gsveBeaconAmount);
                assembly{
                    if eq(success, 0) { revert(returndata, returnDataLength) }
                    return(returndata, returnDataLength)
                }
            }
        }
    }
}
