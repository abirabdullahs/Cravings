import { Hero } from "@/components/home/hero";
import { CuisineBrowser } from "@/components/home/cuisine-browser";
import { PopularSection } from "@/components/home/popular-section";

export default function HomePage() {
  return (
    <div className="bg-background">
      <Hero />
      <CuisineBrowser />
      {/* <PopularSection /> */}
    </div>
  );
}
