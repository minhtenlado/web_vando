import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Engineering Lab — Embedded Systems, Edge AI, and Robotics";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div style={{
      height: "100%", width: "100%", display: "flex", flexDirection: "column",
      justifyContent: "space-between", padding: "54px 64px", background: "#0b111a",
      color: "#f1f5f9", fontFamily: "sans-serif",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 22 }}>
        <span style={{ fontWeight: 700, letterSpacing: 2 }}>ENGINEERING LAB</span>
        <span style={{ color: "#66d9e8", fontSize: 14, letterSpacing: 2 }}>EMBEDDED SYSTEMS / EDGE AI / ROBOTICS</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <span style={{ color: "#66d9e8", fontSize: 18, letterSpacing: 3 }}>PROJECT & PRODUCT SHOWCASE</span>
          <span style={{ fontSize: 70, fontWeight: 700, letterSpacing: -3, lineHeight: 1.05 }}>Engineering projects.</span>
          <span style={{ fontSize: 70, fontWeight: 700, letterSpacing: -3, lineHeight: 1.05 }}>Built systems.</span>
        </div>
        <div style={{ width: 180, height: 180, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 22, border: "1px solid #293b4f", background: "#172433", color: "#66d9e8", fontSize: 82, fontWeight: 700 }}>EL</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #293b4f", paddingTop: 22, fontSize: 17 }}>
        <span style={{ color: "#a8b5c6" }}>Hardware. Firmware. Intelligence.</span>
        <span>phanhuynh.id.vn</span>
      </div>
    </div>,
    size,
  );
}
