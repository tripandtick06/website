export interface Operator {
  id: string;
  name: string;
  licenseNo: string;
  rating: number;
  reviewCount: number;
  founded: number;
  description: string;
}

export const OPERATORS: Operator[] = [
  { id: "kaya", name: "Kaya Balon", licenseNo: "A-2348", rating: 4.8, reviewCount: 1843, founded: 2008, description: "Kapadokya'nın en köklü operatörlerinden. Geniş filo ve güvenilirlik." },
  { id: "istanbul", name: "İstanbul Balon", licenseNo: "A-2410", rating: 4.85, reviewCount: 2104, founded: 2005, description: "20 yılı aşkın deneyim. Standart ve konfor uçuşlar." },
  { id: "urgup", name: "Ürgüp Balon", licenseNo: "A-2456", rating: 4.9, reviewCount: 1521, founded: 2010, description: "Ürgüp merkezli, küçük gruplar için ideal." },
  { id: "butterfly", name: "Butterfly Balloons", licenseNo: "A-2287", rating: 4.95, reviewCount: 3210, founded: 2002, description: "Premium segmentin lideri. Deluxe ve romantik uçuşlar." },
  { id: "asiana", name: "Asiana Balon", licenseNo: "A-2512", rating: 4.75, reviewCount: 987, founded: 2014, description: "Asya pazarına odaklı, çok dilli rehberlik." },
  { id: "turkiye", name: "Türkiye Balon", licenseNo: "A-2398", rating: 4.8, reviewCount: 1456, founded: 2009, description: "Güvenilir aile şirketi." },
  { id: "universal", name: "Universal Balon", licenseNo: "A-2421", rating: 4.85, reviewCount: 1187, founded: 2011, description: "Modern filo, yüksek standart bakım." },
  { id: "voyager", name: "Voyager Balloons", licenseNo: "A-2334", rating: 4.9, reviewCount: 1892, founded: 2007, description: "Premium hizmet, küçük sepet konforu." },
  { id: "aircappadocia", name: "Air Cappadocia", licenseNo: "A-2483", rating: 4.8, reviewCount: 1342, founded: 2013, description: "İngilizce ve Almanca rehberlik." },
  { id: "royal", name: "Royal Balloon", licenseNo: "A-2256", rating: 4.97, reviewCount: 2543, founded: 2001, description: "Romantik ve VIP uçuşların lideri." },
];

export function getOperatorById(id: string): Operator | undefined {
  return OPERATORS.find((o) => o.id === id);
}
