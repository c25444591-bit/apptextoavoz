/**
 * XTTS-v2 Voice Cloning Service
 * Uses Vercel API proxy to avoid CORS issues
 */

export interface XTTSOptions {
    text: string;
    voiceSampleBase64: string;
    language?: string;
    signal?: AbortSignal;
}

export const cloneVoiceWithXTTS = async (
    options: XTTSOptions
): Promise<string> => {
    const { text, voiceSampleBase64, language = 'es', signal } = options;

    try {
        console.log('🎤 Clonando voz con XTTS-v2 via proxy...');

        // Call our Vercel API endpoint instead of Hugging Face directly
        const response = await fetch('/api/voice-clone', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                voiceSampleBase64,
                language
            }),
            signal,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Error del servidor:', errorData);

            if (response.status === 503) {
                throw new Error('El modelo XTTS-v2 se está cargando. Intenta de nuevo en 20 segundos.');
            }

            throw new Error(errorData.error || `Error al clonar voz: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success || !data.audio) {
            throw new Error('No se recibió audio del servidor');
        }

        console.log('✅ Voz clonada exitosamente');

        return data.audio;

    } catch (error: any) {
        if (error.name === 'AbortError') {
            throw error;
        }

        console.error('❌ Error en clonación de voz:', error);
        throw new Error(error.message || 'Error al clonar la voz con XTTS-v2');
    }
};
