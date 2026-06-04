// /aktiviteler/[slug] — aktivite detay (landing) sayfasi. index:true.
import { ACTIVITIES } from "@/data/services/catalog";
import { makeServiceDetailPage } from "@/lib/service-detail-page";

export const runtime = "edge";

const handlers = makeServiceDetailPage({
  items: ACTIVITIES,
  categoryPath: "/aktiviteler",
  navKey: "activities",
});

export const generateStaticParams = handlers.generateStaticParams;
export const generateMetadata = handlers.generateMetadata;
export default handlers.Page;
