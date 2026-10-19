
"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import type { AboutContent } from "../data/about.data";

interface AboutHeroProps {
  hero: AboutContent["hero"];
  brandName: string;
}

const AUTOPLAY_MS = 5500;

export default function AboutHero({
  hero,
  brandName,
}: AboutHeroProps) {
  const { slides } = hero;

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  const slideCount = slides.length;
  const activeSlide = slides[current];

  const next = useCallback(() => {
    setCurrent((index) => (index + 1) % slideCount);
  }, [slideCount]);

  const prev = useCallback(() => {
    setCurrent((index) => (index - 1 + slideCount) % slideCount);
  }, [slideCount]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const updateMotionPreference = () => {
      setIsReducedMotion(mediaQuery.matches);
    };

    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => {
      mediaQuery.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  useEffect(() => {
    if (paused || isReducedMotion || slideCount < 2) return;

    const timer = window.setInterval(next, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [paused, isReducedMotion, next, slideCount]);

  if (!activeSlide) return null;

  return (
    <section
      aria-labelledby="about-hero-title"
      className="relative overflow-hidden bg-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      {/* Subtle background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-slate-100/80 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-[1440px] items-center gap-10 px-4 py-10 sm:px-6 sm:py-14 md:grid-cols-[0.95fr_1.05fr] md:gap-10 lg:gap-16 lg:px-10 lg:py-20 xl:gap-24">
        {/* Editorial content */}
        <div className="relative order-2 max-w-2xl md:order-1">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-10 bg-[#173b63]" />

            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#173b63] sm:text-xs">
              <Sparkles size={14} strokeWidth={1.8} />
              {hero.eyebrow}
            </span>
          </div>

          <h1
            id="about-hero-title"
            className="max-w-xl text-4xl font-semibold uppercase leading-[1.08] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-6xl xl:text-[68px]"
          >
            {hero.title}
          </h1>

          <div
            aria-hidden="true"
            className="my-6 h-1 w-16 rounded-full bg-[#173b63]"
          />

          <p className="max-w-xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8 lg:text-[17px]">
            {hero.intro}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="/"
              className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#102d50] px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white shadow-sm transition-colors hover:bg-[#1b456f] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#102d50]/20"
            >
              Explore collection
              <ChevronRight
                size={17}
                className="transition-transform group-hover:translate-x-1 motion-reduce:transform-none"
              />
            </a>

            <a
              href="#about-story"
              className="inline-flex min-h-12 items-center gap-2 rounded-full px-3 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600 transition-colors hover:text-[#102d50] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#102d50]/30"
            >
              Our story
              <ArrowDown size={15} />
            </a>
          </div>

          {/* Carousel status */}
          {slideCount > 1 && (
            <div
              className="mt-10 flex items-center gap-4 border-t border-slate-200 pt-5"
              aria-label={`Slide ${current + 1} of ${slideCount}`}
            >
              <span className="text-sm font-semibold tabular-nums text-[#102d50]">
                {String(current + 1).padStart(2, "0")}
              </span>

              <div className="h-px w-16 overflow-hidden bg-slate-200">
                <div
                  className="h-full bg-[#173b63] transition-[width] duration-300"
                  style={{
                    width: `${((current + 1) / slideCount) * 100}%`,
                  }}
                />
              </div>

              <span className="text-xs tabular-nums text-slate-400">
                {String(slideCount).padStart(2, "0")}
              </span>

              <span className="ml-1 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Discover {brandName}
              </span>
            </div>
          )}
        </div>

        {/* Image carousel */}
        <div className="order-1 min-w-0 md:order-2">
          <div
            role="region"
            aria-roledescription="carousel"
            aria-label={`${brandName} fashion gallery`}
            aria-live="off"
            className="group relative isolate"
          >
            {/* Decorative frame */}
            <div
              aria-hidden="true"
              className="absolute -right-2 -top-2 h-24 w-24 rounded-tr-[2rem] border-r border-t border-[#173b63]/40 sm:-right-3 sm:-top-3 sm:h-32 sm:w-32"
            />

            <div className="relative aspect-[4/4.7] overflow-hidden rounded-2xl bg-slate-100 shadow-[0_20px_60px_rgba(15,23,42,0.12)] sm:aspect-[4/4.5] md:aspect-[4/5]">
              {slides.map((slide, index) => (
                <div
                  key={slide.src}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${slideCount}`}
                  aria-hidden={index !== current}
                  className={`absolute inset-0 ${
                    isReducedMotion
                      ? ""
                      : "transition-opacity duration-700 ease-in-out"
                  } ${
                    index === current
                      ? "z-10 opacity-100"
                      : "z-0 opacity-0"
                  }`}
                >
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1279px) 48vw, 650px"
                    className={`object-cover ${
                      isReducedMotion
                        ? ""
                        : "transition-transform duration-[7000ms] ease-out"
                    } ${
                      index === current
                        ? "scale-100"
                        : "scale-[1.04]"
                    }`}
                  />

                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-slate-950/5"
                  />
                </div>
              ))}

              {/* Image label */}
              <div className="absolute bottom-5 left-5 z-20 max-w-[65%] sm:bottom-7 sm:left-7">
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/75 sm:text-[10px]">
                  {brandName}
                </p>

                <p className="mt-1 text-sm font-medium text-white sm:text-base">
                  Timeless style. Personal expression.
                </p>
              </div>

              {/* Navigation controls */}
              {slideCount > 1 && (
                <div className="absolute bottom-5 right-4 z-20 flex items-center gap-2 sm:bottom-7 sm:right-7">
                  <button
                    type="button"
                    onClick={prev}
                    aria-label="Previous image"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-slate-950/15 text-white backdrop-blur-md transition hover:bg-white hover:text-[#102d50] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <ChevronLeft size={19} />
                  </button>

                  <button
                    type="button"
                    onClick={next}
                    aria-label="Next image"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-slate-950/15 text-white backdrop-blur-md transition hover:bg-white hover:text-[#102d50] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <ChevronRight size={19} />
                  </button>
                </div>
              )}
            </div>

            {/* Slide indicators */}
            {slideCount > 1 && (
              <div
                className="mt-5 flex items-center justify-center gap-2 md:justify-start"
                aria-label="Choose gallery image"
              >
                {slides.map((slide, index) => (
                  <button
                    key={slide.src}
                    type="button"
                    onClick={() => setCurrent(index)}
                    aria-label={`Go to image ${index + 1}`}
                    aria-pressed={current === index}
                    className="flex min-h-8 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#102d50]/40"
                  >
                    <span
                      className={`block h-1.5 rounded-full transition-all duration-300 ${
                        current === index
                          ? "w-8 bg-[#102d50]"
                          : "w-3 bg-slate-300 hover:bg-slate-500"
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
