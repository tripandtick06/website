import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "1.0.0",
    uptime: typeof process.uptime === "function" ? process.uptime() : 0,
    env: process.env.NODE_ENV ?? "development",
  });
}
