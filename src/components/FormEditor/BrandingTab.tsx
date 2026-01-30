import React from 'react';
import { Sun, Moon, Image as ImageIcon, Upload } from 'lucide-react';
import { FormConfig } from '../../types';
import Card from '../Card';

interface BrandingTabProps {
    form: FormConfig;
    setForm: React.Dispatch<React.SetStateAction<FormConfig>>;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => void;
}

const BrandingTab: React.FC<BrandingTabProps> = ({ form, setForm, handleFileUpload }) => {
    return (
        <Card title="Branding e Tema" subtitle="Como o seu cliente verá o formulário">
            <div className="space-y-6">
                <div className="space-y-3">
                    <label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">Tema Visual do Formulário Público</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => {
                                setForm({ ...form, theme: 'light' });
                                document.documentElement.classList.remove('dark');
                            }}
                            className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all ${form.theme === 'light' ? 'border-blue-600 bg-blue-50 text-blue-700 ring-4 ring-blue-100' : 'border-gray-100 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-400 hover:border-gray-200'}`}
                        >
                            <Sun size={32} />
                            <span className="font-bold">MODO CLARO</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setForm({ ...form, theme: 'dark' });
                                document.documentElement.classList.add('dark');
                            }}
                            className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all ${form.theme === 'dark' ? 'border-blue-600 bg-gray-900 text-white ring-4 ring-blue-100/20' : 'border-gray-100 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-400 hover:border-gray-200'}`}
                        >
                            <Moon size={32} />
                            <span className="font-bold">MODO DARK</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Nome <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full p-2 border dark:border-gray-700 rounded-lg outline-none bg-transparent dark:text-white focus:border-blue-500"
                            placeholder="Ex: Lead Qualificado"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">URL (Slug) <span className="text-red-500">*</span></label>
                        <div className="flex items-center">
                            <span className="bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 border-r-0 px-3 py-2 rounded-l-lg text-gray-400 text-sm">/f/</span>
                            <input
                                type="text"
                                value={form.slug}
                                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                className="w-full p-2 border dark:border-gray-700 rounded-r-lg outline-none bg-transparent dark:text-white focus:border-blue-500"
                                placeholder="minha-url"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Cor Primária</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={form.primaryColor}
                                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                                className="w-12 h-10 border dark:border-gray-700 p-1 rounded cursor-pointer bg-white dark:bg-gray-800"
                            />
                            <input
                                type="text"
                                value={form.primaryColor}
                                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                                className="flex-1 p-2 border dark:border-gray-700 rounded-lg text-sm font-mono bg-transparent dark:text-white focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Logo</label>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 border dark:border-gray-700 rounded flex items-center justify-center bg-gray-50 dark:bg-gray-800 overflow-hidden">
                                {form.logo ? <img src={form.logo} className="w-full h-full object-contain" alt="Logo preview" /> : <ImageIcon size={20} className="text-gray-300" />}
                            </div>
                            <label className="flex-1 flex items-center justify-center gap-2 p-2 border border-dashed dark:border-gray-700 rounded-lg text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors dark:text-gray-400">
                                <Upload size={14} /> Upload
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, (base64) => setForm({ ...form, logo: base64 }))}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default BrandingTab;
