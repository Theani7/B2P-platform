import { Link } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

export default function PromoterDashboard() {
  const { user } = useAuth();

  const links = [
    { to: "/promoter/applications", label: "My Applications", desc: "Track your campaign applications" },
    { to: "/promoter/invitations", label: "Invitations", desc: "Review collaboration invitations" },
    { to: "/promoter/collaborations", label: "Collaborations", desc: "View active and past collaborations" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-6">
        <h1 className="text-2xl font-bold text-text">Welcome, {user?.full_name ?? "Promoter"}</h1>
        <p className="mt-1 text-gray-500">Role: Promoter</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="rounded-lg border bg-white p-4 hover:shadow-sm"
          >
            <h2 className="text-lg font-semibold text-text">{link.label}</h2>
            <p className="mt-1 text-sm text-gray-500">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
