import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import logoImg from "@/public/logo.png" // or "../public/logo.png" depending on your alias
type LogoProps = {
  /** "default" for light backgrounds, "inverted" for dark footers */
  variant?: "default" | "inverted";
  className?: string;
  href?: string;
};

export function Logo({
  variant = "default",
  className,
  href = "/",
}: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2.5 transition-opacity hover:opacity-90",
        className,
      )}
    >
      {/* Icon Graphic */}
      <div className="relative h-9 w-9 shrink-0">
        <Image
          src={logoImg}
          alt="Cravings Icon"
          fill
          priority
          className="object-contain"
        />
      </div>

      {/* Brand Name Text */}
      <span
        className={cn(
          "font-serif text-2xl font-bold tracking-tight",
          variant === "inverted" ? "text-white" : "text-amber-950",
        )}
      >
        Cravings<span className="text-primary">.</span>
      </span>
    </Link>
  );
}
