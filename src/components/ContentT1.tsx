import React from "react";

export default function ContentRecipeAlubiasPintas({
  image,
}: {
  image?: React.ReactNode;
}) {
  return (
    <article
      className="
       overflow-hidden rounded-2xl shadow-xl
        border border-neutral-200/70 bg-white text-neutral-900
        dark:border-zinc-800 dark:bg-zinc-950 dark:text-neutral-200
      "
    >
      {/* Hero image (top) */}
      <div className="relative aspect-[16/7] w-full overflow-hidden bg-neutral-200 dark:bg-neutral-800">
        {image}
      </div>

      {/* Body */}
      <div className="px-6 py-7 md:px-10 md:py-10">
        {/* Title */}
        <h1 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          Alubias Pintas
        </h1>

        {/* Intro */}
        <p className="mt-3 max-w-3xl leading-relaxed">
          Pinto beans (alubias pintas in Spanish) are popular in Spanish home
          cooking. They are soft, filling, and absorb flavor well. In
          traditional recipes, they are often cooked with meat, but this
          vegetarian version uses smoked paprika and vegetables for a rich, warm
          taste.
        </p>

        {/* Ingredients — full width */}
        <section className="mt-8">
          <h2 className="text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-neutral-600 dark:text-neutral-400">
            Ingredients (4 servings)
          </h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 marker:text-neutral-400 dark:marker:text-neutral-500">
            <li>250 g dried pinto beans</li>
            <li>1 tbsp olive oil</li>
            <li>1 onion, chopped</li>
            <li>2 cloves garlic, chopped</li>
            <li>1 carrot, diced</li>
            <li>1 red bell pepper, diced</li>
            <li>1 tsp sweet smoked paprika</li>
            <li>½ tsp hot smoked paprika (optional)</li>
            <li>1 bay leaf</li>
            <li>1 large tomato, chopped (or 1 cup canned chopped tomatoes)</li>
            <li>1 liter vegetable broth</li>
            <li>Salt and pepper, to taste</li>
            <li>Fresh parsley, chopped, for garnish</li>
          </ul>
        </section>

        {/* Instructions — full width */}
        <section className="mt-10">
          <h2 className="text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-neutral-600 dark:text-neutral-400">
            Instructions
          </h2>
          <ol className="mt-3 list-decimal space-y-3 pl-5 marker:text-neutral-400 dark:marker:text-neutral-500">
            <li>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                Soak beans:
              </span>{" "}
              Rinse the beans and soak them overnight in plenty of water. Drain
              before cooking.
            </li>
            <li>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                Cook vegetables:
              </span>{" "}
              Heat olive oil in a large pot. Fry onion, carrot, and bell pepper
              for 5 minutes until soft. Add garlic and cook for 1 more minute.
            </li>
            <li>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                Add spices and tomato:
              </span>{" "}
              Stir in the paprika(s). Cook for a few seconds, then add tomato.
              Simmer for a few minutes until slightly thick.
            </li>
            <li>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                Cook beans:
              </span>{" "}
              Add the beans, bay leaf, and vegetable broth. Bring to a boil,
              then lower the heat. Cook gently for 1–1½ hours until beans are
              soft. Stir sometimes and add more water if needed.
            </li>
            <li>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                Finish:
              </span>{" "}
              Remove the bay leaf. Add salt and pepper to taste. Sprinkle with
              parsley and serve with bread or rice.
            </li>
          </ol>
        </section>

        {/* Divider */}
        <div className="my-10 h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80" />

        {/* What makes it special */}
        <p className="max-w-3xl leading-relaxed">
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            What makes it special:
          </span>{" "}
          The slow cooking blends the smoky paprika, sweet vegetables, and soft
          beans. This is healthy comfort food — high in protein and fiber, and
          full of Mediterranean flavor.
        </p>
      </div>
    </article>
  );
}
