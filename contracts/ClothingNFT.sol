// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ClothingNFT
 * @dev ERC721 token for clothing items with metadata storage
 */
contract ClothingNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Mapping from token ID to product information
    mapping(uint256 => ProductInfo) public productInfo;
    
    // Mapping from product ID to edition counter
    mapping(string => uint256) public productEditions;
    
    struct ProductInfo {
        string productId;
        string serialNumber;
        uint256 editionNumber;
        uint256 maxEdition;
        address originalOwner;
        uint256 mintTimestamp;
    }
    
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string productId,
        string serialNumber,
        uint256 editionNumber
    );
    
    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) Ownable(msg.sender) {
        // Start token IDs at 1
        _tokenIdCounter.increment();
    }
    
    /**
     * @dev Mint a new NFT for a clothing item
     * @param to Address to mint the NFT to
     * @param productId Unique identifier for the product
     * @param serialNumber Serial number of the item
     * @param maxEdition Maximum edition count for this product
     * @param tokenURI IPFS URI for the token metadata
     */
    function safeMint(
        address to,
        string memory productId,
        string memory serialNumber,
        uint256 maxEdition,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        // Increment edition counter for this product
        productEditions[productId]++;
        uint256 editionNumber = productEditions[productId];
        
        require(editionNumber <= maxEdition, "Maximum edition reached");
        
        // Store product information
        productInfo[tokenId] = ProductInfo({
            productId: productId,
            serialNumber: serialNumber,
            editionNumber: editionNumber,
            maxEdition: maxEdition,
            originalOwner: to,
            mintTimestamp: block.timestamp
        });
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        emit NFTMinted(tokenId, to, productId, serialNumber, editionNumber);
        
        return tokenId;
    }
    
    /**
     * @dev Get the current token counter
     */
    function tokenCounter() public view returns (uint256) {
        return _tokenIdCounter.current() - 1;
    }
    
    /**
     * @dev Get product information for a token
     */
    function getProductInfo(uint256 tokenId) public view returns (ProductInfo memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return productInfo[tokenId];
    }
    
    /**
     * @dev Get current edition number for a product
     */
    function getCurrentEdition(string memory productId) public view returns (uint256) {
        return productEditions[productId];
    }
    
    /**
     * @dev Check if a product has reached maximum edition
     */
    function isProductSoldOut(string memory productId, uint256 maxEdition) public view returns (bool) {
        return productEditions[productId] >= maxEdition;
    }
    
    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}