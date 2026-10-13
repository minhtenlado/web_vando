import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Phan Huỳnh Văn Đô — Embedded Systems, IoT & Edge AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "54px 64px",
        background: "#f7f8f2",
        color: "#183f36",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 24,
        }}
      >
        <span style={{ fontWeight: 700 }}>phanhuynh.</span>
        <span style={{ fontSize: 15, letterSpacing: 2 }}>
          EMBEDDED SYSTEMS / IoT / EDGE AI
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <span style={{ fontSize: 22 }}>Phan Huỳnh Văn Đô</span>
          <span
            style={{
              fontSize: 76,
              fontWeight: 700,
              letterSpacing: -4,
              lineHeight: 1.08,
            }}
          >
            Where hardware
          </span>
          <span
            style={{
              fontSize: 76,
              fontWeight: 700,
              letterSpacing: -4,
              lineHeight: 1.08,
            }}
          >
            meets intelligence.
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 180,
            height: 180,
            borderRadius: 90,
            background: "#d4ee95",
            fontSize: 135,
          }}
        >
          ✳
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid #dce2d6",
          paddingTop: 22,
          fontSize: 18,
        }}
      >
        <span>Curiosity. Systems thinking. Hands-on building.</span>
        <span>phanhuynh.id.vn</span>
      </div>
    </div>,
    size,
  );
}
