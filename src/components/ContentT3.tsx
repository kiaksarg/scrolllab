import React from "react";

export default function ContentT3({ image }: { image?: React.ReactNode }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl">
      {/* Hero image */}
      <div className="aspect-[16/7] w-full bg-zinc-900">{image}</div>

      {/* Body */}
      <div className="px-6 py-7 md:px-10 md:py-10">
        {/* Title */}
        <h1 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-white">
          Pimientos de Padrón with Garlic–Lemon Drizzle
        </h1>

        {/* Intro */}
        <p className="mt-3 max-w-3xl leading-relaxed text-zinc-200">
          Pimientos de Padrón are small green peppers from Galicia in northern
          Spain. Most are mild and sweet, but sometimes you get one that is a
          little spicy — part of the fun! Usually, they are simply fried in
          olive oil and served with salt. This version keeps the traditional
          style but adds a light garlic–lemon sauce for extra flavor.
        </p>

        {/* Ingredients */}
        <section className="mt-8">
          <h2 className="text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-zinc-400">
            Ingredients (4 servings)
          </h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-zinc-100">
            <li>300 g Pimientos de Padrón (about 2 large handfuls)</li>
            <li>2 tbsp olive oil</li>
            <li>2 cloves garlic, finely chopped</li>
            <li>Juice of ½ lemon</li>
            <li>Flaky sea salt (for example, Maldon), to taste</li>
            <li>Ground black pepper (optional)</li>
            <li>Lemon wedges, to serve</li>
          </ul>
        </section>

        {/* Instructions */}
        <section className="mt-10">
          <h2 className="text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-zinc-400">
            Instructions
          </h2>
          <ol className="mt-3 list-decimal space-y-3 pl-5 text-zinc-100">
            <li>
              <span className="font-medium">Prepare peppers:</span> Wash and dry
              the peppers completely. Keeping the stems makes them easier to
              hold when eating.
            </li>
            <li>
              <span className="font-medium">Make the sauce:</span> In a small
              bowl, mix the lemon juice with 1 tablespoon olive oil. In a small
              pan, heat the other tablespoon of olive oil on low heat. Add the
              garlic and cook for 30–45 seconds until it smells nice — do not
              let it turn brown. Mix the garlic oil into the lemon mixture.
            </li>
            <li>
              <span className="font-medium">Cook the peppers:</span> Heat a
              heavy frying pan (cast iron is best) on medium-high. Add the dry
              peppers in one layer. Let them cook for 1–2 minutes without moving
              them, then stir or shake the pan for another 3–4 minutes until the
              skin has brown or black spots.
            </li>
            <li>
              <span className="font-medium">Serve:</span> Put the peppers on a
              plate. Drizzle with the garlic–lemon sauce. Sprinkle with salt
              and, if you like, black pepper. Serve hot with lemon wedges.
            </li>
          </ol>
        </section>

        {/* Divider */}
        <div className="my-10 h-px w-full bg-zinc-800/80" />

        {/* What makes it special */}
        <p className="max-w-3xl leading-relaxed text-zinc-200">
          <span className="font-medium text-zinc-100">
            What makes it special:
          </span>{" "}
          The olive oil makes the peppers soft and sweet, the lemon gives
          freshness, and the garlic adds depth. This dish is quick to make,
          healthy, and a perfect starter or side dish.
        </p>
      </div>
    </article>
  );
}
