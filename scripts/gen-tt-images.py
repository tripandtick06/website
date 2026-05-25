"""Generate AI images for TripAndTick.com (Kapadokya OTA) via Google Imagen 4
or Gemini 2.5 Flash Image.

Adapted from aanloop/scripts/gen-ai-image.py.

Outputs:
  public/images/og/og-default.jpg       (1200x630)
  public/images/balloons/<slug>.jpg     (1200x800)
  public/images/hotels/<slug>.jpg       (1200x800)
  public/images/tours/<slug>.jpg        (1200x800)
  public/images/activities/<slug>.jpg   (1200x800)
  public/images/packages/<slug>.jpg     (1200x800)
  public/images/blog/<slug>.jpg         (1200x630)
  public/images/hero/homepage.jpg       (1920x1080)

Usage:
  python scripts/gen-tt-images.py --all
  python scripts/gen-tt-images.py --wave 1            # Q1 essentials: og + hero + balloons
  python scripts/gen-tt-images.py --category balloons # one category
  python scripts/gen-tt-images.py --scene og-default  # single scene
  python scripts/gen-tt-images.py --model gemini      # cheaper

Setup:
  pip install google-genai pillow
  # Either:
  echo "GEMINI_API_KEY=..." > .env.local
  # Or:
  export GEMINI_API_KEY=...
"""
from __future__ import annotations

import argparse
import base64
import io
import json
import os
import sys
import time
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
IMG_ROOT = REPO / "public" / "images"

CATEGORIES = ("og", "hero", "balloons", "hotels", "tours", "activities", "packages", "blog")
for cat in CATEGORIES:
    (IMG_ROOT / cat).mkdir(parents=True, exist_ok=True)

PROJECT = os.environ.get("GOOGLE_CLOUD_PROJECT", "")
LOCATION = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")
BACKEND = os.environ.get("GENAI_BACKEND", "apikey").lower()

MODEL_IMAGEN = "imagen-4.0-generate-001"
MODEL_GEMINI = "gemini-2.5-flash-image"


def _load_api_key() -> str:
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if key:
        return key
    env = REPO / ".env.local"
    if env.exists():
        for line in env.read_text(encoding="utf-8").splitlines():
            if line.strip().startswith("GEMINI_API_KEY="):
                return line.split("=", 1)[1].strip()
    aanloop_env = REPO.parent.parent / "aanloop" / ".env.local"
    if aanloop_env.exists():
        for line in aanloop_env.read_text(encoding="utf-8").splitlines():
            if line.strip().startswith("GEMINI_API_KEY="):
                return line.split("=", 1)[1].strip()
    print("ERROR: GEMINI_API_KEY not found (env, .env.local, or ../aanloop/.env.local).", file=sys.stderr)
    sys.exit(1)


def _get_client():
    try:
        from google import genai
        from google.genai import types as gtypes
    except ImportError:
        print("ERROR: google-genai not installed. Run: pip install google-genai pillow", file=sys.stderr)
        sys.exit(1)
    if BACKEND == "vertex":
        client = genai.Client(vertexai=True, project=PROJECT, location=LOCATION)
    else:
        client = genai.Client(api_key=_load_api_key())
    return client, gtypes


def _save_jpg(png_bytes: bytes, out_path: Path, quality: int = 88) -> None:
    try:
        from PIL import Image
    except ImportError:
        png_path = out_path.with_suffix(".png")
        png_path.write_bytes(png_bytes)
        print(f"  saved (raw png, pillow missing): {png_path.name}", file=sys.stderr)
        return
    img = Image.open(io.BytesIO(png_bytes))
    if img.mode in ("RGBA", "LA", "P"):
        bg = Image.new("RGB", img.size, (255, 255, 255))
        bg.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
        img = bg
    elif img.mode != "RGB":
        img = img.convert("RGB")
    img.save(out_path, "JPEG", quality=quality, optimize=True)
    print(f"  saved: {out_path.name} ({out_path.stat().st_size // 1024}KB)", file=sys.stderr)


def generate_image(prompt: str, out_path: Path, model: str = MODEL_IMAGEN,
                   aspect: str = "16:9") -> Path | None:
    if out_path.exists():
        print(f"  cache hit: {out_path.name}", file=sys.stderr)
        return out_path

    client, gtypes = _get_client()
    print(f"  generating: {out_path.name} ({model}, {aspect}) ...", file=sys.stderr)

    if model == MODEL_GEMINI:
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=gtypes.GenerateContentConfig(response_modalities=["IMAGE"]),
        )
        for part in response.candidates[0].content.parts:
            if part.inline_data is not None:
                data = part.inline_data.data
                img_bytes = data if isinstance(data, (bytes, bytearray)) else base64.b64decode(data)
                _save_jpg(img_bytes, out_path)
                return out_path
        raise RuntimeError(f"No image in Gemini response for: {out_path.name}")

    cfg_kwargs = dict(number_of_images=1, output_mime_type="image/png", aspect_ratio=aspect)
    response = client.models.generate_images(
        model=model,
        prompt=prompt,
        config=gtypes.GenerateImagesConfig(**cfg_kwargs),
    )
    if response.generated_images:
        img_bytes = response.generated_images[0].image.image_bytes
        _save_jpg(img_bytes, out_path)
        return out_path
    raise RuntimeError(f"No image returned for: {out_path.name}")


BRAND_SUFFIX = (
    "Professional travel photography. Authentic Cappadocia atmosphere. "
    "Warm natural light, golden-hour or sunrise tones. Hyper-realistic, "
    "DSLR quality. No text overlays, no watermarks, no people-faces close-up."
)

NEGATIVE = "text, watermark, logo, blurry, low quality, distorted, cartoon, oversaturated"


SCENES: list[dict] = [
    {
        "id": "og-default",
        "category": "og",
        "aspect": "16:9",
        "wave": 1,
        "prompt": (
            "Cinematic sunrise panorama of Cappadocia, Turkey: 60+ colorful hot-air "
            "balloons floating over fairy-chimney rock formations at dawn. Warm golden "
            "light, soft mist between valleys, Goreme village faintly visible below. "
            "Wide aerial perspective, professional travel photography, sharp focus, "
            "vibrant but realistic colors. "
            + BRAND_SUFFIX
        ),
    },
    {
        "id": "homepage",
        "category": "hero",
        "aspect": "16:9",
        "wave": 1,
        "prompt": (
            "Iconic Cappadocia sunrise scene: dozens of hot-air balloons drifting "
            "over pink-orange fairy chimneys and rose-colored valleys. Crystal clear "
            "early-morning sky with subtle clouds. Wide cinematic landscape composition. "
            + BRAND_SUFFIX
        ),
    },
    {
        "id": "standart-balon-ucusu",
        "category": "balloons",
        "aspect": "16:9",
        "wave": 1,
        "prompt": (
            "Colorful red-and-yellow hot-air balloon basket with 16-20 passenger "
            "compartment ascending at sunrise over Cappadocia. Visible burner flames, "
            "wicker basket detail, panoramic valley below with fairy chimneys. Multiple "
            "other balloons in background. Standard tour atmosphere. "
            + BRAND_SUFFIX
        ),
    },
    {
        "id": "deluxe-balon-ucusu",
        "category": "balloons",
        "aspect": "16:9",
        "wave": 1,
        "prompt": (
            "Premium hot-air balloon ride over Cappadocia at golden hour. Compact "
            "wicker basket with 8-12 passengers visible from the side, balloon canopy "
            "in deep red and gold. Floating low over Love Valley fairy chimneys, "
            "elegant boutique experience feel. "
            + BRAND_SUFFIX
        ),
    },
    {
        "id": "romantik-ozel-balon",
        "category": "balloons",
        "aspect": "16:9",
        "wave": 1,
        "prompt": (
            "Romantic private hot-air balloon ride for two: small intimate basket with "
            "a couple silhouette, balloon decorated with white roses and ribbons, "
            "floating at sunrise over pink-rose Cappadocia valleys. Champagne bottle "
            "and two glasses visible in basket. Honeymoon photography style. "
            + BRAND_SUFFIX
        ),
    },
    {
        "id": "magara-otel-suit",
        "category": "hotels",
        "aspect": "16:9",
        "wave": 2,
        "prompt": (
            "Luxury cave-hotel suite in Urgup, Cappadocia: hand-carved stone walls, "
            "king-size bed with Turkish kilim bedspread, hammered-copper Jakuzi tub "
            "visible, soft warm lighting, panoramic arched window with valley view at "
            "dusk. Premium boutique hospitality aesthetic. "
            + BRAND_SUFFIX
        ),
    },
    {
        "id": "magara-otel-goreme-honeymoon",
        "category": "hotels",
        "aspect": "16:9",
        "wave": 2,
        "prompt": (
            "Honeymoon cave-hotel VIP suite in Goreme: candles on stone shelves, "
            "rose petals on canopy bed, foam-filled Jakuzi with champagne bucket beside, "
            "soft amber lighting from carved-stone niches. Intimate romantic atmosphere, "
            "panoramic terrace door with balloon view at sunrise. "
            + BRAND_SUFFIX
        ),
    },
    {
        "id": "magara-otel-deluxe",
        "category": "hotels",
        "aspect": "16:9",
        "wave": 2,
        "prompt": (
            "Authentic stone-carved cave-hotel room in Goreme: rustic vaulted ceiling, "
            "antique-style wooden bed, hand-woven rugs, ambient lamps. Open balcony "
            "with panoramic Goreme village + balloons at dawn. Warm earthy color palette. "
            + BRAND_SUFFIX
        ),
    },
    {
        "id": "magara-otel-goreme-romantik",
        "category": "hotels",
        "aspect": "16:9",
        "wave": 2,
        "prompt": (
            "Romantic boutique cave-room in Goreme for couples: stone fireplace lit, "
            "king bed with crisp white linens, candles on bedside niches, open arched "
            "balcony door, view of Goreme valley at twilight. Warm intimate lighting. "
            + BRAND_SUFFIX
        ),
    },
    {
        "id": "butik-otel-uchisar-premium",
        "category": "hotels",
        "aspect": "16:9",
        "wave": 2,
        "prompt": (
            "Premium boutique hotel in Uchisar, Cappadocia: modern Mediterranean stone "
            "architecture, landscaped garden with cypress trees, infinity-style terrace "
            "overlooking Uchisar Castle at golden hour. Outdoor breakfast table set with "
            "fresh fruit, olives, Turkish coffee. "
            + BRAND_SUFFIX
        ),
    },
    {
        "id": "resort-aile",
        "category": "hotels",
        "aspect": "16:9",
        "wave": 2,
        "prompt": (
            "Family-friendly resort in Nevsehir, Cappadocia: half-olympic outdoor pool "
            "with parasols, landscaped garden, modern terraced rooms in cream stone. "
            "Sunny mid-morning atmosphere, no people. Wide architectural shot. "
            + BRAND_SUFFIX
        ),
    },
    {
        "id": "glamping-yurt-suit",
        "category": "hotels",
        "aspect": "16:9",
        "wave": 2,
        "prompt": (
            "Luxury Mongolian yurt-style glamping suite in rural Cappadocia: white "
            "canvas yurt with wooden door, king-size bed inside visible through open "
            "flap, wood-burning stove, panoramic view of balloons rising over rocky "
            "valleys at dawn. Cinematic glamping aesthetic. "
            + BRAND_SUFFIX
        ),
    },
    {
        "id": "kirmizi-tur",
        "category": "tours",
        "aspect": "16:9",
        "wave": 2,
        "prompt": (
            "Goreme Open Air Museum, Cappadocia: ancient rock-cut Byzantine cave "
            "churches with frescoes, stone steps leading between fairy-chimney formations, "
            "sunny mid-day, UNESCO World Heritage atmosphere. Tour-group perspective, "
            "wide cinematic landscape. "
            + BRAND_SUFFIX
        ),
    },
    {
        "id": "yesil-tur",
        "category": "tours",
        "aspect": "16:9",
        "wave": 2,
        "prompt": (
            "Ihlara Valley canyon walk, Cappadocia: lush green canyon floor with "
            "Melendiz river, ancient cave-church carved into cliff wall, hikers' "
            "perspective on the trail, dappled sunlight through poplar trees. "
            "Green tour highlight scene. "
            + BRAND_SUFFIX
        ),
    },
    {
        "id": "yeralti-turu",
        "category": "tours",
        "aspect": "16:9",
        "wave": 2,
        "prompt": (
            "Derinkuyu Underground City, Cappadocia: ancient stone tunnel illuminated "
            "by warm amber light, carved millstone door visible, multi-level vertical "
            "passage going downward. Mysterious atmospheric underground heritage feel. "
            + BRAND_SUFFIX
        ),
    },
    {
        "id": "gun-batimi-turu",
        "category": "tours",
        "aspect": "16:9",
        "wave": 2,
        "prompt": (
            "Sunset panorama from Red Valley viewpoint, Cappadocia: rose-orange-purple "
            "sky over jagged red-rock fairy chimneys, distant Erciyes volcano on horizon. "
            "Wine glasses on a flat rock in foreground (no people). Cinematic golden-hour "
            "tourism photography. "
            + BRAND_SUFFIX
        ),
    },
    {
        "id": "instagram-turu",
        "category": "tours",
        "aspect": "16:9",
        "wave": 2,
        "prompt": (
            "Aktepe sunrise photography viewpoint, Cappadocia: tripod with DSLR camera "
            "facing dozens of hot-air balloons rising over fairy chimneys. Soft golden "
            "light, professional travel-photography setup. Wide cinematic landscape. "
            + BRAND_SUFFIX
        ),
    },
    {
        "id": "atv-sunset",
        "category": "activities",
        "aspect": "16:9",
        "wave": 3,
        "prompt": (
            "Two ATV quads on dusty trail through Love Valley, Cappadocia, at golden "
            "hour. Riders in helmets visible from behind. Dramatic phallic rock "
            "formations and red-orange sunset sky behind. Adventure travel photography. "
            + BRAND_SUFFIX
        ),
    },
    {
        "id": "at-sunset",
        "category": "activities",
        "aspect": "16:9",
        "wave": 3,
        "prompt": (
            "Horse-riding tour in Cappadocia at sunset: two brown horses with riders "
            "walking along the rim of a fairy-chimney valley, silhouetted against "
            "amber-gold sky. Cinematic wide landscape, peaceful adventure tourism. "
            + BRAND_SUFFIX
        ),
    },
    {
        "id": "jeep-sunset",
        "category": "activities",
        "aspect": "16:9",
        "wave": 3,
        "prompt": (
            "Open-top safari jeep parked at panoramic Goreme valley overlook at sunset. "
            "Dust hanging in golden light, dramatic fairy-chimney rocks in background. "
            "Adventure tour vehicle photography. "
            + BRAND_SUFFIX
        ),
    },
    {
        "id": "hamam-standart",
        "category": "activities",
        "aspect": "16:9",
        "wave": 3,
        "prompt": (
            "Traditional Turkish hammam interior in Cappadocia: domed ceiling with "
            "star-shaped light apertures, central marble heated platform (gobek tasi), "
            "ornate brass faucets on marble walls, warm steam, soft ambient light. "
            "Authentic Anatolian spa atmosphere, no people. "
            + BRAND_SUFFIX
        ),
    },
    {
        "id": "turk-gecesi-yemekli",
        "category": "activities",
        "aspect": "16:9",
        "wave": 3,
        "prompt": (
            "Turkish night folklore show in a Cappadocia cave restaurant: female "
            "dancer in colorful traditional Anatolian dress mid-spin, candles on stone "
            "tables, vaulted cave ceiling, soft warm spotlight. Audience silhouettes "
            "blurred in foreground. Authentic cultural night atmosphere. "
            + BRAND_SUFFIX
        ),
    },
    {
        "id": "microlight-standart",
        "category": "activities",
        "aspect": "16:9",
        "wave": 3,
        "prompt": (
            "Microlight ultralight aircraft flying low over Cappadocia at morning "
            "golden hour. Two-seater open-cockpit design visible from rear quarter "
            "view, peri-bacasi rock formations below, balloons in distant background. "
            "Adventure aviation photography. "
            + BRAND_SUFFIX
        ),
    },
    {
        "id": "tam-gun-paket",
        "category": "packages",
        "aspect": "16:9",
        "wave": 3,
        "prompt": (
            "Cappadocia balloon ride + tour package montage feel: balloon rising at "
            "dawn over fairy chimneys, cave-hotel terrace breakfast setup in foreground, "
            "soft warm light. Combo experience photography. "
            + BRAND_SUFFIX
        ),
    },
    {
        "id": "balayi-paketi",
        "category": "packages",
        "aspect": "16:9",
        "wave": 3,
        "prompt": (
            "Honeymoon couple silhouette on cave-hotel terrace at sunrise, dozens of "
            "balloons floating in distance, breakfast for two with flowers and champagne "
            "on stone table. Romantic Cappadocia honeymoon photography. "
            + BRAND_SUFFIX
        ),
    },
    {
        "id": "aile-paketi",
        "category": "packages",
        "aspect": "16:9",
        "wave": 3,
        "prompt": (
            "Family of four on Cappadocia tour viewpoint: parents and two children "
            "(silhouettes only, no face details) standing on cliff edge looking out at "
            "fairy chimneys and balloons. Wide golden-hour family travel photography. "
            + BRAND_SUFFIX
        ),
    },
    {
        "id": "evlilik-teklifi",
        "category": "packages",
        "aspect": "16:9",
        "wave": 3,
        "prompt": (
            "Marriage proposal scene on Cappadocia cliff at sunrise: rose petals on "
            "rock, champagne bottle in ice bucket, small velvet ring box open, dozens "
            "of balloons rising behind. No people visible. Cinematic special-moment "
            "photography. "
            + BRAND_SUFFIX
        ),
    },
    {
        "id": "cappadocia-winter-2026-guide",
        "category": "blog",
        "aspect": "16:9",
        "wave": 4,
        "prompt": (
            "Snowy Cappadocia winter landscape: fairy chimneys dusted with fresh snow, "
            "few hot-air balloons rising over Goreme in pale morning light, soft pastel "
            "winter sky. Atmospheric travel photography. "
            + BRAND_SUFFIX
        ),
    },
    {
        "id": "heissluftballon-kappadokien-preise",
        "category": "blog",
        "aspect": "16:9",
        "wave": 4,
        "prompt": (
            "Multiple colorful hot-air balloons clustered close together rising at dawn "
            "in Cappadocia, basket detail visible in foreground showing 16-20 passenger "
            "compartments. Educational tourism photography. "
            + BRAND_SUFFIX
        ),
    },
    {
        "id": "kapadokya-dugun-fotografciligi",
        "category": "blog",
        "aspect": "16:9",
        "wave": 4,
        "prompt": (
            "Cappadocia wedding photography session: bride in white dress with long "
            "train standing on red-rock cliff at sunrise, groom beside her (back-view), "
            "balloons rising in background. Professional wedding-shot composition, "
            "dreamy golden light. "
            + BRAND_SUFFIX
        ),
    },
]


def out_path_for(scene: dict) -> Path:
    return IMG_ROOT / scene["category"] / f"{scene['id']}.jpg"


def run_scene(scene: dict, model_key: str = "imagen") -> Path | None:
    model = MODEL_GEMINI if model_key == "gemini" else MODEL_IMAGEN
    out_path = out_path_for(scene)
    aspect = scene.get("aspect", "16:9")
    last_err = None
    for attempt in range(1, 5):
        try:
            return generate_image(
                prompt=scene["prompt"],
                out_path=out_path,
                model=model,
                aspect=aspect,
            )
        except Exception as e:  # noqa: BLE001
            last_err = e
            wait = attempt * 8
            print(f"  attempt {attempt}/4 failed ({str(e)[:90]}); retry in {wait}s", file=sys.stderr)
            time.sleep(wait)
    print(f"  SKIPPED {scene['id']} after 4 attempts: {last_err}", file=sys.stderr)
    return None


def filter_scenes(args) -> list[dict]:
    out = SCENES
    if args.wave:
        out = [s for s in out if s.get("wave") == args.wave]
    if args.category:
        out = [s for s in out if s["category"] == args.category]
    if args.scene:
        out = [s for s in out if s["id"] == args.scene]
    return out


def print_manifest() -> None:
    by_wave: dict[int, int] = {}
    by_cat: dict[str, int] = {}
    for s in SCENES:
        w = s.get("wave", 0)
        by_wave[w] = by_wave.get(w, 0) + 1
        by_cat[s["category"]] = by_cat.get(s["category"], 0) + 1
    manifest = {
        "total_scenes": len(SCENES),
        "by_wave": by_wave,
        "by_category": by_cat,
        "scenes": [
            {"id": s["id"], "category": s["category"], "wave": s.get("wave"), "aspect": s.get("aspect", "16:9")}
            for s in SCENES
        ],
    }
    print(json.dumps(manifest, indent=2, ensure_ascii=False))


def main() -> int:
    ap = argparse.ArgumentParser(description="Generate TripAndTick AI images via Imagen/Gemini.")
    ap.add_argument("--all", action="store_true", help="Generate all scenes")
    ap.add_argument("--wave", type=int, help="Wave (1=essentials, 2=hotels+tours, 3=activities+packages, 4=blog)")
    ap.add_argument("--category", choices=CATEGORIES, help="Generate one category only")
    ap.add_argument("--scene", help="Generate one scene by id")
    ap.add_argument("--manifest", action="store_true", help="Print scene manifest as JSON and exit")
    ap.add_argument("--model", choices=["imagen", "gemini"], default="imagen", help="imagen (best) | gemini (cheaper/faster)")
    args = ap.parse_args()

    if args.manifest:
        print_manifest()
        return 0

    if not (args.all or args.wave or args.category or args.scene):
        ap.print_help()
        return 0

    scenes = filter_scenes(args)
    if not scenes:
        print("No scenes matched filters.", file=sys.stderr)
        return 2

    print(f"=== Generating {len(scenes)} scene(s) with {args.model} ===", file=sys.stderr)
    success = 0
    for s in scenes:
        if run_scene(s, args.model) is not None:
            success += 1
        time.sleep(1)
    print(f"=== Done: {success}/{len(scenes)} succeeded ===", file=sys.stderr)
    return 0 if success == len(scenes) else 1


if __name__ == "__main__":
    sys.exit(main())
