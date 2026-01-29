import React from 'react';
import { Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    PlusCircle,
    LogOut,
    FormInput,
    X,
    Sun,
    Moon
} from 'lucide-react';
import { THEME_STORAGE_KEY } from '../constants';

interface SidebarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (val: boolean) => void;
    handleLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    isSidebarOpen,
    setIsSidebarOpen,
    handleLogout
}) => {
    return (
        <aside className={`
      fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r dark:border-gray-800 transform transition-transform duration-300 ease-in-out
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:translate-x-0 lg:static
    `}>
            <div className="flex flex-col h-full">
                <div className="p-6 border-b dark:border-gray-800 flex items-center gap-2">
                    <FormInput className="text-blue-600" size={28} />
                    <span className="text-xl font-bold text-gray-800 dark:text-white">Formulary AI</span>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden ml-auto p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                    >
                        <X size={20} className="dark:text-gray-400" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        to="/admin"
                        onClick={() => setIsSidebarOpen(false)}
                        className="flex items-center gap-3 p-3 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors"
                    >
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link
                        to="/admin/leads"
                        onClick={() => setIsSidebarOpen(false)}
                        className="flex items-center gap-3 p-3 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors"
                    >
                        <Users size={20} />
                        <span>Leads</span>
                    </Link>
                    <Link
                        to="/admin/formularios/novo"
                        onClick={() => setIsSidebarOpen(false)}
                        className="flex items-center gap-3 p-3 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors"
                    >
                        <PlusCircle size={20} />
                        <span>Novo Formulário</span>
                    </Link>
                </nav>

                <div className="p-4 border-t dark:border-gray-800 space-y-2">
                    <button
                        onClick={() => {
                            const isDark = document.documentElement.classList.toggle('dark');
                            localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
                        }}
                        className="flex items-center gap-3 w-full p-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <Sun className="hidden dark:block" size={20} />
                        <Moon className="block dark:hidden" size={20} />
                        <span className="hidden dark:block">Modo Claro</span>
                        <span className="block dark:hidden">Modo Escuro</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Sair</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
