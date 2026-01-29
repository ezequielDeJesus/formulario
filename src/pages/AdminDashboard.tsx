import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Copy,
  CheckCircle2,
  XCircle,
  Search,
  Loader2
} from 'lucide-react';
import { FormConfig } from '../types';
import { useForms } from '../hooks/useForms';
import Button from '../components/Button';
import Card from '../components/Card';

const AdminDashboard: React.FC = () => {
  const { getForms, deleteForm, loading: formsLoading } = useForms();
  const [forms, setForms] = useState<FormConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    setLoading(true);
    const data = await getForms();
    if (data) {
      setForms(data);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este formulário? Todos os dados associados (perguntas, produtos) serão perdidos.')) {
      try {
        await deleteForm(id);
        setForms(forms.filter(f => f.id !== id));
      } catch (err) {
        alert('Erro ao excluir formulário.');
      }
    }
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/#/f/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(slug);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredForms = forms.filter(f =>
    (f.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Meus Formulários</h1>
          <p className="text-gray-500 dark:text-gray-400">Gerencie seus fluxos de captura no Supabase</p>
        </div>
        <Link to="/admin/formularios/novo">
          <Button icon={<Plus size={20} />}>
            Criar Novo
          </Button>
        </Link>
      </div>

      <Card padding="none">
        <div className="p-4 border-b dark:border-gray-800">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">URL (Slug)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Criado em</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-800">
                {filteredForms.length > 0 ? filteredForms.map((form) => (
                  <tr key={form.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-100">{form.name}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">/f/{form.slug}</span>
                        <button
                          onClick={() => handleCopyLink(form.slug)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Copiar Link"
                        >
                          {copiedId === form.slug ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-400 dark:text-gray-500" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${form.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                        {form.status === 'active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {form.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {new Date(form.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        to={`/f/${form.slug}`}
                        target="_blank"
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-block"
                        title="Ver Formulário"
                      >
                        <ExternalLink size={18} />
                      </Link>
                      <Link
                        to={`/admin/formularios/${form.id}/editar`}
                        className="p-2 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors inline-block"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(form.id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      Nenhum formulário encontrado. Comece criando um novo!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
