require('dotenv').config();
const express = require('express');
const path = require('path');
const { Alchemy, Network } = require('alchemy-sdk');

// Khởi tạo ứng dụng Express
const app = express();
const PORT = process.env.PORT || 3000;

// Địa chỉ hợp đồng thông minh của bộ sưu tập NFT
const NFT_CONTRACT_ADDRESS = "0x0e381cd73faa421066dc5e2829a973405352168c";

// Cấu hình Alchemy API cho mạng BASE Mainnet
const API_KEY = process.env.ALCHEMY_API_KEY || "HUaVCdt_QzzidoA1doeqhWByAnXkiVSg";

// Cấu hình Alchemy SDK
const config = {
  apiKey: API_KEY,
  network: Network.BASE_MAINNET
};

// Khởi tạo Alchemy SDK
const alchemy = new Alchemy(config);

// Phục vụ các file tĩnh từ thư mục hiện tại
app.use(express.static(path.join(__dirname, 'public')));

// Middleware để xử lý dữ liệu JSON
app.use(express.json());

// API endpoint để lấy NFT cho một địa chỉ ví
app.get('/api/nfts/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    // Kiểm tra địa chỉ ví có hợp lệ không
    if (!isValidEthereumAddress(walletAddress)) {
      return res.status(400).json({ error: "Địa chỉ ví không hợp lệ" });
    }
    
    // Lấy NFT từ Alchemy SDK
    const nfts = await getNFTsForOwner(walletAddress, NFT_CONTRACT_ADDRESS);
    
    res.json({ nfts });
  } catch (error) {
    console.error('Lỗi khi lấy NFT:', error);
    res.status(500).json({ error: "Đã xảy ra lỗi khi lấy dữ liệu NFT" });
  }
});

/**
 * Hàm lấy NFT cho chủ sở hữu từ một hợp đồng cụ thể
 * @param {string} ownerAddress - Địa chỉ ví của chủ sở hữu
 * @param {string} contractAddress - Địa chỉ hợp đồng NFT
 * @returns {Promise<Array>} - Mảng chứa thông tin NFT
 */
async function getNFTsForOwner(ownerAddress, contractAddress) {
  try {
    // Kiểm tra số lượng NFT của địa chỉ ví
    const nftsForOwner = await alchemy.nft.getNftsForOwner(ownerAddress, {
      contractAddresses: [contractAddress]
    });

    // Nếu không có NFT, trả về mảng rỗng
    if (!nftsForOwner.ownedNfts || nftsForOwner.ownedNfts.length === 0) {
      return [];
    }

    // Xử lý kết quả và trả về mảng NFT
    return nftsForOwner.ownedNfts.map(nft => ({
      id: nft.tokenId,
      name: nft.title || `NFT #${parseInt(nft.tokenId, 16)}`,
      description: nft.description || "Không có mô tả",
      image: nft.media && nft.media[0] ? nft.media[0].gateway : null,
      contractAddress: contractAddress,
      tokenId: nft.tokenId
    }));
  } catch (error) {
    console.error("Lỗi khi truy vấn NFT:", error);
    throw error;
  }
}

/**
 * Hàm kiểm tra địa chỉ Ethereum có hợp lệ không
 * @param {string} address - Địa chỉ cần kiểm tra
 * @returns {boolean} - true nếu địa chỉ hợp lệ, false nếu không
 */
function isValidEthereumAddress(address) {
  // Kiểm tra địa chỉ có bắt đầu bằng 0x và có độ dài 42 ký tự (bao gồm 0x)
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Route mặc định trả về trang chủ
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});