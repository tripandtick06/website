import { SkeletonCard, SkeletonHero } from "@/components/loading/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-[80vh] py-12 px-4">
      <SkeletonHero />
      <div className="container-main mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}
