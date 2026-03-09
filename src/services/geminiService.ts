import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function chatWithTutor(history: any[], message: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [{ text: "你是一个专业的少儿英语节奏导师皮皮（一只可爱的小老虎）。你的任务是帮助孩子们根据他们提供的单词编写有趣的、朗朗上口的三字经口诀（Phonics Rhymes）。每个口诀应该包含3个短句，每句包含一个目标单词及其中文意思。语气要活泼、鼓励性强，多用表情符号。例如：我家 dad (爸爸), 脾气 bad (坏的), 让我 sad (伤心的)。" }]
        },
        ...history,
        {
          role: "user",
          parts: [{ text: message }]
        }
      ],
      config: {
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
}
