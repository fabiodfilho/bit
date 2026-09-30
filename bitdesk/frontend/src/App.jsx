import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota Pública */}
          <Route path="/login" element={<Login />} />

          {/* Rotas Protegidas dentro do Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<div className="p-4"><h1 className="text-2xl font-bold">Dashboard (Em breve)</h1></div>} />
              <Route path="/solicitacoes" element={<div className="p-4"><h1 className="text-2xl font-bold">Lista de Solicitações (Em breve)</h1></div>} />
              <Route path="/solicitacoes/nova" element={<div className="p-4"><h1 className="text-2xl font-bold">Nova Solicitação (Em breve)</h1></div>} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>

          {/* Redirecionamento padrão */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;