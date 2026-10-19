export interface HeroSlide {
  src: string;
  alt: string;
}

export interface AboutValue {
  id: string;
  title: string;
  description: string;
}

export interface AboutCollection {
  id: string;
  name: string;
  description: string;
  href: string;
}

export interface AboutContent {
  brandName: string;
  foundedYear: number;
  hero: {
    eyebrow: string;
    title: string;
    intro: string;
    slides: HeroSlide[];
  };
  story: {
    title: string;
    paragraphs: string[];
    collections: AboutCollection[];
  };
  values: {
    title: string;
    subtitle: string;
    items: AboutValue[];
  };
  closing: string;
}

export const aboutData: AboutContent = {
  brandName: "MyShop",
  foundedYear: 2022,
  hero: {
    eyebrow: "About Us",
    title: "Who We Are",
    intro:
      "MyShop is your premier destination for timeless elegance and modern fashion. Founded in 2022, our goal has always been to bring high-quality clothing, cosmetics, and accessories to style-conscious individuals across Pakistan and beyond.",
    slides: [
      { src: "/images/im1.jpg", alt: "MyShop signature collection" },
      { src: "/images/im2.jpg", alt: "Festive formal wear" },
      { src: "/images/im3.jpg", alt: "Premium lawn wear" },
    ],
  },
  story: {
    title: "Our Story",
    paragraphs: [
      "Our collections feature bridal couture, festive formals, and everyday essentials like premium lawn wear. Every piece is curated with care, showcasing craftsmanship, quality, and cultural grace.",
      "From a small team with a big vision, we have grown into a trusted fashion brand, delivering style and confidence to customers in Pakistan and internationally.",
    ],
    collections: [
      {
        id: "bridal",
        name: "Bridal",
        description: "Couture pieces crafted for your most special day.",
        href: "/bridal",
      },
      {
        id: "formals",
        name: "Formals",
        description: "Festive and luxury formals for every occasion.",
        href: "/formals",
      },
      {
        id: "lawn",
        name: "Lawn",
        description: "Premium, breathable everyday essentials.",
        href: "/lawn",
      },
    ],
  },
  values: {
    title: "Why Choose Us",
    subtitle: "We are proud to offer",
    items: [
      {
        id: "quality",
        title: "Handpicked Quality Products",
        description:
          "Every item is carefully selected to meet our standards of craftsmanship.",
      },
      {
        id: "affordable",
        title: "Affordable Luxury for All",
        description:
          "Premium fashion at fair prices, so elegance is within everyone's reach.",
      },
      {
        id: "support",
        title: "Fast Shipping & Dedicated Support",
        description:
          "Free shipping in Pakistan, international delivery, and a responsive support team.",
      },
    ],
  },
  closing: "Thank you for being part of the MyShop journey!",
};