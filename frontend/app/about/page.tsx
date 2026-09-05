import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "About — Byparsathy",
  description: "What Byparsathy is and how brand to creator collaboration works.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-linen-canvas">
      <div className="mx-auto max-w-[800px] px-6 pb-24 pt-28">
        <Link href="/" className="text-sm font-medium text-signal-blue hover:opacity-80">
          ← Back home
        </Link>
        <h1 className="mb-4 mt-6 text-heading-lg text-midnight-ink">Brands meet creators here</h1>
        <p className="mb-6 text-body leading-relaxed text-steel">
          Byparsathy is a collaboration platform for Nepal. Businesses post campaign briefs,
          creators apply or get matched by fit, and both sides manage deliverables, chat,
          and reviews in one shared workspace.
        </p>
        <p className="mb-10 text-body leading-relaxed text-steel">
          Every match is scored out of 100 across niche fit, location, audience, and track
          record, and the breakdown is always visible. No black boxes, no middlemen.
        </p>
        <div className="rounded-cards border border-steel/10 bg-white p-8 text-center shadow-product-card">
          <h2 className="mb-2 text-heading-sm text-graphite">Ready to try it?</h2>
          <p className="mb-6 text-sm text-ash">Free to join for brands and creators.</p>
          <Link href="/register">
            <Button>
              <span className="flex items-center gap-2">Get started <ArrowRight size={16} /></span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
