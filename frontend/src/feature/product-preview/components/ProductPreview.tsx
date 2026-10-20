"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Heart,
  LockKeyhole,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";

import { useToast } from "@/src/components/providers/ToastProvider";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const NO_IMAGE =
  "https://dummyimage.com/700x850/f3f4f6/6b7280&text=Product+Image";

type Product = {
  _id: string;
  productId?: string;
  name: string;
  price: number;
  category?: string;
  categoryId?: string | { name?: string };
  images?: string[];
  image?: string;
  sizes?: string[];
  description?: string;
  stock?: number;
  sku?: string;
};

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
};

type Review = {
  _id?: string;
  rating: number;
  comment: string;
  userId?: string | { name?: string };
  createdAt?: string;
};

function resolveImagePath(path?: string): string {
  if (!path) return NO_IMAGE;

  if (
    path.startsWith("data:image/") ||
    path.startsWith("https://") ||
    path.startsWith("http://")
  ) {
    return path;
  }

  if (path.startsWith("/")) {
    if (path.startsWith("/uploads/") || path.startsWith("/upload/")) {
      return `${API_BASE_URL}${path}`;
    }

    return path;
  }

  const cleanPath = path.replace(/^\.?\//, "");

  if (
    cleanPath.startsWith("uploads/") ||
    cleanPath.startsWith("upload/")
  ) {
    return `${API_BASE_URL}/${cleanPath}`;
  }

  return `${API_BASE_URL}/uploads/${cleanPath}`;
}

function getCategory(product: Product | null): string {
  if (!product) return "Collection";

  if (typeof product.category === "string" && product.category) {
    return product.category;
  }

  if (
    product.categoryId &&
    typeof product.categoryId === "object" &&
    product.categoryId.name
  ) {
    return product.categoryId.name;
  }

  if (typeof product.categoryId === "string") {
    return product.categoryId;
  }

  return "Collection";
}

function getProductImage(product: Product): string {
  return product.images?.[0] || product.image || "";
}

function readStoredCart(): CartItem[] {
  try {
    const value = localStorage.getItem("cart");
    const parsed: unknown = value ? JSON.parse(value) : [];

    if (!Array.isArray(parsed)) return [];

    return parsed as CartItem[];
  } catch {
    return [];
  }
}

function formatPrice(price: number): string {
  return `Rs. ${price.toLocaleString("en-PK")}`;
}

function formatDate(date?: string): string {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function averageRating(reviews: Review[]): number {
  if (!reviews.length) return 0;

  const total = reviews.reduce(
    (sum, review) =>
      sum + Math.min(5, Math.max(0, Number(review.rating) || 0)),
    0
  );

  return total / reviews.length;
}

export default function ProductPreview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");

  const { showSuccess, showError, showWarning } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);

  const [reviewList, setReviewList] = useState<Review[]>([]);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  const category = getCategory(product);
  const images = useMemo(() => {
    if (!product) return [NO_IMAGE];

    const availableImages = product.images?.length
      ? product.images
      : product.image
        ? [product.image]
        : [];

    return availableImages.length ? availableImages : [NO_IMAGE];
  }, [product]);

  const ratingValue = useMemo(
    () => averageRating(reviewList),
    [reviewList]
  );

  const inStock =
    product?.stock === undefined || product.stock > 0;

  // Load product details.
  useEffect(() => {
    const controller = new AbortController();

    async function loadProduct() {
      setLoading(true);
      setError("");
      setProduct(null);
      setSelectedImage("");
      setSelectedSize("");
      setQuantity(1);

      try {
        let item: Record<string, unknown>;

        if (productId) {
          const response = await fetch(
            `${API_BASE_URL}/api/products/${encodeURIComponent(productId)}`,
            { signal: controller.signal }
          );

          if (!response.ok) {
            throw new Error("Unable to load this product.");
          }

          const data = await response.json();
          item = data.product ?? data;
        } else {
          const stored = localStorage.getItem("previewProduct");

          if (!stored) {
            throw new Error(
              "No product selected. Please open a product first."
            );
          }

          item = JSON.parse(stored);
        }

        if (!item._id && !item.productId && !item.name) {
          throw new Error("Invalid product data received from server.");
        }

        const rawImages = Array.isArray(item.images)
          ? item.images.filter(
              (image): image is string => typeof image === "string"
            )
          : typeof item.image === "string"
            ? [item.image]
            : [];

        const normalized: Product = {
          _id: String(item._id || item.productId || "preview-product"),
          productId:
            typeof item.productId === "string"
              ? item.productId
              : undefined,
          name: String(item.name || "Product"),
          price: Math.max(0, Number(item.price) || 0),
          category:
            typeof item.category === "string"
              ? item.category
              : undefined,
          categoryId:
            typeof item.categoryId === "string" ||
            (item.categoryId !== null &&
              typeof item.categoryId === "object")
              ? (item.categoryId as string | { name?: string })
              : undefined,
          images: rawImages,
          sizes: Array.isArray(item.sizes)
            ? item.sizes.filter(
                (size): size is string => typeof size === "string"
              )
            : [],
          description:
            typeof item.description === "string"
              ? item.description
              : undefined,
          stock:
            item.stock !== undefined && Number.isFinite(Number(item.stock))
              ? Number(item.stock)
              : undefined,
          sku: typeof item.sku === "string" ? item.sku : undefined,
        };

        setProduct(normalized);
        setSelectedImage(getProductImage(normalized));
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong loading the product."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadProduct();

    return () => controller.abort();
  }, [productId]);

  
useEffect(() => {
  const currentProductId = product?._id;

  if (!currentProductId || currentProductId === "preview-product") {
    setReviewList([]);
    return;
  }

  
  const safeProductId: string = currentProductId;
  const controller = new AbortController();

  async function loadReviews() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/reviews/${encodeURIComponent(safeProductId)}`,
        { signal: controller.signal }
      );

      if (!response.ok) return;

      const data = await response.json();

      const reviews: Review[] = Array.isArray(data)
        ? data
        : Array.isArray(data.reviews)
          ? data.reviews
          : [];

      setReviewList(reviews);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;

      console.error("Unable to load reviews.", err);
    }
  }

  void loadReviews();

  return () => controller.abort();
}, [product?._id]);

  // Add selected product and quantity to the existing cart.
  function addToCart() {
    if (!product) {
      showError("Product is not available.");
      return;
    }

    if (product.sizes?.length && !selectedSize) {
      showWarning("Please select a size first.");
      return;
    }

    if (!inStock) {
      showWarning("This product is currently out of stock.");
      return;
    }

    try {
      const currentCart = readStoredCart();
      const image = resolveImagePath(
        selectedImage || getProductImage(product)
      );

      const id = product._id;
      const existing = currentCart.find(
        (item) =>
          item.productId === id &&
          item.size === (selectedSize || undefined)
      );

      if (
        existing &&
        product.stock !== undefined &&
        existing.quantity + quantity > product.stock
      ) {
        showWarning("The requested quantity exceeds available stock.");
        return;
      }

      const updatedCart: CartItem[] = existing
        ? currentCart.map((item) =>
            item.productId === id &&
            item.size === (selectedSize || undefined)
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        : [
            ...currentCart,
            {
              productId: id,
              name: product.name,
              price: product.price,
              quantity,
              image,
              size: selectedSize || undefined,
            },
          ];

      localStorage.setItem("cart", JSON.stringify(updatedCart));

      window.dispatchEvent(new Event("cart-updated"));
      window.dispatchEvent(new Event("open-cart"));

      showSuccess("Product added to your shopping bag.");
    } catch {
      showError("Unable to save your cart. Please try again.");
    }
  }

  // Submit a product review.
  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!productId) {
      showWarning("A product ID is required to submit a review.");
      return;
    }

    const cleanComment = comment.trim();

    if (!cleanComment) {
      showWarning("Please write a review.");
      return;
    }

    setReviewLoading(true);

    try {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        showWarning("Please log in before submitting a review.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          productId,
          userId,
          rating: Number(rating),
          comment: cleanComment,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit review.");
      }

      setReviewList((current) => [
        {
          _id: data.review?._id,
          rating: Number(rating),
          comment: cleanComment,
          createdAt: new Date().toISOString(),
        },
        ...current,
      ]);

      setComment("");
      setRating("5");
      setReviewFormOpen(false);

      showSuccess("Your review was submitted successfully.");
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Unable to submit review."
      );
    } finally {
      setReviewLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[70vh]  mt-[160px] items-center justify-center bg-[#faf9f6] px-5">
        <div className="text-center">
          <div className="mx-auto mb-5 h-11 w-11 animate-spin rounded-full border-[3px] border-stone-200 border-t-stone-900" />
          <p className="text-sm font-medium text-stone-700">
            Preparing your product...
          </p>
          <p className="mt-1 text-xs text-stone-500">
            Please wait a moment
          </p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#faf9f6] px-5 py-16">
        <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-100">
            <ShoppingBag className="h-6 w-6 text-stone-700" />
          </div>

          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-stone-900">
            Product unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-stone-600">
            {error || "We could not find this product."}
          </p>

          <Link
            href="/"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-lg bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            <ArrowLeft size={16} />
            Back to shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-stone-900">
      {/* Breadcrumb navigation */}
      <div className="border-b border-stone-100 bg-[#faf9f6]">
        <div className="mx-auto flex max-w-[1440px] items-center gap-2 overflow-hidden px-4 py-4 text-xs text-stone-500 sm:px-6 lg:px-10">
          <Link href="/" className="shrink-0 transition hover:text-stone-950">
            Home
          </Link>
          <ChevronRight size={13} className="shrink-0" />
          <span className="max-w-[35%] truncate">{category}</span>
          <ChevronRight size={13} className="shrink-0" />
          <span className="truncate font-medium text-stone-900">
            {product.name}
          </span>
        </div>
      </div>

      {/* Product details */}
      <section className="mx-auto mt-[160px] max-w-[1440px] px-4 pb-16 pt-7 sm:px-6 sm:pb-20 sm:pt-10 lg:px-10 lg:pb-24">
        <div className="grid grid-cols-1 items-start gap-9 lg:grid-cols-12 lg:gap-12 xl:gap-16">
          {/* Image gallery */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 sm:grid-cols-[84px_minmax(0,1fr)] sm:gap-5">
              <div className="flex flex-col gap-3">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    aria-label={`View product image ${index + 1}`}
                    aria-pressed={selectedImage === image}
                    className={`relative aspect-[4/5] w-full overflow-hidden rounded-lg border bg-stone-50 transition ${
                      selectedImage === image
                        ? "border-stone-900 ring-1 ring-stone-900"
                        : "border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    <Image
                      src={resolveImagePath(image)}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      fill
                      sizes="84px"
                      unoptimized
                      className="object-cover transition duration-500 hover:scale-105"
                    />
                  </button>
                ))}
              </div>

              <div className="relative min-w-0">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#f5f3ef]">
                  <Image
                    src={resolveImagePath(
                      selectedImage || getProductImage(product)
                    )}
                    alt={product.name}
                    fill
                    priority
                    unoptimized
                    sizes="(max-width: 1024px) 85vw, 58vw"
                    className="object-cover transition duration-700"
                  />

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/10 to-transparent" />

                  <button
                    type="button"
                    onClick={() => setWishlist((current) => !current)}
                    aria-label={
                      wishlist
                        ? "Remove from wishlist"
                        : "Add to wishlist"
                    }
                    aria-pressed={wishlist}
                    className={`absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/70 shadow-sm backdrop-blur-md transition sm:right-5 sm:top-5 ${
                      wishlist
                        ? "bg-stone-950 text-white"
                        : "bg-white/90 text-stone-900 hover:bg-white"
                    }`}
                  >
                    <Heart
                      size={19}
                      fill={wishlist ? "currentColor" : "none"}
                      strokeWidth={1.7}
                    />
                  </button>

                  {product.stock !== undefined && product.stock <= 0 && (
                    <div className="absolute left-3 top-3 rounded-md bg-stone-950 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-white sm:left-5 sm:top-5">
                      Out of stock
                    </div>
                  )}
                </div>

                <p className="mt-3 text-center text-[10px] uppercase tracking-[0.2em] text-stone-400">
                  {images.length > 1
                    ? `${images.length} product views`
                    : "Product detail"}
                </p>
              </div>
            </div>
          </div>

          {/* Product information */}
          <div className="lg:col-span-5 lg:pt-2">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
              <span>{category}</span>
              <span className="h-1 w-1 rounded-full bg-stone-300" />
              <span>MY SHOPE</span>
            </div>

            <h1 className="mt-4 max-w-xl text-3xl font-semibold leading-[1.15] tracking-[-0.04em] text-stone-950 sm:text-4xl xl:text-[44px]">
              {product.name}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="text-2xl font-semibold tracking-tight text-stone-950">
                {formatPrice(product.price)}
              </p>

              {reviewList.length > 0 && (
                <a
                  href="#customer-reviews"
                  className="inline-flex items-center gap-2 text-xs text-stone-600 transition hover:text-stone-950"
                >
                  <span className="flex items-center gap-1 text-amber-600">
                    <Star size={14} fill="currentColor" />
                    <span className="font-semibold text-stone-900">
                      {ratingValue.toFixed(1)}
                    </span>
                  </span>
                  <span className="text-stone-300">|</span>
                  <span>
                    {reviewList.length}{" "}
                    {reviewList.length === 1 ? "review" : "reviews"}
                  </span>
                </a>
              )}
            </div>

            <p className="mt-5 max-w-lg text-sm leading-7 text-stone-600">
              {product.description ||
                "Discover this piece from our collection. Choose your preferred size and add it to your shopping bag to continue."}
            </p>

            <div className="my-7 border-t border-stone-200" />

            {/* Size selection */}
            {!!product.sizes?.length && (
              <div>
                <div className="flex items-center justify-between gap-4">
                  <label className="text-xs font-semibold uppercase tracking-[0.13em] text-stone-900">
                    Select size
                  </label>
                  <span className="text-xs text-stone-500">
                    {selectedSize
                      ? `Selected: ${selectedSize}`
                      : "Please choose a size"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      aria-pressed={selectedSize === size}
                      className={`min-w-[54px] rounded-lg border px-4 py-3 text-sm font-medium transition ${
                        selectedSize === size
                          ? "border-stone-950 bg-stone-950 text-white"
                          : "border-stone-200 bg-white text-stone-800 hover:border-stone-800"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-7">
              <label className="text-xs font-semibold uppercase tracking-[0.13em] text-stone-900">
                Quantity
              </label>

              <div className="mt-3 inline-flex h-12 items-center rounded-lg border border-stone-200">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                  onClick={() =>
                    setQuantity((current) => Math.max(1, current - 1))
                  }
                  className="flex h-full w-12 items-center justify-center text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Minus size={15} />
                </button>

                <span
                  aria-live="polite"
                  className="min-w-10 text-center text-sm font-semibold"
                >
                  {quantity}
                </span>

                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={
                    product.stock !== undefined &&
                    quantity >= product.stock
                  }
                  onClick={() =>
                    setQuantity((current) =>
                      product.stock === undefined
                        ? current + 1
                        : Math.min(product.stock, current + 1)
                    )
                  }
                  className="flex h-full w-12 items-center justify-center text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <div className="mt-7 space-y-3">
              <button
                type="button"
                onClick={addToCart}
                disabled={!inStock}
              className="group flex min-h-[54px] w-full items-center justify-center gap-3 rounded-lg bg-[#123B6D] px-6 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white transition duration-300 hover:bg-[#0D2D52] disabled:cursor-not-allowed disabled:bg-gray-400">
                <ShoppingBag
                  size={17}
                  strokeWidth={1.7}
                  className="transition-transform group-hover:-translate-y-0.5"
                />
                {inStock ? "Add to shopping bag" : "Currently unavailable"}
              </button>

              <Link
                href="/"
                className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-stone-800 transition hover:border-stone-900"
              >
                Continue shopping
                <ChevronRight size={15} />
              </Link>
            </div>

            <div className="mt-7 space-y-4 border-t border-stone-200 pt-6">
              <div className="flex items-start gap-3">
                <Truck
                  size={18}
                  strokeWidth={1.5}
                  className="mt-0.5 shrink-0 text-stone-600"
                />
                <div>
                  <p className="text-xs font-semibold text-stone-900">
                    Delivery information
                  </p>
                  <p className="mt-1 text-xs leading-5 text-stone-500">
                    Shipping details and applicable charges are shown at checkout.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <RotateCcw
                  size={18}
                  strokeWidth={1.5}
                  className="mt-0.5 shrink-0 text-stone-600"
                />
                <div>
                  <p className="text-xs font-semibold text-stone-900">
                    Returns and exchanges
                  </p>
                  <p className="mt-1 text-xs leading-5 text-stone-500">
                    Please review the store&apos;s return policy before ordering.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={18}
                  strokeWidth={1.5}
                  className="mt-0.5 shrink-0 text-stone-600"
                />
                <div>
                  <p className="text-xs font-semibold text-stone-900">
                    Secure order process
                  </p>
                  <p className="mt-1 text-xs leading-5 text-stone-500">
                    Review your order details before confirming your purchase.
                  </p>
                </div>
              </div>
            </div>

            {product.sku && (
              <p className="mt-6 text-[11px] tracking-wide text-stone-400">
                SKU: {product.sku}
              </p>
            )}
          </div>
        </div>
      </section>

   
      {/* Store assurance strip */}
      <section className="border-t border-stone-200 bg-white">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-5 py-8 sm:grid-cols-3 sm:gap-8 sm:px-8 lg:px-10">
          <div className="flex items-center justify-center gap-3 sm:justify-start">
            <Truck size={20} strokeWidth={1.5} className="text-stone-600" />
            <div>
              <p className="text-xs font-semibold text-stone-900">
                Delivery information
              </p>
              <p className="mt-1 text-[11px] text-stone-500">
                Shipping details at checkout
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 sm:justify-start">
            <ShieldCheck
              size={20}
              strokeWidth={1.5}
              className="text-stone-600"
            />
            <div>
              <p className="text-xs font-semibold text-stone-900">
                Order with confidence
              </p>
              <p className="mt-1 text-[11px] text-stone-500">
                Review your order before payment
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 sm:justify-start">
            <RotateCcw
              size={20}
              strokeWidth={1.5}
              className="text-stone-600"
            />
            <div>
              <p className="text-xs font-semibold text-stone-900">
                Store policies
              </p>
              <p className="mt-1 text-[11px] text-stone-500">
                Check returns and exchanges
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
