# Cấu hình chatbot "Ask AI about me"

Chatbot trả lời câu hỏi về bạn **chỉ dựa trên `content/profile.md`**, dùng Claude Haiku 5.5.
Luồng chạy: trình duyệt → `POST /api/chat` (server, giữ API key) → Anthropic API → stream câu trả lời về.

## 1. Lấy API key và chặn chi tiêu (làm một lần)

1. Vào https://console.anthropic.com, đăng ký hoặc đăng nhập.
2. **Billing**: nạp credit. $5 là đủ dùng rất lâu, vì mỗi câu hỏi chỉ tốn khoảng $0.0007.
3. **Limits**: đặt **monthly spend limit**, ví dụ $5/tháng. Đây là chốt chặn chi phí thật sự.
   Giới hạn lượt trong code chỉ chặn được spam đơn giản, không đảm bảo tuyệt đối.
4. **API Keys** → Create Key, đặt tên kiểu `portfolio-chat`. Copy key (dạng `sk-ant-...`).
   Key chỉ hiện một lần. **Không** dán key vào code, không commit lên git.

## 2. Chạy ở máy

Tạo file `.env.local` ở thư mục gốc. File này đã được `.gitignore` bỏ qua nên không lên git:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Rồi chạy `npm run dev`, mở http://localhost:3000 và bấm "Ask AI about me".
Chưa có key thì chat sẽ báo "The assistant is not set up yet" thay vì lỗi.

## 3. Cấu hình trên Vercel

Project → **Settings → Environment Variables**, thêm:

| Tên | Giá trị | Môi trường |
|---|---|---|
| `ANTHROPIC_API_KEY` | key ở bước 1 | Production (và Preview nếu muốn test link preview) |
| `NEXT_PUBLIC_SITE_URL` | domain thật, ví dụ `https://ten-ban.vercel.app` | Production |

Thêm hoặc đổi biến xong phải **Redeploy**: Deployments → bản mới nhất → ⋯ → Redeploy.
Biến môi trường chỉ có tác dụng với lần deploy sau.

**Kiểm tra cấu hình build (chỉ một lần):** Settings → Build and Deployment → Framework Preset phải là
**Next.js**, và **Output Directory để trống**, đừng để `out`. Trước đây site build ra thư mục tĩnh `out/`;
giờ đã có server cho chat nên không còn thư mục đó. Nếu vẫn để `out` thì deploy sẽ lỗi.
Khi deploy lỗi, Vercel giữ nguyên bản cũ đang chạy nên site không bị sập.

Tài liệu: https://vercel.com/docs/environment-variables

## 4. Viết `content/profile.md` (quan trọng nhất)

AI chỉ biết những gì có trong file này. Viết bằng Markdown thường, tiếng Anh hoặc tiếng Việt đều được.

**Nên có:**
- Thông tin recruiter hay hỏi: vị trí mong muốn, thời gian có thể bắt đầu (notice period),
  remote hay on-site, ngoại ngữ, múi giờ, có cần visa không (nếu ứng tuyển nước ngoài).
- Chi tiết từng project: bài toán là gì, bạn làm phần nào, quyết định kỹ thuật nào và vì sao,
  khó khăn gặp phải. Đây là phần engineer hay hỏi sâu.
- Đại từ bạn muốn AI dùng: thêm dòng `Pronouns: ...` trong mục Basics.
  Không có thì AI gọi bạn bằng tên hoặc dùng they/them.

**Không được có:**
- Thông tin không muốn công khai (lương cũ, địa chỉ nhà, chuyện cá nhân).
  Người ta có thể dụ AI đọc nguyên văn tài liệu ra.
- Số liệu bạn không chắc chắn. AI sẽ nhắc lại y nguyên như sự thật.

**Mẹo:** câu nào bạn muốn AI trả lời theo một cách cụ thể (ví dụ mức lương mong muốn) thì ghi
thẳng câu trả lời vào, như: `Salary expectations: happy to discuss; please email.`

Sửa file xong thì restart `npm run dev` hoặc deploy lại. File được đọc một lần khi server khởi động.

## 5. Chỉnh hành vi

| Muốn đổi | Sửa ở đâu |
|---|---|
| Quy tắc trả lời (giọng văn, độ dài, ngôn ngữ) | hằng `SYSTEM` trong `app/api/chat/route.ts` |
| Số câu hỏi tối đa mỗi IP mỗi giờ (mặc định 20) | `perVisitor` trong `app/api/chat/route.ts` |
| Độ dài câu hỏi / số lượt một cuộc chat | `MAX_QUESTION_CHARS`, `MAX_TURNS` (route) và `MAX_QUESTION`, `MAX_TURNS` (`app/components/Chat.tsx`). Hai bên phải khớp nhau. |
| Câu hỏi gợi ý | `SUGGESTIONS` trong `app/components/Chat.tsx` |
| Chữ trên nút, lời nhắc trong khung chat | `app/components/Chat.tsx` |
| Model | `MODEL` trong route. Haiku 5.5 là rẻ nhất. Sonnet/Opus thông minh hơn nhưng đắt hơn 20–40 lần. |

## 6. Kiểm tra trước khi gửi link cho nhà tuyển dụng

Hỏi thử ít nhất:
- Một câu **có** trong profile: phải trả lời đúng.
- Một câu **không có**, ví dụ "Bân có kinh nghiệm Kubernetes không?": phải nói không có thông tin
  và gợi ý email, **không được bịa**.
- Một câu tiếng Việt: phải trả lời bằng tiếng Việt.
- Một câu lạc đề, ví dụ "viết cho tôi đoạn code sort": phải từ chối nhẹ nhàng.

Nếu AI vẫn bịa ở câu nào, bổ sung thông tin đó vào profile, kể cả khi chỉ để ghi "không có".

## 7. Bảo mật: đã có sẵn những gì

Toàn bộ site chỉ có **một API duy nhất** là `POST /api/chat`. Không đăng nhập, không database,
không lưu gì phía server, AI không có tool nào để thao tác (chỉ trả lời bằng chữ).

| Rủi ro | Cách xử lý |
|---|---|
| Lộ API key | Key chỉ nằm trên server (biến môi trường), không bao giờ gửi xuống trình duyệt. `.env*` đã nằm trong `.gitignore`. |
| Prompt injection (dụ AI phá luật) | System prompt yêu cầu chỉ trả lời từ profile, từ chối việc lạc đề. AI không có tool hay dữ liệu bí mật nào, nên bị dụ thì cùng lắm nói linh tinh, không làm hại được gì. |
| Giả mạo lịch sử chat | Server ký HMAC lên từng câu trả lời; sửa bất kỳ câu nào trong lịch sử là bị từ chối (400). |
| XSS | Câu trả lời hiển thị dưới dạng chữ thuần, không bao giờ render HTML. Đã test với payload `<img onerror>`. |
| CSRF / site khác gọi API | Kiểm tra `Origin` và bắt buộc `Content-Type: application/json`. |
| Spam / đốt tiền | 20 request/giờ/IP, 300 request/giờ mỗi server, câu hỏi ≤ 500 ký tự, ≤ 12 lượt mỗi cuộc chat, body ≤ 64 KB, ngắt gọi AI khi người dùng đóng chat. **Chốt chặn thật sự là spend limit trong Console.** |
| Clickjacking | Header `frame-ancestors 'none'` và `X-Frame-Options: DENY`. |
| Dependency có lỗ hổng | Next.js đã nâng lên 16.4.6; `npm audit` báo 0 lỗ hổng. Thỉnh thoảng chạy lại `npm audit`. |
| IDOR, SQL injection, path traversal | Không áp dụng: không có ID, không có database, đường dẫn file là cố định. |

**Giới hạn còn lại:** bộ đếm lượt nằm trong RAM của từng server, người đổi IP liên tục vẫn né được.
Nếu bị spam thật thì bật thêm rate limit ở **Vercel → Firewall** (tuỳ gói), và spend limit luôn chặn được chi phí.

## 8. Theo dõi

- Chi phí và số request: https://console.anthropic.com, mục Usage / Cost.
- Lỗi phía server: Vercel → Project → Logs, lọc theo `[chat]`.

## Tài liệu tham khảo

- Claude API: https://platform.claude.com/docs
- Prompt caching (đã bật sẵn, giảm tiền cho phần profile lặp lại mỗi lần hỏi):
  https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- Next.js Route Handlers: `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
