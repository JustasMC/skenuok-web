import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050508",
          borderRadius: 8,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: "#00d4ff",
            fontFamily: 'ui-sans-serif, system-ui, "Segoe UI", sans-serif',
          }}
        >
          FS
        </span>
      </div>
    ),
    { width: 32, height: 32 },
  );
}
