# Chinh Phục Ngân Hà

Game chiến lược 4X không gian chạy trên trình duyệt (một file `index.html`, không cần cài gì).

## Chạy
```
python -m http.server 8765 --directory ngan-ha
```
Rồi mở `http://localhost:8765`. Thêm `?dev` vào đường dẫn để hiện các nút tua nhanh (x2, x5, x30, x120) dùng khi thử game.

## Nội dung thư mục
- `index.html` — toàn bộ game (phiên bản mới nhất).
- `bot.js` — bot chơi thử để đo cân bằng. Mở game với `?dev`, rồi trong console:
  ```js
  window.__HEADLESS = true;                       // im lặng, không vẽ giao diện
  (0, eval)(await fetch('/bot.js').then(r => r.text()));
  await runBatch([[seed, doKho]], giayGameToiDa); // doKho: 0 dễ, 1 thường, 2 khó
  ```

## Luật tóm tắt
- Nhịp ván cố định ~10 tuần (chậm kiểu duy trì); game vẫn chạy khi bạn vắng mặt (tính bù tối đa 14 ngày).
- Tài nguyên khởi đầu ở độ khó Thường: 1.500 kim loại, 900 tinh thể, 500 nhiên liệu, 100 kim loại hiếm. Ván cũ còn trong giai đoạn tân thủ nhận phần tăng thêm một lần, tối đa sức chứa kho.
- Không có mốc thắng; chỉ thua khi mất sạch hành tinh, kể cả hành tinh mẹ.
- Khảo sát hành tinh (tàu thăm dò) mới thấy trữ lượng, đặc tính, sự sống và chủng tộc; thuộc địa hóa mới xây mỏ.
- Nghiên cứu được rút ngắn 80% ở cấp đầu; thời gian mỗi cấp sau tăng ×1,35. Bản lưu cũ tự cập nhật thời gian nghiên cứu đang làm, giữ nguyên phần trăm tiến độ.
- Tàu thực dân dùng một lần khi lập thuộc địa thành công: giá cơ bản 240 kim loại, 160 tinh thể, 80 nhiên liệu; tăng 20% giá cơ bản cho mỗi thuộc địa đang sở hữu ngoài hành tinh đầu tiên, trước các ưu đãi.
- 36 chủng tộc với thái độ hợp tác / lệ thuộc / chống đối; 91 công nghệ; các thế lực AI học hỏi, thích nghi, lập liên minh chống bá chủ; Bầy Hư Không trỗi dậy theo chu kỳ.
