# 🎮 Người vs Sói - Mini Board Game

Một game board đơn giản được viết bằng React với logic game hoàn chỉnh.

## 🚀 Cách chạy game

### Bước 1: Cài đặt dependencies

```bash
npm install
```

### Bước 2: Chạy development server

```bash
npm start
```

Game sẽ tự động mở trong trình duyệt tại `http://localhost:3000`

## 🎯 Cách chơi

1. **Người chơi**: Click vào quân của mình (hình cô gái màu hồng) để chọn
2. **Di chuyển**: Click vào ô trống ở giữa để di chuyển
3. **Sói**: Tương tự với quân sói (hình màu xanh)
4. **Mục tiêu**: Khóa đối phương không thể di chuyển

## 🛠️ Công nghệ sử dụng

- **React 18** - UI framework
- **CSS3** - Styling với animations
- **Base64 SVG** - Hình ảnh nhân vật (tránh vấn đề CORS)

## 📁 Cấu trúc project

```
src/
├── components/
│   ├── GameBoard.js      # Bàn chơi game
│   ├── GameBoard.css     # CSS cho bàn chơi
│   ├── ScoreBoard.js     # Hiển thị điểm số
│   ├── ScoreBoard.css    # CSS cho điểm số
│   ├── GameLog.js        # Hiển thị log game
│   └── GameLog.css       # CSS cho log
├── App.js                # Component chính
├── App.css               # CSS chính
├── index.js              # Entry point
└── index.css             # CSS global
```

## 🎨 Tính năng

- ✅ Logic game hoàn chỉnh
- ✅ Hình ảnh base64 (không cần server)
- ✅ Animations và hiệu ứng
- ✅ Responsive design
- ✅ Score tracking
- ✅ Round management
- ✅ Auto-switch turns

## 🔧 Troubleshooting

Nếu gặp lỗi, hãy thử:

1. **Xóa node_modules và cài lại**:

```bash
rm -rf node_modules package-lock.json
npm install
```

2. **Clear cache**:

```bash
npm start -- --reset-cache
```

3. **Kiểm tra port**: Đảm bảo port 3000 không bị sử dụng

## 📱 Browser Support

- Chrome (khuyến nghị)
- Firefox
- Safari
- Edge

---

**Chúc bạn chơi game vui vẻ! 🎉**
