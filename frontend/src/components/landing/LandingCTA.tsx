import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";

export default function LandingCTA() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="relative bg-gray-50 border border-gray-200 rounded-3xl p-10 sm:p-14 text-center overflow-hidden"
        >
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-purple/5 via-transparent to-brand-indigo/5 rounded-3xl" />
          <h2 className="text-2xl sm:text-3xl font-medium text-gray-900 tracking-tight mb-4">
            Ready to grow your next collaboration?
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-lg mx-auto mb-8">
            Join hundreds of businesses and creators already using Byparsathy to work smarter.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/register">
              <Button size="lg" className="h-12 px-6 text-base">
                Create your account
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="secondary" className="h-12 px-6 text-base">
                Sign in
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
