import { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../api/Frontauth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Au chargement de l'app : le cookie est-il encore valide ?
  useEffect(() => {
    api.myProfile()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(id) {
    const data = await api.loggedin(id);
    setUser(data.user);
  }

  async function logout() {
    await api.loggedout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}