import { StaticPage } from "@/components/StaticPage";

export default function AboutPage() {
  return (
    <StaticPage title="About CookedMeter">
      <p>
        CookedMeter is a humor tool that turns everyday situations into a cooked
        score, verdict, and recovery plan.
      </p>
      <p>
        The joke is simple: type one sentence, get judged by the oven, and leave
        with something funny enough to share and useful enough to act on.
      </p>
      <p>
        CookedMeter is not a therapy app, financial advisor, legal service, or
        emergency resource. If something is genuinely dangerous, the app should
        drop the roast and point toward real support.
      </p>
    </StaticPage>
  );
}
