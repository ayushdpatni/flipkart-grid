// SPDX-License-Identifier: MIT
pragma solidity <=0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFT is ERC721URIStorage {
    address owner;
    uint public tokenCount;
    constructor() ERC721("DApp NFT", "DAPP"){
        owner=msg.sender;
    }
    modifier onlyPlatformOwner(){
        require(owner==msg.sender,"Sender is not owner");
        _;
    }
    function mint(string memory _tokenURI) external returns(uint) {
        tokenCount ++;
        _safeMint(msg.sender, tokenCount);
        _setTokenURI(tokenCount, _tokenURI);
        return(tokenCount);
    }
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");
        _transfer(from, to, tokenId);
    }
    function burn(
        uint256 tokenId
    ) public onlyPlatformOwner virtual {
        _burn(tokenId);
    }
}