import React, { useState, useEffect } from 'react';
import {
  Search,
  Calendar,
  X,
  Mail,
  Phone,
  User as UserIcon,
  MessageSquare,
  Download,
  ClipboardList,
  Loader2
} from 'lucide-react';
import { marked } from 'marked';
import { Lead, FormConfig } from '../types';
import { useLeads } from '../hooks/useLeads';
import { useForms } from '../hooks/useForms';
import Button from '../components/Button';
import Card from '../components/Card';

const LeadsList: React.FC = () => {
  const { getLeads } = useLeads();
  const { getForms } = useForms();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [forms, setForms] = useState<FormConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFormId, setFilterFormId] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsData, formsData] = await Promise.all([
        getLeads(),
        getForms()
      ]);

      if (leadsData) setLeads(leadsData);
      if (formsData) setForms(formsData);
    } catch (error) {
      console.error("Erro ao carregar leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const getQuestionLabel = (formId: string, qId: string) => {
    const form = forms.find(f => f.id === formId);
    if (!form) return "Campo";
    const question = form.questions.find(q => q.id === qId);
    return question ? question.label : "Campo";
  };

  const filteredLeads = leads.filter(lead => {
    const name = lead.contactInfo?.name || '';
    const email = lead.contactInfo?.email || '';

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesForm = filterFormId === 'all' || lead.formId === filterFormId;

    return matchesSearch && matchesForm;
  });

  const exportCSV = () => {
    const headers = ['Nome', 'Email', 'Telefone', 'Formulário', 'Data'];
    const rows = filteredLeads.map(l => [
      l.contactInfo?.name || '',
      l.contactInfo?.email || '',
      l.contactInfo?.phone || '',
      l.formName || '',
      new Date(l.timestamp).toLocaleString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers, ...rows].map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leads_export_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Leads Coletados</h1>
          <p className="text-gray-500 dark:text-gray-400">Dados persistidos no Firebase</p>
        </div>
        <Button
          onClick={exportCSV}
          variant="secondary"
          icon={<Download size={18} />}
        >
          Exportar CSV
        </Button>
      </div>

      <Card padding="none">
        <div className="p-4 border-b dark:border-gray-800 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <select
            value={filterFormId}
            onChange={(e) => setFilterFormId(e.target.value)}
            className="border dark:border-gray-700 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 dark:text-white outline-none min-w-[200px]"
          >
            <option value="all">Todos os Formulários</option>
            {forms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm font-semibold border-b dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4">Lead</th>
                  <th className="px-6 py-4">Formulário</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-800">
                {filteredLeads.length > 0 ? filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{lead.contactInfo?.name || 'Anônimo'}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{lead.contactInfo?.email || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                        {lead.formName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(lead.timestamp).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        onClick={() => setSelectedLead(lead)}
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold"
                      >
                        Ver Detalhes
                      </Button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">Nenhum lead encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border dark:border-gray-800">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
              <h2 className="text-2xl font-bold dark:text-white">Detalhes do Lead</h2>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors dark:text-gray-400"
                aria-label="Fechar"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 flex flex-col items-center text-center">
                  <UserIcon className="text-blue-500 mb-2" />
                  <span className="text-xs text-gray-400 font-bold uppercase">Nome</span>
                  <span className="font-semibold dark:text-gray-200">{selectedLead.contactInfo?.name || 'N/A'}</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 flex flex-col items-center text-center">
                  <Mail className="text-blue-500 mb-2" />
                  <span className="text-xs text-gray-400 font-bold uppercase">Email</span>
                  <span className="font-semibold dark:text-gray-200">{selectedLead.contactInfo?.email || 'N/A'}</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 flex flex-col items-center text-center">
                  <Phone className="text-blue-500 mb-2" />
                  <span className="text-xs text-gray-400 font-bold uppercase">Telefone</span>
                  <span className="font-semibold dark:text-gray-200">{selectedLead.contactInfo?.phone || 'N/A'}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2 dark:text-white">
                  <ClipboardList className="text-blue-600" /> Respostas
                </h3>
                <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl divide-y dark:divide-gray-800">
                  {Object.entries(selectedLead.answers || {}).length > 0 ? (
                    Object.entries(selectedLead.answers).map(([qId, answer]) => {
                      const label = getQuestionLabel(selectedLead.formId, qId);
                      return (
                        <div key={qId} className="p-4 flex flex-col md:flex-row">
                          <span className="text-sm font-bold text-gray-500 dark:text-gray-400 w-full md:w-1/3">{label}:</span>
                          <span className="text-gray-800 dark:text-gray-200">{String(answer)}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-gray-500 italic dark:text-gray-400">Nenhuma resposta registrada.</div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2 dark:text-white">
                  <MessageSquare className="text-purple-600" /> Análise IA
                </h3>
                <div
                  className="bg-purple-50 dark:bg-purple-900/10 p-6 rounded-2xl border border-purple-100 dark:border-purple-800/30 markdown-content dark:text-gray-200"
                  dangerouslySetInnerHTML={{ __html: marked.parse(selectedLead.aiResponse || "Sem análise gerada.") }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsList;
