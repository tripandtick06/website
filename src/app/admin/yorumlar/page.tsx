// Admin /admin/yorumlar — yorum moderasyon paneli
//
// Importers: admin sidebar NAV item (admin/layout.tsx line 24-34 NAV array)
// Affected: pending yorum onaylama/reddetme/silme UI
// Data: GET /api/yorum?status=pending|approved|rejected (x-admin-token header)
//       PATCH /api/admin/yorumlar { id, action: "approve"|"reject"|"delete" }
//       Token kaynak: localStorage["tripandtick:admin:auth"]
// User verbatim: "devam et"

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  X,
  Trash2,
  Star,
  Mail,
  Phone,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AUTH_KEY = "tripandtick:admin:auth";

type ReviewStatus = "pending" | "approved" | "rejected";

interface AdminReview {
  id: string;
  name: string;
  email: string;
  phone?: string;
  serviceSlug: string;
  serviceName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  message: string;
  language: string;
  status: ReviewStatus;
  createdAt: string;
  moderatedAt?: string;
}

function getToken(): string {
  if (typeof window === "undefined") return "demo-token";
  return window.localStorage.getItem(AUTH_KEY) ?? "demo-token";
}

export default function AdminYorumlarPage() {
  const [tab, setTab] = useState<ReviewStatus>("pending");
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actioning, setActioning] = useState<Record<string, boolean>>({});

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/yorum?status=${tab}`, {
        headers: { "x-admin-token": getToken() },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Hata (${res.status})`);
      const data = (await res.json()) as { reviews: AdminReview[] };
      setReviews(data.reviews ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bilinmeyen hata");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    void fetchReviews();
  }, [fetchReviews]);

  async function doAction(id: string, action: "approve" | "reject" | "delete") {
    setActioning((m) => ({ ...m, [id]: true }));
    try {
      const res = await fetch("/api/admin/yorumlar", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": getToken(),
        },
        body: JSON.stringify({ id, action }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? `Hata (${res.status})`);
      }
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Bilinmeyen hata");
    } finally {
      setActioning((m) => {
        const next = { ...m };
        delete next[id];
        return next;
      });
    }
  }

  const TABS: Array<{ key: ReviewStatus; label: string }> = [
    { key: "pending", label: "Bekleyen" },
    { key: "approved", label: "Yayında" },
    { key: "rejected", label: "Reddedilen" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Yorum Moderasyonu</h1>
          <p className="text-sm text-slate-500">
            Müşteri yorumlarını onayla, reddet veya sil.
          </p>
        </div>
        <button
          onClick={fetchReviews}
          className="inline-flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Yenile
        </button>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-4 py-2 text-sm font-semibold border-b-2 transition-colors",
              tab === t.key
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 border-l-4 border-rose-500 bg-rose-50 p-3 rounded text-sm text-rose-800">
          <strong>Hata:</strong> {error}
        </div>
      )}

      {loading && reviews.length === 0 && (
        <div className="text-center py-10 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        </div>
      )}

      {!loading && reviews.length === 0 && !error && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500">Bu kategoride yorum yok.</p>
        </div>
      )}

      <div className="space-y-3">
        {reviews.map((r) => (
          <ReviewCard
            key={r.id}
            review={r}
            tab={tab}
            actioning={!!actioning[r.id]}
            onApprove={() => doAction(r.id, "approve")}
            onReject={() => doAction(r.id, "reject")}
            onDelete={() => {
              if (confirm("Bu yorumu kalıcı olarak silmek istiyor musunuz?")) {
                void doAction(r.id, "delete");
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  tab,
  actioning,
  onApprove,
  onReject,
  onDelete,
}: {
  review: AdminReview;
  tab: ReviewStatus;
  actioning: boolean;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
}) {
  const date = new Date(review.createdAt);
  const dateStr = date.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={cn(
                    "w-4 h-4",
                    n <= review.rating
                      ? "fill-amber-500 text-amber-500"
                      : "text-slate-200"
                  )}
                />
              ))}
            </div>
            <span className="text-xs uppercase font-bold text-slate-400">
              {review.serviceName}
            </span>
            <span className="text-xs text-slate-400">{review.language.toUpperCase()}</span>
          </div>
          <h3 className="font-bold text-slate-900">{review.title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {review.name} • {dateStr} • ID: {review.id}
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {review.email}
            </span>
            {review.phone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {review.phone}
              </span>
            )}
          </div>
        </div>
      </div>
      <p className="text-sm text-slate-700 leading-relaxed mb-4 whitespace-pre-wrap">
        {review.message}
      </p>
      <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
        {tab !== "approved" && (
          <button
            disabled={actioning}
            onClick={onApprove}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold disabled:opacity-40"
          >
            <Check className="w-3.5 h-3.5" />
            Onayla
          </button>
        )}
        {tab !== "rejected" && (
          <button
            disabled={actioning}
            onClick={onReject}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold disabled:opacity-40"
          >
            <X className="w-3.5 h-3.5" />
            Reddet
          </button>
        )}
        <button
          disabled={actioning}
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold disabled:opacity-40 ml-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Sil
        </button>
      </div>
    </article>
  );
}
