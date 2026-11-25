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
- Nhịp ván cố định (đồng hồ game chậm 100 lần so với giờ thật); game vẫn chạy khi bạn vắng mặt (tính bù tối đa 14 ngày). Tập kích từ khoảng ngày thứ 1, đổ bộ chiếm hành tinh từ ~ngày 3, vây hành tinh mẹ từ ~ngày 6, Bầy Hư Không ~ngày 10.
- Tài nguyên khởi đầu ở độ khó Thường: 1.500 kim loại, 900 tinh thể, 500 nhiên liệu, 100 kim loại hiếm. Ván cũ còn trong giai đoạn tân thủ nhận phần tăng thêm một lần, tối đa sức chứa kho.
- Không có mốc thắng; chỉ thua khi mất sạch hành tinh, kể cả hành tinh mẹ.
- Khảo sát hành tinh (tàu thăm dò) mới thấy trữ lượng, đặc tính, sự sống và chủng tộc; thuộc địa hóa mới xây mỏ.
- Nghiên cứu được rút ngắn 80% ở cấp đầu; thời gian mỗi cấp sau tăng ×1,35. Bản lưu cũ tự cập nhật thời gian nghiên cứu đang làm, giữ nguyên phần trăm tiến độ.
- Tàu thực dân dùng một lần khi lập thuộc địa thành công: giá cơ bản 240 kim loại, 160 tinh thể, 80 nhiên liệu; tăng 20% giá cơ bản cho mỗi thuộc địa đang sở hữu ngoài hành tinh đầu tiên, trước các ưu đãi.
- 36 chủng tộc với thái độ hợp tác / lệ thuộc / chống đối; 91 công nghệ; các thế lực AI học hỏi, thích nghi, lập liên minh chống bá chủ; Bầy Hư Không trỗi dậy theo chu kỳ.
- Thương mại liên sao: tab "Thương mại" cho đổi 4 nguyên liệu với các nền văn minh đã gặp (giá đổi theo khan hiếm/dư thừa và quan hệ). Hàng chở bằng chính tàu của bạn (mọi loại trừ tàu thực dân), tàu giao xong tự mang hàng đổi lại về; không có tàu giao hàng riêng.
- Chiến tranh giữa các thế lực AI: tuyên chiến, gửi hạm đội (thấy trên bản đồ) chiếm hành tinh của nhau, hòa ước khi hết thời hạn hoặc mất 3 hành tinh. Phe bị đánh có thể cầu viện bạn (thưởng khi phe đó không thua).
- Quân lực AI: mỗi đợt tập kích/tấn công tiêu hao quân lực; diệt hạm đội của họ làm quân lực giảm → thời cơ phản công. AI lên cấp công nghệ theo thời gian, mở rộng tới 24 hành tinh.
- Bảng cảnh báo góc trái bản đồ: liệt kê hành tinh đang bị tấn công, thời gian địch tới, sức mạnh địch so với phòng thủ của bạn (tính cả tàu tăng viện đang tới), và nút tăng viện từ hành tinh có tàu chiến mạnh nhất tới kịp.
- Nhiều thế lực: ván mở đầu với 4 đại thế lực + ~6 tiểu quốc bản địa; trong nửa đầu ván còn nhiều phe mới trỗi dậy từ 1 hành tinh (hoặc sau nổi dậy thành công). Các phe đánh nhau, cắt đất, thôn tính phe tàn — về cuối chỉ còn vài thế lực lớn (bot: ~10–12 phe đầu ván còn ~7–9 sau ~18 ngày). Có phanh chống một phe nuốt cả ngân hà.
- Đòi cống nạp: khi sức mạnh của bạn gấp 1,3 lần một thế lực, có thể ép họ nộp tài nguyên (giảm quan hệ, hồi chiêu ~1,7 ngày).
