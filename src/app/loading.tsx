import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
      <p className="text-slate-600 font-semibold">Yükleniyor...</p>
      <div className="mt-8 w-full max-w-3xl">
        <div className="h-8 bg-slate-200 rounded-lg animate-pulse mb-4 w-1/2 mx-auto" />
        <div className="h-4 bg-slate-200 rounded animate-pulse mb-2" />
        <div className="h-4 bg-slate-200 rounded animate-pulse mb-2 w-5/6" />
        <div className="h-4 bg-slate-200 rounded animate-pulse w-4/6" />
      </div>
    </div>
  );
}
