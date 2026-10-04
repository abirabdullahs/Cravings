"use client";

import { useRouter } from "next/navigation";
import { ArrowRightIcon, BikeIcon, MapPinIcon, SparklesIcon } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";

const features = [
  {
    icon: MapPinIcon,
    number: "01",
    title: "Local by design",
    description: "Browse familiar Dhaka kitchens and discover a new neighbourhood favourite.",
  },
  {
    icon: SparklesIcon,
    number: "02",
    title: "Clear, honest totals",
    description: "See delivery fees and minimum orders before committing to your meal.",
  },
  {
    icon: BikeIcon,
    number: "03",
    title: "Follow every handoff",
    description: "Track your order from restaurant confirmation through doorstep delivery.",
  },
] as const;

export function ExperienceSection() {
  const router = useRouter();
  const { showToast } = useToast();

  return (
    <section className="px-2 pb-16 pt-4 sm:px-6 lg:px-14">
      <div className="mx-auto max-w-[1500px] overflow-hidden rounded-xl bg-footer text-footer-foreground">
        <div className="grid gap-px bg-white/10 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="flex flex-col justify-between bg-footer p-7 sm:p-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">The Cravings way</p>
              <h2 className="mt-4 max-w-md font-serif text-3xl font-bold leading-tight sm:text-4xl">
                Dinner should feel exciting, not complicated.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-footer-muted">
                A smoother route from “what should we eat?” to the first delicious bite.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                showToast("Opening tonight’s top-rated picks.");
                router.push("/search?sort=top-rated");
              }}
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-sm bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
            >
              Plan tonight’s dinner <ArrowRightIcon className="size-4" />
            </button>
          </div>

          <div className="grid gap-px bg-white/10 sm:grid-cols-3">
            {features.map(({ icon: Icon, number, title, description }) => (
              <article key={number} className="flex min-h-64 flex-col bg-footer p-7 sm:p-8">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-full border border-primary/40 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="font-serif text-sm text-footer-muted">{number}</span>
                </div>
                <h3 className="mt-auto pt-10 font-serif text-xl font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-footer-muted">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
