import { Code2, Copy, Check } from "lucide-react";
import { useState } from "react";

const setupCode = `# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
createdb b2p_db
alembic upgrade head
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
cp .env.example .env
npm run dev`;

export default function HomePage() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(setupCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-linen-canvas">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-radial-wash opacity-20" />
        <div className="max-w-4xl mx-auto px-6 py-24 relative">
          <div className="text-center mb-12">
            <h1 className="text-display text-midnight-ink mb-4">
              Build with <span className="text-signal-blue">B2P</span>
            </h1>
            <p className="text-body text-ash max-w-2xl mx-auto">
              A full-stack Brand-to-Promoter collaboration platform. FastAPI backend, React frontend, PostgreSQL database.
            </p>
          </div>

          <div className="bg-white border border-slate-custom/10 rounded-cards-lg shadow-feature-section p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-signal-blue" />
                <span className="text-sm font-medium text-graphite">Quick Start</span>
              </div>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ash hover:text-signal-blue transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="bg-linen-canvas border border-slate-custom/10 rounded-cards p-4 overflow-x-auto">
              <code className="text-xs text-graphite font-mono leading-relaxed">{setupCode}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-heading-lg text-midnight-ink mb-4">What's included</h2>
            <p className="text-body text-ash">Everything you need to launch a production-ready platform.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Authentication & Security", desc: "JWT tokens, email verification, password reset, account lockout, rate limiting" },
              { title: "Role-Based Access", desc: "BUSINESS, PROMOTER, and ADMIN roles with granular route protection" },
              { title: "Campaign Management", desc: "Full CRUD with status lifecycle, search, pagination, and filtering" },
              { title: "Smart Matching", desc: "Rule-based scoring engine with niche, location, followers, and engagement matching" },
              { title: "Collaborations", desc: "Applications, invitations, accept/reject workflows, and review system" },
              { title: "Admin Panel", desc: "User management, campaign moderation, audit logs, and analytics" },
            ].map((feature) => (
              <div key={feature.title} className="bg-linen-canvas border border-slate-custom/10 rounded-cards p-5 shadow-product-card">
                <h3 className="text-heading-sm text-graphite mb-2">{feature.title}</h3>
                <p className="text-sm text-ash leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
