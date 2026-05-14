import { StaticPage } from "@/components/StaticPage";

export default function TermsPage() {
  return (
    <StaticPage title="Terms">
      <p>
        CookedMeter is for entertainment and general information only. Outputs
        may include practical suggestions, but they are not medical, legal,
        financial, emergency, or other professional advice.
      </p>
      <p>
        The app must not be used to plan harm, harassment, fraud, illegal
        activity, or unsafe behavior. If a situation involves immediate danger or
        self-harm, CookedMeter should return a supportive safe-mode response
        instead of a score.
      </p>
      <p>
        Generated results may be wrong, spicy, or overly dramatic. That is partly
        the bit, but you are responsible for decisions you make afterward.
      </p>
      <p>
        Public links can expose the generated result to anyone who has the URL.
        Do not submit or share private information you would not want others to
        see.
      </p>
    </StaticPage>
  );
}
