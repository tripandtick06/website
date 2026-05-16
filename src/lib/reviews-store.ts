// Server-side review submissions store (Edge runtime: globalThis in-memory only).
// Faz 2'de Supabase tablo: reviews(id, name, email, service_slug, rating, title,
//   message, language, status, created_at, moderated_at).
//
// Importers:
//   - src/app/api/yorum/route.ts (POST submit)
//   - src/app/api/admin/yorumlar/route.ts (admin moderation actions)
//   - src/app/admin/yorumlar/page.tsx (admin UI fetch — via API)
// Affected: musteri yorum submit flow + admin moderation.
// Data: PendingReview { id "RV-XXXX-XXXX", name, email, phone?, serviceSlug,
//       serviceName, rating 1-5, title, message, language, status enum,
//       createdAt ISO 8601, moderatedAt? ISO 8601, moderatedBy? string }
//       Persistence YOK (Cloudflare Workers ephemeral — Faz 2 Supabase).

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface PendingReview {
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
  moderatedBy?: string;
}

type Store = Map<string, PendingReview>;

const g = globalThis as unknown as {
  __reviewsStore?: Store;
  __reviewsLoaded?: boolean;
};

function getStore(): Store {
  if (!g.__reviewsStore) g.__reviewsStore = new Map();
  return g.__reviewsStore;
}

// Persistence kaldirildi — Cloudflare Workers ephemeral.
export async function loadFromFile(): Promise<void> {
  if (g.__reviewsLoaded) return;
  g.__reviewsLoaded = true;
}

async function persistToFile(): Promise<void> {
  // no-op: gercek persistence Supabase'te.
}

function makeReviewId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RV-${ts}-${rnd}`;
}

export async function addReview(
  input: Omit<PendingReview, "id" | "status" | "createdAt">
): Promise<PendingReview> {
  await loadFromFile();
  const review: PendingReview = {
    ...input,
    id: makeReviewId(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  getStore().set(review.id, review);
  await persistToFile();
  return review;
}

export async function listReviews(
  status?: ReviewStatus
): Promise<PendingReview[]> {
  await loadFromFile();
  const arr = Array.from(getStore().values());
  const filtered = status ? arr.filter((r) => r.status === status) : arr;
  return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getReview(id: string): Promise<PendingReview | null> {
  await loadFromFile();
  return getStore().get(id) ?? null;
}

export async function setReviewStatus(
  id: string,
  status: ReviewStatus,
  moderatedBy?: string
): Promise<PendingReview | null> {
  await loadFromFile();
  const review = getStore().get(id);
  if (!review) return null;
  review.status = status;
  review.moderatedAt = new Date().toISOString();
  if (moderatedBy) review.moderatedBy = moderatedBy;
  getStore().set(id, review);
  await persistToFile();
  return review;
}

export async function deleteReview(id: string): Promise<boolean> {
  await loadFromFile();
  const ok = getStore().delete(id);
  if (ok) await persistToFile();
  return ok;
}
