import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

// 2026-11-06: the Istanbul->Cappadocia article said "4 hr" in the table and "75-90 minutes"
// in the plane section. Both are right for different things: 75-90 min = the flight itself,
// ~4 hr = door to door (airport procedures + transfer). Each language must say which is which.
// The bus section also claimed a "10-hour" night trip while the table says 12-15 hr.
const DIR = path.join(process.cwd(), "public", "blog");
const files = readdirSync(DIR).filter((f) => f.endsWith("-kapadokya-istanbuldan-nasil-gidilir.json"));

describe("istanbuldan article: durations are explicit and consistent in every locale", () => {
  it("covers all 17 locales", () => {
    expect(files.length).toBe(17);
  });

  for (const f of files) {
    it(`${f}`, () => {
      const content: string = JSON.parse(readFileSync(path.join(DIR, f), "utf8")).content;
      const lines = content.split("\n");
      const header = lines.find((l) => l.startsWith("| ") && l.includes("Nevşehir") === false && l.split("|").length > 6) ?? "";
      const sectionIdx = lines.findIndex((l) => l.startsWith("## 1."));
      const intro = lines[sectionIdx + 2] ?? "";

      // table header qualifies the "total time" column with a parenthetical (door to door)
      expect(header.split("|")[2]).toMatch(/[(（（].+[)）]/);
      // plane section keeps the 75-90 flight time AND ties it to the ~4 hr door-to-door total
      expect(intro).toMatch(/75\s?(-|à|a)\s?90/);
      expect(intro).toMatch(/\b4\b|４/);
      // plane rows still say 4 / 4.5 (door to door)
      expect(content).toMatch(/\| 4(\.5|,5)? ?\S*\s*\|/);
      // bus night trip must not claim 10 hours (table: 12-15 hr)
      expect(content).not.toMatch(/(?<![\d-])10[ -]?(hour|saat|stünd|heures?|horas?|ore|uur|час|годин|घंटे|گھنٹے|小时|時間|시간|saatlıq)/i);
    });
  }
});
