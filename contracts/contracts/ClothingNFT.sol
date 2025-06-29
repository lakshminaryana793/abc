// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ClothingNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Mapping from token ID to edition number
    mapping(uint256 => uint256) public tokenEdition;
    
    // Mapping from token ID to serial code
    mapping(uint256 => string) public tokenSerialCode;
    
    // Events
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed to,
        string tokenURI,
        uint256 edition,
        string serialCode
    );
    
    constructor() ERC721("Web3 Store Clothing", "W3SC") {}
    
    function mintNFT(
        address to,
        string memory tokenURI,
        uint256 edition,
        string memory serialCode
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        tokenEdition[tokenId] = edition;
        tokenSerialCode[tokenId] = serialCode;
        
        emit NFTMinted(tokenId, to, tokenURI, edition, serialCode);
        
        return tokenId;
    }
    
    function getTokenEdition(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        return tokenEdition[tokenId];
    }
    
    function getTokenSerialCode(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return tokenSerialCode[tokenId];
    }
    
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    // Override functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}