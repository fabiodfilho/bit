import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Solicitacoes } from './pages/Solicitacoes'; 
import { Perfil } from './pages/Perfil';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        {/* Configuração global do Toaster */}
        <Toaster 
          position="top-right" 
          toastOptions={{ 
            style: { background: '#1e293b', color: '#f8fafc', border: '1px solid #334155' },
            success: { iconTheme: { primary: '#10b981', secondary: '#1e293b' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } }
          }} 
        />
        <BrowserRouter>
          <Routes>
            {/* Rota Pública */}
            <Route path="/login" element={<Login />} />

            {/* Rotas Protegidas no Layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/solicitacoes" element={<Solicitacoes />} />
                <Route path="/solicitacoes/nova" element={<Solicitacoes />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/perfil" element={<Perfil />} />
              </Route>
            </Route>

            {/* Redirecionamento padrão */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;