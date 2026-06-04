// /turlar/[slug] — gezi turu detay (landing) sayfasi. index:true.
import { TOURS } from "@/data/services/catalog";
import { makeServiceDetailPage } from "@/lib/service-detail-page";

// Blog pattern: tam statik SSG (Worker'a girmez) — uzun aciklama JSON build-time fs.
export const dynamic = "force-static";
export const dynamicParams = false;

const handlers = makeServiceDetailPage({
  items: TOURS,
  categoryPath: "/turlar",
  navKey: "tours",
});

export const generateStaticParams = handlers.generateStaticParams;
export const generateMetadata = handlers.generateMetadata;
export default handlers.Page;
