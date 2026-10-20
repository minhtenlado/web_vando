import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'Engineering Lab — projects and technical articles';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '60px 68px', background: '#111418', color: '#edeff1', fontFamily: 'sans-serif' }}>
      <div style={{ fontSize: 26, fontWeight: 600 }}>Engineering Lab</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ fontSize: 60, fontWeight: 600, lineHeight: 1.2 }}>Projects and technical notes</div>
        <div style={{ fontSize: 24, color: '#a5abb2', lineHeight: 1.6 }}>Embedded systems, hardware, AI, IoT, and robotics.</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #343a40', paddingTop: 24, color: '#a5abb2', fontSize: 19 }}><span>Project documentation and articles</span><span>phanhuynh.id.vn</span></div>
    </div>, size,
  );
}
