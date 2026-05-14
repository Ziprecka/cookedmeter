import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          color: "#fff9ed",
          background:
            "radial-gradient(circle at 50% 15%, rgba(255,91,26,.42), transparent 360px), linear-gradient(180deg,#190905,#050404)",
          fontFamily: "Arial",
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 900, color: "#ff7a18" }}>
          CookedMeter
        </div>
        <div style={{ marginTop: 38, fontSize: 118, fontWeight: 900, lineHeight: 0.9 }}>
          Am I cooked?
        </div>
        <div style={{ marginTop: 34, fontSize: 34, color: "rgba(255,249,237,.72)" }}>
          Drop in your situation. Get the verdict.
        </div>
      </div>
    ),
    size,
  );
}
