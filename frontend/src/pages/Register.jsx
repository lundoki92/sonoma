import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { registered } from '../api/Frontauth.js';
import { Champ } from '../components/Champ.jsx';

export function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [send, setSend] = useState(false);
  const navigate = useNavigate();

  const modify = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErrors({});
    setMessage('');
    setSend(true);
    try {
      await registered(form);
      navigate('/login', { state: { inscrite: true } });
    } catch (error) {
      setErrors(error.errors);                 // 422 : une error par champ
      // 409, 500… : un message global. Pour un 422, les messages sous les champs suffisent.
      setMessage(error.status === 422 ? 'Corrige les champs signalés.' : error.message);
    } finally {
      setSend(false);
    }
  }

  return (
    <main className="carte-form">
      <h1>Créer un compte</h1>
      {message && <p role="alert" className="alerte">{message}</p>}
      <form onSubmit={submit} noValidate>
        <Champ id="username" label="username" value={form.username} onChange={modify}
          error={errors.username} autoComplete="given-name" required />
        <Champ id="email" label="Email" type="email" value={form.email} onChange={modify}
          error={errors.email} autoComplete="email" required />
        <Champ id="password" label="password (8 caractères minimum)" type="password"
          value={form.password} onChange={modify} error={errors.password}
          autoComplete="new-password" required />
        <button type="submit" disabled={send}>{send ? 'Création…' : 'Créer mon compte'}</button>
      </form>
      <p>Déjà un compte ? <Link to="/connexion">Se connecter</Link></p>
    </main>
  );
}