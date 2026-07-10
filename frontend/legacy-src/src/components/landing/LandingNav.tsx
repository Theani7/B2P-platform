import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#businesses", label: "For businesses" },
  { href: "#promoters", label: "For promoters" },
];

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-linen-canvas/80 backdrop-blur-md border-b border-slate-custom/10" : "bg-transparent"
      }`}
    >
      <div className="max-w-[1200px] mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-medium text-signal-blue">
          Byparsathy
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-slate-custom hover:text-signal-blue transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm text-slate-custom hover:text-signal-blue px-3 py-2 transition-colors"
          >
            Sign in
          </Link>
          <Link to="/register">
            <Button size="sm" variant="primary-outlined">Get started</Button>
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 text-slate-custom hover:bg-sky-wash rounded-button"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-midnight-ink/30 backdrop-blur-sm z-50 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-linen-canvas z-50 md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between h-16 px-6 border-b border-slate-custom/10">
                <span className="text-lg font-medium text-signal-blue">Byparsathy</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 text-slate-custom hover:bg-sky-wash rounded-button"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-3 rounded-button text-sm text-slate-custom hover:bg-sky-wash transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="p-6 border-t border-slate-custom/10 flex flex-col gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center text-sm text-slate-custom hover:text-signal-blue px-4 py-2.5 border border-slate-custom/20 rounded-button transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center text-sm text-white hero-blue-fade rounded-button px-4 py-2.5 transition-colors"
                >
                  Get started
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
