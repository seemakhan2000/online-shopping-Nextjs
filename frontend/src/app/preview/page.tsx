import { Suspense } from "react";
import ProductPreview from "@/src/feature/product-preview/components/ProductPreview";

export const metadata = {
  title: "Product Preview | MY SHOPE",
  description: "View product details, choose your size, and shop at MY SHOPE.",
};

export default function ProductPreviewPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-white">
          <p className="text-sm text-gray-500">Loading product preview...</p>
        </main>
      }
    >
      <ProductPreview />
    </Suspense>
  );
}