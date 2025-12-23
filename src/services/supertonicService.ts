import * as ort from 'onnxruntime-web';

// Configure ONNX Runtime
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.0/dist/';

interface SupertonicModels {
    encoder: ort.InferenceSession | null;
    decoder: ort.InferenceSession | null;
    vocoder: ort.InferenceSession | null;
}

class SupertonicService {
    private models: SupertonicModels = {
        encoder: null,
        decoder: null,
        vocoder: null
    };

    private isLoading = false;
    private isLoaded = false;

    /**
     * Initialize and load ONNX models
     */
    async loadModels(): Promise<void> {
        if (this.isLoaded) return;
        if (this.isLoading) {
            // Wait for current loading to complete
            while (this.isLoading) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return;
        }

        this.isLoading = true;
        console.log('🎵 Loading Supertonic models...');

        try {
            // Load models in parallel
            const [encoder, decoder, vocoder] = await Promise.all([
                ort.InferenceSession.create('/models/supertonic/encoder.onnx'),
                ort.InferenceSession.create('/models/supertonic/decoder.onnx'),
                ort.InferenceSession.create('/models/supertonic/vocoder.onnx')
            ]);

            this.models.encoder = encoder;
            this.models.decoder = decoder;
            this.models.vocoder = vocoder;

            this.isLoaded = true;
            console.log('✅ Supertonic models loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load Supertonic models:', error);
            throw new Error('No se pudieron cargar los modelos de Supertonic. Verifica que los archivos ONNX estén en /public/models/supertonic/');
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Text to phonemes conversion (simplified)
     */
    private textToPhonemes(text: string): number[] {
        // This is a simplified version. In production, you'd use a proper phonemizer
        // For now, we'll convert text to character codes as a placeholder
        const cleaned = text.toLowerCase().trim();
        return Array.from(cleaned).map(char => char.charCodeAt(0));
    }

    /**
     * Generate speech from text using Supertonic
     */
    async generateSpeech(text: string): Promise<string> {
        if (!this.isLoaded) {
            await this.loadModels();
        }

        if (!this.models.encoder || !this.models.decoder || !this.models.vocoder) {
            throw new Error('Modelos no cargados');
        }

        try {
            console.log('🎤 Generating speech with Supertonic...');

            // 1. Convert text to phoneme sequence
            const phonemes = this.textToPhonemes(text);
            const phonemeTensor = new ort.Tensor('int64', new BigInt64Array(phonemes.map(p => BigInt(p))), [1, phonemes.length]);

            // 2. Encode phonemes to latent representation
            const encoderOutput = await this.models.encoder.run({
                input_ids: phonemeTensor
            });

            // 3. Decode latent to mel-spectrogram
            const decoderOutput = await this.models.decoder.run({
                latent: encoderOutput.latent
            });

            // 4. Vocode mel-spectrogram to waveform
            const vocoderOutput = await this.models.vocoder.run({
                mel: decoderOutput.mel
            });

            // 5. Convert output tensor to audio data
            const audioData = vocoderOutput.audio.data as Float32Array;

            // 6. Convert to WAV format and return as base64
            const wavData = this.floatArrayToWav(audioData, 22050); // Supertonic uses 22.05kHz
            const base64 = this.arrayBufferToBase64(wavData);

            console.log('✅ Speech generated successfully');
            return base64;

        } catch (error) {
            console.error('❌ Error generating speech:', error);
            throw new Error('Error al generar audio con Supertonic');
        }
    }

    /**
     * Convert Float32Array to WAV format
     */
    private floatArrayToWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
        const buffer = new ArrayBuffer(44 + samples.length * 2);
        const view = new DataView(buffer);

        // WAV header
        const writeString = (offset: number, string: string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + samples.length * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true); // PCM
        view.setUint16(22, 1, true); // Mono
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, samples.length * 2, true);

        // Convert float samples to 16-bit PCM
        let offset = 44;
        for (let i = 0; i < samples.length; i++) {
            const s = Math.max(-1, Math.min(1, samples[i]));
            view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            offset += 2;
        }

        return buffer;
    }

    /**
     * Convert ArrayBuffer to base64
     */
    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    /**
     * Unload models to free memory
     */
    async unloadModels(): Promise<void> {
        if (this.models.encoder) await this.models.encoder.release();
        if (this.models.decoder) await this.models.decoder.release();
        if (this.models.vocoder) await this.models.vocoder.release();

        this.models = { encoder: null, decoder: null, vocoder: null };
        this.isLoaded = false;
        console.log('🗑️ Supertonic models unloaded');
    }
}

// Export singleton instance
export const supertonicService = new SupertonicService();
