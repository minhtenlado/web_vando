'use client';

import Link from 'next/link';

export default function ContentErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="lab-container lab-route-error" id="main-content">
    <h1>Nội dung tạm thời chưa tải được</h1><p>Hãy thử lại sau. Lỗi kết nối không có nghĩa là bài viết hoặc dự án đã bị xóa.</p>
    <div><button type="button" className="lab-button" onClick={reset}>Thử lại</button><Link href="/">Về trang chủ</Link></div>
  </main>;
}
