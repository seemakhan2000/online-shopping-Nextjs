
import { Suspense } from "react";
import HomePage from "@/src/feature/home/components/HomePage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 text-sm text-slate-500">
            Loading products...
          </div>
        </main>
      }
    >
      <HomePage />
    </Suspense>
  );
}
