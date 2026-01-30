import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Loader2,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Users,
  Sparkles,
  MessageCircle,
  X
} from 'lucide-react';
import { marked } from 'marked';
import { FormConfig, Question, Product } from '../types';
import { generateLeadResponse } from '../services/geminiService';
import { useForms } from '../hooks/useForms';
import { useLeads } from '../hooks/useLeads';

const ProductCarousel: React.FC<{ product: Product, primaryColor: string }> = ({ product, primaryColor }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const images = product.imageUrls || [];

  if (images.length === 0) return null;

  return (
    <div className="relative group">
      <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 transition-colors">
        <img src={images[currentIdx]} className="w-full h-full object-cover transition-all duration-500" />
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setCurrentIdx(prev => (prev === 0 ? images.length - 1 : prev - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-black/50 dark:text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => setCurrentIdx(prev => (prev === images.length - 1 ? 0 : prev + 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-black/50 dark:text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${idx === currentIdx ? 'w-4 bg-white shadow-sm' : 'w-1.5 bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const PublicFormView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { getFormBySlug } = useForms();
  const { saveLead } = useLeads();
  const [form, setForm] = useState<FormConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResult, setAiResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [showIntermediate, setShowIntermediate] = useState(false);
  const [showAIResult, setShowAIResult] = useState(false);

  useEffect(() => {
    const fetchFormData = async () => {
      if (!slug) return;
      const config = await getFormBySlug(slug);

      if (config) {
        setForm(config);
        document.documentElement.style.setProperty('--primary-color', config.primaryColor);

        // Aplica o tema imediatamente para evitar flash branco
        if (config.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      setLoading(false);
    };

    fetchFormData();

    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, [slug]);

  const handleInputChange = useCallback((qId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  }, []);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => phone.replace(/\D/g, '').length >= 10;

  const handleNext = () => {
    if (!form) return;
    const q = form.questions[currentStep];
    const val = answers[q.id] || '';
    if (q.required && !val.trim()) { setError('Campo obrigatório.'); return; }
    if (val) {
      if (q.type === 'email' && !validateEmail(val)) { setError('E-mail inválido.'); return; }
      if (q.type === 'phone' && !validatePhone(val)) { setError('Telefone inválido.'); return; }
    }
    setError(null);
    if (currentStep < form.questions.length - 1) setCurrentStep(prev => prev + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    if (!form) return;
    setIsSubmitting(true);
    console.log("Iniciando submissão do formulário...", { formId: form.id });

    try {
      console.log("Solicitando resposta à IA...");
      const aiResponse = await generateLeadResponse(form.aiResponsePrompt, answers, form.questions);
      console.log("Resposta da IA recebida (tamanho):", aiResponse.length);
      setAiResult(aiResponse);

      const emailField = form.questions.find(q => q.type === 'email');
      const phoneField = form.questions.find(q => q.type === 'phone');
      const nameField = form.questions.find(q => (q.label || '').toLowerCase().includes('nome'));

      // Sanitize payload to remove any undefined values
      const payload = JSON.parse(JSON.stringify({
        formId: form.id,
        formName: form.name,
        answers: answers,
        aiResponse: aiResponse || '',
        userId: form.userId || '',
        contactInfo: {
          name: (nameField && answers[nameField.id]) || 'Lead Anônimo',
          email: (emailField && answers[emailField.id]) || null,
          phone: (phoneField && answers[phoneField.id]) || null,
        }
      }));

      console.log("Salvando Lead no Firestore with payload:", payload);
      await saveLead(payload);
      console.log("Lead salvo com sucesso.");

      setShowIntermediate(true);
    } catch (err: any) {
      console.error("Erro crítico na submissão:", err);
      // Detailed error for debugging
      const errorMessage = err.message || JSON.stringify(err);
      alert(`Erro ao enviar respostas (v2): ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black transition-colors"><Loader2 className="animate-spin text-primary" size={48} /></div>;
  if (!form) return <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors"><h1 className="text-2xl font-bold">Formulário não encontrado</h1><Link to="/" className="text-blue-600 underline mt-4">Voltar</Link></div>;

  const isDark = form.theme === 'dark';

  if (showIntermediate && !showAIResult) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 animate-in fade-in transition-colors ${isDark ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
        <div className="w-full max-w-xl text-center space-y-10">
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight">Análise Concluída!</h2>
          <div className="grid grid-cols-1 gap-6">
            <button
              type="button"
              onClick={() => navigate(`/f/${slug}/especialista`)}
              className="w-full bg-emerald-600 text-white p-8 rounded-[2rem] shadow-xl flex items-center gap-6 hover:scale-[1.02] transition-transform shadow-emerald-500/10"
            >
              <Users size={40} className="shrink-0" />
              <div className="text-left">
                <p className="font-black text-2xl uppercase">Falar com Especialista</p>
                <p className="text-emerald-100 text-sm font-medium">Inicie sua mentoria agora via WhatsApp.</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setShowAIResult(true)}
              className="w-full bg-blue-600 text-white p-8 rounded-[2rem] shadow-xl flex items-center gap-6 hover:scale-[1.02] transition-transform shadow-blue-500/10"
            >
              <Sparkles size={40} className="shrink-0" />
              <div className="text-left">
                <p className="font-black text-2xl uppercase">Ver Resultado IA</p>
                <p className="text-blue-100 text-sm font-medium">Acesse sua análise estratégica personalizada.</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showAIResult) {
    return (
      <div className={`min-h-screen flex flex-col items-center py-10 px-4 transition-colors ${isDark ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
        <div className="w-full max-w-3xl space-y-8 animate-in fade-in">
          <div className={`p-10 rounded-[2.5rem] shadow-2xl border relative overflow-hidden transition-colors ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
            <div className="absolute top-0 left-0 w-full h-3 bg-primary"></div>
            <h2 className="text-3xl font-black mb-8 flex items-center gap-4"><Sparkles className="text-primary" /> Diagnóstico IA</h2>
            <div
              className={`markdown-content text-lg transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              dangerouslySetInnerHTML={{ __html: marked.parse(aiResult) }}
            />
          </div>

          <Link
            to={`/f/${slug}/especialista`}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-center gap-6 group transition-all transform hover:scale-[1.01] border-4 border-emerald-500/30"
          >
            <div className="p-4 bg-white/20 rounded-3xl group-hover:scale-110 transition-transform">
              <MessageCircle size={40} className="fill-white/10" />
            </div>
            <div className="text-center md:text-left flex-1">
              <p className="font-black text-xl md:text-2xl leading-tight uppercase tracking-tight">
                Acelerar resultados com o Especialista
              </p>
              <p className="text-emerald-100 text-sm mt-2 font-medium">Inicie sua jornada para os 7 dígitos faturados</p>
            </div>
            <ExternalLink size={24} className="ml-auto opacity-50 hidden md:block" />
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {form.products.map(p => (
              <div key={p.id} className={`rounded-[2rem] overflow-hidden shadow-xl border p-6 flex flex-col gap-6 group hover:scale-[1.02] transition-all ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                <ProductCarousel product={p} primaryColor={form.primaryColor} />
                <div className="flex-1 flex flex-col">
                  <h4 className={`font-black text-2xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{p.name}</h4>
                  <p className={`text-sm mb-6 flex-1 line-clamp-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{p.description}</p>
                  <div className={`flex items-center justify-between mt-auto pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                    <span className="font-black text-2xl text-primary">{p.price}</span>
                    <a
                      href={p.ctaLink}
                      target="_blank"
                      className="bg-primary text-white px-8 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-blue-200/50 active:scale-95 transition-all"
                    >
                      Adquirir
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentQ = form.questions[currentStep];
  return (
    <div className={`min-h-screen flex flex-col items-center py-12 px-6 transition-colors ${isDark ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
      <div className="w-full max-w-2xl text-center mb-12">
        {form.logo && <img src={form.logo} className="h-16 mx-auto mb-8 transition-all" />}
        <div className={`h-2 rounded-full overflow-hidden mb-4 transition-colors ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className="h-full bg-primary transition-all duration-700" style={{ width: `${((currentStep + 1) / form.questions.length) * 100}%` }}></div>
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Passo {currentStep + 1} de {form.questions.length}</p>
      </div>
      <div className="w-full max-w-2xl animate-in fade-in slide-in-from-right-8 duration-500">
        <h1 className="text-4xl lg:text-5xl font-black mb-10 leading-tight tracking-tight">{currentQ.label}</h1>
        {currentQ.type === 'select' ? (
          <div className="grid gap-4">
            {currentQ.options?.map(opt => (
              <button
                type="button"
                key={opt}
                onClick={() => handleInputChange(currentQ.id, opt)}
                className={`p-6 border-2 rounded-[1.8rem] text-left font-bold text-lg lg:text-xl transition-all ${answers[currentQ.id] === opt
                  ? 'border-primary bg-primary/10 text-primary shadow-xl shadow-primary/5'
                  : `${isDark ? 'border-gray-800 bg-gray-900/40 hover:bg-gray-800 hover:border-gray-700' : 'border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200'}`}`}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <input
            key={currentQ.id}
            type={currentQ.type === 'number' ? 'number' : 'text'}
            className={`w-full p-8 border-2 rounded-[1.8rem] outline-none focus:border-primary text-2xl transition-all ${isDark ? 'bg-gray-900 border-gray-800 text-white placeholder:text-gray-700' : 'bg-white border-gray-100 text-gray-900 shadow-sm placeholder:text-gray-300'}`}
            value={answers[currentQ.id] || ''}
            onChange={(e) => handleInputChange(currentQ.id, e.target.value)}
            placeholder="Digite aqui..."
            autoFocus
          />
        )}
        {error && <p className="text-red-500 mt-8 font-black flex items-center gap-2 animate-bounce"><X size={20} /> {error}</p>}
        <div className="mt-16 flex flex-col sm:flex-row gap-4">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => prev - 1)}
              className={`flex-1 py-6 border-2 rounded-[1.8rem] font-black text-lg flex items-center justify-center gap-2 transition-all ${isDark ? 'border-gray-800 hover:bg-gray-900 text-gray-400' : 'border-gray-100 hover:bg-gray-50 text-gray-500'}`}
            >
              <ChevronLeft /> Voltar
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="flex-[2] py-6 bg-primary text-white rounded-[1.8rem] font-black text-xl lg:text-2xl flex items-center justify-center gap-2 shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : currentStep === form.questions.length - 1 ? 'Gerar Análise IA' : 'Continuar'}
          </button>
        </div>
      </div>
      <div className="mt-8 text-center animate-pulse">
        <p className="text-[10px] text-gray-400 dark:text-gray-600 font-mono select-none">
          Versão: 3.2 (Deploy Confirmado)
        </p>
      </div>
    </div>
  );
};

export default PublicFormView;
