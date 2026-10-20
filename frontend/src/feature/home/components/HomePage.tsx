
"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle, ShoppingBag } from "lucide-react";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
).replace(/\/+$/, "");

type Product = {
  _id: string;
  name: string;
  price: number;
  images?: string[];
  description?: string;
};

function resolveImage(path?: string) {
  if (!path) return "";

  if (/^(https?:\/\/|data:)/i.test(path)) {
    return path;
  }

  if (path.startsWith("/")) {
    return `${API_BASE_URL}${path}`;
  }

  if (path.startsWith("uploads/") || path.startsWith("upload/")) {
    return `${API_BASE_URL}/${path}`;
  }

  return `${API_BASE_URL}/uploads/${path}`;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0,
  }).format(price);
}

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search query Navbar se URL ke zariye aayegi.
  const searchFromUrl = searchParams.get("search")?.trim() || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async (searchTerm = "") => {
    setLoading(true);
    setError("");

    try {
      const url = searchTerm
        ? `${API_BASE_URL}/api/products/search?q=${encodeURIComponent(
            searchTerm
          )}`
        : `${API_BASE_URL}/api/products`;

      const response = await fetch(url, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          "Products load nahi ho sake. Backend check karein."
        );
      }

      const data: unknown = await response.json();

      if (!Array.isArray(data)) {
        throw new Error(
          "Backend se products ka valid data nahi mila."
        );
      }

      setProducts(data as Product[]);
    } catch (err) {
      setProducts([]);
      setError(
        err instanceof Error
          ? err.message
          : "Products load karte waqt error aaya."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Navbar search URL change hone par products filter honge.
  useEffect(() => {
    void fetchProducts(searchFromUrl);
  }, [searchFromUrl, fetchProducts]);

  

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Promotional banner */}
     


      {/* Products section - Search input removed */}
      <section className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
            Discover your style
          </p>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
            {searchFromUrl ? "Search Results" : "Shop Our Collection"}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {searchFromUrl
              ? `Products matching "${searchFromUrl}"`
              : "Explore our latest fashion collection."}
          </p>
        </div>

        {/* Search result count and clear option */}
        {searchFromUrl && !loading && !error && (
          <div className="mb-5 flex items-center justify-between gap-4 text-sm text-slate-500">
            <span>
              {products.length}{" "}
              {products.length === 1
                ? "product found"
                : "products found"}
            </span>

           
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-slate-500">
            <LoaderCircle className="h-8 w-8 animate-spin" />
            <p className="text-sm">Loading products...</p>
          </div>
        ) : error ? (
          /* Error state */
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-10 text-center">
            <p className="font-semibold text-red-800">
              Unable to load products
            </p>

            <p className="mt-2 text-sm text-red-700">{error}</p>

            <button
              type="button"
              onClick={() => void fetchProducts(searchFromUrl)}
              className="mt-5 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Try again
            </button>
          </div>
        ) : products.length === 0 ? (
          /* No products found */
          <div className="rounded-xl border border-slate-200 px-5 py-16 text-center">
            <ShoppingBag className="mx-auto h-9 w-9 text-slate-400" />

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No products found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {searchFromUrl
                ? "Try another search from the navbar."
                : "Products will appear here when available in the backend."}
            </p>

           
          </div>
        ) : (
          <>
            {!searchFromUrl && (
              <p className="mb-5 text-xs text-slate-500">
                {products.length}{" "}
                {products.length === 1 ? "product" : "products"}
              </p>
            )}

            {/* Products grid */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((product) => {
                const image = resolveImage(product.images?.[0]);

                return (
                  <article key={product._id} className="group min-w-0">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/preview?id=${encodeURIComponent(product._id)}`
                        )
                      }
                      aria-label={`View ${product.name}`}
                      className="relative block w-full overflow-hidden rounded-lg bg-slate-100 text-left"
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                          loading="lazy"
                          className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex aspect-[3/4] items-center justify-center text-sm text-slate-400">
                          Image unavailable
                        </div>
                      )}
                    </button>

                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/preview?id=${encodeURIComponent(product._id)}`
                          )
                        }
                        className="line-clamp-2 min-h-10 text-left text-sm font-medium leading-5 text-slate-800 hover:text-slate-500 sm:text-base"
                      >
                        {product.name}
                      </button>

                      <p className="mt-2 text-sm font-bold text-slate-950 sm:text-base">
                        Rs. {formatPrice(Number(product.price) || 0)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
