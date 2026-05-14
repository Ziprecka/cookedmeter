import { StaticPage } from "@/components/StaticPage";

export default function PrivacyPage() {
  return (
    <StaticPage title="Privacy">
      <p>
        CookedMeter does not require an account for the MVP. Situations are sent
        to the server only when you click the check button so a result can be
        generated.
      </p>
      <p>
        If OpenAI is configured, the server sends your situation to OpenAI to
        produce structured JSON. Do not enter secrets, passwords, private keys,
        or information you are not comfortable processing with an AI provider.
      </p>
      <p>
        Public links are optional and use encoded URL state in this build. Anyone
        with that link can read the situation excerpt and generated result.
        CookedMeter may also store your latest result in localStorage so the
        result page can reload without an account.
      </p>
      <p>
        CookedMeter may use analytics to understand traffic, performance, and
        product usage. Analytics providers may use cookies or similar browser
        technologies depending on their configuration.
      </p>
      <p>
        If advertising is enabled, CookedMeter may work with advertising
        partners including Google AdSense. Those partners may use cookies or
        similar technologies to serve and measure ads. Ads are placed after the
        core result experience, not inside the generator.
      </p>
      <p>
        Generated user content can be funny, personal, or sensitive. Avoid
        submitting private information about yourself or other people.
      </p>
    </StaticPage>
  );
}
