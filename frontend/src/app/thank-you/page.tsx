
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  Headphones,
  House,
  PackageCheck,
  ShoppingBag,
  ShieldCheck,
  Truck,
} from "lucide-react";

export const metadata = {
  title: "Thank You for Your Order | MY SHOPE",
  description:
    "Thank you for shopping with MY SHOPE. Your order has been received and will be processed shortly.",
  robots: {
    index: false,
    follow: false,
  },
};

const orderSteps = [
  {
    title: "Order received",
    description: "Your order has been submitted successfully.",
    icon: CheckCircle2,
    completed: true,
  },
  {
    title: "Order processing",
    description: "Our team will review and prepare your order.",
    icon: PackageCheck,
    completed: false,
  },
  {
    title: "Delivery",
    description: "Your order will be delivered to your address.",
    icon: Truck,
    completed: false,
  },
];

export default function ThankYouPage() {
  return (
    <main className="relative flex mt-[150px] min-h-screen flex-col overflow-hidden bg-[#f7f9fc] text-slate-900">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-emerald-100/60 blur-3xl"
      />

      {/* Header */}
      <header className="relative z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            aria-label="MY SHOPE home"
            className="flex items-center gap-3"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#102d50] text-white shadow-sm">
              <ShoppingBag size={23} />
            </span>

            <span className="text-lg font-extrabold tracking-[0.12em] text-[#102d50]">
              MY SHOPE
            </span>
          </Link>

          <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
            <ShieldCheck size={18} className="text-emerald-600" />
            Secure shopping experience
          </div>
        </div>
      </header>

      {/* Main content */}
      <section className="relative z-10 flex flex-1 items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
        <div className="w-full max-w-3xl">
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_20px_70px_-30px_rgba(15,23,42,0.18)]">
            {/* Success banner */}
            <div className="relative overflow-hidden bg-[#102d50] px-6 py-10 text-center sm:px-12 sm:py-14">
              <div
                aria-hidden="true"
                className="absolute -right-16 -top-20 h-56 w-56 rounded-full border border-white/10"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-28 -left-12 h-64 w-64 rounded-full border border-white/10"
              />

              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-inner sm:h-24 sm:w-24">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400 text-white shadow-lg shadow-emerald-950/20 sm:h-16 sm:w-16">
                  <Check size={35} strokeWidth={3} />
                </div>
              </div>

              <p className="relative mt-6 text-xs font-bold uppercase tracking-[0.25em] text-emerald-300">
                Order confirmation
              </p>

              <h1 className="relative mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
                Thank You!
              </h1>

              <p className="relative mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-200 sm:text-base">
                Thank you for shopping with MY SHOPE. Your order
                has been received successfully, and we appreciate
                your trust in us.
              </p>

              <div className="relative mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200">
                <CheckCircle2 size={17} />
                Order submitted successfully
              </div>
            </div>

            {/* Order information */}
            <div className="px-6 py-8 sm:px-10 sm:py-10">
              <div className="text-center">
                <h2 className="text-xl font-bold sm:text-2xl">
                  What happens next?
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Here is what you can expect after placing your order.
                </p>
              </div>

              <div className="mt-8 space-y-6">
                {orderSteps.map((step, index) => {
                  const Icon = step.icon;

                  return (
                    <div key={step.title} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                            step.completed
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Icon size={21} />
                        </div>

                        {index !== orderSteps.length - 1 && (
                          <div className="mt-2 min-h-6 w-px flex-1 bg-slate-200" />
                        )}
                      </div>

                      <div className="pb-4">
                        <h3 className="font-semibold text-slate-900">
                          {step.title}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Customer support */}
              <div className="mt-4 flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#102d50] shadow-sm">
                  <Headphones size={22} />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Need assistance?
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    If you have any questions about your order,
                    please contact our customer support team.
                  </p>
                  <Link
                    href="/contact"
                    className="mt-2 inline-flex items-center text-sm font-semibold text-[#102d50] underline-offset-4 hover:underline"
                  >
                    Contact support
                  </Link>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Link
                  href="/"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#102d50] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1c4675] focus:outline-none focus:ring-4 focus:ring-blue-200"
                >
                  <House size={18} />
                  Return to home
                </Link>

                <Link
                  href="/"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#102d50] hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
                >
                  <ShoppingBag size={18} />
                  Continue shopping
                </Link>
              </div>

              <p className="mt-6 text-center text-xs leading-5 text-slate-400">
                Thank you for choosing MY SHOPE. We look forward
                to serving you again.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 bg-white px-5 py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
          <p>
         © 2026 MY SHOPE. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            <ShieldCheck size={15} />
            Your shopping experience matters to us.
          </p>
        </div>
      </footer>
    </main>
  );
}
