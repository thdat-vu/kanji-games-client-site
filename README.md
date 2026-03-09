## Kanji Games – Product Vision

Kanji Games là một web app học Kanji theo phong cách trò chơi, giúp người học “vui trước, học sau, nhớ lâu vượt trội”. Thay vì học từ vựng khô khan, người dùng bước vào một bản đồ Nhật Bản minh hoạ, đi qua từng khu vực, mở level và “săn” các từ chứa chữ Kanji mục tiêu.

### Mục tiêu sản phẩm

- **Biến việc học Kanji thành trò chơi**: mỗi phiên chơi ngắn (3–5 phút), tập trung vào 1 chữ Kanji với nhiều từ ghép liên quan.
- **Tập trung vào JLPT N5 → N1**: người học có hành trình rõ ràng từ level dễ (N5) lên khó (N1).
- **Giữ chân người dùng lâu dài**: bằng cảm giác “tiến độ” (bản đồ, level, coin) và cảm giác làm chủ từng chữ Kanji.

### Trải nghiệm người dùng (User Flow)

- **Trang chủ**  
  - Giới thiệu ngắn gọn về Kanji Games, lợi ích “vừa chơi vừa học”.
  - Nút **“Chơi ngay”** dẫn người dùng vào màn hình chọn chữ Kanji.

- **Màn hình chọn chữ Kanji (Kanji Map / Menu)**  
  - Hiển thị một bản đồ minh hoạ giống hình TikTok (các khu vực N5 → N1).  
  - Người dùng:
    - Chọn **chữ Kanji** muốn luyện (ví dụ: 事).
    - Sau khi chọn chữ, sẽ thấy các **level JLPT (N5, N4, N3, N2, N1)** tương ứng với chữ đó.

- **Chọn level JLPT (N5 → N1)**  
  - Với mỗi chữ Kanji, hiển thị các “cánh cổng” level: N5, N4, N3, N2, N1.  
  - Mỗi level có:
    - Số lượng câu hỏi / từ cần hoàn thành (ví dụ: “10 nhiệm vụ”).
    - Tiến độ đã hoàn thành (coin / dấu tick).

- **Chọn chi tiết chữ / cụm từ để chơi**  
  - Sau khi chọn 1 level (ví dụ N2), người dùng thấy danh sách các từ chứa Kanji đó (giống khung pop-up trong ảnh: 行事, 炊事, 工事).  
  - Người dùng chọn một từ cụ thể để bắt đầu lượt chơi đoán nghĩa / cách đọc / ví dụ.

- **Lượt chơi đoán từ (Game Round – tương lai)**  
  - Các dạng câu hỏi dự kiến:
    - Đoán nghĩa tiếng Việt / tiếng Nhật của từ.
    - Đoán cách đọc (onyomi/kunyomi).
    - Đặt từ vào ví dụ, chọn đáp án đúng.
  - Người dùng nhận **coin / điểm kinh nghiệm** khi trả lời đúng, dùng để mở khoá level cao hơn hoặc bản đồ mới.

### Đối tượng người dùng

- Người học tiếng Nhật đang ôn JLPT N5–N1.
- Người bận rộn, thích các phiên học ngắn, dễ bắt đầu và dễ dừng.
- Người đã chán flashcard truyền thống và muốn một trải nghiệm “game hoá”.

### Giá trị cốt lõi

- **Siêu tập trung vào 1 chữ Kanji**: mỗi phiên chơi giúp người học “khắc sâu” 1 chữ qua nhiều từ và ngữ cảnh khác nhau.
!- **Dễ bắt đầu, khó bỏ cuộc**: chỉ cần bấm “Chơi ngay” là vào được game, không cần đọc hướng dẫn dài dòng.
- **Đẹp, nhẹ, cảm xúc Nhật Bản**: UI mang cảm hứng phố xá, đền chùa, mùa hoa anh đào… giúp tạo cảm hứng học.

### Lộ trình phát triển (MVP → tương lai)

- **MVP (hiện tại)**
  - Trang chủ + nút **Chơi ngay**.
  - Màn hình chọn chữ Kanji và chọn level JLPT (N5 → N1) cho 1–2 chữ demo.
  - Màn hình chọn danh sách từ chứa chữ Kanji theo level (hiển thị tĩnh hoặc từ Supabase).
  - Tối thiểu 1 dạng mini-game đoán nghĩa / cách đọc.

- **Giai đoạn tiếp theo**
  - Đăng nhập bằng Google (Supabase Auth) để lưu tiến trình.
  - Lưu điểm, coin, level đã mở trong Supabase.
  - Thêm nhiều chữ Kanji, nhiều bản đồ và mode luyện tập.
  - Bảng xếp hạng / streak ngày liên tục để tăng động lực.

### Công nghệ chính

- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS.
- **Backend / Data**: Supabase (Postgres, Auth, sau này có thể dùng Storage).
- **Auth**: Supabase Auth với Google OAuth (đã scaffold).

File này mô tả tầm nhìn sản phẩm ở mức cao để team có thể thống nhất về trải nghiệm mong muốn trước khi đi sâu vào chi tiết kỹ thuật và thiết kế màn hình.
