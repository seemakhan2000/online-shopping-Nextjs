
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import type { AboutContent } from "../data/about.data";

interface AboutValuesProps {
  values: AboutContent["values"];
  closing: string;
}

export default function AboutValues({
  values,
  closing,
}: AboutValuesProps) {
  return (
    <section
      aria-labelledby="about-values-title"
      className="relative isolate overflow-hidden bg-white py-20 sm:py-24 lg:py-32"
    >
      {/* Subtle navy decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-10 -z-10 h-80 w-80 rounded-full bg-blue-100/50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-32 -z-10 h-80 w-80 rounded-full bg-slate-100 blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Section heading */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#142B4A]/15 bg-[#142B4A]/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#142B4A]">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-[#142B4A]"
            />
            {values.subtitle}
          </span>

          <h2
            id="about-values-title"
            className="mt-6 text-3xl font-semibold leading-tight tracking-tight text-[#142B4A] sm:text-4xl lg:text-5xl"
          >
            {values.title}
          </h2>

          <div
            aria-hidden="true"
            className="mx-auto mt-6 h-1 w-16 rounded-full bg-[#142B4A]"
          />

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            The principles that guide our decisions, shape our service,
            and define the experience we strive to deliver.
          </p>
        </div>

        {/* Values cards */}
        <ul className="mt-14 grid gap-5 sm:mt-16 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {values.items.map((item, index) => (
            <li key={item.id} className="h-full">
              <article className="group relative flex h-full min-h-60 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[#142B4A]/30 hover:shadow-xl hover:shadow-[#142B4A]/10 sm:p-8">
                {/* Top row */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-[0.2em] text-slate-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#142B4A]/5 text-[#142B4A] ring-1 ring-inset ring-[#142B4A]/10 transition-colors duration-300 group-hover:bg-[#142B4A] group-hover:text-white">
                    <CheckCircle2
                      aria-hidden="true"
                      className="h-6 w-6"
                      strokeWidth={1.8}
                    />
                  </span>
                </div>

                {/* Card content */}
                <div className="mt-7">
                  <h3 className="text-xl font-semibold tracking-tight text-[#142B4A] sm:text-2xl">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                    {item.description}
                  </p>
                </div>

                {/* Decorative arrow */}
                <div className="mt-auto flex justify-end pt-6">
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-5 w-5 text-slate-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#142B4A]"
                  />
                </div>

                {/* Navy hover accent */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-[#142B4A] transition-transform duration-300 group-hover:scale-x-100"
                />
              </article>
            </li>
          ))}
        </ul>

        {/* Closing statement */}
        <div className="mx-auto mt-14 max-w-4xl sm:mt-20">
          <div className="relative overflow-hidden rounded-2xl bg-[#142B4A] px-6 py-9 text-center shadow-lg shadow-[#142B4A]/15 sm:px-10 sm:py-11 lg:px-14">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-20 h-48 w-48 rounded-full border border-white/10"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -left-12 h-52 w-52 rounded-full border border-white/10"
            />

            <p className="relative text-lg font-medium leading-8 text-white sm:text-xl sm:leading-9">
              {closing}
            </p>

            <div
              aria-hidden="true"
              className="relative mx-auto mt-5 h-1 w-12 rounded-full bg-white/70"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
