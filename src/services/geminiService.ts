import { GoogleGenerativeAI } from "@google/generative-ai";
import { Question } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
console.log("Gemini API Key:", apiKey ? "Configurada corretamente" : "NÃO ENCONTRADA");

const genAI = new GoogleGenerativeAI(apiKey || "");

// Identificador único para verificar se a nova versão foi carregada
console.log("--- Gemini Service: Versão Estável v4.0 (CACHE BUSTER) ---");

// Modelos estáveis e amplamente disponíveis
// Modelos em ordem de tentativa. 
const STABLE_MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro-latest"
];

// ... (other code remains the same until generateLeadResponse)

export const generateLeadResponse = async (
  formPrompt: string,
  answers: Record<string, string>,
  questions: Question[]
): Promise<string> => {
  if (!apiKey || apiKey === "PLACEHOLDER_API_KEY") {
    return "Obrigado por enviar suas respostas. Nossa equipe entrará em contato em breve.";
  }

  const answerContext = questions.map(q => `${q.label}: ${answers[q.id] || 'N/A'}`).join('\n');
  const prompt = `
    Você é um consultor especializado.
    Objetivo da consultoria: ${formPrompt}
    
    Respostas enviadas pelo Lead:
    ${answerContext}
    
    Analise essas respostas e gere uma resposta personalizada, consultiva e profissional para o lead em formato Markdown. 
    Foque em como os problemas dele podem ser resolvidos. Mantenha um tom encorajador e especialista.
  `;

  let errors: string[] = [];

  for (const modelName of STABLE_MODELS) {
    try {
      console.log(`[IA] Gerando análise com modelo: ${modelName}`);

      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (text) return text;
    } catch (error: any) {
      console.error(`Erro na análise (${modelName}):`, error.message);
      errors.push(`${modelName}: ${error.message}`);
      // Se for erro de quota ou permissão, para o loop. 
      if (error.message?.includes("429") || error.message?.includes("403")) break;
    }
  }

  console.error("Falha em todos os modelos de IA para gerar análise.", errors);

  // DEBUG: Mostrando o erro técnico na tela para o usuário nos mandar o print
  const apiKeyStatus = apiKey ? `Presente (Inicia com: ${apiKey.substring(0, 4)}...)` : "AUSENTE";
  const debugError = errors.join('\n');
  const buildDate = new Date().toLocaleString('pt-BR');

  return `
# Obrigado pelas respostas!

**Diagnóstico Técnico (DEBUG - v4.0 - ${buildDate})**
**(Se você ver 'gemini-pro' abaixo, limpe o cache!)**
\`\`\`
Status da Chave API: ${apiKeyStatus}
Erros por Modelo:
${debugError}
\`\`\`

Infelizmente nossa inteligência artificial está sobrecarregada no momento e não conseguiu gerar sua análise personalizada agora.

**Mas não se preocupe!**
Nossa equipe de especialistas já recebeu seus dados:
${questions.map(q => `- **${q.label}**: ${answers[q.id] || 'N/A'}`).join('\n')}

Entraremos em contato em breve para discutir seu plano de ação.
  `;
};
