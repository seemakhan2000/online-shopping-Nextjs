
import type { Metadata } from "next";
import ConditionalLayout from "@/src/components/layout/ConditionalLayout";
import ToastProvider from "@/src/components/providers/ToastProvider";
import CartDrawer from "@/src/components/cart/CartDrawer";

import "./globals.css";

export const metadata: Metadata = {
  title: "MY SHOPE",
  description:
    "Shop formal wear, luxury formals, lawn and bridal collections.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
          <CartDrawer />
          
        </ToastProvider>
      </body>
    </html>
  );
}
