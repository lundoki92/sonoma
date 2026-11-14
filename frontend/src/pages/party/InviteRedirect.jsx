import { Navigate, useParams } from "react-router";

// The invitation used to live on its own page. It is now a modal opened from
// the party header, so old bookmarks go back to the party.
export default function InviteRedirect() {
  const { id } = useParams();

  return <Navigate to={`/playlist/${id}/propose`} replace />;
}
