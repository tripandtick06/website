import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") ?? "Trip and Tick").slice(0, 110);
  const subtitle = (searchParams.get("subtitle") ?? "Kapadokya Balon Turu — Aracisiz Operator Fiyatlari").slice(0, 160);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px",
          background:
            "linear-gradient(135deg, #F59E0B 0%, #EA580C 50%, #DC2626 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 40,
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: -0.5,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
            }}
          >
            🎈
          </div>
          <div style={{ display: "flex" }}>Trip and Tick</div>
        </div>

        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -2,
            marginBottom: 24,
            maxWidth: "90%",
            display: "flex",
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 32,
            opacity: 0.92,
            lineHeight: 1.3,
            maxWidth: "90%",
            display: "flex",
          }}
        >
          {subtitle}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 80,
            fontSize: 24,
            opacity: 0.85,
            display: "flex",
            fontWeight: 600,
          }}
        >
          tripandtick.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
