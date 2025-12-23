// Piper Service Stub - TTS using native speech synthesis
// This is a placeholder for future Piper TTS integration

export const nativeTtsService = {
    isSupported: () => typeof speechSynthesis !== 'undefined',

    speak: (text: string, rate: number = 1.0, onEnd?: () => void) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.lang = 'es-ES';
        if (onEnd) {
            utterance.onend = () => onEnd();
        }
        speechSynthesis.speak(utterance);
    },

    stop: () => {
        speechSynthesis.cancel();
    },

    pause: async () => {
        speechSynthesis.pause();
    },

    resume: async (rate?: number, onEnd?: () => void) => {
        speechSynthesis.resume();
    }
};
