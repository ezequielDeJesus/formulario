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
      console.log(`[IA] Tentando modelo: ${modelName} na rota V1`);

      // FORÇAMOS a versão V1 explicitamente no segundo argumento.
      // Isso mata a tentativa automática de usar a 'v1beta' que está dando erro 404.
      const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1' });

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
      console.log(`[IA] Gerando análise com modelo: ${modelName} na rota V1`);
      // Removida a forçação de apiVersion 'v1' para deixar a lib decidir ou usar o padrão,
      // pois às vezes 'v1' pode não ter o modelo mais novo disponível.
      // Se der erro, tentamos o próximo.
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (text) return text;
    } catch (error: any) {
      console.error(`Erro na análise (${modelName}):`, error.message);
      // Se for erro de quota ou permissão, para o loop. 
      if (error.message?.includes("429") || error.message?.includes("403")) break;
    }
  }

  console.error("Falha em todos os modelos de IA para gerar análise.");
  return `
# Obrigado pelas respostas!

Infelizmente nossa inteligência artificial está sobrecarregada no momento e não conseguiu gerar sua análise personalizada agora.

**Mas não se preocupe!**
Nossa equipe de especialistas já recebeu seus dados:
${questions.map(q => `- **${q.label}**: ${answers[q.id] || 'N/A'}`).join('\n')}

Entraremos em contato em breve para discutir seu plano de ação.
  `;
};
