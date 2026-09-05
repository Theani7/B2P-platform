import Link from "next/link";

export const metadata = {
  title: "Terms — Byparsathy",
  description: "The terms of using Byparsathy.",
};

const SECTIONS = [
  {
    h: "Accounts",
    p: "You must provide accurate information when registering, verify your email, and keep your credentials secure. You are responsible for activity under your account.",
  },
  {
    h: "Marketplace conduct",
    p: "Post honest briefs and profiles. Do not misrepresent your audience, impersonate others, or use the platform for spam, harassment, or unlawful content. Violations may lead to suspension or removal.",
  },
  {
    h: "Collaborations",
    p: "Campaign terms are agreed between the business and the creator inside each collaboration. Each side is responsible for honoring what it agrees to, including deliverables and payment terms.",
  },
  {
    h: "Content",
    p: "You retain ownership of content you upload. By posting it, you grant Byparsathy the right to display it within the platform for marketplace purposes.",
  },
  {
    h: "Termination",
    p: "You may stop using the platform at any time. We may suspend or delete accounts that breach these terms.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-linen-canvas">
      <div className="mx-auto max-w-[800px] px-6 pb-24 pt-28">
        <Link href="/" className="text-sm font-medium text-signal-blue hover:opacity-80">
          ← Back home
        </Link>
        <h1 className="mb-2 mt-6 text-heading-lg text-midnight-ink">Terms of Service</h1>
        <p className="mb-10 text-sm text-ash">Last updated: 2026</p>
        <div className="flex flex-col gap-8">
          {SECTIONS.map((s) => (
            <section key={s.h}>
              <h2 className="mb-2 text-heading-sm text-graphite">{s.h}</h2>
              <p className="text-body leading-relaxed text-steel">{s.p}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
