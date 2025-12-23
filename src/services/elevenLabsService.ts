// ElevenLabs Voice Cloning Service
// Uses ElevenLabs API to create a temporary voice from a sample and synthesize speech.
// This implementation is lightweight for demo purposes.

export interface ElevenLabsOptions {
    text: string;
    voiceSampleBase64: string;
    signal?: AbortSignal;
}

export const cloneVoiceWithElevenLabs = async (options: ElevenLabsOptions): Promise<string> => {
    const { text, voiceSampleBase64, signal } = options;

    // Retrieve API key from environment variables
    const apiKey =
        import.meta.env.VITE_ELEVENLABS_API_KEY ||
        (window as any).__VITE_ELEVENLABS_API_KEY__ ||
        (window as any).ENV?.VITE_ELEVENLABS_API_KEY ||
        '';

    if (!apiKey) {
        throw new Error('Falta la API Key de ElevenLabs. Configura VITE_ELEVENLABS_API_KEY en Vercel.');
    }

    // Convert base64 audio sample to Blob
    const base64Data = voiceSampleBase64.includes(',')
        ? voiceSampleBase64.split(',')[1]
        : voiceSampleBase64;
    const sampleArray = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const sampleBlob = new Blob([sampleArray], { type: 'audio/wav' });

    // Step 1: Create a temporary voice on ElevenLabs
    const form = new FormData();
    form.append('name', 'temp-clone-' + Date.now());
    form.append('description', 'Voice clone generated from apptextoavoz');
    form.append('files', sampleBlob, 'sample.wav');

    const createResp = await fetch('https://api.elevenlabs.io/v1/voices/add', {
        method: 'POST',
        headers: {
            'xi-api-key': apiKey,
            // When using FormData, the browser sets the correct Content-Type with boundary
        },
        body: form,
        signal,
    });

    if (!createResp.ok) {
        const err = await createResp.text();
        throw new Error(`Error creando voz en ElevenLabs: ${err}`);
    }

    const createData = await createResp.json();
    const voiceId = createData.voice_id || createData.voiceId || createData.id;
    if (!voiceId) {
        throw new Error('No se obtuvo voice_id de ElevenLabs');
    }

    // Step 2: Generate speech using the temporary voice
    const speechResp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
        method: 'POST',
        headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text,
            voice_settings: {
                stability: 0.75,
                similarity_boost: 0.75,
            },
        }),
        signal,
    });

    if (!speechResp.ok) {
        const err = await speechResp.text();
        throw new Error(`Error generando audio en ElevenLabs: ${err}`);
    }

    const audioArrayBuffer = await speechResp.arrayBuffer();
    let binary = '';
    const bytes = new Uint8Array(audioArrayBuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const audioBase64 = window.btoa(binary);
    return audioBase64;
};
