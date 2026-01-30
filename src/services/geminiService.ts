import { GoogleGenerativeAI } from "@google/generative-ai";
import { Question } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
console.log("Gemini API Key:", apiKey ? "Configurada corretamente" : "NÃO ENCONTRADA");

const genAI = new GoogleGenerativeAI(apiKey || "");

// Identificador único para verificar se a nova versão foi carregada
console.log("--- Gemini Service: Versão Estável v1 ---");

// Modelos estáveis e amplamente disponíveis
// Modelos em ordem de tentativa. 
// Coloquei o 'gemini-pro' (1.0) primeiro por ser o mais compatível com todas as chaves.
const STABLE_MODELS = ["gemini-pro", "gemini-1.5-flash", "gemini-1.5-pro"];

// LOG DE DEBUG PARA A CHAVE (Apenas tamanho e prefixo para segurança)
console.log("--- DEBUG API KEY ---");
console.log("Tamanho da chave:", apiKey?.length);
console.log("Começa com AIza:", apiKey?.startsWith("AIza"));
console.log("----------------------");

const cleanAIResponse = (text: string) => {
  try {
    // Tenta encontrar um JSON [] ou {} no meio do texto
    const jsonMatch = text.match(/\[[\s\S]*\]/) || text.match(/\{[\s\S]*\}/);
    const cleaned = jsonMatch ? jsonMatch[0] : text;
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Erro ao processar resposta da IA. Texto recebido:", text);
    throw new Error("A IA retornou um formato inválido. Tente novamente.");
  }
};

export const generateQuestionsFromPrompt = async (prompt: string): Promise<Partial<Question>[]> => {
  if (!apiKey || apiKey === "PLACEHOLDER_API_KEY") {
    throw new Error("Chave de API (VITE_GEMINI_API_KEY) não encontrada nas configurações.");
  }

  let errors: string[] = [];

  for (const modelName of STABLE_MODELS) {
    try {
      console.log(`Tentando modelo: ${modelName}`);
      // Removemos o 'apiVersion' fixo para deixar o SDK decidir a melhor rota
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent({
        contents: [{
          role: "user", parts: [{
            text: `
          Gere um formulário JSON estruturado para o objetivo: "${prompt}".
          Retorne APENAS um array JSON. Seguindo este esquema de objeto:
          { "label": "string", "type": "text|longtext|email|phone|number|select", "options": ["string"], "required": boolean }
        `}]
        }],
        generationConfig: {
          responseMimeType: "application/json",
        }
      });

      const response = await result.response;
      return cleanAIResponse(response.text());
    } catch (error: any) {
      console.warn(`Modelo ${modelName} falhou:`, error.message);
      errors.push(`${modelName}: ${error.message}`);

      // Se for erro de quota (429) ou chave (403), não adianta tentar outros
      if (error.message?.includes("429") || error.message?.includes("403")) break;
    }
  }

  throw new Error(`Não foi possível conectar com a IA. Detalhes:\n${errors.join('\n')}`);
};

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

  for (const modelName of STABLE_MODELS) {
    try {
      console.log(`Gerando análise com modelo: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error(`Erro na análise (${modelName}):`, error.message);
      if (error.message?.includes("429") || error.message?.includes("403")) break;
    }
  }

  return "Obrigado por enviar suas respostas. Sua análise está em processamento.";
};
