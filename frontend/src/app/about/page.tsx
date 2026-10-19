import type { Metadata } from "next";
import AboutHero from "@/src/feature/about/components/AboutHero";
import AboutStory from "@/src/feature/about/components/AboutStory";
import AboutValues from "@/src/feature/about/components/AboutValues";
import { aboutData } from "@/src/feature/about/data/about.data";

export const metadata: Metadata = {
  title: "About Us | MyShop",
  description:
    "Discover MyShop: bridal couture, festive formals and premium lawn wear, delivered across Pakistan and worldwide.",
  openGraph: {
    title: "About Us | MyShop",
    description:
      "Timeless elegance and modern fashion, curated with care since 2022.",
    images: [aboutData.hero.slides[0].src],
    type: "website",
  },
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const { brandName, foundedYear, hero, story, values, closing } = aboutData;

  return (
    <main className="mt-[200px]">
      <AboutHero hero={hero} brandName={brandName} />
      <AboutStory story={story} foundedYear={foundedYear} />
      <AboutValues values={values} closing={closing} />
    </main>
  );
}