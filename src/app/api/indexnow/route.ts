// POST /api/indexnow — on-demand IndexNow ping.
// Yeni icerik (seo-agent blog yayini) rebuild beklemeden Bing/Yandex'e aninda haber.
// Auth: Authorization: Bearer <CRON_SECRET>.
// Body (opsiyonel): { "urls": ["/blog/yeni-yazi", ...] } — bos ise TUM public yuzey.

import { NextResponse } from "next/server";
import { allPublicPaths, toAbsolute } from "@/lib/public-paths";
import { SITE_URL } from "@/lib/schema";

export const runtime = "edge";

export async function POST(req: Request): Promise<NextResponse> {
  const key = process.env.INDEXNOW_KEY;
  const auth = req.headers.get("authorization") ?? "";
  const secrets = [process.env.DEPLOY_SECRET, process.env.CRON_SECRET].filter(
    (s): s is string => Boolean(s)
  );
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!secrets.length || !token || !secrets.includes(token)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!key) {
    return NextResponse.json({ error: "INDEXNOW_KEY not configured" }, { status: 503 });
  }

  let requested: string[] = [];
  try {
    const body = (await req.json()) as { urls?: unknown };
    if (Array.isArray(body?.urls)) {
      requested = body.urls.filter((u): u is string => typeof u === "string");
    }
  } catch {
    // body opsiyonel — yoksa tum yuzey ping'lenir
  }

  const paths = requested.length ? requested : allPublicPaths();
  const urls = paths.map((p) => toAbsolute(p, SITE_URL));
  const host = SITE_URL.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

  try {
    const res = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key,
        keyLocation: `${SITE_URL}/${key}.txt`,
        urlList: urls,
      }),
    });
    return NextResponse.json({ submitted: urls.length, indexnowStatus: res.status });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
