"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  LockKeyhole,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Wallet,
} from "lucide-react";

import { useToast } from "@/src/components/providers/ToastProvider";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const PAYMENT_METHODS = [
  {
    value: "Cash on Delivery",
    label: "Cash on Delivery",
    description: "Pay when your order arrives.",
    icon: Wallet,
  },
  {
    value: "Debit or Credit Card",
    label: "Debit or Credit Card",
    description: "Pay using a supported card gateway.",
    icon: CreditCard,
  },
  {
    value: "Bank Transfer",
    label: "Bank Transfer",
    description: "Receive payment instructions after ordering.",
    icon: Package,
  },
] as const;

type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

type CartItem = {
  _id?: string;
  id?: string;
  productId?: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  size?: string;
};

type FormFields = {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  phone: string;
};

type Address = {
  name: string;
  phone: string;
  street: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  zip: string;
  postalCode: string;
  country: string;
};

const initialForm: FormFields = {
  email: "",
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  zip: "",
  country: "Pakistan",
  phone: "",
};

const countries = [
  "Pakistan",
  "United States",
  "United Kingdom",
  "United Arab Emirates",
  "Saudi Arabia",
  "Canada",
  "Australia",
];

function getImageUrl(image?: string): string {
  if (!image) return "";

  if (
    image.startsWith("data:image/") ||
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  const cleanPath = image.replace(/^\/+/, "");

  if (cleanPath.startsWith("uploads/") || cleanPath.startsWith("upload/")) {
    return `${API_BASE_URL}/${cleanPath}`;
  }

  return `${API_BASE_URL}/uploads/${cleanPath}`;
}

function formatPrice(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-PK", {
    maximumFractionDigits: 2,
  })}`;
}

function readCart(): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem("cart") || "[]"
    );

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is CartItem =>
        item !== null &&
        typeof item === "object" &&
        typeof item.name === "string" &&
        Number.isFinite(Number(item.price)) &&
        Number(item.price) >= 0 &&
        Number.isFinite(Number(item.quantity)) &&
        Number(item.quantity) > 0
    );
  } catch {
    return [];
  }
}

function validateAddress(data: FormFields): string | null {
  if (!data.firstName.trim()) return "Please enter your first name.";
  if (!data.address.trim()) return "Please enter your street address.";
  if (!data.city.trim()) return "Please enter your city.";
  if (!data.phone.trim()) return "Please enter your phone number.";
  if (!data.country.trim()) return "Please select your country.";

  return null;
}

function buildAddress(data: FormFields): Address {
  const name = `${data.firstName} ${data.lastName}`.trim();
  const street = data.address.trim();

  return {
    name,
    phone: data.phone.trim(),
    street,
    addressLine1: street,
    addressLine2: "",
    city: data.city.trim(),
    zip: data.zip.trim(),
    postalCode: data.zip.trim(),
    country: data.country,
  };
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-[13px] font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-rose-600">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "checkout-input block w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#173b63] focus:ring-4 focus:ring-[#173b63]/10";

export default function CheckoutPage() {
  const router = useRouter();
  const { showSuccess, showError, showWarning } = useToast();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [form, setForm] = useState<FormFields>(initialForm);
  const [billing, setBilling] = useState<FormFields>(initialForm);
  const [differentBilling, setDifferentBilling] = useState(false);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("Cash on Delivery");
  const [loading, setLoading] = useState(false);
  const [currentYear, setCurrentYear] = useState(2026);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    setCart(readCart());

    const syncCart = () => setCart(readCart());

    window.addEventListener("cart-updated", syncCart);
    window.addEventListener("storage", syncCart);

    return () => {
      window.removeEventListener("cart-updated", syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total +
          Math.max(0, Number(item.price) || 0) *
            Math.max(0, Number(item.quantity) || 0),
        0
      ),
    [cart]
  );

  const itemCount = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + Math.max(0, Number(item.quantity) || 0),
        0
      ),
    [cart]
  );

  function updateForm(
    field: keyof FormFields,
    value: string,
    isBilling = false
  ) {
    if (isBilling) {
      setBilling((previous) => ({ ...previous, [field]: value }));
    } else {
      setForm((previous) => ({ ...previous, [field]: value }));
    }
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    if (cart.length === 0) {
      showWarning("Your shopping bag is empty. Add a product before checkout.");
      return;
    }

    const shippingError = validateAddress(form);

    if (shippingError) {
      showWarning(shippingError);
      return;
    }

    if (differentBilling) {
      const billingError = validateAddress(billing);

      if (billingError) {
        showWarning(`Billing address: ${billingError}`);
        return;
      }
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
      !/^[+\d][\d\s()-]{6,}$/.test(form.email.trim())
    ) {
      showWarning("Please enter a valid email address or phone number.");
      return;
    }

    const shippingAddress = buildAddress(form);
    const billingAddress = buildAddress(
      differentBilling ? billing : form
    );

    const orderData = {
      userId: null,
      email: form.email.trim(),
      items: cart.map((item) => ({
        productId: item.productId || item._id || item.id,
        name: item.name,
        image: item.image,
        price: Number(item.price),
        quantity: Number(item.quantity),
        size: item.size,
      })),
      shippingAddress,
      billingAddress,
      totalAmount: subtotal,
      paymentMethod,
    };

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(orderData),
      });

      const responseText = await response.text();

      let result: {
        message?: string;
        error?: string;
      } = {};

      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch {
        result = { message: responseText };
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error ||
            "Unable to place your order. Please try again."
        );
      }

      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cart-updated"));

      showSuccess("Order placed successfully!");
      router.push("/thank-you");
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while placing your order."
      );
    } finally {
      setLoading(false);
    }
  }

  function renderAddressFields(data: FormFields, isBilling = false) {
    return (
      <div className="space-y-4">
        <Field label="Country / Region" required>
          <div className="relative">
            <select
              value={data.country}
              onChange={(event) =>
                updateForm("country", event.target.value, isBilling)
              }
              className={`${inputClass} appearance-none pr-10`}
              autoComplete="country-name"
            >
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="First name" required>
            <input
              required
              autoComplete={
                isBilling ? "billing given-name" : "shipping given-name"
              }
              value={data.firstName}
              onChange={(event) =>
                updateForm("firstName", event.target.value, isBilling)
              }
              placeholder="First name"
              className={inputClass}
            />
          </Field>

          <Field label="Last name">
            <input
              autoComplete={
                isBilling ? "billing family-name" : "shipping family-name"
              }
              value={data.lastName}
              onChange={(event) =>
                updateForm("lastName", event.target.value, isBilling)
              }
              placeholder="Last name"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Street address" required>
          <input
            required
            autoComplete={
              isBilling ? "billing street-address" : "shipping street-address"
            }
            value={data.address}
            onChange={(event) =>
              updateForm("address", event.target.value, isBilling)
            }
            placeholder="House number and street name"
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Town / City" required>
            <input
              required
              autoComplete={
                isBilling ? "billing address-level2" : "shipping address-level2"
              }
              value={data.city}
              onChange={(event) =>
                updateForm("city", event.target.value, isBilling)
              }
              placeholder="Enter your city"
              className={inputClass}
            />
          </Field>

          <Field label="Postal code">
            <input
              autoComplete={
                isBilling ? "billing postal-code" : "shipping postal-code"
              }
              value={data.zip}
              onChange={(event) =>
                updateForm("zip", event.target.value, isBilling)
              }
              placeholder="Optional"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Phone number" required>
          <input
            required
            type="tel"
            autoComplete={isBilling ? "billing tel" : "shipping tel"}
            value={data.phone}
            onChange={(event) =>
              updateForm("phone", event.target.value, isBilling)
            }
            placeholder="+92 300 1234567"
            className={inputClass}
          />
        </Field>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
      {/* Store announcement */}
      <div className="bg-[#102d50] px-4 py-2.5 text-center text-[10px] font-medium uppercase tracking-[0.16em] text-white sm:text-xs">
        Discover your style · Shop MY SHOPE
      </div>

      {/* Checkout header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-10">
          <Link
            href="/"
            aria-label="MY SHOPE homepage"
            className="flex shrink-0 items-center gap-2.5"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102d50] text-white">
              <ShoppingBag size={21} strokeWidth={1.7} />
            </span>
            <span>
              <span className="block text-base font-bold tracking-[0.1em] text-[#102d50] sm:text-lg">
                MY SHOPE
              </span>
              <span className="hidden text-[9px] font-medium uppercase tracking-[0.24em] text-slate-400 sm:block">
                Style for every day
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-2 text-xs font-medium text-slate-500 sm:flex">
            <LockKeyhole size={15} className="text-[#102d50]" />
            Secure checkout
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-[#102d50] hover:text-[#102d50] sm:gap-2 sm:px-4 sm:text-sm"
          >
            <ArrowLeft size={15} />
            <span>Continue shopping</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
        {/* Breadcrumb and title */}
        <div className="mb-8 lg:mb-10">
          <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="transition hover:text-[#102d50]">
              Home
            </Link>
            <span>/</span>
            <span className="font-medium text-slate-800">Checkout</span>
          </div>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#56708e]">
                Almost yours
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-[42px]">
                Complete your order
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                Add your delivery details, choose a payment method and review
                your order before submitting.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-3.5 py-2.5 md:self-auto">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#102d50] text-white">
                <LockKeyhole size={12} />
              </span>
              <span className="text-xs font-medium text-slate-600">
                Private checkout
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={submitOrder} noValidate>
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_460px]">
            {/* Main checkout form */}
            <div className="min-w-0 space-y-5">
              {/* Contact */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_3px_18px_rgba(15,23,42,0.025)] sm:p-7 lg:p-8">
                <div className="mb-6 flex items-start gap-3.5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf2f8] text-[#102d50]">
                    <MapPin size={20} strokeWidth={1.7} />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Step 01
                    </p>
                    <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
                      Contact information
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      How we can reach you about your order.
                    </p>
                  </div>
                </div>

                <Field label="Email or mobile number">
                  <input
                    type="text"
                    autoComplete="email"
                    inputMode="email"
                    value={form.email}
                    onChange={(event) =>
                      updateForm("email", event.target.value)
                    }
                    placeholder="you@example.com or phone number"
                    className={inputClass}
                  />
                </Field>
                <p className="mt-2 text-[11px] leading-5 text-slate-400">
                  Leave this blank if you do not want to provide contact details
                  here. Your phone number below is required for delivery.
                </p>
              </section>

              {/* Delivery */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_3px_18px_rgba(15,23,42,0.025)] sm:p-7 lg:p-8">
                <div className="mb-7 flex items-start gap-3.5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf2f8] text-[#102d50]">
                    <Truck size={21} strokeWidth={1.7} />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Step 02
                    </p>
                    <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
                      Delivery address
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Enter the address where you want your order delivered.
                    </p>
                  </div>
                </div>

                {renderAddressFields(form)}

                <div className="mt-7 rounded-xl border border-slate-200 bg-[#f8fafc] p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#102d50]">
                      <Truck size={19} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          Standard shipping
                        </p>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                          Free
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Shipping is shown as free in this checkout. Make sure
                        your store&apos;s actual shipping policy matches this
                        setting.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_3px_18px_rgba(15,23,42,0.025)] sm:p-7 lg:p-8">
                <div className="mb-6 flex items-start gap-3.5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf2f8] text-[#102d50]">
                    <CreditCard size={21} strokeWidth={1.7} />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Step 03
                    </p>
                    <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
                      Payment method
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Choose your preferred payment option.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {PAYMENT_METHODS.map((option) => {
                    const Icon = option.icon;
                    const selected = paymentMethod === option.value;

                    return (
                      <label
                        key={option.value}
                        className={`flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition sm:p-5 ${
                          selected
                            ? "border-[#173b63] bg-[#f3f7fb] ring-1 ring-[#173b63]/10"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={option.value}
                          checked={selected}
                          onChange={() => setPaymentMethod(option.value)}
                          className="mt-1 h-4 w-4 shrink-0 accent-[#102d50]"
                        />

                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                            selected
                              ? "bg-[#102d50] text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <Icon size={19} strokeWidth={1.7} />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
                            {option.label}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-slate-500">
                            {option.description}
                          </span>
                        </span>

                        {selected && (
                          <CheckCircle2
                            size={19}
                            className="mt-0.5 shrink-0 text-[#173b63]"
                          />
                        )}
                      </label>
                    );
                  })}
                </div>

                {paymentMethod === "Cash on Delivery" && (
                  <div className="mt-4 rounded-lg bg-slate-50 p-4 text-xs leading-6 text-slate-600">
                    <p className="font-semibold text-slate-800">
                      Cash on Delivery
                    </p>
                    Pay according to the store&apos;s delivery and collection
                    policy when your order arrives.
                  </div>
                )}

                {paymentMethod === "Bank Transfer" && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-900">
                    Bank instructions should be supplied by your backend or
                    store representative. Do not transfer money until you
                    receive verified payment details.
                  </div>
                )}

                {paymentMethod === "Debit or Credit Card" && (
                  <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4 text-xs leading-6 text-blue-900">
                    Card processing requires a configured payment gateway.
                    Selecting this option does not itself collect card details
                    or charge a card.
                  </div>
                )}
              </section>

              {/* Billing */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_3px_18px_rgba(15,23,42,0.025)] sm:p-7 lg:p-8">
                <div className="mb-5 flex items-start gap-3.5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf2f8] text-[#102d50]">
                    <Package size={20} strokeWidth={1.7} />
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                      Billing address
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Choose the address associated with your order.
                    </p>
                  </div>
                </div>

                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                    !differentBilling
                      ? "border-[#173b63] bg-[#f3f7fb]"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="billingAddress"
                    checked={!differentBilling}
                    onChange={() => setDifferentBilling(false)}
                    className="mt-1 h-4 w-4 accent-[#102d50]"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">
                      Same as delivery address
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      Use the delivery information entered above.
                    </span>
                  </span>
                </label>

                <label
                  className={`mt-3 flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                    differentBilling
                      ? "border-[#173b63] bg-[#f3f7fb]"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="billingAddress"
                    checked={differentBilling}
                    onChange={() => setDifferentBilling(true)}
                    className="mt-1 h-4 w-4 accent-[#102d50]"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">
                      Use a different billing address
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      Enter separate billing details below.
                    </span>
                  </span>
                </label>

                {differentBilling && (
                  <div className="mt-6 border-t border-slate-100 pt-6">
                    {renderAddressFields(billing, true)}
                  </div>
                )}
              </section>

              {/* Submit button for desktop */}
              <div className="hidden lg:block">
                <button
                  type="submit"
                  disabled={loading || cart.length === 0}
                  className="group flex w-full items-center justify-center gap-3 rounded-xl bg-[#102d50] px-6 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#193f68] focus:outline-none focus:ring-4 focus:ring-[#102d50]/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Placing your order...
                    </>
                  ) : (
                    <>
                      Complete order
                      <ArrowRight
                        size={17}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>

                <p className="mt-3 flex items-center justify-center gap-2 text-[11px] leading-5 text-slate-400">
                  <LockKeyhole size={13} />
                  Please verify your details before submitting your order.
                </p>
              </div>
            </div>

            {/* Order summary */}
            <aside className="min-w-0 lg:sticky lg:top-6">
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_3px_18px_rgba(15,23,42,0.035)]">
                <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Your purchase
                      </p>
                      <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-950">
                        Order summary
                      </h2>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf2f8] text-[#102d50]">
                      <ShoppingBag size={19} />
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-slate-500">
                    {itemCount} {itemCount === 1 ? "item" : "items"} in your bag
                  </p>
                </div>

                {cart.length === 0 ? (
                  <div className="px-5 py-10 text-center sm:px-6">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <ShoppingBag size={25} />
                    </span>
                    <h3 className="mt-4 text-base font-semibold text-slate-900">
                      Your bag is empty
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Browse the collection and add a product to continue.
                    </p>
                    <Link
                      href="/"
                      className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#102d50] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#193f68]"
                    >
                      Browse products
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="max-h-[420px] space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
                      {cart.map((item, index) => {
                        const imageUrl = getImageUrl(item.image);

                        return (
                          <div
                            key={`${item.productId || item._id || item.id || item.name}-${item.size || "default"}-${index}`}
                            className="flex gap-3.5"
                          >
                            <div className="relative h-[88px] w-[72px] shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                              {imageUrl ? (
                                <Image
                                  src={imageUrl}
                                  alt={item.name}
                                  fill
                                  sizes="72px"
                                  unoptimized
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-slate-300">
                                  <ShoppingBag size={22} />
                                </div>
                              )}

                              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-bl-md bg-[#102d50] px-1 text-[10px] font-semibold text-white">
                                {item.quantity}
                              </span>
                            </div>

                            <div className="min-w-0 flex-1 pt-0.5">
                              <p className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900">
                                {item.name}
                              </p>
                              <p className="mt-1.5 text-xs text-slate-500">
                                Size: {item.size || "Not specified"}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                Qty: {item.quantity}
                              </p>
                            </div>

                            <p className="shrink-0 pt-0.5 text-right text-xs font-semibold text-slate-900 sm:text-sm">
                              {formatPrice(
                                (Number(item.price) || 0) *
                                  (Number(item.quantity) || 0)
                              )}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-slate-200 px-5 py-5 sm:px-6">
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between gap-4 text-sm">
                          <span className="text-slate-500">Subtotal</span>
                          <span className="font-medium text-slate-900">
                            {formatPrice(subtotal)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-4 text-sm">
                          <span className="text-slate-500">Shipping</span>
                          <span className="font-semibold text-emerald-700">
                            Free
                          </span>
                        </div>
                      </div>

                      <div className="my-5 border-t border-dashed border-slate-200" />

                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-base font-semibold text-slate-950">
                            Total
                          </p>
                          <p className="mt-1 text-[10px] text-slate-400">
                            Currency: PKR
                          </p>
                        </div>
                        <p className="text-2xl font-bold tracking-tight text-[#102d50]">
                          {formatPrice(subtotal)}
                        </p>
                      </div>

                      <div className="mt-5 rounded-xl bg-[#f5f7fa] p-4">
                        <div className="flex items-start gap-3">
                          <ShieldCheck
                            size={19}
                            className="mt-0.5 shrink-0 text-[#102d50]"
                          />
                          <div>
                            <p className="text-xs font-semibold text-slate-800">
                              Your order, clearly summarized
                            </p>
                            <p className="mt-1 text-[11px] leading-5 text-slate-500">
                              Review your products, quantities and delivery
                              details before placing the order.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400">
                        <LockKeyhole size={12} />
                        Checkout information
                      </div>
                    </div>
                  </>
                )}
              </section>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                  <Truck size={18} className="text-[#102d50]" />
                  <p className="mt-2 text-xs font-semibold text-slate-800">
                    Delivery details
                  </p>
                  <p className="mt-1 text-[10px] leading-4 text-slate-500">
                    Enter an accurate address and phone number.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                  <CheckCircle2 size={18} className="text-[#102d50]" />
                  <p className="mt-2 text-xs font-semibold text-slate-800">
                    Review before submit
                  </p>
                  <p className="mt-1 text-[10px] leading-4 text-slate-500">
                    Confirm your selection before ordering.
                  </p>
                </div>
              </div>
            </aside>

            {/* Submit button for mobile and tablet */}
            <div className="lg:hidden">
              <button
                type="submit"
                disabled={loading || cart.length === 0}
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-[#102d50] px-6 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#193f68] focus:outline-none focus:ring-4 focus:ring-[#102d50]/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Placing your order...
                  </>
                ) : (
                  <>
                    Complete order
                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
              <p className="mt-3 flex items-center justify-center gap-2 text-[11px] leading-5 text-slate-400">
                <LockKeyhole size={13} />
                Please verify your details before submitting your order.
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* Footer */}
      <footer className="mt-6 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-3 px-4 py-6 text-center sm:flex-row sm:px-6 sm:text-left lg:px-10">
          <Link
            href="/"
            className="text-sm font-bold tracking-[0.12em] text-[#102d50]"
          >
            MY SHOPE
          </Link>
          <p className="text-[11px] text-slate-400">
            © {currentYear} MY SHOPE. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <LockKeyhole size={12} />
            Checkout
          </p>
        </div>
      </footer>

      <style jsx global>{`
        .checkout-input {
          min-height: 47px;
        }

        .checkout-input:focus-visible {
          outline: none;
        }

        select.checkout-input {
          cursor: pointer;
        }

        input[type="radio"],
        input[type="checkbox"] {
          accent-color: #102d50;
        }
      `}</style>
    </main>
  );
}