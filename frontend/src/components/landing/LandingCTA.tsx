import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";

export default function LandingCTA() {
  return (
    <section className="py-20 lg:py-28 bg-linen-canvas">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="relative bg-white border border-gray-200 rounded-3xl p-10 sm:p-14 text-center overflow-hidden"
        >
          <div className="absolute inset-0 -z-10 bg-[rgba(20,90,255,0.1)] rounded-3xl" />
          <h2 className="text-2xl sm:text-3xl font-medium text-midnight-ink tracking-[-0.22px] mb-4">
            Ready to grow your next collaboration?
          </h2>
          <p className="text-sm text-slate leading-relaxed max-w-lg mx-auto mb-8">
            Join hundreds of businesses and creators already using Byparsathy to work smarter.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/register">
              <Button size="lg" variant="primary" className="h-12 px-6 text-base border border-primary-action-accent text-primary-action-accent bg-white hover:bg-gray-50">
                Create your account
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="primary" className="h-12 px-6 text-base border border-primary-action-accent text-primary-action-accent bg-white hover:bg-gray-50">
                Sign in
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
