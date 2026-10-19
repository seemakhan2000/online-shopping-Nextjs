
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  UserRound,
  ArrowRight,
} from "lucide-react";

type NavbarProps = {
  onOpenCart?: () => void;
  onShowLogin?: () => void;
};

type CartItem = {
  quantity: number;
};

type Category = {
  _id?: string;
  name: string;
};

const navigationLinks = [
  { label: "HOME", href: "/" },
  { label: "ABOUT US", href: "/about" },
  { label: "FORMALS", href: "/formal" },
  { label: "LUXURY FORMALS", href: "/luxury_formals" },
  { label: "LAWN", href: "/lawn" },
  { label: "BRIDAL", href: "/bridal" },
  { label: "BEST SELLERS", href: "/best_sellers" },
];

export default function Navbar({
  onOpenCart,
  onShowLogin,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const categoryRef = useRef<HTMLLIElement>(null);

  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  // Update cart count.
  const updateCartCount = useCallback(() => {
    try {
      const parsed: unknown = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );

      if (!Array.isArray(parsed)) {
        setCartCount(0);
        return;
      }

      const count = (parsed as CartItem[]).reduce(
        (total, item) =>
          total + Math.max(0, Number(item.quantity) || 0),
        0
      );

      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    updateCartCount();

    const handleCartUpdate = () => updateCartCount();

    window.addEventListener("storage", handleCartUpdate);
    window.addEventListener("cart-updated", handleCartUpdate);

    return () => {
      window.removeEventListener("storage", handleCartUpdate);
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  }, [updateCartCount]);

  // Load categories if required by the application.
  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const apiBaseUrl = (
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          "http://localhost:5000"
        ).replace(/\/+$/, "");

        const response = await fetch(
          `${apiBaseUrl}/api/categories`
        );

        if (!response.ok) {
          throw new Error("Unable to load categories");
        }

        const data: unknown = await response.json();

        if (!cancelled && Array.isArray(data)) {
          setCategories(data as Category[]);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error loading categories:", error);
        }
      }
    }

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  // Close category menu when clicking outside.
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setCategoriesOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // Close mobile menus when the route changes.
  useEffect(() => {
    setMenuOpen(false);
    setCategoriesOpen(false);
  }, [pathname]);

  
function triggerSearch() {
  const query = searchQuery.trim();

  if (!query) return;

  setMenuOpen(false);
  setCategoriesOpen(false);

  const params = new URLSearchParams();

  params.set("search", query);

  router.push(`${pathname}?${params.toString()}`);
}


 
function clearSearch() {
  setSearchQuery("");
  setMenuOpen(false);
  setCategoriesOpen(false);

  if (pathname !== "/") {
    router.replace(pathname, { scroll: false });
  } else {
    router.replace("/", { scroll: false });
  }
}

  function handleSearchKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      triggerSearch();
    }

    if (event.key === "Escape") {
      clearSearch();
    }
  }

  function handleCartClick() {
    if (onOpenCart) {
      onOpenCart();
    } else {
      window.dispatchEvent(new Event("open-cart"));
    }
  }

  function handleLoginClick() {
    setMenuOpen(false);

    if (onShowLogin) {
      onShowLogin();
    } else {
      window.dispatchEvent(new Event("show-login-modal"));
    }
  }

  function closeMenus() {
    setMenuOpen(false);
    setCategoriesOpen(false);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-[1030] w-full bg-white shadow-[0_3px_18px_rgba(15,23,42,0.07)]">
      {/* Announcement bar */}
      <div className="bg-[#102d50] px-3 py-2 text-center text-[10px] font-medium tracking-[1.4px] text-white sm:py-2.5 sm:text-[11px] sm:tracking-[2px]">
        FREE SHIPPING IN PAKISTAN
        <span className="mx-2 text-white/40">|</span>
        INTERNATIONAL SHIPPING AVAILABLE
      </div>

      {/* Brand, desktop search and customer actions */}
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8 lg:py-4">
          {/* Logo */}
          <Link
            href="/"
            onClick={closeMenus}
            aria-label="MY SHOPE homepage"
            className="flex min-w-0 shrink-0 items-center gap-2.5"
          >
            <Image
              src="/images/Cart-Logo.png"
              alt="MY SHOPE"
              width={300}
              height={300}
              priority
              className="h-[65px] w-[65px] shrink-0 object-contain sm:h-[80px] sm:w-[80px] lg:h-[95px] lg:w-[95px]"
            />

            <span className="whitespace-nowrap text-[12px] font-extrabold tracking-[1.5px] text-[#102d50] sm:text-xl lg:text-[22px]">
              MY SHOPE
            </span>
          </Link>

          {/* Desktop search */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              triggerSearch();
            }}
            className="relative hidden w-full max-w-[440px] flex-1 md:block lg:mx-8"
            role="search"
          >
            <div className="flex h-11 items-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 transition-all focus-within:border-[#244d79] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(36,77,121,0.08)]">
              <Search
                size={18}
                strokeWidth={1.7}
                className="ml-4 shrink-0 text-slate-400"
                aria-hidden="true"
              />

              <input
                type="text"
                id="navbar-search"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                onKeyDown={handleSearchKeyDown}
                placeholder="Search for your favourite styles..."
                aria-label="Search products"
                className="h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0"
              />

              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  title="Clear search and show all products"
                  className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200 hover:text-[#102d50]"
                >
                  <X size={16} />
                </button>
              )}

              <button
                type="submit"
                disabled={!searchQuery.trim()}
                aria-label="Search products"
                className="mr-1.5 flex h-8 w-9 shrink-0 items-center justify-center rounded-full bg-[#102d50] text-white transition hover:bg-[#1c4675] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </form>

          {/* Account and cart */}
          <div className="flex shrink-0 items-center gap-3 sm:gap-5 lg:gap-7">
            <button
              type="button"
              onClick={handleLoginClick}
              className="hidden items-center gap-2 text-slate-700 transition hover:text-[#102d50] sm:flex"
              aria-label="Login to your account"
            >
              <UserRound size={21} strokeWidth={1.6} />
              <span className="text-[11px] font-semibold tracking-[1px]">
                ACCOUNT
              </span>
            </button>

            <button
              type="button"
              onClick={handleCartClick}
              className="group relative flex items-center gap-2 text-[#102d50] transition hover:text-[#315b87]"
              aria-label={`Open shopping bag, ${cartCount} items`}
            >
              <span className="relative flex">
                <ShoppingBag
                  size={23}
                  strokeWidth={1.6}
                  aria-hidden="true"
                />

                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#102d50] px-1 text-[10px] font-bold text-white ring-2 ring-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </span>

              <span className="hidden text-[11px] font-semibold tracking-[1px] sm:inline">
                BAG
              </span>
            </button>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-[#102d50] transition hover:bg-slate-50 lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="main-navigation-links"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="px-4 pb-3 md:hidden">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              triggerSearch();
            }}
            className="flex h-10 items-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 focus-within:border-[#244d79]"
            role="search"
          >
            <Search
              size={17}
              className="ml-3 shrink-0 text-slate-400"
              aria-hidden="true"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              onKeyDown={handleSearchKeyDown}
              placeholder="Search products..."
              aria-label="Search products"
              className="h-full min-w-0 flex-1 border-0 bg-transparent px-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0"
            />

            {searchQuery.trim() && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                title="Clear search and show all products"
                className="flex h-full w-9 shrink-0 items-center justify-center text-slate-500 transition hover:bg-slate-200 hover:text-[#102d50]"
              >
                <X size={16} />
              </button>
            )}

            <button
              type="submit"
              disabled={!searchQuery.trim()}
              aria-label="Search products"
              className="flex h-full w-11 shrink-0 items-center justify-center bg-[#102d50] text-white transition hover:bg-[#1c4675] disabled:opacity-50"
            >
              <Search size={17} aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>

      {/* Main navigation */}
      <nav
        className="relative border-b border-slate-200 bg-white"
        aria-label="Main navigation"
      >
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
          <div
            id="main-navigation-links"
            className={`${
              menuOpen ? "flex" : "hidden"
            } absolute left-0 top-full max-h-[calc(100vh-100px)] w-full flex-col overflow-y-auto border-b border-slate-200 bg-white px-5 py-4 shadow-[0_12px_24px_rgba(15,23,42,0.08)] lg:static lg:flex lg:max-h-none lg:w-full lg:flex-row lg:items-center lg:justify-center lg:overflow-visible lg:border-0 lg:px-0 lg:py-0 lg:shadow-none`}
          >
            <ul className="m-0 flex list-none flex-col gap-0 p-0 lg:flex-row lg:items-center lg:justify-center lg:gap-5 xl:gap-8">
              {navigationLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname === link.href ||
                      pathname.startsWith(`${link.href}/`);

                return (
                  <li key={link.href} className="shrink-0">
                    <Link
                      href={link.href}
                      onClick={closeMenus}
                      aria-current={isActive ? "page" : undefined}
                      className={`relative block border-b border-slate-100 py-3.5 text-[12px] font-semibold tracking-[1px] no-underline transition-colors lg:border-0 lg:py-[17px] lg:text-[11px] xl:text-xs ${
                        isActive
                          ? "text-[#102d50] lg:after:absolute lg:after:inset-x-0 lg:after:bottom-0 lg:after:h-[3px] lg:after:rounded-t-full lg:after:bg-[#102d50] lg:after:content-['']"
                          : "text-slate-600 hover:text-[#102d50]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}

              {/* Login on mobile */}
              <li className="shrink-0 sm:hidden">
                <button
                  type="button"
                  onClick={handleLoginClick}
                  className="flex w-full items-center gap-2 py-3.5 text-left text-[12px] font-semibold tracking-[1px] text-slate-600 transition hover:text-[#102d50]"
                >
                  <UserRound size={17} />
                  LOGIN / ACCOUNT
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
