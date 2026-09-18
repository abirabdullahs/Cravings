import Link from "next/link";
import {
  Mail,
  UtensilsCrossed,
  Code2,
  Sparkles,
  ShieldCheck,
  Bike,
} from "lucide-react";

// Inline Brand Icons (since Lucide removed brand logos)
function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="primary" {...props}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.72a1.47 1.47 0 1 0 0 2.94 1.47 1.47 0 0 0 0-2.94Z" />
    </svg>
  );
}

const teamMembers = [
  {
    name: "Sakhawat Hossain",
    role: "Co-Founder & Full-Stack Developer",
    bio: "Passionate about building scalable web applications, real-time logistics systems, and intuitive user experiences.",
    github: "https://github.com/sakhawat166",
    linkedin: "https://linkedin.com/in/sakhawat-hossain",
    email: "sakhawath.2313@gmail.com.bd",
    contributions: [
      "Architecture & Database Schema",
      "Rider & Merchant Dashboard Systems",
      "Cart & Real-Time Checkout Flow",
    ],
  },
  {
    name: "Abir Abdullah",
    role: "Co-Founder & Full-Stack Developer",
    bio: "Focused on frontend aesthetics, security layer implementation, and crafting admin interfaces.",
    github: "https://github.com/abirabdullahs",
    linkedin: "https://linkedin.com/in/abir-abdullah",
    email: "abir@cravings.com.bd",
    contributions: [
      "Admin Panel & User Management",
      "UI/UX Design & Component System",
      "Authentication & Security Layer",
    ],
  },
];

const techStack = [
  {
    name: "Next.js (App Router)",
    desc: "Server-side rendering & React Server Components",
  },
  { name: "TypeScript", desc: "Type-safe database models and frontend props" },
  { name: "Tailwind CSS", desc: "Custom luxury Dhakaiya design system" },
  {
    name: "PostgreSQL & Drizzle ORM",
    desc: "High-performance relational data store",
  },
  {
    name: "Auth.js (NextAuth)",
    desc: "Role-based authentication (Customer, Rider, Owner, Admin)",
  },
  {
    name: "TanStack React Query",
    desc: "Optimistic updates & client-side state fetching",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="border-b border-border/60 bg-card py-16">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            <span>The Story Behind Cravings</span>
          </div>
          <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Redefining Fine-Dining Delivery in Dhaka
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Cravings was engineered from the ground up to connect food
            enthusiasts across Dhaka with premium culinary experiences—from
            historic Dhakaiya heritage dishes to modern artisanal kitchens.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-12 space-y-16 sm:px-6">
        {/* Project Mission & Vision */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="border border-border bg-card p-6 rounded-lg space-y-2">
            <UtensilsCrossed className="size-6 text-primary mb-2" />
            <h3 className="font-serif text-lg font-bold">
              Culinary Excellence
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Curated partner restaurants ensuring peak quality control,
              packaging standards, and authentic flavor profiles.
            </p>
          </div>

          <div className="border border-border bg-card p-6 rounded-lg space-y-2">
            <Bike className="size-6 text-primary mb-2" />
            <h3 className="font-serif text-lg font-bold">Smart Logistics</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Automated single-active dispatch algorithms for riders ensuring
              faster drop-offs and transparent tracking.
            </p>
          </div>

          <div className="border border-border bg-card p-6 rounded-lg space-y-2">
            <ShieldCheck className="size-6 text-primary mb-2" />
            <h3 className="font-serif text-lg font-bold">Multi-Role System</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tailored dashboards for Customers, Riders, Restaurant Owners, and
              Platform Administrators.
            </p>
          </div>
        </section>

        {/* Founders / Team Section */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="font-serif text-3xl font-bold text-foreground">
              Meet the Creators
            </h2>
            <p className="text-xs text-muted-foreground">
              Designed, architected, and built by Sakhawat Hossain & Abir
              Abdullah.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="group relative flex flex-col justify-between border border-border bg-card p-6 rounded-xl transition-all hover:border-primary/50"
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-foreground">
                      {member.name}
                    </h3>
                    <p className="text-xs font-medium text-primary">
                      {member.role}
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {member.bio}
                  </p>

                  <div className="space-y-1.5 pt-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Key Contributions:
                    </p>
                    <ul className="space-y-1">
                      {member.contributions.map((item, i) => (
                        <li
                          key={i}
                          className="text-xs text-foreground/90 flex items-center gap-1.5"
                        >
                          <span className="size-1 rounded-full bg-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Social & GitHub Links */}
                <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-4">
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    <GithubIcon className="size-3.5" />
                    GitHub
                  </a>

                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    <LinkedinIcon className="size-3.5 text-blue-600" />
                    LinkedIn
                  </a>

                  <a
                    href={`mailto:${member.email}`}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background p-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
                    title={`Email ${member.name}`}
                  >
                    <Mail className="size-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Stack Overview */}
        <section className="border border-border bg-card p-8 rounded-xl space-y-6">
          <div className="flex items-center gap-2">
            <Code2 className="size-5 text-primary" />
            <h2 className="font-serif text-xl font-bold">
              Tech Stack & Engineering
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="border border-border/60 bg-background p-3.5 rounded-lg"
              >
                <p className="text-xs font-bold text-foreground">{tech.name}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {tech.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Source Code / GitHub Callout */}
        <section className="text-center space-y-4 border-t border-border pt-12">
          <h3 className="font-serif text-2xl font-bold">
            Explore the Source Code
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Cravings is built open-source to showcase modern full-stack
            engineering standards in Next.js.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://github.com/abirabdullahs/cravings"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <GithubIcon className="size-4" />
              View Repository on GitHub
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
