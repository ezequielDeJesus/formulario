import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  ArrowLeft,
  Sparkles,
  Palette,
  MessageSquare,
  Package,
  Loader2
} from 'lucide-react';
import { FormConfig, Question, Product, QuestionType } from '../types';
import { DEFAULT_PRIMARY_COLOR } from '../constants';
import { generateQuestionsFromPrompt } from '../services/geminiService';
import { useAuth } from '../hooks/useAuth';
import { useForms } from '../hooks/useForms';
import Button from '../components/Button';
import BrandingTab from '../components/FormEditor/BrandingTab';
import QuestionsTab from '../components/FormEditor/QuestionsTab';
import ProductsTab from '../components/FormEditor/ProductsTab';
import LogicTab from '../components/FormEditor/LogicTab';

const FormEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { saveForm: firestoreSave, getFormById } = useForms();
  const isEditing = !!id;

  const [form, setForm] = useState<FormConfig>({
    id: '',
    name: '',
    slug: '',
    status: 'active',
    primaryColor: DEFAULT_PRIMARY_COLOR,
    theme: 'light',
    questions: [],
    aiResponsePrompt: 'Analise as respostas e forneça uma recomendação personalizada de serviços com tom consultivo e profissional.',
    products: [],
    expertLink: '',
    createdAt: Date.now()
  });

  const [loading, setLoading] = useState(isEditing);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'branding' | 'questions' | 'logic' | 'products'>('branding');

  useEffect(() => {
    if (isEditing) {
      loadFormData();
    }
  }, [id]);

  const loadFormData = async () => {
    try {
      const formData = await getFormById(id);
      if (formData) {
        console.log("FormEditor: Dados carregados com sucesso!", {
          id: formData.id,
          nome: formData.name,
          perguntas: formData.questions?.length || 0
        });
        setForm({
          ...formData,
          questions: formData.questions || [],
          products: formData.products || []
        });
      } else {
        console.error("FormEditor: Formulário não encontrado no Firebase.");
        alert("Erro: Formulário não encontrado.");
        navigate('/admin');
      }
    } catch (err: any) {
      console.error("FormEditor: Erro crítico ao carregar dados:", err.message);
      alert("Erro ao carregar formulário: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const saveForm = async () => {
    if (!form.name || !form.slug) {
      alert('Por favor, preencha o nome e a URL (slug).');
      return;
    }

    setLoading(true);

    try {
      await firestoreSave(form);
      navigate('/admin');
    } catch (err: any) {
      alert('Erro ao salvar formulário: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt) {
      alert('Por favor, descreva o objetivo do formulário para a IA.');
      return;
    }
    setIsGenerating(true);
    try {
      const suggested = await generateQuestionsFromPrompt(aiPrompt);
      const newQuestions: Question[] = suggested.map(q => ({
        id: crypto.randomUUID(),
        label: q.label || 'Nova Pergunta',
        type: (q.type as QuestionType) || 'text',
        options: q.options || [],
        required: q.required ?? true
      }));
      setForm(prev => ({ ...prev, questions: [...prev.questions, ...newQuestions] }));
      setAiPrompt('');
      setActiveTab('questions');
    } catch (err: any) {
      alert('Erro ao gerar perguntas com IA: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setIsGenerating(false);
    }
  };

  const addQuestion = () => {
    const newQ: Question = { id: crypto.randomUUID(), label: 'Nova Pergunta', type: 'text', required: true, options: [] };
    setForm(prev => ({ ...prev, questions: [...prev.questions, newQ] }));
  };

  const updateQuestion = (qId: string, updates: Partial<Question>) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === qId ? { ...q, ...updates } : q)
    }));
  };

  const removeQuestion = (qId: string) => {
    setForm(prev => ({ ...prev, questions: prev.questions.filter(q => q.id !== qId) }));
  };

  const addProduct = () => {
    const newP: Product = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      price: '',
      imageUrls: [],
      ctaLink: '#'
    };
    setForm(prev => ({ ...prev, products: [...prev.products, newP] }));
  };

  const updateProduct = (pId: string, updates: Partial<Product>) => {
    setForm(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === pId ? { ...p, ...updates } : p)
    }));
  };

  const addProductImage = (pId: string, base64: string) => {
    setForm(prev => ({
      ...prev,
      products: prev.products.map(p => {
        if (p.id === pId) {
          return { ...p, imageUrls: [...(p.imageUrls || []), base64] };
        }
        return p;
      })
    }));
  };

  const removeProductImage = (pId: string, imgIndex: number) => {
    setForm(prev => ({
      ...prev,
      products: prev.products.map(p => {
        if (p.id === pId) {
          const newImages = [...(p.imageUrls || [])];
          newImages.splice(imgIndex, 1);
          return { ...p, imageUrls: newImages };
        }
        return p;
      })
    }));
  };

  if (loading && isEditing) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  }

  const tabClasses = (tab: typeof activeTab) => `
    w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors
    ${activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-blue-50'}
  `;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="p-2 hover:bg-white rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{isEditing ? 'Editar' : 'Criar'} Formulário</h1>
            <p className="text-gray-500 text-sm">Configure o visual e as perguntas do seu fluxo</p>
          </div>
        </div>
        <Button
          onClick={saveForm}
          isLoading={loading}
          icon={!loading && <Save size={20} />}
        >
          {isEditing ? 'Salvar Alterações' : 'Publicar Formulário'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2">
          <button onClick={() => setActiveTab('branding')} className={tabClasses('branding')}>
            <Palette size={18} /> Visual e Branding
          </button>
          <button onClick={() => setActiveTab('questions')} className={tabClasses('questions')}>
            <Sparkles size={18} /> Perguntas (IA)
          </button>
          <button onClick={() => setActiveTab('logic')} className={tabClasses('logic')}>
            <MessageSquare size={18} /> Lógica de Resposta
          </button>
          <button onClick={() => setActiveTab('products')} className={tabClasses('products')}>
            <Package size={18} /> Produtos Associados
          </button>
        </div>

        <div className="md:col-span-3 space-y-6">
          {activeTab === 'branding' && form && (
            <BrandingTab
              form={form}
              setForm={setForm}
              handleFileUpload={handleFileUpload}
            />
          )}

          {activeTab === 'questions' && form && (
            <QuestionsTab
              form={form}
              aiPrompt={aiPrompt}
              setAiPrompt={setAiPrompt}
              handleAiGenerate={handleAiGenerate}
              isGenerating={isGenerating}
              updateQuestion={updateQuestion}
              removeQuestion={removeQuestion}
              addQuestion={addQuestion}
            />
          )}

          {activeTab === 'products' && form && (
            <ProductsTab
              form={form}
              setForm={setForm}
              updateProduct={updateProduct}
              addProduct={addProduct}
              addProductImage={addProductImage}
              removeProductImage={removeProductImage}
              handleFileUpload={handleFileUpload}
            />
          )}

          {activeTab === 'logic' && form && (
            <LogicTab form={form} setForm={setForm} />
          )}
        </div>
      </div>
    </div>
  );
};

export default FormEditor;
