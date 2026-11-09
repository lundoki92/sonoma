import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';

// Enveloppe une page réservée aux personnes connectées
export function ProtectedRoutes({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p role="status">Chargement…</p>;
  if (!user) {
    // On retient la page demandée pour y revenir après la connexion
    return <Navigate to="/login" replace state={{ depuis: location.pathname }} />;
  }
  return children;
}
