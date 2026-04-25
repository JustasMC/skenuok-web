import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #050508 0%, #12151f 100%)",
          borderRadius: 40,
          border: "2px solid rgba(0, 212, 255, 0.35)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "baseline",
            fontFamily: 'ui-sans-serif, system-ui, "Segoe UI", sans-serif',
          }}
        >
          <span style={{ fontSize: 44, fontWeight: 800, color: "#fafafa" }}>FS</span>
          <span style={{ fontSize: 44, fontWeight: 800, color: "#00d4ff", margin: "0 2px" }}>·</span>
          <span style={{ fontSize: 24, fontWeight: 700, color: "#a1a1aa", letterSpacing: "0.12em" }}>AI</span>
        </div>
      </div>
    ),
    { width: 180, height: 180 },
  );
}
