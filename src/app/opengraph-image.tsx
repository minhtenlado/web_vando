import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const alt = "Phan Huỳnh Văn Đô — Embedded Systems & AIoT Engineer";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#080a0d",
          backgroundImage: "radial-gradient(circle at 25px 25px, #18221c 2%, transparent 0%), radial-gradient(circle at 75px 75px, #0f1612 2%, transparent 0%)",
          backgroundSize: "100px 100px",
          padding: "60px 80px",
          fontFamily: "sans-serif",
          color: "#ffffff",
        }}
      >
        {/* Top Tag & Status */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 20px",
              borderRadius: "50px",
              backgroundColor: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              color: "#34d399",
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#10b981" }} />
            Robotics & AIoT Engineering
          </div>

          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: "#9ca3af",
              letterSpacing: "0.5px",
            }}
          >
            phanhuynh.id.vn
          </div>
        </div>

        {/* Center Main Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
          <h1
            style={{
              fontSize: 64,
              fontWeight: 900,
              letterSpacing: "-2px",
              lineHeight: 1.1,
              color: "#f9fafb",
              margin: 0,
              textShadow: "0 10px 30px rgba(0,0,0,0.8)",
            }}
          >
            Phan Huỳnh Văn Đô
          </h1>
          <p
            style={{
              fontSize: 30,
              fontWeight: 500,
              color: "#a1a1aa",
              margin: 0,
              maxWidth: "900px",
              lineHeight: 1.35,
            }}
          >
            Embedded Systems & Edge AI Engineer · ROS 2 · STM32 · YOLO · IoT
          </p>
        </div>

        {/* Bottom Tech Badges */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", width: "100%" }}>
          {["ROS 2 & Gazebo", "Embedded STM32 / RTOS", "YOLO & Edge AI", "Robotics Kinematics", "IoT Cloud"].map((tech) => (
            <div
              key={tech}
              style={{
                padding: "8px 18px",
                borderRadius: "12px",
                backgroundColor: "#161d19",
                border: "1px solid #27372e",
                color: "#e4e4e7",
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {tech}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
