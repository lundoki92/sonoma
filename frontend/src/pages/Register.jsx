import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { registered } from '../api/Frontauth.js';
import { Champ } from '../components/Champ.jsx';
import ExplanationText from '../components/common/ExplanationText.jsx';
import './Auth.css';

export function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [send, setSend] = useState(false);
  const navigate = useNavigate();

  const modify = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const canSubmit =
    form.username.trim() !== '' &&
    form.email.trim() !== '' &&
    form.password !== '';

  async function submit(e) {
    e.preventDefault();
    if (send) return;

    setErrors({});
    setMessage('');
    setSend(true);

    try {
      await registered(form);
      // On passe l'email pour le préremplir sur la page de connexion.
      navigate('/login', {
        state: { registered: true, email: form.email.trim() },
      });
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
          title="Créer un compte"
          text="Un pseudo, un email, un mot de passe : tu peux lancer ta première soirée."
        />

        {message && (
          <p role="alert" className="alerte">
            {message}
          </p>
        )}

        <form onSubmit={submit} noValidate aria-busy={send}>
          <Champ
            id="username"
            label="Pseudo"
            value={form.username}
            onChange={modify}
            erreur={errors.username}
            placeholder="Ton pseudo"
            autoComplete="nickname"
            required
          />

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
            label="Mot de passe (8 caractères minimum)"
            type="password"
            value={form.password}
            onChange={modify}
            erreur={errors.password}
            placeholder="Choisis un mot de passe"
            autoComplete="new-password"
            required
          />

          <button type="submit" disabled={send || !canSubmit}>
            {send ? 'Création…' : 'Créer mon compte'}
          </button>
        </form>

        <p>
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </main>
  );
}
