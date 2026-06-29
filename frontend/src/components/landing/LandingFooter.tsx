import { Link } from "react-router-dom";

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "For businesses", href: "#businesses" },
    { label: "For promoters", href: "#promoters" },
  ],
  company: [
    { label: "About", href: "/" },
    { label: "Contact", href: "/" },
    { label: "Careers", href: "/" },
  ],
  legal: [
    { label: "Privacy", href: "/" },
    { label: "Terms", href: "/" },
  ],
};

export default function LandingFooter() {
  return (
    <footer className="bg-white border-t border-slate-custom/10">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 text-lg font-medium text-signal-blue">
              Byparsathy
            </Link>
            <p className="text-sm text-ash mt-2 max-w-xs">
              Nepal's brand-to-promoter collaboration platform. Connect, collaborate, and grow.
            </p>
          </div>

          <div>
            <h4 className="text-caption font-medium uppercase tracking-wider text-graphite mb-4">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-ash hover:text-signal-blue transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-caption font-medium uppercase tracking-wider text-graphite mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-ash hover:text-signal-blue transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-caption font-medium uppercase tracking-wider text-graphite mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-ash hover:text-signal-blue transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-custom/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ash">© {new Date().getFullYear()} Byparsathy. All rights reserved.</p>
          <p className="text-xs text-ash">Made in Nepal 🇳🇵</p>
        </div>
      </div>
    </footer>
  );
}
