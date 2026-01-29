import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import FormEditor from './pages/FormEditor';
import LeadsList from './pages/LeadsList';
import PublicFormView from './pages/PublicFormView';
import ExpertLanding from './pages/ExpertLanding';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import ThemeManager from './components/ThemeManager';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 border-none">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const renderAdminRoute = (Component: React.FC) => (
    <AdminLayout
      isAuthenticated={!!user}
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      handleLogout={handleLogout}
    >
      <Component />
    </AdminLayout>
  );

  return (
    <HashRouter>
      <ThemeManager />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/admin" element={renderAdminRoute(AdminDashboard)} />
        <Route path="/admin/formularios/novo" element={renderAdminRoute(FormEditor)} />
        <Route path="/admin/formularios/:id/editar" element={renderAdminRoute(FormEditor)} />
        <Route path="/admin/leads" element={renderAdminRoute(LeadsList)} />

        <Route path="/f/:slug" element={<PublicFormView />} />
        <Route path="/f/:slug/especialista" element={<ExpertLanding />} />

        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
