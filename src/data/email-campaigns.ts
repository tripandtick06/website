// Trip and Tick — email campaign configuration (admin panel + Brevo orchestration).
//
// Importers:
//   - src/app/admin/page.tsx (admin E-posta tab — list + toggle, ~line 105)
//   - future Brevo workflow runner (Faz 2)
// Affected: campaign metadata used by admin UI mock + future scheduler.
// Data: static CAMPAIGNS list — no file I/O. Trigger taxonomy maps to
// /api/newsletter (newsletter_signup), booking funnels (abandoned_cart),
// post-flight automations, birthdays and seasonal blasts. No ISO dates persisted.
// User verbatim: schema { id, name, trigger, delay_hours?, active, audience_segment? }
// with 5 initial CAMPAIGNS entries.

export type CampaignTrigger =
  | "newsletter_signup"
  | "abandoned_cart"
  | "post_flight"
  | "birthday"
  | "seasonal";

export interface EmailCampaign {
  id: string;
  name: string;
  trigger: CampaignTrigger;
  delay_hours?: number;
  active: boolean;
  audience_segment?: string;
  templateFn?:
    | "welcomeEmailHtml"
    | "cartAbandonmentEmailHtml"
    | "postFlightFeedbackEmailHtml"
    | "birthdayDiscountEmailHtml"
    | "seasonalCampaignEmailHtml"
    | "referralActivationEmailHtml";
  description?: string;
}

export const CAMPAIGNS: EmailCampaign[] = [
  {
    id: "welcome",
    name: "Hoşgeldin Bonusu",
    trigger: "newsletter_signup",
    delay_hours: 0,
    active: true,
    templateFn: "welcomeEmailHtml",
    description:
      "Newsletter aboneliği sonrası anında gönderilir. %5 hoşgeldin indirim kodu içerir.",
  },
  {
    id: "cart_1h",
    name: "Sepet Terki — 1 saat",
    trigger: "abandoned_cart",
    delay_hours: 1,
    active: true,
    templateFn: "cartAbandonmentEmailHtml",
    description:
      "Rezervasyon başlatıp tamamlamayanlara 1 saat sonra nazik hatırlatma.",
  },
  {
    id: "cart_24h",
    name: "Sepet Terki — 24 saat",
    trigger: "abandoned_cart",
    delay_hours: 24,
    active: true,
    templateFn: "cartAbandonmentEmailHtml",
    description: "24 saat sonra %10 son şans indirim kodu ile son hatırlatma.",
  },
  {
    id: "post_flight",
    name: "Uçuş Sonrası NPS",
    trigger: "post_flight",
    delay_hours: 24,
    active: true,
    templateFn: "postFlightFeedbackEmailHtml",
    description:
      "Uçuş tarihinden 24 saat sonra review + referral kodu ile feedback talebi.",
  },
  {
    id: "birthday",
    name: "Doğum Günü İndirimi",
    trigger: "birthday",
    delay_hours: 0,
    active: false,
    templateFn: "birthdayDiscountEmailHtml",
    description:
      "Doğum günü sabahı %10 indirim kuponu (Faz 2 — Brevo automation).",
  },
  {
    id: "summer_2026",
    name: "Yaz 2026 Kampanya",
    trigger: "seasonal",
    active: false,
    audience_segment: "all_subscribers",
    templateFn: "seasonalCampaignEmailHtml",
    description: "Yaz sezonu paket fırsatları (manuel tetik).",
  },
  {
    id: "referral_activation",
    name: "Referans Aktivasyon",
    trigger: "newsletter_signup",
    delay_hours: 0,
    active: true,
    templateFn: "referralActivationEmailHtml",
    description:
      "Referans kodu kullanan yeni kullanıcı kaydolunca referrer'a puan bildirimi.",
  },
];

export function getCampaign(id: string): EmailCampaign | undefined {
  return CAMPAIGNS.find((c) => c.id === id);
}

export function getCampaignsByTrigger(trigger: CampaignTrigger): EmailCampaign[] {
  return CAMPAIGNS.filter((c) => c.trigger === trigger && c.active);
}
