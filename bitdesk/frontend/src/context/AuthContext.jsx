import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const userStorage = localStorage.getItem('usuario');
    if (userStorage) {
      try {
        setUsuario(JSON.parse(userStorage));
      } catch {
        localStorage.removeItem('usuario');
      }
    }
    setCarregando(false);
  }, []);

  const login = (userData) => {
    setUsuario(userData);
    localStorage.setItem('usuario', JSON.stringify(userData));
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
  };

  // NOVA FUNÇÃO: Atualiza os dados do usuário em tempo real
  const atualizarUsuarioLocal = (novosDados) => {
    setUsuario((prev) => {
      const userAtualizado = { ...prev, ...novosDados };
      localStorage.setItem('usuario', JSON.stringify(userAtualizado));
      return userAtualizado;
    });
  };

  return (
    <AuthContext.Provider value={{ usuario, autenticado: Boolean(usuario), carregando, login, logout, atualizarUsuarioLocal }}>
      {children}
    </AuthContext.Provider>
  );
};