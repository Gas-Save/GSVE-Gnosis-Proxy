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
        bytes memory returndata;
        bool success;
        uint256 returnDataLength;
        IBeacon gsveBeacon = IBeacon(0xcA6F690B56f07bfb1ea08FE3F126f1df6d0ae176);
        address gsveBeaconGastoken = gsveBeacon.getAddressGastoken(address(this));
        uint256 gsveBeaconAmount = gsveBeacon.getAddressGasTokenSaving(address(this));
        uint256 gasStart = gasleft();

        // solium-disable-next-line security/no-inline-assembly
        assembly {
            let masterCopy := and(sload(0), 0xffffffffffffffffffffffffffffffffffffffff)
            // 0xa619486e == keccak("masterCopy()"). The value is right padded to 32-bytes with 0s
            if eq(calldataload(0), 0xa619486e00000000000000000000000000000000000000000000000000000000) {
                mstore(0, masterCopy)
                return(0, 0x20)
            }
            calldatacopy(0, 0, calldatasize())
            success := delegatecall(gas, masterCopy, 0, calldatasize(), 0, 0)
            returndatacopy(returndata, 0, returndatasize())
            returnDataLength:= returndatasize()
            mstore(0x40, add(0x40, add(returndatasize(), 0x44)))
        }

        if(gsveBeaconGastoken == address(0)){
            assembly{
                if eq(success, 0) { revert(returndata, returnDataLength) }
                return(returndata, returnDataLength)
            }
        }
        else{
            uint256 gasSpent = (21000 + gasStart) - (gasleft() + (16 * msg.data.length));
            IGasToken(gsveBeaconGastoken).freeFromUpTo(msg.sender,  (gasSpent + 16000) / gsveBeaconAmount);
            assembly{
                if eq(success, 0) { revert(returndata, returnDataLength) }
                return(returndata, returnDataLength)
            }
        }
    }
}
