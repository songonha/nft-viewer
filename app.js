/**
 * app.js - File JavaScript chính cho ứng dụng xem NFT trên BASE Mainnet
 * 
 * File này chứa mã nguồn để:
 * 1. Kết nối với mạng BASE Mainnet thông qua Alchemy API
 * 2. Truy vấn NFT từ một bộ sưu tập cụ thể cho một địa chỉ ví
 * 3. Hiển thị NFT lên giao diện người dùng
 * 4. Xử lý các trường hợp lỗi và trạng thái tải
 */

// Địa chỉ hợp đồng thông minh của bộ sưu tập NFT
const NFT_CONTRACT_ADDRESS = "0x0e381cd73faa421066dc5e2829a973405352168c";

// Cấu hình Alchemy API cho mạng BASE Mainnet
// Lưu ý: Bạn cần thay thế API_KEY bằng khóa API thực của bạn từ Alchemy
const API_KEY = "HUaVCdt_QzzidoA1doeqhWByAnXkiVSg"; // Thay thế bằng API key thực của bạn
const BASE_MAINNET_RPC_URL = `https://base-mainnet.g.alchemy.com/v2/${API_KEY}`;

// Khởi tạo kết nối Web3 với Alchemy
let web3;

// Các phần tử DOM
const walletAddressInput = document.getElementById("wallet-address");
const fetchButton = document.getElementById("fetch-button");
const loadingIndicator = document.getElementById("loading-indicator");
const errorMessage = document.getElementById("error-message");
const nftContainer = document.getElementById("nft-container");
const noNftMessage = document.getElementById("no-nft-message");

/**
 * Hàm khởi tạo ứng dụng và thiết lập các sự kiện
 */
function initApp() {
    // Khởi tạo Web3 với Alchemy
    try {
        web3 = AlchemyWeb3.createAlchemyWeb3(BASE_MAINNET_RPC_URL);
        console.log("Đã kết nối thành công với Alchemy Web3");
    } catch (error) {
        console.error("Lỗi khi khởi tạo Alchemy Web3:", error);
        showError("Không thể kết nối với blockchain. Vui lòng kiểm tra kết nối mạng của bạn.");
    }

    // Thêm sự kiện click cho nút tìm kiếm NFT
    fetchButton.addEventListener("click", fetchNFTs);

    // Thêm sự kiện nhấn Enter trong ô input
    walletAddressInput.addEventListener("keyup", function(event) {
        if (event.key === "Enter") {
            fetchNFTs();
        }
    });

    // Ẩn các phần tử ban đầu
    hideElement(loadingIndicator);
    hideElement(errorMessage);
    hideElement(noNftMessage);
}

/**
 * Hàm lấy danh sách NFT từ bộ sưu tập cho địa chỉ ví đã nhập
 */
async function fetchNFTs() {
    // Lấy địa chỉ ví từ ô input và xóa khoảng trắng
    const walletAddress = walletAddressInput.value.trim();

    // Kiểm tra địa chỉ ví có hợp lệ không
    if (!isValidEthereumAddress(walletAddress)) {
        showError("Địa chỉ ví không hợp lệ. Vui lòng nhập địa chỉ ví Ethereum hợp lệ (bắt đầu bằng 0x).");
        return;
    }

    // Xóa nội dung hiển thị trước đó
    clearDisplay();

    // Hiển thị trạng thái đang tải
    showElement(loadingIndicator);

    try {
        // Gọi API của Alchemy để lấy NFT
        // Lưu ý: Trong môi trường thực tế, bạn nên sử dụng Alchemy SDK hoặc API trực tiếp
        // Đây là cách đơn giản hóa để minh họa
        const nfts = await getNFTsForOwner(walletAddress, NFT_CONTRACT_ADDRESS);

        // Ẩn trạng thái đang tải
        hideElement(loadingIndicator);

        // Kiểm tra xem có NFT nào không
        if (nfts.length === 0) {
            showElement(noNftMessage);
        } else {
            // Hiển thị NFT lên giao diện
            displayNFTs(nfts);
        }
    } catch (error) {
        console.error("Lỗi khi lấy NFT:", error);
        hideElement(loadingIndicator);
        showError("Đã xảy ra lỗi khi lấy dữ liệu NFT. Vui lòng thử lại sau.");
    }
}

/**
 * Hàm lấy NFT cho chủ sở hữu từ một hợp đồng cụ thể
 * @param {string} ownerAddress - Địa chỉ ví của chủ sở hữu
 * @param {string} contractAddress - Địa chỉ hợp đồng NFT
 * @returns {Promise<Array>} - Mảng chứa thông tin NFT
 */
async function getNFTsForOwner(ownerAddress, contractAddress) {
    // Trong môi trường thực tế, bạn sẽ sử dụng Alchemy SDK hoặc API
    // Đây là cách sử dụng Alchemy Web3 để minh họa
    
    try {
        // Tạo tham số cho API call
        const params = {
            method: "alchemy_getTokenBalances",
            params: [ownerAddress, [contractAddress]],
            id: 1,
            jsonrpc: "2.0"
        };

        // Gọi API để kiểm tra số lượng token
        const balanceResponse = await web3.alchemy.send(params.method, params.params);
        
        // Nếu không có token, trả về mảng rỗng
        if (!balanceResponse.tokenBalances || balanceResponse.tokenBalances.length === 0 || 
            parseInt(balanceResponse.tokenBalances[0].tokenBalance, 16) === 0) {
            return [];
        }
        
        // Nếu có token, lấy metadata của NFT
        const nftMetadata = await web3.alchemy.send("alchemy_getNFTs", {
            owner: ownerAddress,
            contractAddresses: [contractAddress],
            withMetadata: true
        });

        // Xử lý kết quả và trả về mảng NFT
        if (nftMetadata && nftMetadata.ownedNfts) {
            return nftMetadata.ownedNfts.map(nft => ({
                id: nft.id.tokenId,
                name: nft.title || `NFT #${parseInt(nft.id.tokenId, 16)}`,
                description: nft.description || "Không có mô tả",
                image: nft.media && nft.media[0] ? nft.media[0].gateway : null,
                contractAddress: contractAddress,
                tokenId: nft.id.tokenId
            }));
        }
        
        return [];
    } catch (error) {
        console.error("Lỗi khi truy vấn NFT:", error);
        throw error;
    }
}

/**
 * Hàm hiển thị danh sách NFT lên giao diện
 * @param {Array} nfts - Mảng chứa thông tin NFT
 */
function displayNFTs(nfts) {
    // Xóa nội dung hiện tại
    nftContainer.innerHTML = "";
    
    // Tạo thẻ HTML cho mỗi NFT
    nfts.forEach(nft => {
        // Tạo phần tử card cho NFT
        const nftCard = document.createElement("div");
        nftCard.className = "nft-card";
        
        // Tạo container cho hình ảnh
        const imageContainer = document.createElement("div");
        imageContainer.className = "nft-image-container";
        
        // Kiểm tra xem có hình ảnh không
        if (nft.image) {
            const img = document.createElement("img");
            img.className = "nft-image";
            img.src = nft.image;
            img.alt = nft.name;
            img.onerror = function() {
                // Nếu hình ảnh lỗi, hiển thị placeholder
                this.style.display = "none";
                imageContainer.innerHTML += `<div class="nft-image-placeholder">Không thể tải hình ảnh</div>`;
            };
            imageContainer.appendChild(img);
        } else {
            // Nếu không có hình ảnh, hiển thị placeholder
            imageContainer.innerHTML = `<div class="nft-image-placeholder">Không có hình ảnh</div>`;
        }
        
        // Tạo phần thông tin NFT
        const infoContainer = document.createElement("div");
        infoContainer.className = "nft-info";
        
        // Định dạng ID token (chuyển từ hex sang decimal nếu cần)
        const tokenId = nft.id.startsWith("0x") ? parseInt(nft.id, 16).toString() : nft.id;
        
        // Thêm nội dung HTML cho phần thông tin
        infoContainer.innerHTML = `
            <h3 class="nft-name">${escapeHTML(nft.name)}</h3>
            <p class="nft-id">Token ID: ${escapeHTML(tokenId)}</p>
            <a href="https://basescan.org/token/${nft.contractAddress}?a=${tokenId}" 
               target="_blank" class="nft-link">Xem trên BaseScan</a>
        `;
        
        // Thêm các phần tử vào card
        nftCard.appendChild(imageContainer);
        nftCard.appendChild(infoContainer);
        
        // Thêm card vào container
        nftContainer.appendChild(nftCard);
    });
    
    // Hiển thị container
    showElement(nftContainer);
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

/**
 * Hàm hiển thị thông báo lỗi
 * @param {string} message - Nội dung thông báo lỗi
 */
function showError(message) {
    errorMessage.textContent = message;
    showElement(errorMessage);
}

/**
 * Hàm xóa nội dung hiển thị
 */
function clearDisplay() {
    hideElement(errorMessage);
    hideElement(noNftMessage);
    hideElement(nftContainer);
    nftContainer.innerHTML = "";
}

/**
 * Hàm hiển thị một phần tử
 * @param {HTMLElement} element - Phần tử cần hiển thị
 */
function showElement(element) {
    element.style.display = "block";
}

/**
 * Hàm ẩn một phần tử
 * @param {HTMLElement} element - Phần tử cần ẩn
 */
function hideElement(element) {
    element.style.display = "none";
}

/**
 * Hàm escape HTML để tránh XSS
 * @param {string} str - Chuỗi cần escape
 * @returns {string} - Chuỗi đã được escape
 */
function escapeHTML(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Khởi tạo ứng dụng khi trang đã tải xong
document.addEventListener("DOMContentLoaded", initApp);