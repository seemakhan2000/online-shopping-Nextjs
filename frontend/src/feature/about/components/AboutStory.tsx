
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { AboutContent } from "../data/about.data";

interface AboutStoryProps {
  story: AboutContent["story"];
  foundedYear: number;
}

export default function AboutStory({
  story,
  foundedYear,
}: AboutStoryProps) {
  return (
    <section
      aria-labelledby="about-story-title"
      className="relative isolate overflow-hidden bg-[#f8f7f4] py-20 sm:py-24 lg:py-32"
    >
      {/* Subtle decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 -z-10 h-80 w-80 rounded-full bg-stone-200/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-32 -z-10 h-96 w-96 rounded-full bg-stone-200/30 blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Story introduction */}
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/80 px-4 py-2 shadow-sm">
            <Sparkles
              aria-hidden="true"
              className="h-3.5 w-3.5 text-stone-700"
            />
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-700">
              Our Journey Since {foundedYear}
            </span>
          </div>

          <h2
            id="about-story-title"
            className="mt-7 text-4xl font-semibold leading-[1.12] tracking-tight text-stone-950 sm:text-5xl lg:text-6xl"
          >
            {story.title}
          </h2>

          <div className="mx-auto mt-6 h-1 w-14 rounded-full bg-[#142B4A]" />

          <div className="mx-auto mt-8 max-w-3xl space-y-5 text-base leading-8 text-stone-600 sm:text-lg sm:leading-9">
            {story.paragraphs.map((text, index) => (
              <p key={`${index}-${text.slice(0, 24)}`}>{text}</p>
            ))}
          </div>
        </div>

        {/* Collections heading */}
        {story.collections.length > 0 && (
          <div className="mt-20 sm:mt-24">
            <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                  Find Your Style
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">
                  Explore Our Collections
                </h3>
              </div>

              <p className="max-w-md text-sm leading-6 text-stone-600 sm:text-right">
                Discover thoughtfully selected collections designed to
                complement your everyday style.
              </p>
            </div>

            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {story.collections.map((item, index) => (
                <li key={item.id} className="h-full">
                  <Link
                    href={item.href}
                    className="group relative flex h-full min-h-64 flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white p-7 shadow-sm transition duration-300 ease-out hover:-translate-y-1.5 hover:border-stone-400 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-4 sm:p-8"
                  >
                    {/* Card number and arrow */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium tracking-[0.18em] text-stone-400">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-stone-700 transition duration-300 group-hover:border-[#142B4A] group-hover:bg-[#142B4A] group-hover:text-white">
                        <ArrowRight
                          aria-hidden="true"
                          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>

                    {/* Card content */}
                    <div className="mt-auto pt-12">
                      <h4 className="text-xl font-semibold tracking-tight text-stone-950 sm:text-2xl">
                        {item.name}
                      </h4>

                      <p className="mt-3 text-sm leading-7 text-stone-600 sm:text-base">
                        {item.description}
                      </p>

                      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-stone-900">
                        Explore collection
                        <span
                          aria-hidden="true"
                          className="h-px w-6 bg-stone-400 transition-all duration-300 group-hover:w-10 group-hover:bg-[#142B4A]"
                        />
                      </span>
                    </div>

                    {/* Hover accent */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-[#142B4A] transition-transform duration-300 group-hover:scale-x-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
