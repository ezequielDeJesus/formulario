import React from 'react';
import { Navigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';

interface AdminLayoutProps {
    children: React.ReactNode;
    isAuthenticated: boolean;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (val: boolean) => void;
    handleLogout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
    children,
    isAuthenticated,
    isSidebarOpen,
    setIsSidebarOpen,
    handleLogout
}) => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-black overflow-hidden">
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-md shadow-md"
            >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Sidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                handleLogout={handleLogout}
            />

            <main className="flex-1 overflow-y-auto p-4 lg:p-8 pt-16 lg:pt-8 bg-gray-50 dark:bg-black">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
