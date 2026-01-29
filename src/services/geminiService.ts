import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Question } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
console.log("Gemini API Key configurada:", apiKey ? `Sim (Iniciando com ${apiKey.substring(0, 6)}...)` : "Não");
const genAI = new GoogleGenerativeAI(apiKey || "");

const cleanAIResponse = (text: string) => {
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const cleaned = jsonMatch ? jsonMatch[0] : text;
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Erro ao processar resposta da IA:", text);
    throw new Error("A IA retornou um formato inválido. Tente novamente.");
  }
};

export const generateQuestionsFromPrompt = async (prompt: string): Promise<Partial<Question>[]> => {
  if (!apiKey || apiKey === "PLACEHOLDER_API_KEY") {
    throw new Error("API Key do Gemini não configurada.");
  }

  // Modelos para tentar em ordem de prioridade
  const modelsToTry = ["gemini-2.0-flash-exp", "gemini-1.5-flash", "gemini-1.5-pro"];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Tentando conectar com o modelo: ${modelName}`);
      const model = genAI.getGenerativeModel({
        model: modelName
      });

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
      const text = response.text();
      return cleanAIResponse(text);
    } catch (error: any) {
      console.error(`Falha no modelo ${modelName}:`, error.message);
      lastError = error;

      // Se for erro de quota ou segurança, não tenta os outros
      if (error.message?.includes("429") || error.message?.includes("403")) {
        break;
      }
    }
  }

  throw new Error(lastError?.message || "Erro de conexão com o Google AI. Verifique sua chave.");
};

export const generateLeadResponse = async (
  formPrompt: string,
  answers: Record<string, string>,
  questions: Question[]
): Promise<string> => {
  const modelName = "gemini-2.0-flash-exp";
  try {
    const model = genAI.getGenerativeModel({ model: modelName });

    const answerContext = questions.map(q => `${q.label}: ${answers[q.id] || 'N/A'}`).join('\n');

    const prompt = `
      Você é um consultor especializado.
      Objetivo da consultoria: ${formPrompt}
      
      Respostas enviadas pelo Lead:
      ${answerContext}
      
      Analise essas respostas e gere uma resposta personalizada, consultiva e profissional para o lead em formato Markdown. 
      Foque em como os problemas dele podem ser resolvidos. Mantenha um tom encorajador e especialista.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error(`Erro na análise (modelo ${modelName}):`, error);
    return "Obrigado por enviar suas respostas. Nossa equipe entrará em contato em breve.";
  }
};
