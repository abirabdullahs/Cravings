import Link from "next/link";
import { Logo } from "@/components/brand/logo";

const footerSections = [
  {
    title: "Explore",
    links: [
      { label: "Browse Restaurants", href: "/search" },
      { label: "Coverage Areas", href: "/delivery-areas" },
      {label: "About Us", href: "/about" }
    ],
  },
  {
    title: "Partnerships",
    links: [
      { label: "Partner Restaurant", href: "/register" },
      { label: "Rider Portal", href: "/rider" },
      { label: "Apply as Rider", href: "/register" },
    ],
  },
  {
    title: "Support & Legal",
    links: [
      { label: "Help & FAQ", href: "/help" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-footer text-footer-foreground border-t border-border/10">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <Logo variant="inverted" />
            <p className="mt-4 text-sm leading-relaxed text-footer-muted">
              Fine-dining delivery, celebrating the historic and modern culinary
              heritage of Dhaka.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-12">
            {footerSections.map((col) => (
              <div key={col.title}>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-footer-foreground/90 transition-colors hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-footer-muted sm:flex-row sm:justify-between">
          <p>© 2026 Cravings Delivery. All rights reserved.</p>
          <p>Dhaka, Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}
