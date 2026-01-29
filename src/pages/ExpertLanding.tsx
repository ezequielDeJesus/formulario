
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Trophy,
  Target,
  TrendingUp,
  ShieldCheck,
  MessageCircle,
  ArrowRight,
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { useForms } from '../hooks/useForms';
import { FormConfig } from '../types';

const ExpertLanding: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getFormBySlug } = useForms();
  const [form, setForm] = useState<FormConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFormData = async () => {
      if (!slug) return;
      const data = await getFormBySlug(slug);

      if (data) {
        setForm(data);
        if (data.primaryColor) {
          document.documentElement.style.setProperty('--primary-color', data.primaryColor);
        }
      }
      setLoading(false);
    };

    fetchFormData();

    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, [slug]);

  // Efeito para aplicar o tema do formulário de forma soberana
  useEffect(() => {
    if (form) {
      const isDark = form.theme === 'dark';
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [form]);

  const ensureAbsoluteUrl = (url?: string) => {
    if (!url || url === '#') return '#';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('wa.me')) {
      if (url.startsWith('wa.me')) return `https://${url}`;
      return url;
    }
    return `https://${url}`;
  };

  if (loading) return <div className={`min-h-screen flex items-center justify-center transition-colors ${form?.theme === 'dark' ? 'bg-black' : 'bg-white'}`}><Loader2 className="animate-spin text-primary" size={48} /></div>;
  if (!form) return <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black text-white"><h1 className="text-2xl font-bold">Página não encontrada</h1><Link to="/" className="text-blue-600 underline mt-4">Voltar</Link></div>;

  const finalExpertLink = ensureAbsoluteUrl(form.expertLink);
  const isDark = form.theme === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'} selection:bg-emerald-500/30 selection:text-emerald-400`}>
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full transition-opacity duration-1000 ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-500/5'}`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full transition-opacity duration-1000 ${isDark ? 'bg-blue-500/10' : 'bg-blue-500/5'}`}></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-12 lg:py-24">
        <Link to={`/f/${slug}`} className={`inline-flex items-center gap-2 transition-colors mb-12 text-sm font-black uppercase tracking-widest ${isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}>
          <ChevronLeft size={16} /> Voltar para a análise
        </Link>

        {/* Header Section */}
        <div className="space-y-6 text-center lg:text-left mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className={`inline-flex items-center gap-2 border px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
            <Trophy size={14} /> Autoridade Reconhecida
          </div>
          <h1 className="text-5xl lg:text-8xl font-black tracking-tighter leading-[0.85]">
            Acesso à <span className="text-emerald-500">Mentoria de Elite</span>
          </h1>
          <p className={`text-xl lg:text-2xl font-medium max-w-2xl leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Você está prestes a entrar em contato com o estrategista que gerou mais de <span className={`${isDark ? 'text-white' : 'text-emerald-600'} font-black`}>R$ 3.000.000,00</span> em vendas reais através da internet.
          </p>
        </div>

        {/* Proof Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className={`p-8 rounded-[2.5rem] transition-all border ${isDark ? 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05]' : 'bg-white border-gray-100 hover:shadow-xl shadow-gray-200/50'}`}>
            <Target className="text-emerald-500 mb-6" size={32} />
            <h3 className="text-xl font-black mb-2">Estratégia Pura</h3>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Métodos validados em campos de batalha reais, não apenas teoria de palco.</p>
          </div>
          <div className={`p-8 rounded-[2.5rem] transition-all border ${isDark ? 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05]' : 'bg-white border-gray-100 hover:shadow-xl shadow-gray-200/50'}`}>
            <TrendingUp className="text-blue-500 mb-6" size={32} />
            <h3 className="text-xl font-black mb-2">Escala Acelerada</h3>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Foco total em ROI e crescimento exponencial de faturamento líquido.</p>
          </div>
          <div className={`p-8 rounded-[2.5rem] transition-all border ${isDark ? 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05]' : 'bg-white border-gray-100 hover:shadow-xl shadow-gray-200/50'}`}>
            <ShieldCheck className="text-purple-500 mb-6" size={32} />
            <h3 className="text-xl font-black mb-2">Segurança Total</h3>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Apoio de quem já percorreu o caminho e conhece todos os atalhos seguros.</p>
          </div>
        </div>

        {/* CTA Area */}
        <div className="animate-in fade-in zoom-in duration-700 delay-500">
          <div className="bg-emerald-600 rounded-[3.5rem] p-10 lg:p-16 shadow-2xl shadow-emerald-900/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-3xl rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-125 duration-1000"></div>

            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="flex-1 space-y-6 text-center lg:text-left">
                <h2 className="text-4xl lg:text-6xl font-black text-white leading-[0.9] tracking-tighter">
                  PRONTO PARA O PRÓXIMO NÍVEL?
                </h2>
                <p className="text-emerald-50 text-lg lg:text-xl font-medium max-w-md mx-auto lg:mx-0">
                  Toque no botão abaixo e inicie sua conversa exclusiva via WhatsApp agora.
                </p>
              </div>

              <a
                href={finalExpertLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-emerald-600 px-10 py-6 rounded-full flex items-center gap-4 font-black text-xl lg:text-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 hover:shadow-emerald-400/30 min-w-max"
              >
                <MessageCircle size={32} className="fill-emerald-600/10" />
                INICIAR AGORA
                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className={`text-center text-[10px] mt-20 font-black tracking-[0.3em] uppercase opacity-40`}>
          Vagas Limitadas para Consultoria Individual • 2024 © {form.name}
        </p>
      </div>
    </div>
  );
};

export default ExpertLanding;
