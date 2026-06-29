import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";

export default function LandingCTA() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="bg-linen-canvas border border-slate-custom/10 rounded-cards-lg p-12 lg:p-16 text-center shadow-feature-section"
        >
          <h2 className="text-heading-lg text-midnight-ink mb-4 max-w-2xl mx-auto">
            Ready to transform your marketing?
          </h2>
          <p className="text-body text-ash mb-8 max-w-xl mx-auto">
            Join hundreds of businesses and promoters already using Byparsathy to run
            high-performing campaigns.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="/register" className="inline-flex">
              <Button size="lg" variant="primary-filled">
                <span className="flex items-center gap-2">
                  Get started free
                  <ArrowRight size={16} />
                </span>
              </Button>
            </a>
            <a href="/login" className="inline-flex">
              <Button size="lg" variant="primary-outlined">
                Contact sales
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
