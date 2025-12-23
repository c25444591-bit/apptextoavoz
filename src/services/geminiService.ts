import { GoogleGenAI, Modality } from "@google/genai";
import { VoiceName, AudioFormat } from "../types";
import { cloneVoiceWithElevenLabs } from "./elevenLabsService";

export const generateSpeech = async (
    text: string,
    voice: VoiceName | 'custom-voice',
    format: AudioFormat = AudioFormat.MP3,
    signal?: AbortSignal,
    voiceSampleBase64?: string | null
): Promise<string | undefined> => {

    try {
        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

        // Limpieza agresiva
        const cleanText = text
            .replace(/\s+/g, ' ')
            .replace(/\[.*?\]/g, '')
            .trim();

        if (!cleanText) throw new Error("El texto está vacío");

        const MAX_CHARS = 600;
        const finalText = cleanText.length > MAX_CHARS
            ? cleanText.substring(0, MAX_CHARS) + "... (continúa en el texto escrito)"
            : cleanText;

        // CLONACIÓN DE VOZ CON ELEVENLABS
        if (voice === 'custom-voice' && voiceSampleBase64) {
            console.log('🎤 Usando ElevenLabs para clonación de voz...');
            const audioBase64 = await cloneVoiceWithElevenLabs({
                text: finalText,
                voiceSampleBase64,
                signal
            });
            return audioBase64;
        }

        // VOCES PREDEFINIDAS CON GOOGLE GEMINI
        const apiKey =
            import.meta.env.VITE_API_KEY ||
            (window as any).__VITE_API_KEY__ ||
            (window as any).ENV?.VITE_API_KEY ||
            '';

        console.log('🔑 API Key check:', apiKey ? 'Encontrada ✓' : 'NO encontrada ✗');
        console.log('🔑 API Key length:', apiKey?.length || 0);
        console.log('🔑 API Key starts with:', apiKey?.substring(0, 10) + '...');
        console.log('🔑 Environment variables:', {
            VITE_API_KEY: !!import.meta.env.VITE_API_KEY,
            window_VITE_API_KEY: !!(window as any).__VITE_API_KEY__,
            window_ENV: !!(window as any).ENV?.VITE_API_KEY
        });
        console.log('🎵 Iniciando generación de audio para:', finalText.substring(0, 50) + '...');

        if (!apiKey || apiKey === 'undefined' || apiKey.length < 10) {
            console.error('❌ API Key faltante o inválida');
            throw new Error("API Key no válida. Revisa la configuración en Vercel.");
        }

        const ai = new GoogleGenAI({ apiKey });

        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: finalText }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            voiceName: voice as VoiceName,
                        },
                    },
                },
            },
        });

        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

        console.log('🎵 Respuesta completa de Gemini:', {
            candidates: response.candidates?.length || 0,
            firstCandidate: response.candidates?.[0] ? 'Existe' : 'No existe',
            content: response.candidates?.[0]?.content ? 'Existe' : 'No existe',
            parts: response.candidates?.[0]?.content?.parts?.length || 0
        });

        const audioPart = response.candidates?.[0]?.content?.parts?.[0];
        console.log('🎵 Audio part:', {
            exists: !!audioPart,
            hasInlineData: !!audioPart?.inlineData,
            hasData: !!audioPart?.inlineData?.data,
            dataLength: audioPart?.inlineData?.data?.length || 0,
            mimeType: audioPart?.inlineData?.mimeType
        });
        
        if (audioPart?.inlineData?.data) {
            console.log("✅ Audio generado exitosamente, tamaño:", audioPart.inlineData.data.length, "caracteres");
            console.log("🎵 MIME Type:", audioPart.inlineData.mimeType);
            return audioPart.inlineData.data;
        }

        console.error("❌ La IA no devolvió audio");
        console.error("❌ Estructura de respuesta:", JSON.stringify(response, null, 2));
        throw new Error("La IA no devolvió audio.");

    } catch (clientError: any) {
        if (clientError.name === 'AbortError' || clientError.message === 'Aborted') {
            throw clientError;
        }

        console.error("❌ Error generando audio:", clientError);
        if (clientError.message?.includes("API Key")) throw clientError;
        if (clientError.status === 429) throw new Error("Cuota agotada.");

        throw new Error(clientError.message || "No se pudo generar el audio.");
    }
};