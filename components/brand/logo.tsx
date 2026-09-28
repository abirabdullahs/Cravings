import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
      <Image
        src="/logo.svg"
        alt="Cravings"
        width={137}
        height={40}
        priority
        unoptimized
        className={cn(
          "h-10 w-auto",
          variant === "inverted" && "brightness-0 invert",
        )}
      />
    </Link>
  );
}
