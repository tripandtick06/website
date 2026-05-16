"use client";

// Admin rezervasyon detay sayfası — mock data uzerinden tum bilgi gosterim + demo aksiyonlar.
//
// Importers: Next.js App Router auto-route /admin/rezervasyon/[id].
// Linked-from: src/app/admin/page.tsx Rezervasyonlar tab (Detay link per row).
// Affected: admin operasyon detay gorunumu.
// Data: getBookingById(params.id) MOCK_BOOKINGS lookup. AdminLayout zaten auth korur.
//        Aksiyonlar demo — sadece local React state (no persist).
// User verbatim: "Param id rezervasyon ID. Mock data'dan rezervasyon detay cek
// (50 mock'tan match) Tum bilgi gosterim... Action butonlari: 'Onayla', 'Iptal Et'
// (refund tetikle), 'Maili Yeniden Gonder', 'Operatore Yonlendir' (WhatsApp link)
// 'Geri Don' button → /admin?tab=rezervasyonlar"

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Mail,
  MessageCircle,
  User as UserIcon,
  Calendar as CalendarIcon,
  Tag,
  CreditCard,
  Building2,
  Receipt,
  Send,
  AlertTriangle,
} from "lucide-react";
import {
  getBookingById,
  type MockBooking,
  type BookingStatus,
  type PaymentStatus,
} from "@/data/mock-bookings";
import { getCustomerById, getNationalityLabel } from "@/data/mock-customers";
import { formatPrice, formatDate, cn } from "@/lib/utils";

function statusBadge(s: BookingStatus) {
  const map: Record<BookingStatus, { color: string; label: string }> = {
    confirmed: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Onaylandı" },
    pending: { color: "bg-amber-100 text-amber-700 border-amber-200", label: "Bekliyor" },
    cancelled: { color: "bg-rose-100 text-rose-700 border-rose-200", label: "İptal Edildi" },
    completed: { color: "bg-slate-100 text-slate-700 border-slate-200", label: "Tamamlandı" },
  };
  const m = map[s];
  return (
    <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border", m.color)}>
      {m.label}
    </span>
  );
}

function paymentBadge(p: PaymentStatus) {
  const map: Record<PaymentStatus, { color: string; label: string }> = {
    paid: { color: "bg-emerald-100 text-emerald-700", label: "Ödendi" },
    unpaid: { color: "bg-amber-100 text-amber-700", label: "Ödenmedi" },
    refunded: { color: "bg-blue-100 text-blue-700", label: "İade Edildi" },
    partial_refund: { color: "bg-indigo-100 text-indigo-700", label: "Kısmi İade" },
  };
  const m = map[p];
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium", m.color)}>
      {m.label}
    </span>
  );
}

export default function AdminBookingDetailClient() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const initial = useMemo(() => getBookingById(id), [id]);
  const [booking, setBooking] = useState<MockBooking | undefined>(initial);
  const [actionMsg, setActionMsg] = useState<{ tone: "ok" | "warn" | "info"; text: string } | null>(null);

  useEffect(() => {
    setBooking(getBookingById(id));
  }, [id]);

  if (!booking) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin?tab=rezervasyonlar"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Geri Dön
        </Link>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-1">Rezervasyon bulunamadı</h2>
          <p className="text-sm text-slate-500">
            <span className="font-mono">{id}</span> ID&apos;li bir kayıt yok.
          </p>
        </div>
      </div>
    );
  }

  const customer = getCustomerById(booking.customerId);

  function showMsg(tone: "ok" | "warn" | "info", text: string) {
    setActionMsg({ tone, text });
    setTimeout(() => setActionMsg(null), 4000);
  }

  function handleConfirm() {
    setBooking((b) => (b ? { ...b, status: "confirmed", paymentStatus: "paid" } : b));
    showMsg("ok", "Rezervasyon onaylandı. (Demo — Faz 2'de Stripe capture)");
  }

  function handleCancel() {
    setBooking((b) =>
      b
        ? {
            ...b,
            status: "cancelled",
            paymentStatus: b.paymentStatus === "paid" ? "refunded" : "unpaid",
          }
        : b
    );
    showMsg("warn", "Rezervasyon iptal edildi ve iade tetiklendi. (Demo)");
  }

  function handleResendEmail() {
    setBooking((b) =>
      b
        ? {
            ...b,
            emailLog: [
              ...b.emailLog,
              {
                type: "confirmation",
                sentAt: new Date().toISOString(),
                to: b.customerEmail,
                status: "sent",
              },
            ],
          }
        : b
    );
    showMsg("ok", "Onay e-postası yeniden gönderildi. (Demo)");
  }

  const whatsappBody = encodeURIComponent(
    `Merhaba ${booking.operatorName ?? "operatör"}, ${booking.id} kodlu rezervasyon — ${booking.serviceName}, ${formatDate(booking.date)}, ${booking.pax} kişi. Müşteri: ${booking.customerName} (${booking.customerPhone}).`
  );
  const whatsappHref = `https://wa.me/?text=${whatsappBody}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin?tab=rezervasyonlar"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Geri Dön
        </Link>
        <div className="flex items-center gap-2">
          {statusBadge(booking.status)}
          {paymentBadge(booking.paymentStatus)}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{booking.serviceName}</h1>
            <p className="text-sm text-slate-500 font-mono mt-1">{booking.id}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Toplam</p>
            <p className="text-3xl font-extrabold text-amber-600">
              {formatPrice(booking.total, booking.currency)}
            </p>
          </div>
        </div>

        {actionMsg && (
          <div
            className={cn(
              "rounded-lg p-3 text-sm border-l-4 mb-4",
              actionMsg.tone === "ok"
                ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                : actionMsg.tone === "warn"
                ? "bg-amber-50 border-amber-500 text-amber-800"
                : "bg-blue-50 border-blue-500 text-blue-800"
            )}
          >
            {actionMsg.text}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleConfirm}
            disabled={booking.status === "confirmed" || booking.status === "completed"}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" /> Onayla
          </button>
          <button
            onClick={handleCancel}
            disabled={booking.status === "cancelled"}
            className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <XCircle className="w-4 h-4" /> İptal Et (İade Tetikle)
          </button>
          <button
            onClick={handleResendEmail}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            <Send className="w-4 h-4" /> Maili Yeniden Gönder
          </button>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            <MessageCircle className="w-4 h-4" /> Operatöre Yönlendir (WhatsApp)
          </a>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Müşteri Bilgileri" icon={UserIcon}>
            <Row label="Ad Soyad" value={booking.customerName} />
            <Row
              label="E-posta"
              value={
                <a href={`mailto:${booking.customerEmail}`} className="text-primary hover:underline">
                  {booking.customerEmail}
                </a>
              }
            />
            <Row label="Telefon" value={booking.customerPhone} />
            <Row label="Uyruk" value={getNationalityLabel(customer?.nationality ?? "")} />
            <Row label="Müşteri ID" value={<span className="font-mono text-xs">{booking.customerId}</span>} />
            {customer && (
              <Row
                label="Segment"
                value={
                  <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold capitalize">
                    {customer.segment}
                  </span>
                }
              />
            )}
            {customer && <Row label="Toplam rezervasyon" value={`${customer.totalBookings} kayıt`} />}
            {customer && (
              <Row
                label="Toplam harcama"
                value={<span className="font-semibold">{formatPrice(customer.totalSpent, "EUR")}</span>}
              />
            )}
          </Card>

          <Card title="Yolcular" icon={UserIcon}>
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2 pr-3">#</th>
                  <th className="py-2 pr-3">Ad Soyad</th>
                  <th className="py-2 pr-3">Yaş</th>
                  <th className="py-2">Uyruk</th>
                </tr>
              </thead>
              <tbody>
                {booking.passengers.map((p, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-3 font-mono text-xs text-slate-400">{i + 1}</td>
                    <td className="py-2 pr-3">{p.fullName}</td>
                    <td className="py-2 pr-3 text-slate-600">{p.age ?? "—"}</td>
                    <td className="py-2 text-slate-600">{getNationalityLabel(p.nationality)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card title="Hizmet & Tarih" icon={CalendarIcon}>
            <Row label="Hizmet" value={booking.serviceName} />
            <Row label="Slug" value={<span className="font-mono text-xs">{booking.serviceSlug}</span>} />
            <Row label="Kategori" value={<span className="capitalize">{booking.serviceCategory}</span>} />
            <Row label="Tarih" value={formatDate(booking.date)} />
            <Row label="Kişi sayısı" value={`${booking.pax} (${booking.adults} yetişkin, ${booking.children} çocuk)`} />
            {booking.operatorName && <Row label="Operatör" value={booking.operatorName} />}
          </Card>

          <Card title="Mail Gönderim Logu" icon={Mail}>
            {booking.emailLog.length === 0 ? (
              <p className="text-sm text-slate-500">Henüz e-posta gönderilmedi.</p>
            ) : (
              <ul className="space-y-2">
                {booking.emailLog.map((log, i) => (
                  <li
                    key={i}
                    className="flex items-start justify-between gap-3 border-b border-slate-100 last:border-0 pb-2 last:pb-0"
                  >
                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-900 capitalize">
                          {log.type === "confirmation"
                            ? "Onay"
                            : log.type === "reminder"
                            ? "Hatırlatma"
                            : log.type === "cancellation"
                            ? "İptal"
                            : "İade"}{" "}
                          e-postası
                        </p>
                        <p className="text-xs text-slate-500">{log.to}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <p className="text-slate-500">{new Date(log.sentAt).toLocaleString("tr-TR")}</p>
                      <span
                        className={cn(
                          "inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold",
                          log.status === "sent"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        )}
                      >
                        {log.status === "sent" ? "Gönderildi" : "Başarısız"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Fiyat Dökümü" icon={Receipt}>
            <PriceRow
              label={`Yetişkin × ${booking.adults}`}
              value={booking.adults * booking.unitPrice}
              currency={booking.currency}
            />
            {booking.children > 0 && (
              <PriceRow
                label={`Çocuk × ${booking.children}`}
                value={Math.round(booking.children * booking.unitPrice * 0.8)}
                currency={booking.currency}
              />
            )}
            {booking.insurance && (
              <PriceRow
                label={`Sigorta × ${booking.pax}`}
                value={booking.insuranceTotal}
                currency={booking.currency}
              />
            )}
            {booking.discount > 0 && (
              <PriceRow
                label={booking.couponCode ? `İndirim (${booking.couponCode})` : "İndirim"}
                value={-booking.discount}
                currency={booking.currency}
                tone="discount"
              />
            )}
            <div className="border-t-2 border-slate-200 pt-2 mt-2">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-slate-900">Toplam</span>
                <span className="text-2xl font-extrabold text-amber-600">
                  {formatPrice(booking.total, booking.currency)}
                </span>
              </div>
            </div>
          </Card>

          <Card title="Ödeme" icon={CreditCard}>
            <Row label="Durum" value={paymentBadge(booking.paymentStatus)} />
            <Row label="Yöntem" value={booking.paymentMethod} />
            {booking.paidAt && (
              <Row label="Ödeme zamanı" value={new Date(booking.paidAt).toLocaleString("tr-TR")} />
            )}
            {booking.couponCode && (
              <Row
                label="Kupon"
                value={
                  <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-xs font-mono">
                    {booking.couponCode}
                  </span>
                }
              />
            )}
          </Card>

          <Card title="Kayıt" icon={Tag}>
            <Row label="Oluşturulma" value={new Date(booking.createdAt).toLocaleString("tr-TR")} />
            {booking.operatorName && (
              <Row label="Operatör" value={booking.operatorName} icon={Building2} />
            )}
            {booking.notes && (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
                <strong>Not:</strong> {booking.notes}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-slate-500" />
        <h3 className="font-bold text-slate-900">{title}</h3>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex justify-between items-start gap-3 py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500 flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </span>
      <span className="text-sm text-slate-900 text-right">{value}</span>
    </div>
  );
}

function PriceRow({
  label,
  value,
  currency,
  tone,
}: {
  label: string;
  value: number;
  currency: string;
  tone?: "discount";
}) {
  return (
    <div className="flex justify-between text-sm py-1">
      <span className="text-slate-600">{label}</span>
      <span className={cn("font-medium", tone === "discount" ? "text-emerald-700" : "text-slate-900")}>
        {tone === "discount" && value < 0 ? "−" : ""}
        {formatPrice(Math.abs(value), currency)}
      </span>
    </div>
  );
}
