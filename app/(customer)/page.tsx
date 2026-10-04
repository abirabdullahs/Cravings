import { Hero } from "@/components/home/hero";
import { CuisineBrowser } from "@/components/home/cuisine-browser";
import { PopularSection } from "@/components/home/popular-section";
import { ActiveOrderBanner } from "@/components/order/ActiveOrderBanner";
import { OrderAgain } from "@/components/home/order-again";
import { ExperienceSection } from "@/components/home/experience-section";

export default function HomePage() {
  return (
    <div className="bg-background">
      <ActiveOrderBanner />
      <Hero />
      <CuisineBrowser />
      <OrderAgain />
      <PopularSection />
      <ExperienceSection />
    </div>
  );
}
