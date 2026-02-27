import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Mantemos o 1.5-flash para garantir estabilidade e velocidade na sua cota de estudante.
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    if (body.acao === "VALIDAR_EMOCAO") {
      const prompt = `Analise a palavra: "${body.palavra}". É um sentimento ou estado emocional?
      Retorne APENAS um JSON: {"valido": boolean, "emocao": "Nome", "emoji": "emoji", "cor": "HEX"}`;
      const result = await model.generateContent(prompt);
      return NextResponse.json(JSON.parse(result.response.text()));
    }

    if (body.acao === "FUNDIR_EMOCOES") {
      const prompt = `Funde as emoções "${body.emocao1}" e "${body.emocao2}". Qual o resultado complexo?
      Retorne APENAS um JSON: {"emocao": "Nova Emoção", "emoji": "emoji", "cor": "HEX"}`;
      const result = await model.generateContent(prompt);
      return NextResponse.json(JSON.parse(result.response.text()));
    }

    if (body.acao === "MATERIALIZAR") {
      const prompt = `
      Atue como um diretor de arte de iluminação abstrata.
      Gere a "Aura" (Mesh Gradient) para a emoção: "${body.emocao}".

      Retorne APENAS um JSON:
      {
        "emocao": "${body.emocao}",
        "cores": ["HEX1", "HEX2", "HEX3", "HEX4"], // 4 cores que representem a emoção perfeitamente.
        "velocidade": 6, // 1 (muito lento/calmo) a 10 (muito rápido/caótico)
        "caos": false, // true para emoções instáveis (ex: raiva, medo), false para estáveis (ex: paz)
        "frase": "Gere uma frase curta, bem irônica, debochada, malcriada e com linguajar popular sobre esse sentimento. Seja engraçado e direto."
      }`;

      const result = await model.generateContent(prompt);
      return NextResponse.json(JSON.parse(result.response.text()));
    }

    return NextResponse.json(
      { error: "Ação não reconhecida" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Erro na API:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
