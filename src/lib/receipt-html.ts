// Receipt / fatura HTML generator. Print-friendly A4 inline-styled markup.
// User verbatim: "en uzunundan basla, en son benim mudahelem gereken seyleri yap"
//
// Callers: src/app/api/receipt/[bookingId]/route.ts (GET endpoint).
// Glob check: no existing receipt-html lib.
// Data: BookingEmailPayload re-used + locale ("tr" | "en") + auto-print toggle.
// Format: HTML5 + inline CSS, A4 portrait, KDV %20 placeholder.

import type { BookingEmailPayload } from "@/lib/email-templates";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tripandtick.com";

const BRAND_PRIMARY = "#1A2B6B";
const BRAND_ACCENT = "#FF6B35";
const BRAND_GOLD = "#FFB627";

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
  return `${symbol}${amount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateLocale(iso: string, locale: "tr" | "en"): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const tag = locale === "en" ? "en-US" : "tr-TR";
    return d.toLocaleDateString(tag, { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

type Tr = Record<string, string>;

const TRANSLATIONS: Record<"tr" | "en", Tr> = {
  tr: {
    title: "Rezervasyon Faturasi",
    subtitle: "TURSAB lisansli seyahat acentasi",
    invoiceNo: "Fatura No",
    bookingCode: "Rezervasyon Kodu",
    issueDate: "Duzenleme Tarihi",
    customer: "Musteri",
    name: "Ad Soyad",
    email: "E-posta",
    phone: "Telefon",
    service: "Hizmet",
    description: "Aciklama",
    date: "Tarih",
    pax: "Kisi sayisi",
    qty: "Adet",
    unitPrice: "Birim Fiyat",
    amount: "Tutar",
    subtotal: "Ara Toplam",
    vat: "KDV (%20 dahil)",
    total: "GENEL TOPLAM",
    paymentMethod: "Odeme Yontemi",
    paymentMethodVal: "Kredi Karti (Stripe)",
    paid: "ODENDI",
    insurance: "Seyahat Sigortasi",
    adults: "Yetiskin",
    children: "Cocuk",
    cancellation: "Iptal & Iade Politikasi",
    cancellationText:
      "48 saat oncesine kadar kosulsuz iptal hakkiniz vardir. Operatorun hava sartlari sebebiyle iptal etmesi durumunda %100 iade garantisi.",
    weatherGuarantee: "Hava Durumu Garantisi: Operatorun iptali halinde %100 iade.",
    footer: "Bu fatura elektronik olarak duzenlenmistir; imza gerektirmez.",
    contact: "Iletisim",
    address: "Goreme Merkez, Nevsehir, Turkiye",
    print: "Yazdir / PDF Indir",
    back: "Geri",
    company: "Trip and Tick",
    taxId: "Vergi No",
    taxIdVal: "—",
  },
  en: {
    title: "Booking Invoice",
    subtitle: "TURSAB-licensed travel agency",
    invoiceNo: "Invoice No",
    bookingCode: "Booking Code",
    issueDate: "Issue Date",
    customer: "Customer",
    name: "Full Name",
    email: "Email",
    phone: "Phone",
    service: "Service",
    description: "Description",
    date: "Date",
    pax: "Passengers",
    qty: "Qty",
    unitPrice: "Unit Price",
    amount: "Amount",
    subtotal: "Subtotal",
    vat: "VAT (20% incl.)",
    total: "GRAND TOTAL",
    paymentMethod: "Payment Method",
    paymentMethodVal: "Credit Card (Stripe)",
    paid: "PAID",
    insurance: "Travel Insurance",
    adults: "Adults",
    children: "Children",
    cancellation: "Cancellation & Refund Policy",
    cancellationText:
      "Free cancellation up to 48 hours before. 100% refund if operator cancels due to weather.",
    weatherGuarantee: "Weather Guarantee: 100% refund if operator cancels.",
    footer: "This invoice is issued electronically; no signature required.",
    contact: "Contact",
    address: "Goreme Center, Nevsehir, Turkey",
    print: "Print / Save as PDF",
    back: "Back",
    company: "Trip and Tick",
    taxId: "Tax No",
    taxIdVal: "—",
  },
};

export function receiptHtml(b: BookingEmailPayload, locale: "tr" | "en" = "tr", opts?: { autoPrint?: boolean }): string {
  const t = TRANSLATIONS[locale];
  const paxCount = b.adults + b.children;
  const paxLabel =
    b.children > 0 ? `${b.adults} ${t.adults} · ${b.children} ${t.children}` : `${b.adults} ${t.adults}`;
  const unitPrice = paxCount > 0 ? b.totalPrice / paxCount : b.totalPrice;
  const vatRate = 0.2;
  const subtotalNet = b.totalPrice / (1 + vatRate);
  const vatAmount = b.totalPrice - subtotalNet;
  const issueDate = formatDateLocale(b.createdAt || new Date().toISOString(), locale);
  const tourDate = formatDateLocale(b.date, locale);
  const invoiceNo = `INV-${b.bookingId}`;

  const autoPrint = opts?.autoPrint !== false;

  return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(t.title)} — ${escapeHtml(b.bookingId)}</title>
<style>
  *{box-sizing:border-box;}
  body{margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#0f172a;background:#f1f5f9;}
  .page{max-width:780px;margin:0 auto;background:#ffffff;border-radius:12px;box-shadow:0 4px 20px rgba(15,23,42,0.08);overflow:hidden;}
  .controls{max-width:780px;margin:0 auto 16px;display:flex;gap:8px;justify-content:flex-end;}
  .btn{padding:10px 18px;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px;cursor:pointer;border:none;}
  .btn-primary{background:${BRAND_PRIMARY};color:#fff;}
  .btn-secondary{background:#fff;color:${BRAND_PRIMARY};border:1px solid #cbd5e1;}
  .header{background:${BRAND_PRIMARY};color:#fff;padding:28px 36px;display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;}
  .brand{font-size:24px;font-weight:800;letter-spacing:-0.02em;}
  .brand span{color:${BRAND_GOLD};}
  .brand-sub{font-size:12px;color:rgba(255,255,255,0.75);margin-top:4px;}
  .invoice-meta{text-align:right;font-size:13px;}
  .invoice-meta strong{display:block;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,255,255,0.65);margin-bottom:2px;}
  .invoice-meta div{margin-bottom:6px;}
  .paid-badge{display:inline-block;background:#10b981;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;margin-top:6px;}
  .body{padding:32px 36px;}
  .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px;}
  .info-block{padding:16px 18px;background:#f8fafc;border-radius:8px;border-left:3px solid ${BRAND_ACCENT};}
  .info-block h3{margin:0 0 10px;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:${BRAND_PRIMARY};}
  .info-block .row{display:flex;justify-content:space-between;font-size:13px;padding:3px 0;}
  .info-block .row .k{color:#64748b;}
  .info-block .row .v{color:#0f172a;font-weight:600;text-align:right;}
  .booking-code-box{background:linear-gradient(135deg,#fff7ed,#ffedd5);border:2px solid ${BRAND_ACCENT};border-radius:10px;padding:16px;text-align:center;margin-bottom:24px;}
  .booking-code-box .label{font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#9a3412;margin-bottom:4px;}
  .booking-code-box .code{font-size:28px;font-weight:800;color:${BRAND_ACCENT};letter-spacing:0.14em;font-family:"SF Mono","Courier New",monospace;}
  table.items{width:100%;border-collapse:collapse;margin-bottom:24px;}
  table.items th{background:${BRAND_PRIMARY};color:#fff;text-align:left;padding:10px 12px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;}
  table.items td{padding:12px;border-bottom:1px solid #e2e8f0;font-size:14px;}
  table.items .right{text-align:right;}
  .totals{margin-left:auto;width:48%;font-size:14px;}
  .totals .row{display:flex;justify-content:space-between;padding:6px 0;}
  .totals .row.subtotal{color:#475569;}
  .totals .row.vat{color:#64748b;font-size:13px;}
  .totals .row.total{font-weight:800;font-size:18px;color:${BRAND_ACCENT};border-top:2px solid ${BRAND_PRIMARY};padding-top:10px;margin-top:6px;}
  .policy{margin-top:24px;background:#ecfdf5;border-left:4px solid #10b981;padding:14px 16px;border-radius:6px;font-size:13px;color:#065f46;}
  .policy h4{margin:0 0 4px;font-size:13px;font-weight:700;}
  .footer{background:#f1f5f9;padding:18px 36px;text-align:center;font-size:11px;color:#64748b;border-top:1px solid #e2e8f0;}
  .footer strong{color:${BRAND_PRIMARY};}
  @media print {
    body{background:#fff;padding:0;}
    .controls{display:none;}
    .page{box-shadow:none;border-radius:0;max-width:100%;}
    @page{size:A4;margin:14mm;}
  }
</style>
</head>
<body>
  <div class="controls">
    <a href="javascript:history.back()" class="btn btn-secondary">${escapeHtml(t.back)}</a>
    <button onclick="window.print()" class="btn btn-primary">${escapeHtml(t.print)}</button>
  </div>
  <div class="page">
    <div class="header">
      <div>
        <div class="brand">Trip <span>and</span> Tick</div>
        <div class="brand-sub">${escapeHtml(t.subtitle)}</div>
        <div class="paid-badge">✓ ${escapeHtml(t.paid)}</div>
      </div>
      <div class="invoice-meta">
        <div><strong>${escapeHtml(t.invoiceNo)}</strong>${escapeHtml(invoiceNo)}</div>
        <div><strong>${escapeHtml(t.issueDate)}</strong>${escapeHtml(issueDate)}</div>
        <div><strong>${escapeHtml(t.taxId)}</strong>${escapeHtml(t.taxIdVal)}</div>
      </div>
    </div>

    <div class="body">
      <div class="booking-code-box">
        <div class="label">${escapeHtml(t.bookingCode)}</div>
        <div class="code">${escapeHtml(b.bookingId)}</div>
      </div>

      <div class="grid-2">
        <div class="info-block">
          <h3>${escapeHtml(t.customer)}</h3>
          <div class="row"><span class="k">${escapeHtml(t.name)}</span><span class="v">${escapeHtml(b.customerName)}</span></div>
          <div class="row"><span class="k">${escapeHtml(t.email)}</span><span class="v">${escapeHtml(b.customerEmail)}</span></div>
          <div class="row"><span class="k">${escapeHtml(t.phone)}</span><span class="v">${escapeHtml(b.customerPhone)}</span></div>
        </div>
        <div class="info-block">
          <h3>${escapeHtml(t.service)}</h3>
          <div class="row"><span class="k">${escapeHtml(t.description)}</span><span class="v">${escapeHtml(b.serviceName)}</span></div>
          <div class="row"><span class="k">${escapeHtml(t.date)}</span><span class="v">${escapeHtml(tourDate)}</span></div>
          <div class="row"><span class="k">${escapeHtml(t.pax)}</span><span class="v">${paxCount} (${escapeHtml(paxLabel)})</span></div>
        </div>
      </div>

      <table class="items">
        <thead>
          <tr>
            <th>${escapeHtml(t.description)}</th>
            <th class="right">${escapeHtml(t.qty)}</th>
            <th class="right">${escapeHtml(t.unitPrice)}</th>
            <th class="right">${escapeHtml(t.amount)}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>${escapeHtml(b.serviceName)}</strong><br><span style="color:#64748b;font-size:12px;">${escapeHtml(tourDate)} · ${escapeHtml(paxLabel)}</span></td>
            <td class="right">${paxCount}</td>
            <td class="right">${escapeHtml(formatCurrency(unitPrice, b.currency))}</td>
            <td class="right"><strong>${escapeHtml(formatCurrency(b.totalPrice, b.currency))}</strong></td>
          </tr>
          ${b.insurance ? `<tr><td>${escapeHtml(t.insurance)}</td><td class="right">—</td><td class="right">—</td><td class="right">${escapeHtml(t.paid)}</td></tr>` : ""}
        </tbody>
      </table>

      <div class="totals">
        <div class="row subtotal"><span>${escapeHtml(t.subtotal)}</span><span>${escapeHtml(formatCurrency(subtotalNet, b.currency))}</span></div>
        <div class="row vat"><span>${escapeHtml(t.vat)}</span><span>${escapeHtml(formatCurrency(vatAmount, b.currency))}</span></div>
        <div class="row total"><span>${escapeHtml(t.total)}</span><span>${escapeHtml(formatCurrency(b.totalPrice, b.currency))}</span></div>
      </div>

      <div style="margin-top:24px;padding:14px 16px;background:#f8fafc;border-radius:6px;font-size:13px;color:#475569;">
        <strong>${escapeHtml(t.paymentMethod)}:</strong> ${escapeHtml(t.paymentMethodVal)}
      </div>

      <div class="policy">
        <h4>${escapeHtml(t.cancellation)}</h4>
        <div>${escapeHtml(t.cancellationText)}</div>
      </div>
    </div>

    <div class="footer">
      <strong>${escapeHtml(t.company)}</strong> · ${escapeHtml(t.address)} · <a href="${SITE_URL}" style="color:${BRAND_ACCENT};text-decoration:none;">${SITE_URL.replace(/^https?:\/\//, "")}</a>
      <br>${escapeHtml(t.footer)}
    </div>
  </div>
  ${autoPrint ? `<script>window.addEventListener("load",function(){setTimeout(function(){try{window.print();}catch(e){}},400);});</script>` : ""}
</body>
</html>`;
}
