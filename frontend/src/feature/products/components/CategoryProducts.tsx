
"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle, ShoppingBag } from "lucide-react";

type Product = {
  _id: string;
  name: string;
  price: number;
  category?: string;
  images?: string[];
  description?: string;
};

type CartItem = {
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

type CategoryConfig = {
  title: string;
  description: string;
  values: readonly string[];
  discount?: string;
};

type Props = {
  config: CategoryConfig;
};

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

function normalizeCategory(value = "") {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function resolveImage(path?: string) {
  if (!path) return "";

  if (/^(https?:\/\/|data:image\/)/i.test(path)) {
    return path;
  }

  const cleanPath = path.replace(/^\/+/, "");

  if (cleanPath.startsWith("upload/") || cleanPath.startsWith("uploads/")) {
    return `${API_BASE_URL}/${cleanPath}`;
  }

  return `${API_BASE_URL}/upload/${cleanPath}`;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0,
  }).format(price);
}

function readCart(): CartItem[] {
  try {
    const saved: unknown = JSON.parse(
      localStorage.getItem("cart") || "[]"
    );

    if (!Array.isArray(saved)) return [];

    return saved
      .filter((item) => item && typeof item === "object")
      .map((item) => {
        const value = item as Partial<CartItem> & { _id?: string };

        return {
          productId: String(value.productId || value._id || ""),
          name: String(value.name || ""),
          price: Number(value.price) || 0,
          image: value.image || "",
          quantity: Math.max(1, Number(value.quantity) || 1),
        };
      })
      .filter((item) => item.productId);
  } catch {
    return [];
  }
}

function CategoryProductsContent({ config }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search")?.trim() || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Products load nahi ho sake. Backend check karein.");
      }

      const data: unknown = await response.json();

      const allProducts: Product[] = Array.isArray(data)
        ? (data as Product[])
        : data &&
            typeof data === "object" &&
            "products" in data &&
            Array.isArray((data as { products: unknown }).products)
          ? (data as { products: Product[] }).products
          : [];

      const allowedCategories = config.values.map(normalizeCategory);

      const categoryProducts = allProducts.filter((product) =>
        allowedCategories.includes(normalizeCategory(product.category))
      );

      setProducts(categoryProducts);
    } catch (err) {
      console.error("Error loading category products:", err);
      setProducts([]);
      setError(
        err instanceof Error
          ? err.message
          : "Products load karte waqt error aaya."
      );
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();

    if (!query) return products;

    return products.filter((product) =>
      `${product.name} ${product.description || ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [products, searchQuery]);

  function addToCart(product: Product) {
    setAddingId(product._id);
    setAddedId(null);

    try {
      const cart = readCart();
      const image = resolveImage(product.images?.[0]);

      const existingIndex = cart.findIndex(
        (item) => item.productId === product._id
      );

      if (existingIndex >= 0) {
        const existing = cart[existingIndex];

        cart[existingIndex] = {
          ...existing,
          name: product.name,
          price: Number(product.price) || 0,
          image: image || existing.image,
          quantity: existing.quantity + 1,
        };
      } else {
        cart.push({
          productId: product._id,
          name: product.name,
          price: Number(product.price) || 0,
          image,
          quantity: 1,
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cart-updated"));
      window.dispatchEvent(new Event("open-cart"));

      setAddedId(product._id);
    } catch (err) {
      console.error("Unable to update cart:", err);
      window.alert("Cart update nahi ho saka. Dobara try karein.");
    } finally {
      setAddingId(null);
    }
  }

  function openProductPreview(id: string) {
    router.push(`/preview?id=${encodeURIComponent(id)}`);
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="mx-auto mt-[200px] max-w-[1600px] px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
        <header className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
            MY SHOPE COLLECTION
          </p>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
            {searchQuery ? `${config.title} — Search Results` : config.title}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {searchQuery
              ? `Results matching "${searchQuery}" in this collection.`
              : config.description}
          </p>
        </header>

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-slate-500">
            <LoaderCircle className="h-8 w-8 animate-spin" />
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="font-semibold text-red-800">{error}</p>
            <button
              type="button"
              onClick={() => void fetchProducts()}
              className="mt-4 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Try Again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-xl border border-slate-200 px-5 py-16 text-center">
            <ShoppingBag className="mx-auto h-9 w-9 text-slate-400" />
            <h2 className="mt-4 text-lg font-semibold">
              {searchQuery
                ? "No matching products found"
                : "No products found in this collection"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {searchQuery
                ? "Try another search from the navbar."
                : "Products will appear here when available in the backend."}
            </p>
          </div>
        ) : (
          <>
            <p className="mb-5 text-xs text-slate-500">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "product" : "products"}
              {searchQuery ? " found" : ""}
            </p>

            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredProducts.map((product) => {
                const image = resolveImage(product.images?.[0]);
                const isAdding = addingId === product._id;
                const isAdded = addedId === product._id;

                return (
                  <article key={product._id} className="group min-w-0">
                    <button
                      type="button"
                      onClick={() => openProductPreview(product._id)}
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

                      {config.discount && (
                        <span className="absolute left-2 top-2 rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white">
                          {config.discount}
                        </span>
                      )}
                    </button>

                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={() => openProductPreview(product._id)}
                        className="line-clamp-2 min-h-10 text-left text-sm font-medium leading-5 text-slate-800 hover:text-slate-500 sm:text-base"
                      >
                        {product.name}
                      </button>

                      <p className="mt-2 text-sm font-bold text-slate-950 sm:text-base">
                        Rs. {formatPrice(Number(product.price) || 0)}
                      </p>

                      <button
                        type="button"
                        disabled={isAdding}
                        onClick={() => addToCart(product)}
                       className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#102d50] px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-[#1c4675] disabled:opacity-60 sm:text-sm"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        {isAdding
                          ? "Adding..."
                          : isAdded
                            ? "Added to Cart ✓"
                            : "Add to Cart"}
                      </button>
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

export default function CategoryProducts({ config }: Props) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-64 items-center justify-center text-slate-500">
          <LoaderCircle className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <CategoryProductsContent config={config} />
    </Suspense>
  );
}
