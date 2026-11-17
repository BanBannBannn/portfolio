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
| Giới hạn lượt, model, ngân sách, số câu, độ dài | biến môi trường hoặc trang `/admin` (mục 8.3) |
| Độ dài câu trả lời | `CHAT_MAX_OUTPUT_TOKENS` (mục 8.3), và câu "Keep answers under about 120 words" trong `SYSTEM` |
| Email, số điện thoại, LinkedIn trên thẻ liên hệ | `EMAIL`, `PHONE`, `LINKEDIN` trong `app/components/Chat.tsx` |
| Câu hỏi gợi ý | `SUGGESTIONS` trong `app/components/Chat.tsx` |
| Chữ trên nút, lời nhắc trong khung chat | `app/components/Chat.tsx` |

## 6. Kiểm tra trước khi gửi link cho nhà tuyển dụng

Hỏi thử ít nhất:
- Một câu **có** trong profile: phải trả lời đúng.
- Một câu **không có**, ví dụ "Bân có kinh nghiệm Kubernetes không?": phải nói không có thông tin
  và gợi ý email, **không được bịa**.
- Một câu tiếng Việt: phải trả lời bằng tiếng Việt.
- Một câu lạc đề, ví dụ "viết cho tôi đoạn code sort": phải từ chối nhẹ nhàng.

Nếu AI vẫn bịa ở câu nào, bổ sung thông tin đó vào profile, kể cả khi chỉ để ghi "không có".

## 7. Bảo mật: đã có sẵn những gì

Site có một API công khai là `/api/chat` (`POST` để hỏi, `GET` để lấy cấu hình hiển thị), `POST /api/chat/send` (gửi tin nhắn khách đã xác nhận, xem `docs/contact-tool-report.md`), cùng trang `/admin` có mật khẩu.
Khách không cần đăng nhập. Server chỉ lưu số liệu và cấu hình (mục 8), câu hỏi chỉ được lưu khi bạn bật `CHAT_LOG_CONTENT`.
AI chỉ có một tool: **soạn** tin nhắn gửi Bân. Tool này không gửi được gì; khách phải tự bấm Send (chi tiết và 16 mối đe doạ đã xử lý: `docs/contact-tool-report.md`).

| Rủi ro | Cách xử lý |
|---|---|
| Lộ API key | Key chỉ nằm trên server (biến môi trường), không bao giờ gửi xuống trình duyệt. `.env*` đã nằm trong `.gitignore`. |
| Prompt injection (dụ AI phá luật) | System prompt yêu cầu chỉ trả lời từ profile, từ chối việc lạc đề. AI không có tool hay dữ liệu bí mật nào, nên bị dụ thì cùng lắm nói linh tinh, không làm hại được gì. |
| Giả mạo lịch sử chat | Server ký HMAC lên từng câu trả lời; sửa bất kỳ câu nào trong lịch sử là bị từ chối (400). |
| XSS | Câu trả lời hiển thị dưới dạng chữ thuần, không bao giờ render HTML. Đã test với payload `<img onerror>`. |
| CSRF / site khác gọi API | Kiểm tra `Origin` và bắt buộc `Content-Type: application/json`. |
| Spam / đốt tiền | Giới hạn nhiều lớp (bảng dưới), câu hỏi ≤ 300 ký tự, ≤ 6 câu mỗi cuộc chat, câu trả lời ≤ 1024 token, body ≤ 120 KB, ngắt gọi AI khi người dùng đóng chat. **Chốt chặn thật sự là spend limit trong Console.** |
| Clickjacking | Header `frame-ancestors 'none'` và `X-Frame-Options: DENY`. |
| Dependency có lỗ hổng | Next.js đã nâng lên 16.4.6; `npm audit` báo 0 lỗ hổng. Thỉnh thoảng chạy lại `npm audit`. |
| IDOR, SQL injection, path traversal | Không áp dụng: không có ID, không có database, đường dẫn file là cố định. |

### Giới hạn lượt hỏi (mặc định, chỉnh được ở mục 8.3)

Mỗi trình duyệt được nhận một cookie `chat_device` có chữ ký HMAC (HttpOnly, SameSite=Strict, chỉ gửi kèm `/api/chat`).
Sửa cookie thì chữ ký sai, server coi như thiết bị mới. Ai xoá cookie liên tục thì vẫn bị giới hạn theo IP.

| Theo | Ngắn hạn ("đợi chút") | Mỗi giờ | Mỗi ngày |
|---|---|---|---|
| Thiết bị (cookie) | 1 câu / 2 giây | 15 | 30 |
| IP | 3 câu / 10 giây | 30 | 60 |
| Cả server (mỗi instance) | | 300 | 1500 |

- Giới hạn IP rộng hơn vì cả văn phòng, hoặc nhiều người dùng chung nhà mạng di động, có thể ra Internet bằng cùng một IP.
- Request bị từ chối **không** bị tính lượt, nên người hỏi bình thường không mất lượt oan.
- Request sai định dạng vẫn bị tính lượt, để script spam không né được giới hạn.
- Vượt giới hạn ngắn hạn: khung chat báo "đợi chút" và giữ nguyên câu đã gõ.
  Vượt giới hạn giờ/ngày, hoặc hỏi đủ 6 câu: khung chat thay ô nhập bằng thẻ liên hệ (Email / Gọi / LinkedIn).

**Giới hạn còn lại:** bộ đếm lượt nằm trong RAM của từng server, người đổi IP liên tục vẫn né được.
Nếu bị spam thật thì bật thêm rate limit ở **Vercel → Firewall** (tuỳ gói), và spend limit luôn chặn được chi phí.

## 8. Theo dõi: log, token, chi phí, tốc độ

Mỗi request vào `/api/chat` sinh ra đúng **một trace**: kết quả (answered / refused / error / aborted /
rate_limited / rejected / paused), số token (input, cache read, cache write, output — output đã gồm cả
phần "thinking"), chi phí ước tính, thời gian tới chữ đầu tiên (TTFT), tổng thời gian, `stop_reason`,
request id của Anthropic, câu hỏi thứ mấy trong cuộc chat, IP và thiết bị (đã băm, không đọc ngược được).

Trace đi ba nơi, tuỳ bạn cấu hình tới đâu:

| Nơi xem | Cần cấu hình gì | Xem được gì |
|---|---|---|
| **Log của Vercel** (hoặc terminal khi chạy local) | Không cần gì | Mỗi trace là một dòng JSON `{"evt":"chat_trace",...}`. Vercel → Project → **Logs**, gõ `chat_trace` vào ô tìm. Gói Hobby chỉ giữ log 1 giờ. |
| **Trang `/admin`** | `ADMIN_PASSWORD` | Chi tiêu hôm nay / tháng này so với ngân sách, TTFT p50/p95, token trung bình, tỉ lệ cache hit, bảng 14 ngày, danh sách request gần nhất (lọc theo kết quả), và form chỉnh cấu hình. |
| **Upstash Redis** (free) | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Giúp trang admin có số liệu **chung cho mọi server** và **không mất khi deploy lại**: tổng theo ngày (giữ 400 ngày), 500 trace gần nhất, cấu hình chỉnh từ admin. |

Không có Upstash thì `/admin` vẫn chạy, nhưng số liệu chỉ của server đang trả lời trang và mất khi deploy.
Lúc đó cũng không lưu được cấu hình: muốn đổi thì sửa biến môi trường rồi redeploy.

**Chi phí trên admin là số ước tính** từ số token × bảng giá (`PRICES` trong `lib/chat/telemetry.ts`).
Số chính xác nằm trong Anthropic Console → Usage / Cost. Request bị lỗi giữa chừng hoặc bị khách đóng ngang
thì không có số token, nên không được tính vào ước tính.

### 8.1. Bật trang admin

1. Tạo mật khẩu dài (≥ 12 ký tự; admin sẽ cảnh báo nếu ngắn hơn), ví dụ chạy `openssl rand -base64 24`.
2. Thêm `ADMIN_PASSWORD` vào `.env.local` (local) và Vercel → Environment Variables (Production), rồi Redeploy.
3. Mở `https://<domain>/admin`, đăng nhập. Phiên đăng nhập giữ 7 ngày. Đổi mật khẩu thì mọi phiên cũ mất hiệu lực.

Không đặt `ADMIN_PASSWORD` thì `/admin` trả 404, như thể không tồn tại.
Trang có `noindex`, không bị service worker cache, sai mật khẩu 5 lần trong 15 phút thì IP đó bị khoá tạm.

### 8.2. Bật Upstash Redis (miễn phí)

Cách nhanh nhất qua Vercel:

1. Vercel → Project → **Storage** → **Create Database** → chọn **Upstash for Redis** (Marketplace) → gói **Free**.
2. Chọn region gần server Vercel nhất (mặc định Vercel chạy ở `iad1` / Washington, D.C.), connect vào project.
   Vercel tự thêm `KV_REST_API_URL` và `KV_REST_API_TOKEN`. Code đọc được cả hai tên này.
3. Redeploy. Vào `/admin`, dòng đầu phải ghi "Shared store connected".

Hoặc tạo trực tiếp ở https://console.upstash.com → Redis → Create Database → copy **REST URL** và
**REST Token** vào `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`.

Gói free (500.000 lệnh/tháng) dư sức: mỗi câu trả lời tốn khoảng 15–20 lệnh. Request bị chặn vì spam được
gộp lại, ghi tối đa mỗi 30 giây một lần, nên bị spam cũng không đốt hết quota Redis.

### 8.3. Cấu hình: biến môi trường và trang admin

Thứ tự ưu tiên: **giá trị lưu trong admin → biến môi trường → mặc định trong code**.
Biến nào điền sai (ví dụ chữ thay vì số) sẽ bị bỏ qua, và log có dòng `[chat-config] ignoring invalid ...`.
Số ngoài khoảng cho phép thì bị kéo về giới hạn gần nhất. Danh sách đầy đủ và giá trị mặc định nằm trong `.env.example`.

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `CHAT_ENABLED` | `true` | `false`: chat thôi trả lời, chỉ hiện thẻ liên hệ, không gọi API. Công tắc khẩn cấp. |
| `CHAT_MODEL` | `claude-haiku-5-5` | Hoặc `claude-sonnet-5-5`, `claude-opus-5-5` (đắt hơn ~20–40 lần). |
| `CHAT_EFFORT` | `low` | `low` / `medium` / `high`: model nghĩ kỹ tới đâu. Phần nghĩ cũng tính tiền như output. |
| `CHAT_LOG_CONTENT` | `false` | `true`: lưu câu hỏi + câu trả lời vào trace (chỉ trong Redis/admin, không in ra log). Khung chat tự thêm câu báo cho khách biết. |
| `CHAT_MAX_QUESTIONS` | `6` | Số câu mỗi cuộc chat. |
| `CHAT_MAX_QUESTION_CHARS` | `300` | Độ dài tối đa một câu hỏi. |
| `CHAT_MAX_OUTPUT_TOKENS` | `1024` | Trần token cho mỗi câu trả lời. |
| `CHAT_DEVICE_PER_HOUR` / `_PER_DAY` | `15` / `30` | Giới hạn theo thiết bị. |
| `CHAT_IP_PER_HOUR` / `_PER_DAY` | `30` / `60` | Giới hạn theo IP. |
| `CHAT_GLOBAL_PER_HOUR` / `_PER_DAY` | `300` / `1500` | Giới hạn toàn site (tính trên mỗi server instance). |
| `CHAT_CONTACT_TOOL` | `true` | Cho AI soạn tin nhắn gửi Bân (cần `RESEND_API_KEY`, `CONTACT_TO_EMAIL`). |
| `CHAT_MAIL_PER_DAY` | `20` | Số tin nhắn tối đa mỗi ngày toàn site (thêm 2/thiết bị, 3/IP). |
| `CHAT_DAILY_BUDGET_USD` | `0.5` | Chi phí ước tính trong ngày (UTC) chạm mức này thì chat tạm nghỉ tới 0h UTC (7h sáng giờ VN). `0` = không giới hạn. |
| `CHAT_MONTHLY_BUDGET_USD` | `5` | Tương tự, theo tháng. |
| `ADMIN_PASSWORD` | (trống) | Bật trang `/admin`. |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | (trống) | Kho lưu chung, xem 8.2. |

Đổi ở admin thì có hiệu lực ngay trên server đó, các server khác cập nhật trong vòng 15 giây.
Nút "Clear all overrides" xoá mọi giá trị đã lưu ở admin, quay về env + mặc định.

**Với $6 credit:** Haiku 5.5, mỗi câu trả lời tốn khoảng $0.00005–0.0003 (trang admin hiện số thật).
Mức mặc định $0.50/ngày, $5/tháng nghĩa là kể cả bị spam liên tục cũng không quá $5 một tháng.
Nhớ đặt thêm spend limit trong Anthropic Console (mục 1): đó mới là chốt chặn chính xác tuyệt đối.

## Tài liệu tham khảo

- Claude API: https://platform.claude.com/docs
- Prompt caching (đã bật sẵn, giảm tiền cho phần profile lặp lại mỗi lần hỏi):
  https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- Next.js Route Handlers: `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
