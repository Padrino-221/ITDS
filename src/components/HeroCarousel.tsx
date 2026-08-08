"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/lib/settings";

export default function HeroCarousel({
  slides,
  phone,
}: {
  slides: HeroSlide[];
  phone: string;
}) {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 7000);
    return () => clearInterval(id);
  }, [count]);

  if (count === 0) return null;

  return (
    <section className="relative overflow-hidden bg-forest-950">
      <div className="relative h-[560px] sm:h-[620px] lg:h-[680px]">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000",
              i === index ? "opacity-100" : "opacity-0"
            )}
            aria-hidden={i !== index}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={i === 0}
              sizes="100vw"
              className="animate-kenburns object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-forest-950/95 via-forest-950/80 to-forest-950/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 to-transparent" />
          </div>
        ))}

        {/* Content */}
        <div className="absolute inset-0">
          <div className="mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h1
                style={{ animationDelay: "120ms" }}
                className="display-heading animate-fade-up mt-6 text-4xl font-extrabold uppercase tracking-tight text-white text-balance sm:text-5xl lg:text-6xl"
              >
                {slides[index].title}
              </h1>
              <p
                style={{ animationDelay: "240ms" }}
                className="animate-fade-up mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg"
              >
                {slides[index].subtitle}
              </p>

              <div
                style={{ animationDelay: "360ms" }}
                className="animate-fade-up mt-8 flex flex-wrap items-center gap-4"
              >
                <Link
                  href={slides[index].cta?.href ?? "/projects"}
                  className="btn-pill btn-pill-accent px-7 py-3.5 text-sm hover:-translate-y-0.5"
                >
                  {slides[index].cta?.label ?? "Get Started"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/about"
                  className="btn-pill border border-white/25 bg-white/5 px-7 py-3.5 text-sm text-white backdrop-blur hover:-translate-y-0.5 hover:bg-white/10"
                >
                  Learn About Us
                </Link>

                {/* Call block */}
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="group flex items-center gap-3"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold-500 text-white transition-transform group-hover:scale-105">
                    <Phone className="h-5 w-5" />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
                      Call Us
                    </span>
                    <span className="block text-sm font-bold text-white">{phone}</span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Dots */}
        {count > 1 && (
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-2.5 rounded-lg transition-all duration-300",
                  i === index ? "w-9 bg-gold-400 rounded-full" : "w-2.5 bg-white/40 hover:bg-white/70 rounded-full"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
