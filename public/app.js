/**
 * app.js - File JavaScript phía client cho ứng dụng xem NFT trên BASE Mainnet
 * 
 * File này chứa mã nguồn để:
 * 1. Gửi yêu cầu API đến server Node.js
 * 2. Xử lý dữ liệu NFT nhận được
 * 3. Hiển thị NFT lên giao diện người dùng
 * 4. Xử lý các trường hợp lỗi và trạng thái tải
 */

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
        // Gọi API của server để lấy NFT
        const response = await fetch(`/api/nfts/${walletAddress}`);
        const data = await response.json();

        // Ẩn trạng thái đang tải
        hideElement(loadingIndicator);

        // Kiểm tra lỗi từ API
        if (data.error) {
            showError(data.error);
            return;
        }

        // Kiểm tra xem có NFT nào không
        if (!data.nfts || data.nfts.length === 0) {
            showElement(noNftMessage);
        } else {
            // Hiển thị NFT lên giao diện
            displayNFTs(data.nfts);
        }
    } catch (error) {
        console.error("Lỗi khi lấy NFT:", error);
        hideElement(loadingIndicator);
        showError("Đã xảy ra lỗi khi lấy dữ liệu NFT. Vui lòng thử lại sau.");
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