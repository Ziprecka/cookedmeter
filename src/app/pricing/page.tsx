import { pricingTiers } from "@/lib/cooked-data";
import { StaticPage } from "@/components/StaticPage";

export default function PricingPage() {
  return (
    <StaticPage title="Pricing">
      <p>
        CookedMeter stays free to try. Upgrades keep the oven running without
        making the homepage weird.
      </p>
      <div className="grid gap-3 sm:grid-cols-4">
        {pricingTiers.map((tier) => (
          <div key={tier.name} className="rounded-3xl border border-white/10 bg-white/[.045] p-5">
            <p className="text-sm font-black text-white/52">{tier.name}</p>
            <p className="mt-2 text-4xl font-black text-white">{tier.price}</p>
            <p className="mt-3 text-sm leading-6 text-white/62">{tier.description}</p>
          </div>
        ))}
      </div>
    </StaticPage>
  );
}
