// /paketler/[slug] — paket detay (landing) sayfasi. index:true.
import { PACKAGES } from "@/data/services/catalog";
import { makeServiceDetailPage } from "@/lib/service-detail-page";

export const runtime = "edge";

const handlers = makeServiceDetailPage({
  items: PACKAGES,
  categoryPath: "/paketler",
  navKey: "packages",
});

export const generateStaticParams = handlers.generateStaticParams;
export const generateMetadata = handlers.generateMetadata;
export default handlers.Page;
