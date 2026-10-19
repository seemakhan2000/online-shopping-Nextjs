"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PackagePlus,
  ShoppingCart,
  Clock3,
  CheckCircle2,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

type AdminNavbarProps = {
  onLogout: () => void;
};

const links = [
  {
    label: "Add Product",
    href: "/addProduct",
    icon: PackagePlus,
  },
  {
    label: "All Orders",
    href: "/viewOrder",
    icon: ShoppingCart,
  },
  {
    label: "Pending Orders",
    href: "/viewPending",
    icon: Clock3,
  },
  {
    label: "Confirmed Orders",
    href: "/viewConfirmed",
    icon: CheckCircle2,
  },
];

export default function AdminNavbar({ onLogout }: AdminNavbarProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex min-h-[76px] max-w-[1600px] items-center gap-10 px-6 py-3 lg:px-10">
        {/* Admin Logo */}
        <Link
          href="/addProduct"
          className="flex shrink-0 items-center gap-3"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#123B6D] text-white shadow-sm">
            <LayoutDashboard size={23} strokeWidth={2} />
          </span>

          <span className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-[#123B6D]">
              MyShop
            </span>
            <span className="text-xs font-medium tracking-wide text-slate-500">
              ADMIN PANEL
            </span>
          </span>
        </Link>

        {/* Navigation Items */}
        <div className="flex flex-1 items-center justify-start gap-2 overflow-x-auto">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex shrink-0 items-center gap-2.5 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                 isActive
  ? "bg-gray-100 text-black shadow-sm"
  : "text-slate-600 hover:bg-gray-100 hover:text-black"
                }`}
              >
                <Icon size={18} strokeWidth={2} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={onLogout}
          className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}