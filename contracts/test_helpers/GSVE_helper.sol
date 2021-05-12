// SPDX-License-Identifier: MIT
pragma solidity ^0.5.3;

import "../GSVESaver.sol";

contract GSVE_helper is GSVESaver {

    function dummy() public {
        assembly{
            invalid()
        }
    }

    // Burns at least burn gas by calling itself and throwing
    function burnGas(uint256 burn) public discountGas(true) {
        // call self.dummy() to burn a bunch of gas
        assembly {
            mstore(0x0, 0x32e43a1100000000000000000000000000000000000000000000000000000000)
            let ret := call(burn, address(), 0, 0x0, 0x04, 0x0, 0)
        }
    }
}
