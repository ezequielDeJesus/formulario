import React from 'react';
import { Wand2, Sparkles, Trash2, Plus } from 'lucide-react';
import { FormConfig, Question, QuestionType } from '../../types';
import { QUESTION_TYPES } from '../../constants';
import Button from '../Button';

interface QuestionsTabProps {
    form: FormConfig;
    aiPrompt: string;
    setAiPrompt: (val: string) => void;
    handleAiGenerate: () => void;
    isGenerating: boolean;
    updateQuestion: (qId: string, updates: Partial<Question>) => void;
    removeQuestion: (qId: string) => void;
    addQuestion: () => void;
}

const QuestionsTab: React.FC<QuestionsTabProps> = ({
    form,
    aiPrompt,
    setAiPrompt,
    handleAiGenerate,
    isGenerating,
    updateQuestion,
    removeQuestion,
    addQuestion
}) => {
    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl shadow-lg text-white">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg"><Wand2 size={24} /></div>
                    <h2 className="text-xl font-bold">IA Geradora</h2>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="O que este formulário deve perguntar?"
                        className="flex-1 p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-100 outline-none h-20 resize-none"
                    />
                    <Button
                        onClick={handleAiGenerate}
                        isLoading={isGenerating}
                        variant="secondary"
                        className="bg-white text-blue-700 hover:bg-blue-50 border-none px-8"
                        icon={!isGenerating && <Sparkles size={20} />}
                    >
                        Gerar
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {form.questions.map((q, idx) => (
                    <div key={q.id} className="bg-white dark:bg-gray-900 p-5 rounded-xl border dark:border-gray-800 shadow-sm group">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">{idx + 1}</span>
                            <input
                                type="text"
                                value={q.label}
                                onChange={(e) => updateQuestion(q.id, { label: e.target.value })}
                                className="flex-1 font-semibold text-gray-800 dark:text-gray-200 bg-transparent border-b border-transparent focus:border-blue-500 outline-none"
                            />
                            <button onClick={() => removeQuestion(q.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <select
                                    value={q.type}
                                    onChange={(e) => updateQuestion(q.id, { type: e.target.value as QuestionType })}
                                    className="w-full p-2 text-sm border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-200 outline-none"
                                >
                                    {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                            {q.type === 'select' && (
                                <div className="md:col-span-2">
                                    <textarea
                                        value={q.options?.join('\n') || ''}
                                        onChange={(e) => updateQuestion(q.id, { options: e.target.value.split('\n') })}
                                        className="w-full p-3 text-sm border dark:border-gray-700 rounded-lg h-24 outline-none bg-white dark:bg-gray-800 dark:text-gray-200"
                                        placeholder="Opções (uma por linha)"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <Button
                    onClick={addQuestion}
                    variant="outline"
                    className="w-full py-4 text-gray-400 dark:text-gray-500 border-dashed"
                    icon={<Plus size={20} />}
                >
                    Adicionar Pergunta
                </Button>
            </div>
        </div>
    );
};

export default QuestionsTab;
