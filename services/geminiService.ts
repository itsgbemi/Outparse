
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ProofreadingResult, EditorialTone } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const PROOFREADING_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    correctedText: {
      type: Type.STRING,
      description: "The full text after all corrections and improvements are applied.",
    },
    suggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          original: { type: Type.STRING, description: "The EXACT substring from the input text that is problematic. Must be verbatim." },
          replacement: { type: Type.STRING, description: "The contextually perfect replacement. No partial fragments." },
          explanation: { type: Type.STRING, description: "Concise reason for the change." },
          category: { type: Type.STRING, enum: ['Grammar', 'Style', 'Clarity', 'Tone', 'Vocabulary'] },
          index: { type: Type.INTEGER, description: "The ZERO-BASED character index where 'original' starts in the input text." }
        },
        required: ["id", "original", "replacement", "explanation", "category", "index"]
      }
    },
    stats: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.NUMBER, description: "Readability score (0-100)." },
        level: { type: Type.STRING, description: "Reading level name." },
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
  // Switched to gemini-3-flash-preview for speed/latency optimization
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a high-end professional editor. Proofread the text for a ${tone} tone.

CRITICAL PRECISION RULES:
1. **Verbatim Indexing**: The 'original' text MUST exist in the input string exactly at the 'index' provided.
2. **Context-Aware Corrections**: Ensure corrections handle adjacent prepositions correctly (e.g., replace 'went to' with 'visited', not just 'went').
3. **Grammar Verification**: The final text must be error-free.

Input Text:
"${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: PROOFREADING_SCHEMA,
      temperature: 0.1,
    }
  });

  try {
    const result = JSON.parse(response.text);
    result.suggestions = result.suggestions.filter((s: any) => {
      const actual = text.substring(s.index, s.index + s.original.length);
      return actual === s.original;
    });
    return result;
  } catch (e) {
    throw new Error("Analysis Error");
  }
};

export const generateSpeech = async (text: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Read this clearly: ${text}` }] }],
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
