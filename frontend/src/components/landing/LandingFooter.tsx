import { Link } from "react-router-dom";

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "For Businesses", href: "#businesses" },
    { label: "For Promoters", href: "#promoters" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Contact", href: "#" },
  ],
  legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
  ],
};

export default function LandingFooter() {
  return (
    <footer className="py-12 bg-white border-t border-stone-100">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block text-lg font-medium text-stone-900 mb-4">
              Byparsathy
            </Link>
            <p className="text-xs text-stone-900 leading-relaxed max-w-[200px]">
              The collaboration marketplace for businesses and promoters in Nepal.
            </p>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-stone-900 mb-4">Product</p>
            <ul className="flex flex-col gap-2.5">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-stone-900 hover:text-brand-purple transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-stone-900 mb-4">Company</p>
            <ul className="flex flex-col gap-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-stone-900 hover:text-brand-purple transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-stone-900 mb-4">Legal</p>
            <ul className="flex flex-col gap-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-stone-900 hover:text-brand-purple transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-900">© 2026 Byparsathy, Nepal.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs text-stone-900 hover:text-brand-purple transition-colors">Twitter</a>
            <a href="#" className="text-xs text-stone-900 hover:text-brand-purple transition-colors">LinkedIn</a>
            <a href="#" className="text-xs text-stone-900 hover:text-brand-purple transition-colors">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
