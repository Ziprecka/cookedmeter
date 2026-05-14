import { StaticPage } from "@/components/StaticPage";

export default function ContactPage() {
  return (
    <StaticPage title="Contact">
      <p>
        Questions, feedback, takedown requests, or business inquiries can go to:
      </p>
      <p>
        <a
          className="font-black text-orange-200 underline decoration-orange-200/30 underline-offset-4"
          href="mailto:hello@cookedmeter.com"
        >
          hello@cookedmeter.com
        </a>
      </p>
      <p>
        If your message involves immediate danger or a personal crisis, contact
        local emergency services or a trusted person near you first.
      </p>
    </StaticPage>
  );
}
