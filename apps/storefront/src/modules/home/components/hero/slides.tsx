"use client"

import { useEffect, useState } from "react"

const SLIDES = [
  {
    src: "/home-hero.jpg",
    alt: "Natural ingredient powders and botanical extracts in a laboratory",
  },
  {
    src: "/home-hero-2.jpg",
    alt: "Spice and seasoning powders for food manufacturing",
  },
  {
    src: "/home-hero-3.jpg",
    alt: "Nutraceutical capsules for supplement formulations",
  },
]

const INTERVAL_MS = 3000

// Cross-fading hero backgrounds. The hero text sits on top and stays put.
const HeroSlides = () => {
  const [index, setIndex] = useState(0)

  // Restarting on `index` gives a full interval after a dot is clicked.
  useEffect(() => {
    const id = window.setTimeout(
      () => setIndex((i) => (i + 1) % SLIDES.length),
      INTERVAL_MS
    )
    return () => window.clearTimeout(id)
  }, [index])

  return (
    <div
      className="absolute inset-0 bg-[#00254d]"
      aria-roledescription="carousel"
      aria-label="Featured ingredients"
    >
      {SLIDES.map((slide, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={slide.src}
          src={slide.src}
          alt={i === index ? slide.alt : ""}
          aria-hidden={i !== index}
          loading={i === 0 ? "eager" : "lazy"}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 motion-reduce:duration-0 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-[#00254d]/[.92] via-[#00254d]/[.76] to-[#00254d]/[.15]" />

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show slide ${i + 1} of ${SLIDES.length}`}
            aria-current={i === index}
            className={`h-2.5 rounded-full transition-all ${
              i === index ? "w-7 bg-[#7aba0c]" : "w-2.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default HeroSlides
