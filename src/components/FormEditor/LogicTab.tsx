import React from 'react';
import { FormConfig } from '../../types';
import Card from '../Card';

interface LogicTabProps {
    form: FormConfig;
    setForm: React.Dispatch<React.SetStateAction<FormConfig>>;
}

const LogicTab: React.FC<LogicTabProps> = ({ form, setForm }) => {
    return (
        <Card title="Lógica IA" subtitle="Define como a IA deve analisar as respostas">
            <div className="space-y-4">
                <textarea
                    value={form.aiResponsePrompt}
                    onChange={(e) => setForm({ ...form, aiResponsePrompt: e.target.value })}
                    className="w-full h-48 p-4 border dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-transparent dark:text-gray-200"
                    placeholder="Ex: Use as respostas acima para criar um diagnóstico..."
                />
                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30">
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                        Não esqueça de configurar o Link de Especialistas na aba "Branding" para direcionar seus leads após a análise.
                    </p>
                </div>
            </div>
        </Card>
    );
};

export default LogicTab;
