import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import { Champ } from '../components/Champ.jsx';
import ExplanationText from '../components/common/ExplanationText.jsx';
import './Auth.css';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Si on arrive depuis l'inscription, l'email est déjà rempli.
  const [form, setForm] = useState({
    email: location.state?.email ?? '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [send, setSend] = useState(false);

  const modify = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const canSubmit = form.email.trim() !== '' && form.password !== '';

  async function submit(e) {
    e.preventDefault();
    if (send) return;

    setErrors({});
    setMessage('');
    setSend(true);

    try {
      await login(form);
      navigate(location.state?.depuis ?? '/', { replace: true });
    } catch (error) {
      // 422 : une erreur par champ. Les autres cas : un message global.
      setErrors(error.errors ?? {});
      setMessage(
        error.status === 422 ? 'Corrige les champs signalés.' : error.message,
      );
    } finally {
      setSend(false);
    }
  }

  return (
    <main className="carte-form">
      <div className="auth-card">
        <ExplanationText
          title="Se connecter"
          text="Retrouve tes soirées et la playlist en cours."
        />

        {location.state?.registered && (
          <p role="status" className="succes">
            Compte créé : tu peux te connecter.
          </p>
        )}

        {message && (
          <p role="alert" className="alerte">
            {message}
          </p>
        )}

        <form onSubmit={submit} noValidate aria-busy={send}>
          <Champ
            id="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={modify}
            erreur={errors.email}
            placeholder="ton@email.fr"
            autoComplete="email"
            required
          />

          <Champ
            id="password"
            label="Mot de passe"
            type="password"
            value={form.password}
            onChange={modify}
            erreur={errors.password}
            placeholder="Ton mot de passe"
            autoComplete="current-password"
            required
          />

          <button type="submit" disabled={send || !canSubmit}>
            {send ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p>
          Pas encore de compte ? <Link to="/register">Créer un compte</Link>
        </p>
      </div>
    </main>
  );
}
