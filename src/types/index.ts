// ── Core Types ──

export type Locale = "tr" | "en" | "de" | "fr" | "es" | "nl" | "zh" | "hi" | "ur";

export type ServiceCategory =
  | "balloon"
  | "hotel"
  | "transfer"
  | "atv"
  | "horse"
  | "tour"
  | "package"
  | "insurance";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "refunded";

export type CalendarDayStatus = "available" | "filling" | "full" | "closed";

// ── Service / Product ──

export interface Service {
  id: string;
  slug: string;
  category: ServiceCategory;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  images: string[];
  includes: string[];
  excludes: string[];
  warnings: string[];
  duration: string;
  minPax: number;
  maxPax: number;
  minAge: number;
  adultPrice: number;
  childRatio: number; // e.g. 0.80 = 80% of adult price
  currency: "EUR" | "TRY" | "USD";
  operatorId?: string;
  marketPrice?: number; // competitor price for comparison
  isActive: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
}

// ── Operator ──

export interface Operator {
  id: string;
  name: string;
  logo: string;
  licenseNo: string;
  commissionRate: number;
  contactEmail: string;
  contactPhone: string;
  isActive: boolean;
}

// ── Booking ──

export interface Passenger {
  fullName: string;
  email: string;
  phone: string;
  age?: number;
  gender?: "male" | "female" | "other";
  passportNo?: string;
  nationality: string;
  accommodation?: string;
}

export interface Booking {
  id: string;
  serviceId: string;
  date: string;
  adults: number;
  children: number;
  passengers: Passenger[];
  totalPrice: number;
  currency: string;
  status: BookingStatus;
  paymentId?: string;
  promoCode?: string;
  specialRequests?: string;
  createdAt: string;
}

// ── Calendar ──

export interface CalendarDay {
  date: string;
  status: CalendarDayStatus;
  availableSlots: number;
  totalSlots: number;
  priceMultiplier: number; // 1.0 = normal, 1.2 = high season +20%
  note?: string;
}

// ── Blog / SEO Agent ──

export interface BlogPost {
  id: string;
  slug: Record<Locale, string>;
  title: Record<Locale, string>;
  excerpt: Record<Locale, string>;
  content: Record<Locale, string>;
  metaTitle: Record<Locale, string>;
  metaDescription: Record<Locale, string>;
  coverImage: string;
  category: string;
  tags: string[];
  author: string;
  publishedAt: string | null;
  isPublished: boolean;
  isAiGenerated: boolean;
  seoScore: number;
  views: number;
}
