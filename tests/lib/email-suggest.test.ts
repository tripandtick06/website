import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { emailSuggestion, emailHintText } from "@/lib/emailSuggest";

const ROOT = path.resolve(__dirname, "../..");
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8");

describe("emailSuggestion", () => {
  it("suggests a fix for typos in known domains and TLDs", () => {
    expect(emailSuggestion("jan@gmial.com")).toBe("jan@gmail.com");
    expect(emailSuggestion("jan@gmail.co")).toBe("jan@gmail.com");
    expect(emailSuggestion("Jan@Hotmial.NL")).toBe("jan@hotmail.nl");
    expect(emailSuggestion("jan@outlok.com")).toBe("jan@outlook.com");
    expect(emailSuggestion("jan@zigo.nl")).toBe("jan@ziggo.nl");
    expect(emailSuggestion("jan@bedrijf.con")).toBe("jan@bedrijf.com");
    expect(emailSuggestion("jan@bedrijf.nll")).toBe("jan@bedrijf.nl");
  });

  it("leaves correct and unknown addresses alone", () => {
    for (const a of ["jan@gmail.com", "jan@live.nl", "jan@live.be", "jan@devries-keukens.nl", "jan@kpn.nl", "", "geen-adres", "a@b@c.nl"]) {
      expect(emailSuggestion(a), a).toBe("");
    }
  });

  it("hint text: en/nl/tr, unknown locale falls back to en", () => {
    expect(emailHintText("nl")).toEqual(["Bedoelt u ", "?"]);
    expect(emailHintText("tr")[0]).toContain("demek istediniz");
    expect(emailHintText("ja")).toEqual(emailHintText("en"));
    expect(emailHintText("en")).toEqual(["Did you mean ", "?"]);
  });
});

describe("email hint wiring", () => {
  it("is wired into the four forms, never mutates the value itself, renders conditionally", () => {
    for (const f of [
      "src/app/[locale]/iletisim/ContactForm.tsx",
      "src/components/booking/QuickContact.tsx",
      "src/components/oteller/HotelInquiryForm.tsx",
    ]) {
      expect(read(f), f).toContain("<EmailHint");
      expect(read(f), f).toContain("emailHint.check(");
    }
    expect(read("src/app/[locale]/rezervasyon/[slug]/BookingClient.tsx")).toContain('emailHint="booking"');
    const comp = read("src/components/ui/EmailHint.tsx");
    expect(comp).toContain("if (!suggestion) return null");
    expect(comp).not.toMatch(/hidden=|display:/);
    // Olaylarda adres değil yalnız domain.
    expect(comp).toContain('domain: s.split("@")[1]');
  });

  it("funnel events reuse DB-allowed names (events.name CHECK has no custom names)", () => {
    const sql = read("supabase/migrations/0006_events.sql");
    expect(sql).toContain("'form_submit','error'");
    const hook = read("src/lib/analytics/useFormFunnel.ts");
    expect(hook).toContain('track("click"');
    expect(hook).toContain('trackBeacon("click"');
  });
});
