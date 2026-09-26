import { Hero } from "@/components/home/hero";
import { CuisineBrowser } from "@/components/home/cuisine-browser";
import { PopularSection } from "@/components/home/popular-section";
import { ActiveOrderBanner } from "@/components/order/ActiveOrderBanner";

export default function HomePage() {
  return (
    <div className="bg-background">
      <ActiveOrderBanner />
      <Hero />
      <CuisineBrowser />
      <PopularSection />
    </div>
  );
}
