// Trip and Tick — Founder/team + Company tek-kaynak veri dosyasi.
// PLACEHOLDER: gercek bilgiler (TURSAB lisans no, telefon, ekip uyeleri) user
// tarafindan saglandiginda burayi guncelle. schema.ts, Footer.tsx ve
// hakkimizda/page.tsx bu dosyadan beslenir.

export interface Founder {
  name: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  linkedin?: string;
  twitter?: string;
  image?: string;
}

// Placeholder data — user gercek bilgiyle sonra degistirir.
export const FOUNDER: Founder = {
  name: "Trip and Tick Ekibi",
  title: "Kurucu Ekip",
  bio: "TÜRSAB lisansli 9+ operatör ile çalisan, Göreme/Nevşehir merkezli online seyahat acentesi.",
  email: "info@tripandtick.com",
  phone: "+90-500-123-4567",
};

export interface CompanyAddress {
  street: string;
  locality: string;
  region: string;
  postalCode: string;
  country: string;
}

export interface CompanyGeo {
  lat: number;
  lng: number;
}

export interface CompanySocial {
  instagram: string;
  facebook: string;
  twitter: string;
  youtube: string;
  linkedin: string;
}

export interface Company {
  legalName: string;
  foundingDate: string;
  phone: string;
  email: string;
  altEmail: string;
  billingEmail: string;
  whatsapp: string;
  address: CompanyAddress;
  geo: CompanyGeo;
  tursab: string;
  social: CompanySocial;
}

export const COMPANY: Company = {
  legalName: "Trip and Tick Seyahat Acentası",
  foundingDate: "2024-06-01",
  phone: "+90-500-123-4567",
  email: "info@tripandtick.com",
  altEmail: "destek@tripandtick.com",
  billingEmail: "fatura@tripandtick.com",
  whatsapp: "905001234567",
  address: {
    street: "Göreme Merkez Mah.",
    locality: "Göreme",
    region: "Nevşehir",
    postalCode: "50180",
    country: "TR",
  },
  geo: { lat: 38.6431, lng: 34.8289 },
  tursab: "A-XXXX", // Placeholder — gercek TURSAB lisans no
  social: {
    instagram: "https://www.instagram.com/tripandtick",
    facebook: "https://www.facebook.com/tripandtick",
    twitter: "https://twitter.com/tripandtick",
    youtube: "https://www.youtube.com/@tripandtick",
    linkedin: "https://www.linkedin.com/company/tripandtick",
  },
};

// Helper: telefon numarasini tel: linki icin sadelestir.
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^0-9+]/g, "")}`;
}

// Helper: WhatsApp deep-link
export function whatsappHref(waNumber: string, message?: string): string {
  const base = `https://wa.me/${waNumber.replace(/[^0-9]/g, "")}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
