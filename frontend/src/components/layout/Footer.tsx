"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ReactNode, FormEvent } from "react";
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

type FeatureProps = {
  icon: ReactNode;
  title: string;
  desc: string;
};

type FooterColProps = {
  title: string;
  links: string[];
};

type SocialProps = {
  icon: ReactNode;
  href: string;
  label: string;
};

export default function Footer() {
  const [year, setYear] = useState("2026");

  useEffect(() => {
    setYear(String(new Date().getFullYear()));
  }, []);

  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <footer className="bg-[#0a1f44] text-gray-300">
      {/* Top Features Bar */}
      <div className="border-b border-blue-900">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-6 md:grid-cols-4">
          <Feature
            icon={<FaTruck />}
            title="Free Shipping"
            desc="Orders over $99"
          />
          <Feature
            icon={<FaUndo />}
            title="Easy Returns"
            desc="30 days return"
          />
          <Feature
            icon={<FaLock />}
            title="Secure Payment"
            desc="100% protected"
          />
          <Feature
            icon={<FaHeadset />}
            title="24/7 Support"
            desc="Always here"
          />
        </div>
      </div>

      {/* Main Footer */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-14 md:grid-cols-2 lg:grid-cols-5">
        {/* Brand and Newsletter */}
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-2xl font-bold text-white">
            Shop<span className="text-blue-400">Verse</span>
          </h2>

          <p className="mb-5 text-sm leading-relaxed">
            Your one-stop destination for premium products at unbeatable
            prices. Fast delivery, trusted quality, and a shopping experience
            you&apos;ll love.
          </p>

          <p className="mb-2 text-sm font-semibold text-white">
            Subscribe to our newsletter
          </p>

          <form
            onSubmit={handleNewsletterSubmit}
            className="flex max-w-sm items-center overflow-hidden rounded-lg bg-[#112b5c]"
          >
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              aria-label="Email address"
              required
              className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-gray-400"
            />

            <button
              type="submit"
              className="bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Shop Links */}
        <FooterCol
          title="Shop"
          links={[
            "New Arrivals",
            "Best Sellers",
            "Men",
            "Women",
            "Sale",
          ]}
        />

        {/* Customer Care */}
        <FooterCol
          title="Customer Care"
          links={[
            "My Account",
            "Track Order",
            "Shipping Info",
            "Returns",
            "FAQ",
          ]}
        />

        {/* Contact and Social Links */}
        <div>
          <h3 className="mb-4 text-base font-semibold text-white">
            Contact Us
          </h3>

          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <FaMapMarkerAlt className="mt-1 shrink-0 text-blue-400" />
              <span>123 Commerce Street, Karachi, Pakistan</span>
            </li>

            <li className="flex items-center gap-3">
              <FaPhoneAlt className="shrink-0 text-blue-400" />
              <span>+92 3348436065</span>
            </li>

            <li className="flex items-center gap-3">
              <FaEnvelope className="shrink-0 text-blue-400" />
              <a
                href="mailto:seemakhan36065@gmail.com"
                className="break-all transition hover:text-blue-400"
              >
                seemakhan36065@gmail.com
              </a>
            </li>
          </ul>

          <div className="mt-5 flex gap-3">
            <Social
              icon={<FaFacebookF />}
              href="#"
              label="Facebook"
            />
            <Social
              icon={<FaInstagram />}
              href="#"
              label="Instagram"
            />
            <Social
              icon={<FaTwitter />}
              href="#"
              label="Twitter"
            />
            <Social
              icon={<FaYoutube />}
              href="#"
              label="YouTube"
            />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-blue-900">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-5 md:flex-row">
          <p className="text-center text-xs text-gray-400">
            © {year}{" "}
            <span className="font-semibold text-white">ShopVerse</span>.
            All rights reserved.
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <Link
              href="/privacy"
              className="transition hover:text-blue-400"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms"
              className="transition hover:text-blue-400"
            >
              Terms of Service
            </Link>

            <Link
              href="/cookies"
              className="transition hover:text-blue-400"
            >
              Cookies
            </Link>
          </div>

          <div
            className="flex items-center gap-3 text-2xl text-gray-400"
            aria-label="Accepted payment methods"
          >
            <FaCcVisa className="transition hover:text-blue-400" />
            <FaCcMastercard className="transition hover:text-blue-400" />
            <FaCcPaypal className="transition hover:text-blue-400" />
          </div>
        </div>
      </div>
    </footer>
  );
}

/* Feature Component */

function Feature({ icon, title, desc }: FeatureProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-2xl text-blue-400">{icon}</div>

      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
    </div>
  );
}

/* Footer Links Component */

function FooterCol({ title, links }: FooterColProps) {
  return (
    <div>
      <h3 className="mb-4 text-base font-semibold text-white">{title}</h3>

      <ul className="space-y-2 text-sm">
        {links.map((label) => (
          <li key={label}>
            <Link
              href="#"
              className="inline-block transition hover:translate-x-1 hover:text-blue-400"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Social Links Component */

function Social({ icon, href, label }: SocialProps) {
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#112b5c] text-gray-300 transition hover:bg-blue-500 hover:text-white"
    >
      {icon}
    </a>
  );
}
