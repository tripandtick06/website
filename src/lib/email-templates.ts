// Trip and Tick — booking email HTML/text templates.
// Brand: primary #1A2B6B (navy), accent #FF6B35 (orange), gold #FFB627 (CTA).
// Imported by src/app/api/booking/route.ts for transactional sends (Brevo).

export interface BookingEmailPassenger {
  fullName: string;
  email: string;
  phone: string;
  nationality?: string;
}

export interface BookingEmailPayload {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceName: string;
  serviceSlug: string;
  date: string; // YYYY-MM-DD
  adults: number;
  children: number;
  totalPrice: number;
  currency: string;
  passengers?: Array<BookingEmailPassenger>;
  insurance: boolean;
  specialRequests?: string;
  createdAt: string; // ISO
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tripandtick.com";
const BRAND_PRIMARY = "#1A2B6B";
const BRAND_ACCENT = "#FF6B35";
const BRAND_GOLD = "#FFB627";
const BRAND_BG = "#F8FAFC";

function escapeHtml(s: string | undefined | null): string {
  if (s === undefined || s === null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatCurrency(amount: number, currency: string): string {
  const symbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : currency === "TRY" ? "₺" : currency + " ";
  return `${symbol}${amount.toLocaleString("tr-TR")}`;
}

function formatDateTr(iso: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric", weekday: "long" });
  } catch {
    return iso;
  }
}

function icalUrl(b: BookingEmailPayload): string {
  const params = new URLSearchParams({
    bookingId: b.bookingId,
    serviceName: b.serviceName,
    date: b.date,
    time: "05:00",
  });
  return `${SITE_URL}/api/ical?${params.toString()}`;
}

function ticketUrl(b: BookingEmailPayload): string {
  return `${SITE_URL}/api/ticket-pdf?bookingId=${encodeURIComponent(b.bookingId)}`;
}

// ----------------------------------------------------------------------------
// CUSTOMER — HTML
// ----------------------------------------------------------------------------
export function customerBookingEmailHtml(b: BookingEmailPayload): string {
  const paxCount = b.adults + b.children;
  const paxLabel = b.children > 0 ? `${b.adults} yetişkin · ${b.children} çocuk` : `${b.adults} yetişkin`;

  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Rezervasyon Onayı — ${escapeHtml(b.bookingId)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND_BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1f2937;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_BG};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(15,23,42,0.06);">
        <!-- Header -->
        <tr><td style="background:${BRAND_PRIMARY};padding:28px 32px;text-align:left;">
          <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">
            Trip <span style="color:${BRAND_GOLD};">and</span> Tick
          </div>
          <div style="font-size:13px;color:rgba(255,255,255,0.75);margin-top:4px;">Kapadokya · TÜRSAB Lisanslı OTA</div>
        </td></tr>

        <!-- Hero -->
        <tr><td style="padding:32px 32px 16px 32px;">
          <div style="display:inline-block;background:#d1fae5;color:#065f46;padding:6px 12px;border-radius:999px;font-size:12px;font-weight:600;margin-bottom:12px;">
            ✓ Rezervasyon Alındı
          </div>
          <h1 style="margin:0 0 8px 0;font-size:24px;line-height:1.3;color:${BRAND_PRIMARY};">Merhaba ${escapeHtml(b.customerName)},</h1>
          <p style="margin:0;font-size:15px;line-height:1.6;color:#475569;">
            Rezervasyonunuz başarıyla oluşturuldu. Detaylar aşağıda — sorularınız için bu e-postayı yanıtlayabilirsiniz.
          </p>
        </td></tr>

        <!-- Booking code -->
        <tr><td style="padding:0 32px 16px 32px;">
          <div style="background:linear-gradient(135deg,#fff7ed 0%,#ffedd5 100%);border:2px solid ${BRAND_ACCENT};border-radius:12px;padding:20px;text-align:center;">
            <div style="font-size:12px;color:#9a3412;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">Rezervasyon Kodu</div>
            <div style="font-size:30px;font-weight:800;color:${BRAND_ACCENT};letter-spacing:0.14em;font-family:'SF Mono','Courier New',monospace;">
              ${escapeHtml(b.bookingId)}
            </div>
            <div style="font-size:12px;color:#7c2d12;margin-top:8px;">Bu kodu uçuş günü kalkış noktasında gösterin.</div>
          </div>
        </td></tr>

        <!-- Details -->
        <tr><td style="padding:8px 32px 16px 32px;">
          <h2 style="margin:16px 0 12px 0;font-size:16px;color:${BRAND_PRIMARY};">Rezervasyon Detayları</h2>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;width:42%;">Hizmet</td>
              <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:600;text-align:right;">${escapeHtml(b.serviceName)}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;">Tarih</td>
              <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:600;text-align:right;">${escapeHtml(formatDateTr(b.date))}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;">Kişi</td>
              <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:600;text-align:right;">${paxCount} (${escapeHtml(paxLabel)})</td>
            </tr>
            ${b.insurance ? `<tr>
              <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;">Seyahat Sigortası</td>
              <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#059669;font-weight:600;text-align:right;">✓ Dahil</td>
            </tr>` : ""}
            <tr>
              <td style="padding:12px 0 4px 0;color:#64748b;font-size:15px;">Toplam</td>
              <td style="padding:12px 0 4px 0;color:${BRAND_ACCENT};font-weight:800;font-size:20px;text-align:right;">${escapeHtml(formatCurrency(b.totalPrice, b.currency))}</td>
            </tr>
          </table>
        </td></tr>

        <!-- CTAs -->
        <tr><td style="padding:8px 32px 24px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right:6px;width:50%;">
                <a href="${icalUrl(b)}" style="display:block;background:${BRAND_PRIMARY};color:#ffffff;text-align:center;padding:14px 16px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
                  Takvime Ekle (.ics)
                </a>
              </td>
              <td style="padding-left:6px;width:50%;">
                <a href="${ticketUrl(b)}" style="display:block;background:#ffffff;color:${BRAND_PRIMARY};border:2px solid ${BRAND_PRIMARY};text-align:center;padding:12px 16px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
                  Bileti İndir (PDF)
                </a>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Guarantee -->
        <tr><td style="padding:0 32px 24px 32px;">
          <div style="background:#ecfdf5;border-left:4px solid #10b981;padding:14px 16px;border-radius:6px;">
            <div style="font-weight:700;color:#065f46;font-size:14px;margin-bottom:4px;">Hava Durumu Garantisi</div>
            <div style="font-size:13px;color:#047857;line-height:1.5;">
              Operatör hava şartları sebebiyle uçuşu iptal ederse <strong>%100 iade</strong> garantisi sunuyoruz. 48 saat öncesine kadar koşulsuz iptal hakkınız vardır.
            </div>
          </div>
        </td></tr>

        ${b.specialRequests ? `
        <!-- Special requests -->
        <tr><td style="padding:0 32px 24px 32px;">
          <div style="background:#fffbeb;border-left:4px solid ${BRAND_GOLD};padding:14px 16px;border-radius:6px;">
            <div style="font-weight:700;color:#78350f;font-size:14px;margin-bottom:4px;">Özel İstekleriniz</div>
            <div style="font-size:13px;color:#92400e;line-height:1.5;">${escapeHtml(b.specialRequests)}</div>
          </div>
        </td></tr>` : ""}

        <!-- Next steps -->
        <tr><td style="padding:0 32px 24px 32px;">
          <h2 style="margin:0 0 10px 0;font-size:16px;color:${BRAND_PRIMARY};">Sıradaki Adımlar</h2>
          <ol style="margin:0;padding-left:20px;font-size:14px;line-height:1.7;color:#475569;">
            <li>Uçuştan 1 gün önce hava raporu için sizinle iletişime geçeceğiz.</li>
            <li>Sabah otelinizden alış vakti SMS / e-posta ile bildirilecek.</li>
            <li>Rezervasyon kodunuzla kalkış noktasında check-in yapın.</li>
          </ol>
        </td></tr>

        <!-- Contact -->
        <tr><td style="padding:0 32px 32px 32px;border-top:1px solid #e2e8f0;padding-top:24px;">
          <h2 style="margin:0 0 8px 0;font-size:15px;color:${BRAND_PRIMARY};">İletişim</h2>
          <p style="margin:0 0 6px 0;font-size:14px;color:#475569;">
            <strong>WhatsApp / Telefon:</strong> <a href="tel:+905374647861" style="color:${BRAND_ACCENT};text-decoration:none;">+90 537 464 78 61</a>
          </p>
          <p style="margin:0 0 6px 0;font-size:14px;color:#475569;">
            <strong>E-posta:</strong> <a href="mailto:info@tripandtick.com" style="color:${BRAND_ACCENT};text-decoration:none;">info@tripandtick.com</a>
          </p>
          <p style="margin:0;font-size:14px;color:#475569;">
            <strong>Web:</strong> <a href="${SITE_URL}" style="color:${BRAND_ACCENT};text-decoration:none;">tripandtick.com</a>
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f1f5f9;padding:20px 32px;text-align:center;font-size:12px;color:#64748b;">
          <div style="margin-bottom:6px;">
            <strong>Trip and Tick</strong> · Göreme Merkez, Nevşehir, Türkiye
          </div>
          <div>TÜRSAB lisanslı seyahat acentası · &copy; ${new Date().getFullYear()} Trip and Tick</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ----------------------------------------------------------------------------
// CUSTOMER — Plain text fallback
// ----------------------------------------------------------------------------
export function customerBookingEmailText(b: BookingEmailPayload): string {
  const paxCount = b.adults + b.children;
  const paxLabel = b.children > 0 ? `${b.adults} yetişkin, ${b.children} çocuk` : `${b.adults} yetişkin`;
  const lines = [
    `Trip and Tick — Rezervasyon Onayı`,
    `==================================`,
    ``,
    `Merhaba ${b.customerName},`,
    ``,
    `Rezervasyonunuz başarıyla oluşturuldu.`,
    ``,
    `REZERVASYON KODU: ${b.bookingId}`,
    ``,
    `Detaylar:`,
    `- Hizmet: ${b.serviceName}`,
    `- Tarih: ${formatDateTr(b.date)}`,
    `- Kişi: ${paxCount} (${paxLabel})`,
    b.insurance ? `- Seyahat Sigortası: Dahil` : null,
    `- Toplam: ${formatCurrency(b.totalPrice, b.currency)}`,
    ``,
    `Takvime ekle (.ics): ${icalUrl(b)}`,
    `Bilet PDF: ${ticketUrl(b)}`,
    ``,
    b.specialRequests ? `Özel istekleriniz: ${b.specialRequests}\n` : null,
    `Hava durumu garantisi: Operatör iptalinde %100 iade. 48 saat öncesine kadar koşulsuz iptal.`,
    ``,
    `Sıradaki adımlar:`,
    `1. Uçuştan 1 gün önce hava raporu için iletişime geçeceğiz.`,
    `2. Otelden alış vakti SMS / e-posta ile bildirilecek.`,
    `3. Rezervasyon kodunuzla kalkış noktasında check-in yapın.`,
    ``,
    `İletişim:`,
    `Telefon / WhatsApp: +90 537 464 78 61`,
    `E-posta: info@tripandtick.com`,
    `Web: ${SITE_URL}`,
    ``,
    `--`,
    `Trip and Tick · TÜRSAB lisanslı seyahat acentası`,
    `Göreme Merkez, Nevşehir, Türkiye`,
  ];
  return lines.filter((l): l is string => l !== null).join("\n");
}

// ----------------------------------------------------------------------------
// ADMIN — HTML
// ----------------------------------------------------------------------------
export function adminBookingEmailHtml(b: BookingEmailPayload): string {
  const paxCount = b.adults + b.children;
  const paxLabel = b.children > 0 ? `${b.adults} yetişkin · ${b.children} çocuk` : `${b.adults} yetişkin`;
  const passengerRows = (b.passengers ?? [])
    .map((p, i) => `
      <tr>
        <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;color:#475569;">${i + 1}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:600;">${escapeHtml(p.fullName)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;color:#475569;">${escapeHtml(p.email)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;color:#475569;">${escapeHtml(p.phone)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;color:#64748b;">${escapeHtml(p.nationality ?? "—")}</td>
      </tr>`)
    .join("");

  const adminBookingUrl = `${SITE_URL}/admin/rezervasyonlar?code=${encodeURIComponent(b.bookingId)}`;
  const whatsappUrl = `https://wa.me/${b.customerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Merhaba ${b.customerName}, Trip and Tick rezervasyonunuz (${b.bookingId}) hakkında...`)}`;

  return `<!doctype html>
<html lang="tr">
<head><meta charset="utf-8"><title>YENİ REZERVASYON — ${escapeHtml(b.bookingId)}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 16px;">
    <tr><td align="center">
      <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr><td style="background:${BRAND_ACCENT};padding:18px 24px;color:#ffffff;">
          <div style="font-size:13px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;opacity:0.9;">YENİ REZERVASYON</div>
          <div style="font-size:22px;font-weight:800;margin-top:2px;font-family:'SF Mono','Courier New',monospace;">${escapeHtml(b.bookingId)}</div>
        </td></tr>

        <tr><td style="padding:20px 24px 8px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#64748b;width:35%;">Hizmet</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(b.serviceName)} <span style="color:#94a3b8;font-weight:400;font-size:12px;">(${escapeHtml(b.serviceSlug)})</span></td></tr>
            <tr><td style="padding:6px 0;color:#64748b;">Tarih</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(formatDateTr(b.date))}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b;">Kişi</td><td style="padding:6px 0;font-weight:600;">${paxCount} (${escapeHtml(paxLabel)})</td></tr>
            <tr><td style="padding:6px 0;color:#64748b;">Toplam</td><td style="padding:6px 0;font-weight:800;color:${BRAND_ACCENT};font-size:16px;">${escapeHtml(formatCurrency(b.totalPrice, b.currency))}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b;">Sigorta</td><td style="padding:6px 0;font-weight:600;">${b.insurance ? "✓ Dahil" : "—"}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b;">Oluşturuldu</td><td style="padding:6px 0;color:#475569;">${escapeHtml(b.createdAt)}</td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:8px 24px;">
          <h3 style="margin:14px 0 8px 0;font-size:14px;color:${BRAND_PRIMARY};">Grup Lideri</h3>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
            <tr><td style="padding:4px 0;color:#64748b;width:35%;">Ad Soyad</td><td style="padding:4px 0;font-weight:600;">${escapeHtml(b.customerName)}</td></tr>
            <tr><td style="padding:4px 0;color:#64748b;">E-posta</td><td style="padding:4px 0;"><a href="mailto:${escapeHtml(b.customerEmail)}" style="color:${BRAND_ACCENT};text-decoration:none;">${escapeHtml(b.customerEmail)}</a></td></tr>
            <tr><td style="padding:4px 0;color:#64748b;">Telefon</td><td style="padding:4px 0;"><a href="tel:${escapeHtml(b.customerPhone)}" style="color:${BRAND_ACCENT};text-decoration:none;">${escapeHtml(b.customerPhone)}</a></td></tr>
          </table>
        </td></tr>

        ${passengerRows ? `
        <tr><td style="padding:8px 24px;">
          <h3 style="margin:14px 0 8px 0;font-size:14px;color:${BRAND_PRIMARY};">Tüm Yolcular (${(b.passengers ?? []).length})</h3>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;border-collapse:collapse;">
            <thead>
              <tr style="background:#f8fafc;">
                <th style="padding:6px 8px;text-align:left;font-weight:600;color:#475569;border-bottom:1px solid #cbd5e1;">#</th>
                <th style="padding:6px 8px;text-align:left;font-weight:600;color:#475569;border-bottom:1px solid #cbd5e1;">Ad Soyad</th>
                <th style="padding:6px 8px;text-align:left;font-weight:600;color:#475569;border-bottom:1px solid #cbd5e1;">E-posta</th>
                <th style="padding:6px 8px;text-align:left;font-weight:600;color:#475569;border-bottom:1px solid #cbd5e1;">Telefon</th>
                <th style="padding:6px 8px;text-align:left;font-weight:600;color:#475569;border-bottom:1px solid #cbd5e1;">Uyruk</th>
              </tr>
            </thead>
            <tbody>${passengerRows}</tbody>
          </table>
        </td></tr>` : ""}

        ${b.specialRequests ? `
        <tr><td style="padding:8px 24px;">
          <h3 style="margin:14px 0 8px 0;font-size:14px;color:${BRAND_PRIMARY};">Özel İstek</h3>
          <div style="background:#fffbeb;border-left:3px solid ${BRAND_GOLD};padding:10px 12px;font-size:13px;color:#78350f;border-radius:4px;">${escapeHtml(b.specialRequests)}</div>
        </td></tr>` : ""}

        <tr><td style="padding:16px 24px 24px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right:6px;width:50%;">
                <a href="${adminBookingUrl}" style="display:block;background:${BRAND_PRIMARY};color:#ffffff;text-align:center;padding:12px 16px;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px;">
                  Admin Panel → Onayla
                </a>
              </td>
              <td style="padding-left:6px;width:50%;">
                <a href="${whatsappUrl}" style="display:block;background:#25d366;color:#ffffff;text-align:center;padding:12px 16px;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px;">
                  WhatsApp ile İletişim
                </a>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ----------------------------------------------------------------------------
// ADMIN — Plain text fallback
// ----------------------------------------------------------------------------
export function adminBookingEmailText(b: BookingEmailPayload): string {
  const paxCount = b.adults + b.children;
  const paxLabel = b.children > 0 ? `${b.adults} yetişkin, ${b.children} çocuk` : `${b.adults} yetişkin`;
  const paxList = (b.passengers ?? [])
    .map((p, i) => `  ${i + 1}. ${p.fullName} — ${p.email} — ${p.phone}${p.nationality ? ` (${p.nationality})` : ""}`)
    .join("\n");

  const lines = [
    `YENI REZERVASYON: ${b.bookingId}`,
    `=================================`,
    ``,
    `Hizmet: ${b.serviceName} (${b.serviceSlug})`,
    `Tarih: ${formatDateTr(b.date)}`,
    `Kişi: ${paxCount} (${paxLabel})`,
    `Toplam: ${formatCurrency(b.totalPrice, b.currency)}`,
    `Sigorta: ${b.insurance ? "Dahil" : "Yok"}`,
    `Oluşturuldu: ${b.createdAt}`,
    ``,
    `Grup Lideri:`,
    `  Ad: ${b.customerName}`,
    `  E-posta: ${b.customerEmail}`,
    `  Telefon: ${b.customerPhone}`,
    ``,
    paxList ? `Tüm yolcular:\n${paxList}\n` : null,
    b.specialRequests ? `Özel istek: ${b.specialRequests}\n` : null,
    `Admin Panel: ${SITE_URL}/admin/rezervasyonlar?code=${b.bookingId}`,
  ];
  return lines.filter((l): l is string => l !== null).join("\n");
}

// ============================================================================
// MARKETING TEMPLATES (Brevo campaigns) — Faz 1 newsletter + Faz 2 cart/bday/seasonal
// ============================================================================

function shellHtml(opts: {
  title: string;
  preheader?: string;
  badge?: string;
  badgeColor?: string;
  heading: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footnote?: string;
}): string {
  const badgeColor = opts.badgeColor ?? BRAND_ACCENT;
  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND_BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1f2937;">
${opts.preheader ? `<div style="display:none;font-size:1px;color:${BRAND_BG};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(opts.preheader)}</div>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_BG};padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(15,23,42,0.06);">
      <tr><td style="background:${BRAND_PRIMARY};padding:24px 32px;">
        <div style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">
          Trip <span style="color:${BRAND_GOLD};">and</span> Tick
        </div>
        <div style="font-size:12px;color:rgba(255,255,255,0.75);margin-top:2px;">Kapadokya · TÜRSAB Lisanslı OTA</div>
      </td></tr>

      <tr><td style="padding:32px 32px 8px 32px;">
        ${opts.badge ? `<div style="display:inline-block;background:${badgeColor}1a;color:${badgeColor};padding:6px 12px;border-radius:999px;font-size:12px;font-weight:700;margin-bottom:14px;text-transform:uppercase;letter-spacing:0.06em;">${escapeHtml(opts.badge)}</div>` : ""}
        <h1 style="margin:0 0 12px 0;font-size:24px;line-height:1.3;color:${BRAND_PRIMARY};">${escapeHtml(opts.heading)}</h1>
        <div style="font-size:15px;line-height:1.7;color:#475569;">${opts.body}</div>
      </td></tr>

      ${opts.ctaUrl ? `<tr><td style="padding:24px 32px 8px 32px;">
        <a href="${escapeHtml(opts.ctaUrl)}" style="display:inline-block;background:${BRAND_ACCENT};color:#ffffff;padding:14px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">${escapeHtml(opts.ctaLabel ?? "Devam Et")}</a>
      </td></tr>` : ""}

      ${opts.footnote ? `<tr><td style="padding:8px 32px 24px 32px;font-size:12px;color:#94a3b8;line-height:1.6;">${opts.footnote}</td></tr>` : ""}

      <tr><td style="background:#f1f5f9;padding:20px 32px;text-align:center;font-size:12px;color:#64748b;">
        <div style="margin-bottom:6px;"><strong>Trip and Tick</strong> · Göreme Merkez, Nevşehir, Türkiye</div>
        <div>TÜRSAB lisanslı seyahat acentası · &copy; ${new Date().getFullYear()} Trip and Tick</div>
        <div style="margin-top:8px;"><a href="${SITE_URL}" style="color:${BRAND_ACCENT};text-decoration:none;">tripandtick.com</a></div>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ----------------------------------------------------------------------------
// Q3 BALON BORSASI — bulk-cancel sonrasi musteriye alt-tarih/refund magic link
// ----------------------------------------------------------------------------

export interface RescheduleEmailParams {
  customerName: string;
  bookingId: string;
  serviceName: string;
  originalDate: string; // YYYY-MM-DD
  cancellationReason?: string;
  magicLinkUrl: string;
  alternativeDates: string[]; // YYYY-MM-DD[]
  refundAmount: number;
  currency: string;
  ttlDays: number;
}

export function rescheduleBatchEmailHtml(p: RescheduleEmailParams): string {
  const altListHtml = p.alternativeDates
    .slice(0, 5)
    .map(
      (d) =>
        `<li style="margin:6px 0;color:#0f172a;"><strong>${escapeHtml(formatDateTr(d))}</strong></li>`
    )
    .join("");
  const body = `
    <p style="margin:0 0 14px 0;">Merhaba <strong>${escapeHtml(p.customerName)}</strong>,</p>
    <p style="margin:0 0 14px 0;">
      Üzgünüz — <strong>${escapeHtml(formatDateTr(p.originalDate))}</strong> tarihindeki
      <strong>${escapeHtml(p.serviceName)}</strong> rezervasyonunuz iptal edilmek zorunda kalındı.
    </p>
    ${p.cancellationReason ? `
      <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:14px 16px;border-radius:6px;margin:12px 0;">
        <div style="font-weight:700;color:#991b1b;font-size:14px;margin-bottom:4px;">İptal Sebebi</div>
        <div style="font-size:13px;color:#b91c1c;">${escapeHtml(p.cancellationReason)}</div>
      </div>` : ""}

    <p style="margin:0 0 14px 0;">
      İki seçeneğiniz var — aşağıdaki <strong>tek tıklık link</strong> üzerinden seçin.
    </p>

    <h3 style="margin:18px 0 8px 0;font-size:15px;color:${BRAND_PRIMARY};">Seçenek 1 — Alternatif tarih (önerilen)</h3>
    ${altListHtml ? `<p style="margin:0 0 6px 0;font-size:14px;color:#475569;">Önerilen ilk uygun tarihler:</p>
    <ul style="margin:0 0 14px 18px;padding:0;font-size:14px;line-height:1.6;">${altListHtml}</ul>` : `
    <p style="margin:0 0 14px 0;font-size:14px;color:#475569;">Linkten size uygun bir tarihi seçebilirsiniz.</p>`}

    <h3 style="margin:18px 0 8px 0;font-size:15px;color:${BRAND_PRIMARY};">Seçenek 2 — %100 iade</h3>
    <p style="margin:0 0 14px 0;font-size:14px;color:#475569;">
      İstemezseniz <strong>${escapeHtml(formatCurrency(p.refundAmount, p.currency))}</strong> tutarın tamamı
      hesabınıza 5 iş günü içinde iade edilir.
    </p>

    <div style="background:#fffbeb;border:1px solid ${BRAND_GOLD};border-radius:6px;padding:10px 14px;margin:18px 0;font-size:12px;color:#78350f;">
      Bu link <strong>${p.ttlDays} gün</strong> içinde kullanılmalıdır. Rezervasyon kodu:
      <strong style="font-family:'SF Mono','Courier New',monospace;">${escapeHtml(p.bookingId)}</strong>
    </div>
  `;
  return shellHtml({
    title: "Rezervasyonunuz iptal edildi — alternatif veya iade",
    preheader: `${p.serviceName} ${formatDateTr(p.originalDate)} iptal — alternatif tarih veya tam iade seçin.`,
    badge: "İptal · Aksiyon Bekliyor",
    badgeColor: "#ef4444",
    heading: "Rezervasyonunuz İptal Edildi",
    body,
    ctaLabel: "Alternatif Seç veya İade İste",
    ctaUrl: p.magicLinkUrl,
    footnote: `Sorularınız için <a href="https://wa.me/905374647861" style="color:${BRAND_ACCENT};">WhatsApp +90 537 464 78 61</a>.`,
  });
}

export function rescheduleBatchEmailText(p: RescheduleEmailParams): string {
  const lines = [
    `Trip and Tick — Rezervasyon İptal & Aksiyon`,
    ``,
    `Merhaba ${p.customerName},`,
    ``,
    `${formatDateTr(p.originalDate)} tarihindeki ${p.serviceName} rezervasyonunuz iptal edildi.`,
    `Rezervasyon kodu: ${p.bookingId}`,
    p.cancellationReason ? `İptal sebebi: ${p.cancellationReason}` : null,
    ``,
    `İki seçenek:`,
    `1) Alternatif tarih seç (önerilen):`,
    ...p.alternativeDates.slice(0, 5).map((d) => `   - ${formatDateTr(d)}`),
    `2) %100 iade (${formatCurrency(p.refundAmount, p.currency)}) — 5 iş günü`,
    ``,
    `Tek-tıklık link (${p.ttlDays} gün geçerli):`,
    p.magicLinkUrl,
    ``,
    `WhatsApp: +90 537 464 78 61`,
    `--`,
    `Trip and Tick`,
  ];
  return lines.filter((l): l is string => l !== null).join("\n");
}

export interface RescheduleConfirmationParams {
  customerName: string;
  bookingId: string;
  serviceName: string;
  choice: "reschedule" | "refund";
  newDate?: string; // YYYY-MM-DD (reschedule)
  refundAmount?: number;
  currency?: string;
}

export function rescheduleConfirmationEmailHtml(p: RescheduleConfirmationParams): string {
  if (p.choice === "reschedule" && p.newDate) {
    const body = `
      <p style="margin:0 0 14px 0;">Merhaba <strong>${escapeHtml(p.customerName)}</strong>,</p>
      <p style="margin:0 0 14px 0;">
        Yeni rezervasyon tarihiniz onaylandı.
      </p>
      <div style="background:#ecfdf5;border:2px solid #10b981;border-radius:12px;padding:18px;text-align:center;margin:14px 0;">
        <div style="font-size:12px;color:#065f46;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">Yeni Tarih</div>
        <div style="font-size:20px;font-weight:800;color:#065f46;">${escapeHtml(formatDateTr(p.newDate))}</div>
        <div style="font-size:13px;color:#047857;margin-top:6px;">${escapeHtml(p.serviceName)} · Kod: ${escapeHtml(p.bookingId)}</div>
      </div>
      <p style="margin:0;font-size:14px;color:#475569;">Uçuştan 1 gün önce hava raporu için sizinle iletişime geçeceğiz.</p>
    `;
    return shellHtml({
      title: "Yeni Tarih Onaylandı",
      preheader: `${p.serviceName} ${formatDateTr(p.newDate)} tarihine taşındı.`,
      badge: "Onaylandı",
      badgeColor: "#10b981",
      heading: "Yeni Tarihiniz Onaylandı",
      body,
    });
  }
  const refundLine =
    p.refundAmount && p.currency
      ? `<strong>${escapeHtml(formatCurrency(p.refundAmount, p.currency))}</strong> tutarın iadesi`
      : "Tam iade";
  const body = `
    <p style="margin:0 0 14px 0;">Merhaba <strong>${escapeHtml(p.customerName)}</strong>,</p>
    <p style="margin:0 0 14px 0;">
      ${refundLine} talebiniz alındı. 5 iş günü içinde ödeme yaptığınız karta yansıyacaktır.
    </p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#64748b;">
      Rezervasyon kodu: <strong>${escapeHtml(p.bookingId)}</strong> · ${escapeHtml(p.serviceName)}
    </p>
    <p style="margin:0;font-size:14px;color:#475569;">
      Tekrar Kapadokya'ya hoş geldiniz demek için sabırsızlanıyoruz.
    </p>
  `;
  return shellHtml({
    title: "İade Talebiniz Alındı",
    preheader: "5 iş günü içinde iade.",
    badge: "İade",
    badgeColor: BRAND_ACCENT,
    heading: "İade Talebiniz Alındı",
    body,
  });
}

export function rescheduleConfirmationEmailText(p: RescheduleConfirmationParams): string {
  if (p.choice === "reschedule" && p.newDate) {
    return [
      `Trip and Tick — Yeni Tarih Onaylandı`,
      ``,
      `Merhaba ${p.customerName},`,
      ``,
      `Yeni tarih: ${formatDateTr(p.newDate)}`,
      `Hizmet: ${p.serviceName}`,
      `Kod: ${p.bookingId}`,
      ``,
      `--`,
      `Trip and Tick`,
    ].join("\n");
  }
  return [
    `Trip and Tick — İade Talebiniz Alındı`,
    ``,
    `Merhaba ${p.customerName},`,
    ``,
    p.refundAmount && p.currency
      ? `İade tutarı: ${formatCurrency(p.refundAmount, p.currency)} — 5 iş günü içinde karta.`
      : `Tam iade — 5 iş günü içinde karta.`,
    `Kod: ${p.bookingId} · ${p.serviceName}`,
    ``,
    `--`,
    `Trip and Tick`,
  ].join("\n");
}

// ----------------------------------------------------------------------------
// 1) WELCOME — newsletter signup hosgeldin bonusu
// ----------------------------------------------------------------------------
export interface WelcomeEmailParams {
  name?: string;
  email: string;
  locale: string;
  discountCode?: string;
  discountPercent?: number;
}

export function welcomeEmailHtml(p: WelcomeEmailParams): string {
  const name = p.name?.trim() || p.email.split("@")[0];
  const code = p.discountCode ?? "HOSGELDIN5";
  const pct = p.discountPercent ?? 5;
  const body = `
    <p style="margin:0 0 14px 0;">Merhaba <strong>${escapeHtml(name)}</strong>,</p>
    <p style="margin:0 0 14px 0;">
      Trip and Tick bültenine hoş geldiniz! Kapadokya'nın en rekabetçi fiyatlı OTA'sından
      sezon fırsatları, yeni paketler ve sadece abonelerimize özel kampanyalar artık doğrudan
      e-posta kutunuzda.
    </p>
    <div style="background:linear-gradient(135deg,#fff7ed 0%,#ffedd5 100%);border:2px solid ${BRAND_ACCENT};border-radius:12px;padding:18px;text-align:center;margin:18px 0;">
      <div style="font-size:11px;color:#9a3412;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">Hoşgeldin Bonusu</div>
      <div style="font-size:28px;font-weight:800;color:${BRAND_ACCENT};letter-spacing:0.14em;font-family:'SF Mono','Courier New',monospace;">${escapeHtml(code)}</div>
      <div style="font-size:13px;color:#7c2d12;margin-top:6px;">İlk rezervasyonunuzda <strong>%${pct} indirim</strong>.</div>
    </div>
    <p style="margin:0;">Hoş geldin uçuşunuzu seçmeye hazır mısınız?</p>
  `;
  return shellHtml({
    title: "Trip and Tick — Hoşgeldin Bonusu",
    preheader: `İlk rezervasyonunuzda %${pct} indirim — kod: ${code}`,
    badge: "Hoş Geldiniz",
    heading: "Hoş Geldin Bonusunuz Hazır!",
    body,
    ctaLabel: "Balon Turlarını Keşfet",
    ctaUrl: `${SITE_URL}/balonlar`,
    footnote: `Locale: ${escapeHtml(p.locale)}. Bültenden ayrılmak için <a href="${SITE_URL}/abonelik-iptali" style="color:${BRAND_ACCENT};">tıklayın</a>.`,
  });
}

export function welcomeEmailText(p: WelcomeEmailParams): string {
  const name = p.name?.trim() || p.email.split("@")[0];
  const code = p.discountCode ?? "HOSGELDIN5";
  const pct = p.discountPercent ?? 5;
  return [
    `Trip and Tick — Hoş Geldiniz!`,
    ``,
    `Merhaba ${name},`,
    ``,
    `Bültenimize hoş geldiniz. Kapadokya'nın en rekabetçi fiyatlı OTA'sından`,
    `sezon fırsatları artık doğrudan e-postanızda.`,
    ``,
    `HOŞGELDİN KODU: ${code}`,
    `İlk rezervasyonunuzda %${pct} indirim.`,
    ``,
    `Balon turları: ${SITE_URL}/balonlar`,
    ``,
    `--`,
    `Trip and Tick · TÜRSAB lisanslı seyahat acentası`,
    `Locale: ${p.locale}`,
    `Abonelikten çıkış: ${SITE_URL}/abonelik-iptali`,
  ].join("\n");
}

// ----------------------------------------------------------------------------
// 2) CART ABANDONMENT — sepet terki (Faz 2 trigger 1h / 24h)
// ----------------------------------------------------------------------------
export interface CartAbandonmentParams {
  customerName: string;
  serviceName: string;
  bookingDraftUrl: string;
  variant?: "1h" | "24h";
  discountCode?: string;
}

export function cartAbandonmentEmailHtml(p: CartAbandonmentParams): string {
  const isLate = p.variant === "24h";
  const body = `
    <p style="margin:0 0 14px 0;">Merhaba <strong>${escapeHtml(p.customerName)}</strong>,</p>
    <p style="margin:0 0 14px 0;">
      <strong>${escapeHtml(p.serviceName)}</strong> rezervasyonunuzu tamamlamadan ayrıldığınızı fark ettik.
      Yarım kalmış rezervasyonunuz hâlâ sizi bekliyor.
    </p>
    ${isLate && p.discountCode ? `
      <div style="background:#fffbeb;border-left:4px solid ${BRAND_GOLD};padding:14px 16px;border-radius:6px;margin:14px 0;">
        <div style="font-weight:700;color:#78350f;font-size:14px;margin-bottom:4px;">Son Şans %10 İndirim</div>
        <div style="font-size:13px;color:#92400e;">
          Kod: <strong>${escapeHtml(p.discountCode)}</strong> — 24 saat geçerli.
        </div>
      </div>
    ` : ""}
    <p style="margin:14px 0 0 0;">
      ${isLate ? "Stoklar hızla tükeniyor." : "Birkaç dakika içinde tamamlayabilirsiniz."}
    </p>
  `;
  return shellHtml({
    title: "Rezervasyonunuz sizi bekliyor",
    preheader: `${p.serviceName} rezervasyonunuz hâlâ açık.`,
    badge: isLate ? "Son Çağrı" : "Hatırlatma",
    badgeColor: isLate ? BRAND_GOLD : BRAND_ACCENT,
    heading: isLate ? "Son Şans — Rezervasyonu Tamamlayın" : "Rezervasyonunuza Devam Edin",
    body,
    ctaLabel: "Rezervasyonu Tamamla",
    ctaUrl: p.bookingDraftUrl,
    footnote: "Bu e-postayı yarım kalmış rezervasyonunuz nedeniyle aldınız. Tekrar görmek istemiyorsanız aboneliği iptal edebilirsiniz.",
  });
}

export function cartAbandonmentEmailText(p: CartAbandonmentParams): string {
  return [
    `Trip and Tick — Rezervasyonunuz sizi bekliyor`,
    ``,
    `Merhaba ${p.customerName},`,
    ``,
    `${p.serviceName} rezervasyonunuzu tamamlamadan ayrıldınız.`,
    `Devam etmek için: ${p.bookingDraftUrl}`,
    p.discountCode ? `\nİndirim kodu: ${p.discountCode}` : "",
    ``,
    `--`,
    `Trip and Tick`,
  ].join("\n");
}

// ----------------------------------------------------------------------------
// 3) BIRTHDAY DISCOUNT — dogum gunu kampanya
// ----------------------------------------------------------------------------
export interface BirthdayDiscountParams {
  name: string;
  discount: number; // percent
  code: string;
  validUntil?: string; // YYYY-MM-DD
}

export function birthdayDiscountEmailHtml(p: BirthdayDiscountParams): string {
  const body = `
    <p style="margin:0 0 14px 0;">Doğum gününüz kutlu olsun, <strong>${escapeHtml(p.name)}</strong>!</p>
    <p style="margin:0 0 14px 0;">
      Bu özel gün için size küçük bir hediyemiz var. Trip and Tick ailesinden
      doğum günü indiriminizi kullanın ve Kapadokya'yı keşfedin.
    </p>
    <div style="background:linear-gradient(135deg,#fef3c7 0%,#fde68a 100%);border:2px solid ${BRAND_GOLD};border-radius:12px;padding:20px;text-align:center;margin:18px 0;">
      <div style="font-size:11px;color:#78350f;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">Doğum Günü İndirimi</div>
      <div style="font-size:36px;font-weight:800;color:${BRAND_GOLD};">%${p.discount}</div>
      <div style="font-size:14px;color:#7c2d12;margin-top:6px;">Kod: <strong style="font-family:'SF Mono','Courier New',monospace;">${escapeHtml(p.code)}</strong></div>
      ${p.validUntil ? `<div style="font-size:12px;color:#92400e;margin-top:6px;">Son kullanım: ${escapeHtml(formatDateTr(p.validUntil))}</div>` : ""}
    </div>
  `;
  return shellHtml({
    title: "Doğum gününüz kutlu olsun!",
    preheader: `Size %${p.discount} doğum günü indirimi.`,
    badge: "Doğum Günü",
    badgeColor: BRAND_GOLD,
    heading: "Doğum Gününüz Kutlu Olsun!",
    body,
    ctaLabel: "İndirimi Kullan",
    ctaUrl: `${SITE_URL}/balonlar?coupon=${encodeURIComponent(p.code)}`,
  });
}

export function birthdayDiscountEmailText(p: BirthdayDiscountParams): string {
  return [
    `Doğum gününüz kutlu olsun, ${p.name}!`,
    ``,
    `Trip and Tick'ten doğum günü hediyeniz: %${p.discount} indirim`,
    `Kod: ${p.code}`,
    p.validUntil ? `Son kullanım: ${formatDateTr(p.validUntil)}` : "",
    ``,
    `Balon turları: ${SITE_URL}/balonlar?coupon=${p.code}`,
  ].join("\n");
}

// ----------------------------------------------------------------------------
// 4) POST-FLIGHT FEEDBACK — ucus sonrasi 24h NPS + review + referral
// ----------------------------------------------------------------------------
export interface PostFlightFeedbackParams {
  name: string;
  serviceName: string;
  reviewUrl: string;
  referralCode?: string;
}

export function postFlightFeedbackEmailHtml(p: PostFlightFeedbackParams): string {
  const body = `
    <p style="margin:0 0 14px 0;">Merhaba <strong>${escapeHtml(p.name)}</strong>,</p>
    <p style="margin:0 0 14px 0;">
      <strong>${escapeHtml(p.serviceName)}</strong> deneyiminiz nasıldı? Görüşleriniz hem bizim
      hem de gelecek misafirlerimiz için çok değerli.
    </p>
    <p style="margin:0 0 14px 0;">Birkaç dakikanızı ayırarak değerlendirmenizi paylaşır mısınız?</p>
    ${p.referralCode ? `
      <div style="background:#ecfdf5;border-left:4px solid #10b981;padding:14px 16px;border-radius:6px;margin:18px 0;">
        <div style="font-weight:700;color:#065f46;font-size:14px;margin-bottom:4px;">Arkadaşlarınızı Davet Edin</div>
        <div style="font-size:13px;color:#047857;line-height:1.6;">
          Referans kodunuzla bir arkadaşınızı çağırın; siz <strong>500 puan</strong>, arkadaşınız
          <strong>%5 indirim</strong> kazansın.<br>
          Kodunuz: <strong style="font-family:'SF Mono','Courier New',monospace;">${escapeHtml(p.referralCode)}</strong>
        </div>
      </div>
    ` : ""}
  `;
  return shellHtml({
    title: "Deneyiminiz nasıldı?",
    preheader: `${p.serviceName} hakkında geri bildiriminizi rica ederiz.`,
    badge: "Geri Bildirim",
    badgeColor: "#10b981",
    heading: "Deneyiminizi Paylaşır Mısınız?",
    body,
    ctaLabel: "Değerlendirme Bırak",
    ctaUrl: p.reviewUrl,
  });
}

export function postFlightFeedbackEmailText(p: PostFlightFeedbackParams): string {
  return [
    `Merhaba ${p.name},`,
    ``,
    `${p.serviceName} deneyiminiz nasıldı?`,
    `Değerlendirme bırakın: ${p.reviewUrl}`,
    p.referralCode ? `\nReferans kodunuz: ${p.referralCode}` : "",
    ``,
    `--`,
    `Trip and Tick`,
  ].join("\n");
}

// ----------------------------------------------------------------------------
// 5) SEASONAL CAMPAIGN — sezon kampanyasi (Faz 2)
// ----------------------------------------------------------------------------
export interface SeasonalCampaignParams {
  season: string;
  headline: string;
  offers: Array<{ name: string; price: number; currency: string; href: string }>;
  ctaUrl: string;
}

export function seasonalCampaignEmailHtml(p: SeasonalCampaignParams): string {
  const offersHtml = p.offers
    .slice(0, 4)
    .map(
      (o) => `
      <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
        <a href="${escapeHtml(o.href)}" style="display:flex;justify-content:space-between;align-items:center;text-decoration:none;color:#0f172a;font-weight:600;">
          <span>${escapeHtml(o.name)}</span>
          <span style="color:${BRAND_ACCENT};font-weight:800;">${escapeHtml(formatCurrency(o.price, o.currency))}</span>
        </a>
      </td></tr>
    `
    )
    .join("");
  const body = `
    <p style="margin:0 0 14px 0;">${escapeHtml(p.headline)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">
      ${offersHtml}
    </table>
  `;
  return shellHtml({
    title: `Trip and Tick — ${p.season}`,
    preheader: p.headline,
    badge: p.season,
    heading: `${p.season} Fırsatları`,
    body,
    ctaLabel: "Tüm Kampanyaları Gör",
    ctaUrl: p.ctaUrl,
  });
}

export function seasonalCampaignEmailText(p: SeasonalCampaignParams): string {
  const offers = p.offers
    .map((o) => `- ${o.name}: ${formatCurrency(o.price, o.currency)} — ${o.href}`)
    .join("\n");
  return [
    `Trip and Tick — ${p.season} Fırsatları`,
    ``,
    p.headline,
    ``,
    offers,
    ``,
    `Tümü: ${p.ctaUrl}`,
  ].join("\n");
}

// ----------------------------------------------------------------------------
// 6) REFERRAL ACTIVATION — referans onayi
// ----------------------------------------------------------------------------
export interface ReferralActivationParams {
  referrerName: string;
  code: string;
  bonusPoints: number;
}

export function referralActivationEmailHtml(p: ReferralActivationParams): string {
  const body = `
    <p style="margin:0 0 14px 0;">Tebrikler <strong>${escapeHtml(p.referrerName)}</strong>!</p>
    <p style="margin:0 0 14px 0;">
      <strong>${escapeHtml(p.code)}</strong> referans kodunuzu kullanan yeni bir misafir Trip and Tick
      ailesine katıldı.
    </p>
    <div style="background:#ecfdf5;border:2px solid #10b981;border-radius:12px;padding:20px;text-align:center;margin:18px 0;">
      <div style="font-size:11px;color:#065f46;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">Kazandınız</div>
      <div style="font-size:36px;font-weight:800;color:#10b981;">+${p.bonusPoints.toLocaleString("tr-TR")} puan</div>
      <div style="font-size:13px;color:#047857;margin-top:6px;">Hesabınıza eklendi.</div>
    </div>
    <p style="margin:14px 0 0 0;">Daha fazla davet, daha fazla puan!</p>
  `;
  return shellHtml({
    title: "Referansınız aktive oldu!",
    preheader: `${p.bonusPoints} puan kazandınız.`,
    badge: "Referans",
    badgeColor: "#10b981",
    heading: "Referansınız Aktive Oldu!",
    body,
    ctaLabel: "Hesabımı Gör",
    ctaUrl: `${SITE_URL}/hesabim`,
  });
}

export function referralActivationEmailText(p: ReferralActivationParams): string {
  return [
    `Tebrikler ${p.referrerName}!`,
    ``,
    `Referans kodunuz ${p.code} kullanıldı.`,
    `+${p.bonusPoints} puan hesabınıza eklendi.`,
    ``,
    `Hesabım: ${SITE_URL}/hesabim`,
  ].join("\n");
}
