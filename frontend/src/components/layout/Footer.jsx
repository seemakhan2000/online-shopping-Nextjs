"use client";

import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaCcVisa,
  FaCcMastercard,
  FaCcPaypal,
  FaTruck,
  FaUndo,
  FaLock,
  FaHeadset,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0a1f44] text-gray-300">
      {/* ===== Top Features Bar ===== */}
      <div className="border-b border-blue-900">
        <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <Feature icon={<FaTruck />} title="Free Shipping" desc="Orders over $99" />
          <Feature icon={<FaUndo />} title="Easy Returns" desc="30 days return" />
          <Feature icon={<FaLock />} title="Secure Payment" desc="100% protected" />
          <Feature icon={<FaHeadset />} title="24/7 Support" desc="Always here" />
        </div>
      </div>

      {/* ===== Main Footer ===== */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand / Newsletter */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-white mb-3">
            Shop<span className="text-blue-400">Verse</span>
          </h2>
          <p className="text-sm leading-relaxed mb-5">
            Your one-stop destination for premium products at unbeatable prices.
            Fast delivery, trusted quality, and a shopping experience you'll love.
          </p>

          <p className="text-white font-semibold mb-2 text-sm">Subscribe to our newsletter</p>
          <form className="flex items-center bg-[#112b5c] rounded-lg overflow-hidden max-w-sm">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-gray-400 outline-none"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 transition px-5 py-3 text-sm font-semibold text-white"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Shop Links */}
        <FooterCol
          title="Shop"
          links={["New Arrivals", "Best Sellers", "Men", "Women", "Sale"]}
        />

        {/* Help */}
        <FooterCol
          title="Customer Care"
          links={["My Account", "Track Order", "Shipping Info", "Returns", "FAQ"]}
        />

        {/* Contact + Social */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-base">Contact Us</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <FaMapMarkerAlt className="text-blue-400 mt-1 shrink-0" />
              <span>123 Commerce Street, Karachi, Pakistan</span>
            </li>
            <li className="flex items-center gap-3">
              <FaPhoneAlt className="text-blue-400 shrink-0" />
              <span>+92 3348436065</span>
            </li>
            <li className="flex items-center gap-3">
              <FaEnvelope className="text-blue-400 shrink-0" />
              <span>seemakhan36065@gmail.com</span>
            </li>
          </ul>

          <div className="flex gap-3 mt-5">
            <Social icon={<FaFacebookF />} href="#" />
            <Social icon={<FaInstagram />} href="#" />
            <Social icon={<FaTwitter />} href="#" />
            <Social icon={<FaYoutube />} href="#" />
          </div>
        </div>
      </div>

      {/* ===== Bottom Bar ===== */}
      <div className="border-t border-blue-900">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © {year} <span className="text-white font-semibold">ShopVerse</span>. All rights reserved.
          </p>

          <div className="flex gap-4 text-xs">
            <Link href="/privacy" className="hover:text-blue-400 transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-blue-400 transition">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-blue-400 transition">Cookies</Link>
          </div>

          <div className="flex items-center gap-3 text-2xl text-gray-400">
            <FaCcVisa className="hover:text-blue-400 transition" />
            <FaCcMastercard className="hover:text-blue-400 transition" />
            <FaCcPaypal className="hover:text-blue-400 transition" />
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Helper Components ---------- */

function Feature({ icon, title, desc }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-blue-400 text-2xl">{icon}</div>
      <div>
        <p className="text-white text-sm font-semibold">{title}</p>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
    </div>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h3 className="text-white font-semibold mb-4 text-base">{title}</h3>
      <ul className="space-y-2 text-sm">
        {links.map((l) => (
          <li key={l}>
            <Link
              href="#"
              className="hover:text-blue-400 hover:translate-x-1 inline-block transition"
            >
              {l}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Social({ icon, href }) {
  return (
    <a
      href={href}
      className="w-9 h-9 flex items-center justify-center rounded-full bg-[#112b5c] text-gray-300 hover:bg-blue-500 hover:text-white transition"
    >
      {icon}
    </a>
  );
}