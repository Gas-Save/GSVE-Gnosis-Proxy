pragma solidity ^0.5.3;

import "./Proxy.sol";

interface IProxyCreationCallback {
    function proxyCreated(Proxy proxy, address _mastercopy, bytes calldata initializer, uint256 saltNonce) external;
}

/// @title IProxy - Helper interface to access masterCopy of the Proxy on-chain
/// @author Richard Meissner - <richard@gnosis.io>
interface IProxy {
    function masterCopy() external view returns (address);
}

/**
* @dev interface to allow gsve to be burned for upgrades
*/
interface IGSVEToken {
    function burnFrom(address account, uint256 amount) external;
}

/// @title Proxy Factory - Allows to create new proxy contact and execute a message call to the new proxy within one transaction.
/// @author Stefan George - <stefan@gnosis.pm>
contract ProxyFactory {
    mapping(address => address) private _deployedAddress;
    mapping(address => address) private _addressGasToken;
    mapping(address => uint256) private _supportedGasTokens;
    event ProxyCreation(Proxy proxy);
    address public GSVEToken;
    
    constructor (address _GSVEToken) public {
        GSVEToken = _GSVEToken;
        //chi, gst2 and gst1
        _supportedGasTokens[0x0000000000004946c0e9F43F4Dee607b0eF1fA1c] = 24000;
        _supportedGasTokens[0x0000000000b3F879cb30FE243b4Dfee438691c04] = 24000;
        _supportedGasTokens[0x88d60255F917e3eb94eaE199d827DAd837fac4cB] = 15000;

        //wchi, wgst2 and wgst1
        _supportedGasTokens[0x04Bb5e8d692E665ca02c99C754BE2E41b6D35259] = 24000;
        _supportedGasTokens[0x45418f0B857BAF1c394B050d34d79E1aB89784dA] = 24000;
        _supportedGasTokens[0x4f6c4eB915b96442f030C819be29b0e143db65D9] = 15000;
    }
    
    /**
    * @dev return the location of a users deployed wrapper
    */
    function getDeployedAddress(address creator) public view returns(address){
        return _deployedAddress[creator];
    }

    /**
    * @dev return the gas token used by a safe
    */
    function getAddressGastoken(address safe) public view returns(address){
        return _addressGasToken[safe];
    }

    /**
    * @dev return the savings a gas token gives
    */
    function getAddressGasTokenSaving(address safe) public view returns(uint256){
        return _supportedGasTokens[getAddressGastoken(safe)];
    }

    /**
    * @dev return the location of a users deployed wrapper
    */
    function setAddressGasToken(address safe, address gasToken) public {
        require(_deployedAddress[msg.sender] == safe, "GSVE: Tried to set another safes gas token");
        require(_supportedGasTokens[gasToken] > 0, "GSVE: Invalid Gas Token");
        _addressGasToken[safe] = gasToken;
    }

    /// @dev Allows to create new proxy contact and execute a message call to the new proxy within one transaction.
    /// @param masterCopy Address of master copy.
    /// @param data Payload for message call sent to new proxy contract.
    function createProxy(address masterCopy, bytes memory data)
        public
        returns (Proxy proxy)
    {
        proxy = new Proxy(masterCopy);
        if (data.length > 0)
            // solium-disable-next-line security/no-inline-assembly
            assembly {
                if eq(call(gas, proxy, 0, add(data, 0x20), mload(data), 0, 0), 0) { revert(0, 0) }
            }
        emit ProxyCreation(proxy);
    }

    /// @dev Allows to retrieve the runtime code of a deployed Proxy. This can be used to check that the expected Proxy was deployed.
    function proxyRuntimeCode() public pure returns (bytes memory) {
        return type(Proxy).runtimeCode;
    }

    /// @dev Allows to retrieve the creation code used for the Proxy deployment. With this it is easily possible to calculate predicted address.
    function proxyCreationCode() public pure returns (bytes memory) {
        return type(Proxy).creationCode;
    }

    /// @dev Allows to create new proxy contact using CREATE2 but it doesn't run the initializer.
    ///      This method is only meant as an utility to be called from other methods
    /// @param _mastercopy Address of master copy.
    /// @param initializer Payload for message call sent to new proxy contract.
    /// @param saltNonce Nonce that will be used to generate the salt to calculate the address of the new proxy contract.
    function deployProxyWithNonce(address _mastercopy, bytes memory initializer, uint256 saltNonce)
        internal
        returns (Proxy proxy)
    {
        // If the initializer changes the proxy address should change too. Hashing the initializer data is cheaper than just concatinating it
        bytes32 salt = keccak256(abi.encodePacked(keccak256(initializer), saltNonce));
        bytes memory deploymentData = abi.encodePacked(type(Proxy).creationCode, uint256(_mastercopy));
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            proxy := create2(0x0, add(0x20, deploymentData), mload(deploymentData), salt)
        }
        require(address(proxy) != address(0), "Create2 call failed");
    }

    /// @dev Allows to create new proxy contact and execute a message call to the new proxy within one transaction.
    /// @param _mastercopy Address of master copy.
    /// @param initializer Payload for message call sent to new proxy contract.
    /// @param saltNonce Nonce that will be used to generate the salt to calculate the address of the new proxy contract.
    function createProxyWithNonce(address _mastercopy, bytes memory initializer, uint256 saltNonce)
        public
        returns (Proxy proxy)
    {
        IGSVEToken(GSVEToken).burnFrom(msg.sender, 50*10**18);
        proxy = deployProxyWithNonce(_mastercopy, initializer, saltNonce);
        if (initializer.length > 0)
            // solium-disable-next-line security/no-inline-assembly
            assembly {
                if eq(call(gas, proxy, 0, add(initializer, 0x20), mload(initializer), 0, 0), 0) { revert(0,0) }
            }

        _deployedAddress[msg.sender] = address(proxy);
        _addressGasToken[address(proxy)] = 0x0000000000004946c0e9F43F4Dee607b0eF1fA1c;
        emit ProxyCreation(proxy);
    }
}
