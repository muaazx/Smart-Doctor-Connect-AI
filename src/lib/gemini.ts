import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getDoctorSuggestions(symptoms: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a medical assistant AI for a Pakistani doctor platform.
      A patient described their symptoms as: "${symptoms}"
      
      Based on these symptoms, suggest the single most relevant doctor specialization. 
      Common specializations in Pakistan: [General Physician, Cardiologist, Dermatologist, Neurologist, Gynecologist, Pediatrician, ENT Specialist, Psychiatrist, Urologist]
      
      Respond ONLY in this JSON format:
      {
        "specialization": "Cardiologist",
        "reason": "Brief reason why this specialization is recommended"
      }`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          specialization: { type: Type.STRING },
          reason: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function chatWithDoctorAI(doctorName: string, specialization: string, message: string, history: any[] = []) {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `You are an AI assistant for ${doctorName}, a ${specialization} doctor in Pakistan.
        The doctor is currently unavailable. Your job is to:
        1. Greet the patient politely.
        2. Collect their full name, contact number, and reason for visit.
        3. Reassure them that the doctor will follow up soon.
        4. Be professional and friendly.
        Keep responses short and conversational.`,
    },
    history: history.map(h => ({
      role: h.isAI ? 'model' : 'user',
      parts: [{ text: h.text }]
    }))
  });

  const result = await chat.sendMessage({ message });
  return result.text;
}
