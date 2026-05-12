import { GoogleGenAI } from '@google/genai';

const getApiKey = () => {
  return import.meta.env.VITE_GEMINI_API_KEY || 
         process.env.GEMINI_API_KEY || 
         "AIzaSyBaA0gPpQI9IGWjwKM99EsvcopsM2BBmNk";
};

const ai = new GoogleGenAI(getApiKey());

export async function getDoctorSuggestions(symptoms: string) {
  try {
    const prompt = `You are a medical AI assistant. Based on the following symptoms/query, suggest the single most appropriate medical specialization the patient should consult. Return ONLY a valid JSON object with two keys: "specialization" (a string, the recommended doctor type, e.g. "Cardiologist", "Neurologist", "Dermatologist") and "reason" (a string, a 1-2 sentence explanation why). Do not include markdown formatting or backticks. Query: ${symptoms}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
  } catch (error) {
    console.error("Gemini AI Error:", error);
  }
  
  // Fallback if AI fails
  return {
    specialization: "General Physician",
    reason: "Based on the input provided, a General Physician would be the best starting point for a comprehensive evaluation."
  };
}

export async function chatWithDoctorAI(doctorName: string, specialization: string, message: string, history: any[] = []) {
  try {
    const formattedHistory = history.map(h => `${h.isAI ? 'Assistant' : 'Patient'}: ${h.text}`).join('\n');
    
    const prompt = `You are an advanced AI assistant representing ${doctorName}, a ${specialization}. The doctor is currently unavailable to chat live.
    Your strict goal is to gracefully collect three pieces of information from the patient so the doctor can contact them later: 
    1. Their Name
    2. Their Contact Number
    3. Their primary Problem/Symptoms
    
    Be empathetic, professional, and concise. Do NOT ask for everything at once if it feels overwhelming. Ask naturally.
    
    Conversation History:
    ${formattedHistory}
    
    Patient's latest message: ${message}
    
    IMPORTANT SYSTEM INSTRUCTION: Once you are absolutely sure you have collected all three pieces of information throughout the conversation, you MUST append this exact JSON block at the very end of your final response, on a new line:
    ___COLLECTED_DATA___ {"name": "patient name", "contact": "patient contact", "problem": "patient problem"}
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    return response.text;
  } catch (error) {
    console.error("Gemini AI Chat Error:", error);
    return `Hello! I am an AI assistant representing ${doctorName} (${specialization}). The AI service is currently unavailable. Could you please provide your details to book a consultation?`;
  }
}
