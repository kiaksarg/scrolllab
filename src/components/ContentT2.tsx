import React from "react";

export default function ContentT2({ image }: { image?: React.ReactNode }) {
  return (
    <article
      className="
        overflow-hidden rounded-2xl shadow-xl
        border border-neutral-200/70 bg-white text-neutral-900
        dark:border-zinc-800 dark:bg-zinc-950 dark:text-neutral-200
      "
    >
      {/* Hero image */}
      <div className="relative aspect-[16/7] w-full overflow-hidden bg-neutral-200 dark:bg-zinc-900">
        {image}
      </div>

      {/* Body */}
      <div className="px-6 py-7 md:px-10 md:py-10">
        {/* Title */}
        <h1 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">
          Imam Bayıldı
        </h1>

        {/* Intro */}
        <p className="mt-3 max-w-3xl leading-relaxed">
          Imam Bayıldı is a classic Turkish dish. It means “the imam fainted” —
          maybe because it tasted so good, or maybe because of all the olive
          oil! Eggplants are filled with a soft onion–tomato mixture and baked
          until tender. It can be eaten warm or at room temperature.
        </p>

        {/* Ingredients */}
        <section className="mt-8">
          <h2 className="text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-neutral-600 dark:text-zinc-400">
            Ingredients (4 servings)
          </h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 marker:text-neutral-400 dark:marker:text-zinc-500">
            <li>4 small eggplants (200–250 g each)</li>
            <li>6 tbsp olive oil, divided</li>
            <li>2 onions, thinly sliced</li>
            <li>3 cloves garlic, chopped</li>
            <li>3 tomatoes, chopped (or 1½ cups canned chopped tomatoes)</li>
            <li>1 red bell pepper, diced</li>
            <li>1 tsp sugar (optional)</li>
            <li>Salt and pepper, to taste</li>
            <li>¼ cup parsley, chopped</li>
            <li>2 tbsp dill, chopped (optional)</li>
            <li>Juice of ½ lemon</li>
          </ul>
        </section>

        {/* Instructions */}
        <section className="mt-10">
          <h2 className="text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-neutral-600 dark:text-zinc-400">
            Instructions
          </h2>
          <ol className="mt-3 list-decimal space-y-3 pl-5 marker:text-neutral-400 dark:marker:text-zinc-500">
            <li>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                Prepare eggplants:
              </span>{" "}
              Peel thin strips of skin to make a striped pattern. Cut in half
              lengthwise. Scoop out some of the inside to make room for filling.
              Chop the scooped-out part and keep it.
            </li>
            <li>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                Cook eggplant shells:
              </span>{" "}
              Heat 3 tbsp olive oil in a frying pan. Place eggplants cut-side
              down and cook until golden, about 5–6 minutes. Turn over and cook
              the other side for 3–4 minutes. Take them out and put on a plate.
            </li>
            <li>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                Make filling:
              </span>{" "}
              In the same pan, heat the rest of the oil. Fry onions until soft,
              then add garlic, bell pepper, and the chopped eggplant. Cook for 5
              minutes. Add tomatoes, sugar, salt, and pepper. Simmer for 10
              minutes. Stir in most of the herbs (keep a little for garnish).
            </li>
            <li>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                Bake:
              </span>{" "}
              Put the eggplants in a baking dish. Fill with the mixture. Drizzle
              with lemon juice and a little olive oil. Add ¼ cup water to the
              dish. Cover with foil and bake at 180 °C (350 °F) for 25 minutes.
              Remove foil and bake for 10 minutes more.
            </li>
            <li>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                Serve:
              </span>{" "}
              Let cool a little. Garnish with the rest of the herbs.
            </li>
          </ol>
        </section>

        {/* Divider */}
        <div className="my-10 h-px w-full bg-neutral-200/80 dark:bg-zinc-800/80" />

        {/* What makes it special */}
        <p className="max-w-3xl leading-relaxed">
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            What makes it special:
          </span>{" "}
          The slow cooking in olive oil makes the vegetables soft and full of
          flavor. This dish is vegan, gluten-free, and tastes even better the
          next day.
        </p>
      </div>
    </article>
  );
}
