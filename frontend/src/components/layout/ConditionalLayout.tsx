"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/components/layout/Footer";
import AdminNavbar from "@/src/components/layout/AdminNavbar";
import AdminLoginModal from "@/src/components/auth/AdminLoginModal";

 
const ADMIN_ROUTES = [
  "/addProduct",
  "/viewOrder",
  "/viewPending",
  "/viewConfirmed",
  "/admin/orders",
  "/admin/orders/pending",
  "/admin/orders/confirmed",
] as const;

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const isAdminPage = ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  useEffect(() => {
    function handleShowLogin() {
      setIsLoginOpen(true);
    }
    window.addEventListener("show-login-modal", handleShowLogin);
    return () => {
      window.removeEventListener("show-login-modal", handleShowLogin);
    };
  }, []);

  function logout() {
    localStorage.removeItem("adminLoginTime");
    router.replace("/");
  }

  return (
    <>
      {isAdminPage ? (
        <AdminNavbar onLogout={logout} />
      ) : (
        <Navbar />
      )}

      {children}

      {!isAdminPage && (
        <>
          <Footer />
          <AdminLoginModal
            isOpen={isLoginOpen}
            onClose={() => setIsLoginOpen(false)}
          />
        </>
      )}
    </>
  );
}