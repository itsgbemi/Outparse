
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ProofreadingResult, EditorialTone } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const PROOFREADING_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    correctedText: {
      type: Type.STRING,
      description: "The full text after improvements.",
    },
    suggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          original: { type: Type.STRING, description: "Problematic substring. Do not include surrounding spaces." },
          replacement: { type: Type.STRING, description: "The replacement string." },
          explanation: { type: Type.STRING, description: "Short reason." },
          category: { type: Type.STRING, enum: ['Grammar', 'Style', 'Clarity', 'Tone', 'Vocabulary'] },
          index: { type: Type.INTEGER, description: "The exact 0-based character index where 'original' starts in the user text." }
        },
        required: ["id", "original", "replacement", "explanation", "category", "index"]
      }
    },
    stats: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.NUMBER },
        level: { type: Type.STRING },
        wordCount: { type: Type.INTEGER },
        sentenceCount: { type: Type.INTEGER },
        readingTime: { type: Type.STRING }
      },
      required: ["score", "level", "wordCount", "sentenceCount", "readingTime"]
    },
    overallTone: { type: Type.STRING }
  },
  required: ["correctedText", "suggestions", "stats", "overallTone"]
};

export const analyzeText = async (text: string, tone: EditorialTone): Promise<ProofreadingResult> => {
  // Use Gemini 3 Flash for speed. 0 thinking budget + low temperature = fast & precise.
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a professional editor. Analyze the text for ${tone} tone.
    RULES:
    1. Identify all grammar, spelling, and style issues.
    2. Provide the 'index' as the exact 0-based starting position of the 'original' string in the source text.
    3. Ensure 'original' does NOT include leading/trailing spaces unless the space itself is the error.
    4. Validate your indices twice.
    
    Text: "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: PROOFREADING_SCHEMA,
      temperature: 0.1,
      thinkingConfig: { thinkingBudget: 0 }
    }
  });

  try {
    const result = JSON.parse(response.text);
    // Strict validation: discard any suggestion with an incorrect index
    result.suggestions = result.suggestions.filter((s: any) => {
      const actual = text.substring(s.index, s.index + s.original.length);
      if (actual === s.original) return true;
      
      // Attempt recovery if index is hallucinated but word exists
      const recoveredIndex = text.indexOf(s.original);
      if (recoveredIndex !== -1) {
        s.index = recoveredIndex;
        return true;
      }
      return false;
    });
    return result;
  } catch (e) {
    throw new Error("Analysis failed");
  }
};

export const generateSpeech = async (text: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Read: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
};
