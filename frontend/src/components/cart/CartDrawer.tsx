
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  X,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
).replace(/\/+$/, "");

function readCart(): CartItem[] {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem("cart") || "[]"
    );

    return Array.isArray(value) ? value as CartItem[] : [];
  } catch {
    return [];
  }
}

function resolveImage(image?: string) {
  if (!image) return "";

  if (
    image.startsWith("data:image") ||
    image.startsWith("https://") ||
    image.startsWith("http://")
  ) {
    return image;
  }

  const cleanPath = image.replace(/^\/+/, "");
  const base = API_BASE_URL.replace(/\/api\/?$/, "");

  if (
    cleanPath.startsWith("uploads/") ||
    cleanPath.startsWith("upload/")
  ) {
    return `${base}/${cleanPath}`;
  }

  return `${base}/uploads/${cleanPath}`;
}

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    function syncCart() {
      setCart(readCart());
    }

    function openCart() {
      syncCart();
      setIsOpen(true);
    }

    function closeCart() {
      setIsOpen(false);
    }

    window.addEventListener("open-cart", openCart);
    window.addEventListener("cart-updated", syncCart);
    window.addEventListener("storage", syncCart);
    window.addEventListener("close-cart", closeCart);

    syncCart();

    return () => {
      window.removeEventListener("open-cart", openCart);
      window.removeEventListener("cart-updated", syncCart);
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("close-cart", closeCart);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function saveCart(nextCart: CartItem[]) {
    localStorage.setItem("cart", JSON.stringify(nextCart));
    setCart(nextCart);
    window.dispatchEvent(new Event("cart-updated"));
  }

  function updateQuantity(index: number, change: number) {
    const nextCart = [...cart];
    const item = nextCart[index];

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
      nextCart.splice(index, 1);
    }

    saveCart(nextCart);
  }

  function removeItem(index: number) {
    saveCart(cart.filter((_, itemIndex) => itemIndex !== index));
  }

  const total = cart.reduce(
    (sum, item) =>
      sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[1090] bg-slate-950/45 backdrop-blur-[2px]"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        role="dialog"
        aria-modal={isOpen ? "true" : undefined}
        aria-label="Shopping cart"
        aria-hidden={!isOpen}
        className={`fixed right-0 top-0 z-[1100] flex h-dvh w-full max-w-[440px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-[#102d50]">
              Your Shopping Bag
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {cart.reduce(
                (sum, item) => sum + Math.max(0, item.quantity || 0),
                0
              )}{" "}
              item(s) in your bag
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close shopping cart"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {cart.length === 0 ? (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-[#102d50]">
                <ShoppingBag size={34} strokeWidth={1.4} />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-slate-800">
                Your bag is empty
              </h3>

              <p className="mt-2 max-w-[260px] text-sm leading-6 text-slate-500">
                Discover your favourite styles and add something you love.
              </p>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#102d50] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1c4675]"
              >
                Continue shopping
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {cart.map((item, index) => {
                const imageSrc = resolveImage(item.image);

                return (
                  <div
                    key={`${item.productId}-${index}`}
                    className="flex gap-4 border-b border-slate-100 pb-5"
                  >
                    <div className="relative h-[125px] w-[95px] shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {imageSrc ? (
                        <Image
                          src={imageSrc}
                          alt={item.name}
                          fill
                          unoptimized
                          sizes="95px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">
                          <ShoppingBag size={24} />
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-800">
                          {item.name}
                        </h3>

                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          aria-label={`Remove ${item.name}`}
                          className="shrink-0 text-slate-400 transition hover:text-red-600"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>

                      <p className="mt-2 text-sm font-bold text-[#102d50]">
                        Rs. {(Number(item.price) || 0).toLocaleString()}
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="flex items-center rounded-full border border-slate-200">
                          <button
                            type="button"
                            onClick={() => updateQuantity(index, -1)}
                            aria-label="Decrease quantity"
                            className="flex h-8 w-8 items-center justify-center text-slate-600 hover:text-[#102d50]"
                          >
                            <Minus size={14} />
                          </button>

                          <span className="min-w-7 text-center text-sm font-semibold text-slate-800">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => updateQuantity(index, 1)}
                            aria-label="Increase quantity"
                            className="flex h-8 w-8 items-center justify-center text-slate-600 hover:text-[#102d50]"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <span className="text-sm font-semibold text-slate-800">
                          Rs. {(
                            (Number(item.price) || 0) *
                            (Number(item.quantity) || 0)
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-slate-200 bg-white px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Subtotal
              </span>

              <span className="text-lg font-bold text-[#102d50]">
                Rs. {total.toLocaleString()}
              </span>
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Shipping and any applicable charges are calculated at checkout.
            </p>

<button
  type="button"
  onClick={() => {
    setIsOpen(false);
    window.location.href = "/checkout";
  }}
  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#102d50] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1c4675]"
>
  Proceed to checkout
  <ArrowRight size={17} />
</button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-3 w-full py-2 text-sm font-medium text-slate-600 transition hover:text-[#102d50]"
            >
              Continue shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
