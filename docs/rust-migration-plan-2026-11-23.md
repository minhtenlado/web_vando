# Engineering Lab — Audit & kế hoạch chuyển đổi sang Rust

Ngày: 23/11/2026 · Trạng thái: **chờ phê duyệt** · Phạm vi tài liệu: Bước 1 (Audit) và Bước 2 (Architecture) của brief "Full Redesign & Rust Migration".
Chưa có thay đổi mã, dữ liệu hay hạ tầng nào được thực hiện cho dự án này.

---

## 0. Tóm tắt để quyết định

- **Hiện trạng ổn định:** Next.js 16.4.6 (App Router) trên Vercel, Postgres Neon qua Prisma, ảnh trên Cloudinary. Có 13 dự án, 3 bài viết và Admin 15 tab đang chạy. CLS = 0, TTFB khoảng 110–200 ms.
- **Kết luận trung thực:** Rust **không tự làm đẹp giao diện hay làm mượt animation**. Ba ưu tiên cao nhất của brief (Design > UX > Performance) chủ yếu đến từ CSS, Web Animations/GSAP, font và ảnh. Phần này chạy giống nhau dù frontend viết bằng React hay Rust.
- **Lợi ích thật của Rust ở dự án này:**
  1. Một ngôn ngữ, một kiểu dữ liệu chung cho cả server (Axum) và giao diện (Leptos server functions).
  2. SQLx kiểm tra câu truy vấn với schema thật ngay lúc biên dịch.
  3. Chế độ *islands* chỉ gửi WASM cho phần có tương tác, nên trang nội dung nhẹ.
  4. Server là một file chạy độc lập, ít phụ thuộc.
  5. Phù hợp với chuyên môn của chủ site (kỹ sư nhúng, Rust đang phát triển mạnh trong embedded). Bản thân website trở thành một sản phẩm Rust để trưng bày.
- **Chi phí thật:** viết lại toàn bộ phần công khai, thêm một nơi host Rust, hệ sinh thái mỏng hơn (rich-text editor, tối ưu ảnh, tạo ảnh OG), thời gian build dài hơn.
- **Khuyến nghị: Phương án B — chuyển đổi dần theo mô hình *strangler*.**
  - Viết lại phần công khai bằng **Leptos 0.8 (SSR + islands) + Axum 0.8 + SQLx**.
  - **Giữ Admin Next.js và các API admin** đang hoạt động, dùng chung database và cùng định dạng phiên đăng nhập.
  - Chuyển từng route qua `rewrites` của Next.js trên Vercel, nên domain, HTTPS và Admin giữ nguyên.
  - Rollback từng route bằng cách revert một commit.
  - Có **cổng Go/No-Go sau POC**: nếu số đo không tốt hơn hiện tại thì dừng, và vẫn giữ được thiết kế mới.

---

## 1. Audit hiện trạng

### 1.1 Kiến trúc

| Lớp | Hiện tại |
|---|---|
| Framework | Next.js 16.4.6 App Router, React 19, TypeScript, Turbopack |
| Hosting | Vercel (serverless, Fluid), domain `phanhuynh.id.vn`, chuyển hướng `www` → apex |
| Database | PostgreSQL trên Neon (pooler), Prisma 6.11; migration thêm cột publication controls chạy lúc build trên Vercel |
| Media | Cloudinary (`web_vando/images`), có lưu dấu Vercel Blob cho dữ liệu cũ |
| Giao diện | CSS token (sáng/tối), next-themes, framer-motion, Radix (Dialog, Sheet), lucide-react |
| Font | Be Vietnam Pro (500/600/700), Manrope, JetBrains Mono — tự host qua `next/font` |
| Ngôn ngữ | Vi/En qua cookie `cv-locale`; dự án tiếng Anh dùng dữ liệu tiếng Việt khi chưa có bản dịch |
| Bảo mật | CSP, HSTS, X-Frame-Options; DOMPurify (isomorphic, phía server) cho HTML từ CMS |
| Kiểm thử | 42 test `node --test` (sanitizer, API bài viết, video, signal art, runtime); ESLint |

### 1.2 Trang công khai

| Route | Nội dung | Dữ liệu |
|---|---|---|
| `/` | Hero, lĩnh vực, dự án tiêu biểu, thư viện dự án (tìm kiếm/lọc), repo GitHub, bài viết | `getSiteData` (Prisma) + `/api/github` |
| `/projects/[id]` | Datasheet dự án: tổng quan, tính năng, triển khai, gallery, video YouTube, kết quả, trước/sau, liên quan | `getProjectById` |
| `/notes` | Danh sách bài viết: tìm kiếm, lọc danh mục, sắp xếp | `getSiteData` |
| `/posts/[slug]` | Đọc bài: mục lục, đổi cỡ chữ, sao chép code, PDF nhúng, thích/lưu, bình luận + trả lời | `getPostBySlug`, `/api/posts/[slug]/stats`, `/api/posts/[slug]/comments` |
| `/privacy`, `/terms` | Trang pháp lý | tĩnh |
| `/sitemap.xml`, `/robots.txt`, `/opengraph-image` | SEO | Prisma, `@vercel/og` |

Có 52 component trong `src/components/cv/`, nhưng **nhiều component không còn được dùng**: AI chatbot, contact modal, command palette, tutorial reader, social share, Google Ad, scroll progress… Các component này **không cần chuyển đổi**.

### 1.3 API (28 route handler)

| Nhóm | Route | Bảo vệ |
|---|---|---|
| Công khai đọc | `GET /api/site-data`, `GET /api/github`, `GET /api` | — |
| Công khai ghi | `POST /api/posts/[slug]/stats` (view/like/bookmark), `GET/POST /api/posts/[slug]/comments`, `POST /api/contact` (Web3Forms + lưu DB, giới hạn tần suất), `POST /api/chat` (Gemini, đang tắt trên giao diện) | giới hạn tần suất tại chỗ |
| Admin xác thực | `login`, `logout`, `session`, `change-password` | khóa 5 phút khi đăng nhập sai nhiều lần |
| Admin nội dung | `projects`, `posts`, `experiences`, `profile`, `settings`, `comments`, `messages`, `activities` (CRUD) | `requireAuth` / `isAuthed` — đã kiểm tra, tất cả route admin đều có bảo vệ |
| Admin media | `upload-image`, `upload-avatar`, `upload-file` (Cloudinary), `extract-pdf` (pdf2json) | `requireAuth` |
| Debug | `GET /api/debug` | `requireAuth` |

### 1.4 Xác thực

- Mật khẩu: `scrypt` (Node mặc định N=16384, r=8, p=1, khóa 64 byte, salt ngẫu nhiên) lưu ở `Profile.passwordHash`; nếu chưa có thì dùng biến môi trường `ADMIN_PASSWORD`.
- Phiên: cookie `httpOnly` chứa `base64url(JSON{exp, v}).HMAC-SHA256(SESSION_SECRET)`, trong đó `v` là 10 ký tự đầu của hash (đổi mật khẩu sẽ hủy mọi phiên).
- **Định dạng này tái tạo được 1:1 bằng Rust** (crate `hmac`, `sha2`, `scrypt`, `base64`). Vì vậy Next.js Admin và Rust có thể dùng chung phiên, không ai phải đăng nhập lại và **không thay đổi thông tin đăng nhập**.

### 1.5 Database (Prisma schema — giữ nguyên)

`Profile` (gồm `settings` JSON, `passwordHash`), `Project` (13 dòng; các mảng lưu dạng chuỗi JSON; có `published/featured/status`), `Post` (3), `Experience`, `Comment`, `ContactMessage`, `ActivityLog`.
Rust sẽ đọc và ghi **đúng các bảng này** qua SQLx. Prisma tiếp tục là nơi duy nhất quản lý migration.

### 1.6 Admin (15 tab, khoảng 7.300 dòng TSX)

Tổng quan, Hồ sơ, Học vấn, Kinh nghiệm, Dự án, Bài viết (Quill + MDX editor, chế độ tutorial, xem trước), Bình luận, Hộp thư, Nhật ký hoạt động, Cấu hình trang chủ, Điều hướng, Tích hợp, Tài khoản, Cài đặt.
Admin phụ thuộc nặng vào hệ sinh thái JS: Quill, `@mdxeditor/editor`, dnd-kit, Radix, React Hook Form. **Rust/WASM chưa có trình soạn thảo rich-text thay thế ngang tầm.**

### 1.7 Số đo hiệu năng hiện tại (production, Chrome headless, cache tắt)

| Trang | Chế độ | TTFB | FCP | LCP | CLS | JS | Font | CSS | Ảnh | Tổng |
|---|---|---|---|---|---|---|---|---|---|---|
| `/` | Desktop | 158 ms | 1,56 s | 2,31 s | 0 | 255 KB | 183 KB | 42 KB | 55 KB | 567 KB |
| `/` | Mobile (CPU ×4, ~1,6 Mbps) | 199 ms | 0,94 s | 1,79 s | 0 | 253 KB | 183 KB | 43 KB | 34 KB | 545 KB |
| `/projects/…` | Desktop | 127 ms | 1,94 s | 3,78 s | 0 | 201 KB | 193 KB | 47 KB | 56 KB | 531 KB |
| `/projects/…` | Mobile | 107 ms | 2,15 s | 4,54 s | 0 | 201 KB | 192 KB | 47 KB | 33 KB | 509 KB |

(Kích thước là lượng truyền sau nén. Số đo headless chỉ mang tính tương đối; Lighthouse CI sẽ là chuẩn đo chính thức ở Bước 5.)

Nhận xét:

- **Font (~185 KB) nặng gần bằng JS.** Thu gọn subset và số weight là cách tăng tốc rẻ nhất, không phụ thuộc framework.
- **LCP trang dự án 3,8–4,5 s** do ảnh bìa lớn. Dùng biến đổi kích thước của Cloudinary (`f_auto,q_auto,w_…`) kèm `fetchpriority=high` sẽ cải thiện mạnh.
- JS khoảng 200–255 KB gồm React, framer-motion và Radix. Leptos islands có thể giảm phần này. Hướng dẫn chính thức của Leptos ghi nhận một ứng dụng mẫu giảm từ 274 KB xuống 24 KB WASM (chưa nén) khi bật islands. Đây là số đo trên bản cũ nên **phải đo lại trong POC**.

---

## 2. Đánh giá Leptos và Dioxus

Phiên bản ổn định trên crates.io ngày 23/11/2026: **Leptos 0.8.23**, leptos_axum 0.8.10, **Dioxus 0.7.10**, **Axum 0.8.9**, **SQLx 0.9.1**, Tokio 1.54.1, cargo-leptos 0.3.12.

| Tiêu chí | Leptos 0.8 | Dioxus 0.7 |
|---|---|---|
| Mô hình render | Fine-grained signals, không có virtual DOM | Virtual DOM (kiểu React) |
| SSR + hydration cho web | Hạng nhất: streaming SSR, out-of-order streaming, hydration | Có (fullstack), nhưng trọng tâm là ứng dụng đa nền tảng |
| Partial hydration (islands) | Có, kèm *islands router* — chỉ phần tương tác tải WASM | Không có tương đương ở cùng mức trưởng thành |
| Tích hợp Axum | `leptos_axum` chính thức; server functions | `dioxus-fullstack` dựa trên Axum |
| SEO / meta | `leptos_meta` (title, meta, link theo route) | Có hỗ trợ, ít ví dụ cho site nội dung |
| Thế mạnh | Website nội dung, SEO, tải trang tối thiểu | Desktop/mobile/web dùng chung một codebase |

**Chọn Leptos.** Đây là website nội dung cần SEO và cần tải ít JS, nên SSR + islands là đúng lợi thế của Leptos. Dioxus mạnh khi cần app desktop/mobile, điều dự án này không cần.

---

## 3. Phương án kiến trúc

| | A. Viết lại toàn bộ bằng Rust | **B. Strangler từng bước (khuyến nghị)** | C. Giữ Next.js, chỉ thiết kế lại |
|---|---|---|---|
| Phạm vi Rust | Công khai + API + Admin | Công khai + API công khai; Admin chuyển dần sau | Không |
| Admin | Viết lại; rich-text vẫn phải dùng JS interop (Quill/Tiptap) | Giữ Next.js, nâng giao diện theo design system mới | Giữ |
| Rủi ro | Cao — "big bang", dễ hỏng Admin | Thấp–trung bình — từng route, rollback được | Thấp |
| Thời gian ra giao diện mới | Muộn nhất | Từng trang một | Sớm nhất |
| Đáp ứng yêu cầu "frontend Rust" | Đầy đủ | Đầy đủ cho phần công khai; Admin theo lộ trình | Không |

### 3.1 Kiến trúc đích của phương án B

```
                   phanhuynh.id.vn (Vercel, giữ nguyên DNS/HTTPS)
                                │
                     Next.js (edge router + Admin)
            ┌───────────────────┼────────────────────────┐
     rewrites (từng route)    /admin, /api/admin/*     route chưa chuyển
            │                   (giữ nguyên)             (giữ nguyên)
            ▼
   lab-rs: Axum 0.8 + Leptos 0.8 SSR/islands  ──SQLx──▶ Neon Postgres (schema Prisma)
   (container hoặc Vercel Rust runtime)        ──HTTP──▶ Cloudinary, GitHub API (cache 1 giờ)
```

- **Workspace Rust** `lab-rs/`, nằm trong repo hiện tại:
  - `app/`: các component và route Leptos, dùng chung cho SSR và WASM.
  - `server/`: Axum, SQLx, auth, API.
  - `shared/`: model và kiểu dữ liệu dùng chung.
  - Build bằng `cargo-leptos`.
- **Định tuyến dần:** thêm `rewrites` trong `next.config.ts` cho từng route đã chuyển, ví dụ `/` → `https://lab-rs…/`. Rollback bằng cách xóa dòng rewrite hoặc dùng Instant Rollback của Vercel.
- **Hosting cho Rust** (quyết định sau POC):
  1. **Vercel Rust runtime** — đang ở giai đoạn *beta*, chạy trên Fluid compute, có template Axum. Ưu điểm: một nền tảng duy nhất.
  2. **Container trên Vercel** theo hướng dẫn Docker chính thức của Vercel.
  3. **Fly.io / Railway / VPS + Caddy** nếu cần server chạy lâu dài (ví dụ WebSocket thời gian thực).
- **Database:** SQLx 0.9 + Neon pooler, ban đầu chỉ đọc. Ghi (bình luận, lượt xem, liên hệ) chuyển sau khi có test tích hợp. **Không thay đổi schema** trong giai đoạn đầu.
- **Ảnh:** bỏ `next/image`, sinh `srcset` bằng biến đổi URL của Cloudinary (`f_auto,q_auto,c_limit,w_{320…1920}`), kèm `width/height` để giữ CLS = 0.
- **SEO:**
  - `leptos_meta` cho title, description, canonical, Open Graph và JSON-LD.
  - Sitemap và robots do Axum sinh ra.
  - Ảnh OG: dùng ảnh bìa dự án sẵn có trên Cloudinary, hoặc sinh bằng `resvg` (không dùng `@vercel/og`).
- **Bảo mật:**
  - Giữ CSP/HSTS qua `tower-http`.
  - Lọc HTML từ CMS bằng `ammonia` (Rust), tương đương DOMPurify; cần kiểm thử hồi quy với bộ case hiện có.
  - Giới hạn tần suất bằng `tower_governor`.

### 3.2 Những phần cần JavaScript interop

| Chức năng | Cách làm |
|---|---|
| Smooth scrolling | CSS `scroll-behavior` + Lenis (~4 KB) chỉ trên desktop; tự tắt khi `prefers-reduced-motion` |
| Scroll-triggered / parallax / text reveal | Ưu tiên CSS scroll-driven animations + Web Animations API (gọi từ Rust qua `web-sys`); GSAP ScrollTrigger chỉ dùng cho timeline phức tạp ở Hero/Hardware Lab, tải lười |
| Page transitions | View Transitions API (Chrome, Safari 18+; Firefox có fallback mờ dần), gọi khi router điều hướng |
| 3D | Three.js chỉ tải ở Hardware Lab và chỉ khi khung nhìn tới (dynamic import). Signal field WebGL hiện có giữ dạng module JS độc lập |
| YouTube | Giữ iframe API (JS), chỉ tải khi người dùng bấm phát |
| Admin editor | Quill/MDX (JS) — Admin vẫn là Next.js trong phương án B |
| Magnetic buttons, cursor spotlight, hover, lightbox, sao chép code, tìm kiếm/lọc | Viết bằng Rust (islands) + CSS transform/opacity |

---

## 4. Thiết kế (Bước 3)

### 4.1 Định hướng

"Premium Dark Engineering Lab" với bảng màu theo brief:

| Vai trò | Màu |
|---|---|
| Nền | `#080A0F` |
| Bề mặt | `#11151D` |
| Chữ chính | `#FFFFFF` |
| Chữ phụ | `#8B9BB4` |
| Nhấn chính | `#00D4FF` |
| Nhấn phụ | `#5865F2` |

- Gradient có kiểm soát: chỉ dùng cho ánh sáng nền Hero, viền thẻ khi hover và một chữ nhấn.
- Glassmorphism chỉ dùng cho thanh điều hướng và lớp phủ, không áp cho mọi thẻ.
- Kiểm tra tương phản WCAG AA cho mọi cặp màu chữ/nền.

### 4.2 Thành phần của design system

- Token màu, khoảng cách (thang 4/8), bo góc, đổ bóng, z-index.
- Thang chữ responsive dùng `clamp()`. Font hiển thị và nội dung đều hỗ trợ tiếng Việt, subset theo ký tự thực dùng, tối đa 2 họ font, mục tiêu tổng ≤ 100 KB.
- Component: buttons (primary/secondary/ghost/magnetic), cards (dự án, bài viết, phần cứng, chỉ số), navigation (desktop/mobile sheet), chips, badge trạng thái, tabs, breadcrumb, skeleton, lightbox, toast.
- Hệ chuyển động: thời lượng 120/240/480/800 ms, 3 đường cong easing, quy tắc *chỉ dùng transform/opacity*, ngân sách mỗi trang, bản thay thế khi giảm chuyển động.
- Trang `/styleguide` nội bộ để duyệt mọi component trước khi ghép trang.

### 4.3 Cấu trúc website mới

| Trang | Nội dung |
|---|---|
| **Home** | Hero (WebGL signal / Three.js nhẹ), Giới thiệu Lab, Dự án tiêu biểu, Technology Stack (tổng hợp từ `tech` của các dự án), Bài viết mới, Liên hệ (form gửi tới `/api/contact` có sẵn và đổ vào hộp thư Admin) |
| **/projects** | Thư viện theo 6 nhóm (Embedded Systems, PCB Design, IoT, Edge AI, Robotics, AI), kèm tìm kiếm, lọc, trạng thái và liên kết GitHub |
| **/projects/[id]** | Overview, System Architecture, Hardware Design, PCB Gallery, Software Architecture, Technical Specifications, Development Process, GitHub (xem 4.4) |
| **/notes**, **/posts/[slug]** | Blog theo chuyên mục (Embedded Linux, STM32, PCB, Electronics, IoT, Edge AI, Robotics) |
| **/hardware-lab** (mới) | Trưng bày PCB và sản phẩm từ các dự án thuộc nhóm Hardware/PCB, dùng ảnh thật trong CMS |
| **/admin** | Giữ chức năng; nâng giao diện; thêm *Thống kê* (lượt xem, thích, bình luận, tin nhắn — dữ liệu đã có) và *Thư viện ảnh* (liệt kê ảnh Cloudinary trong thư mục dự án) |

### 4.4 Khoảng trống dữ liệu

Trang chi tiết dự án yêu cầu các mục như System Architecture, Hardware Design, Software Architecture, Technical Specifications, Development Process. **Schema hiện tại chưa có trường cho các mục này.**

- **Giai đoạn đầu (không đổi schema):**
  - Tách các mục từ các thẻ heading trong `description` (ví dụ "Kiến trúc", "Thông số").
  - Dùng sẵn `features`, `responsibilities`, `results`, `images`, `tech`.
  - **Mục nào không có dữ liệu thật thì ẩn đi — không tự sinh nội dung giả.**
- **Đề xuất migration (cần phê duyệt riêng):**
  - Thêm cột `sections TEXT NOT NULL DEFAULT '[]'` vào `Project`. Đây là thay đổi *bổ sung*, không động tới dữ liệu cũ.
  - Admin có trình soạn từng mục.
  - Rollback bằng `ALTER TABLE "Project" DROP COLUMN "sections"`. Sao lưu Neon (branch) trước khi chạy.

---

## 5. Lộ trình triển khai (Bước 4–6)

| Giai đoạn | Nội dung | Kết quả kiểm chứng | Rollback |
|---|---|---|---|
| **P0 · POC (cổng Go/No-Go)** | Workspace `lab-rs`; Axum + Leptos SSR trang `/lab-preview` đọc 13 dự án qua SQLx; triển khai thử lên host đã chọn; rewrite riêng `/lab-preview` | WASM islands ≤ 150 KB (brotli); TTFB ≤ 300 ms; LCP mobile < 2,5 s; build CI < 10 phút | Xóa rewrite, không ảnh hưởng site |
| **P1 · Design system** | Token, font, component, hệ chuyển động, `/styleguide` | Duyệt giao diện; axe a11y không lỗi nghiêm trọng | Không ảnh hưởng production |
| **P2 · Trang công khai** | Lần lượt: Home → Projects → Project detail → Hardware Lab → Notes → Post (đọc) → pháp lý → sitemap/robots/OG | Mỗi trang: so sánh nội dung với bản Next (snapshot), E2E Playwright, Lighthouse ≥ 90/95/95/95 | Revert rewrite của trang đó |
| **P3 · API công khai** | `site-data`, `github`, `comments`, `stats`, `contact` sang Axum; Admin vẫn gọi API Next | Test hợp đồng API (cùng JSON), test ghi trên Neon branch | Định tuyến API về Next |
| **P4 · Admin** | Áp design system mới cho Admin Next; thêm Thống kê và Thư viện ảnh; (tùy chọn, sau này) chuyển Admin sang Leptos khi có editor phù hợp | Toàn bộ thao tác CRUD/upload/đăng nhập qua E2E | Revert commit Admin |
| **P5 · Kiểm thử & cắt chuyển** | E2E trên Chrome và Firefox, responsive (360–1920), Lighthouse CI, rà soát bảo mật, HTTPS/domain, giám sát log | Không lỗi nghiêm trọng sau 72 giờ | Vercel Instant Rollback |

Mỗi giai đoạn là một nhánh và một PR riêng, kèm commit có thể revert. Không xóa API hay dữ liệu đang dùng.

---

## 6. Rủi ro và cách giảm thiểu

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Rust runtime trên Vercel còn beta | Trung bình | POC trên cả runtime và container; có phương án Fly.io/VPS |
| Neon pooler + SQLx prepared statements | Thấp–TB | Kiểm tra trong POC; dùng kết nối trực tiếp hoặc tắt statement cache nếu cần |
| Khác biệt khi lọc HTML (DOMPurify → ammonia) | Trung bình | Chạy lại bộ test sanitizer hiện có trên cả hai; so sánh HTML đầu ra của 3 bài viết thật |
| Thêm độ trễ do rewrite qua Vercel → host Rust | Thấp | Cache `s-maxage` cho trang công khai; đặt host Rust cùng vùng `ap-southeast-1` với Neon |
| Animation gây giật hoặc khó dùng | Trung bình | Ngân sách chuyển động, chỉ dùng transform/opacity, đo INP; tôn trọng `prefers-reduced-motion`; smooth scroll chỉ ở desktop |
| Kích thước WASM tăng theo số island | Trung bình | `opt-level='z'`, LTO, `wasm-opt`, nén brotli; theo dõi ngân sách trong CI |
| Phiên Admin không tương thích | Thấp | Tái tạo đúng HMAC + scrypt; test chéo phiên Next ↔ Rust |
| Mất thời gian viết lại | Cao | Cổng Go/No-Go sau P0; giao diện mới có thể chạy trên Next (phương án C) nếu dừng |

---

## 7. Các quyết định cần chủ dự án duyệt

1. **Phương án kiến trúc:** B (khuyến nghị), A hoặc C.
2. **Hosting cho Rust trong POC:** Vercel Rust runtime (beta), Vercel container, hay Fly.io/VPS.
3. **Giao diện:** chỉ tối (theo brief) hay tối mặc định và giữ tùy chọn sáng như hiện nay.
4. **Migration bổ sung cột `sections`** cho các mục kỹ thuật của dự án (mục 4.4).
5. **Admin:** chỉ nâng giao diện trên Next (khuyến nghị cho giai đoạn này) hay đưa việc chuyển Admin sang Leptos vào lộ trình.

## Nguồn tham khảo

- Vercel Rust runtime: https://vercel.com/docs/functions/runtimes/rust và changelog public beta: https://vercel.com/changelog/rust-runtime-now-in-public-beta-for-vercel-functions
- Deploy Rust trên Vercel bằng Docker: https://vercel.com/kb/guide/deploy-rust-on-vercel-with-docker
- Leptos islands: https://book.leptos.dev/islands.html · Tối ưu kích thước WASM: https://book.leptos.dev/deployment/binary_size.html · Leptos 0.8.0 release: https://github.com/leptos-rs/leptos/releases/tag/v0.8.0
- Phiên bản crate: crates.io API (truy vấn ngày 23/11/2026)
