# Ứng dụng Xem NFT trên BASE Mainnet

Ứng dụng Node.js cho phép xem NFT từ bộ sưu tập cụ thể trên mạng BASE Mainnet.

## Tính năng

- Kết nối với mạng BASE Mainnet thông qua Alchemy API
- Truy vấn NFT từ bộ sưu tập cụ thể cho một địa chỉ ví
- Hiển thị NFT lên giao diện người dùng
- Xử lý các trường hợp lỗi và trạng thái tải

## Yêu cầu hệ thống

- Node.js (phiên bản 14.x trở lên)
- npm (phiên bản 6.x trở lên)

## Cách thiết lập

### 1. Lấy API Key từ Alchemy

Để ứng dụng hoạt động, bạn cần một API key từ Alchemy:

1. Đăng ký tài khoản tại [Alchemy](https://www.alchemy.com/)
2. Tạo một ứng dụng mới cho mạng BASE Mainnet
3. Lấy API key từ trang quản lý ứng dụng

### 2. Cài đặt ứng dụng

1. Clone hoặc tải xuống mã nguồn
2. Mở terminal và di chuyển đến thư mục dự án
3. Cài đặt các dependencies:

```bash
npm install
```

### 3. Cấu hình API Key

Cập nhật file `.env` với API key của bạn:

```
ALCHEMY_API_KEY=your-api-key-here
PORT=3000
```

### 4. Chạy ứng dụng

```bash
npm start
```

Hoặc chạy trong chế độ phát triển (với nodemon):

```bash
npm run dev
```

Sau khi khởi động, ứng dụng sẽ chạy tại địa chỉ: http://localhost:3000

## Cấu trúc dự án

```
├── public/              # Thư mục chứa các file tĩnh
│   ├── index.html       # File HTML chính
│   ├── app.js           # JavaScript phía client
│   └── styles.css       # CSS cho giao diện người dùng
├── server.js            # File chính của server Node.js
├── package.json         # Cấu hình npm và dependencies
└── .env                 # Biến môi trường (API keys, etc.)
```

## API Endpoints

### GET /api/nfts/:walletAddress

Trả về danh sách NFT từ bộ sưu tập cụ thể cho địa chỉ ví đã cung cấp.

**Tham số:**
- `walletAddress`: Địa chỉ ví Ethereum (bắt đầu bằng 0x)

**Phản hồi:**
```json
{
  "nfts": [
    {
      "id": "tokenId",
      "name": "NFT Name",
      "description": "NFT Description",
      "image": "image_url",
      "contractAddress": "contract_address",
      "tokenId": "tokenId"
    }
  ]
}
```

## Giải thích mã nguồn

### Server (server.js)

File JavaScript chứa logic phía server:
- Khởi tạo Express server
- Kết nối với Alchemy API để truy cập mạng BASE Mainnet
- Cung cấp API endpoint để truy vấn NFT
- Phục vụ các file tĩnh

### Client (public/app.js)

File JavaScript chứa logic phía client:
- Gửi yêu cầu API đến server
- Xử lý và hiển thị dữ liệu NFT
- Xử lý các trường hợp lỗi

## Giấy phép

ISC