import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import { Champ } from '../components/Champ.jsx';

export function Login() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [send, setSend] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const modify = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErrors({});
    setMessage('');
    setSend(true);
    try {
      await login(form);
      navigate(location.state?.depuis ?? '/', { replace: true });
    } catch (error) {
      setErrors(error.errors);
      setMessage(error.status === 422 ? 'Corrige les champs signalés.' : error.message);
    } finally {
      setSend(false);
    }
  }

  return (
    <main className="carte-form">
      <h1>Se connecter</h1>
      {location.state?.registered && (
        <p role="status" className="succes">Compte créé : tu peux te connecter.</p>
      )}
      {message && <p role="alert" className="alerte">{message}</p>}
      <form onSubmit={submit} noValidate>
        <Champ id="email" label="Email" type="email" value={form.email} onChange={modify}
          erreur={errors.email} autoComplete="email" required />
        <Champ id="password" label="password" type="password" value={form.password}
          onChange={modify} erreur={errors.password} autoComplete="current-password" required />
        <button type="submit" disabled={send}>{send ? 'Connexion…' : 'Se connecter'}</button>
      </form>
      <p>Pas encore de compte ? <Link to="/register">Créer un compte</Link></p>
    </main>
  );
}