import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Carregar o perfil do utilizador se houver um token guardado
    const token = localStorage.getItem('bitdesk_token');
    if (token) {
      api.get('/auth/me')
        .then((response) => {
          setUsuario(response.data);
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setCarregando(false);
        });
    } else {
      setCarregando(false);
    }
  }, []);

  const login = async (usuarioInput, senha) => {
    const response = await api.post('/auth/login', {
      usuario: usuarioInput,
      senha: senha
    });

    const { access_token, usuario: dadosUsuario } = response.data;
    
    localStorage.setItem('bitdesk_token', access_token);
    setUsuario(dadosUsuario);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('bitdesk_token');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, autenticado: !!usuario, login, logout, carregando }}>
      {children}
    </AuthContext.Provider>
  );
};