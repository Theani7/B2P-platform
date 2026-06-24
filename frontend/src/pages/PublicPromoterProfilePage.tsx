import { useParams } from "react-router-dom";

export default function PublicPromoterProfilePage() {
  const { username } = useParams<{ username: string }>();
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold text-text">@/{username}</h1>
      <p>Public promoter profile page - display portfolio, social links, and metrics.</p>
    </div>
  );
}