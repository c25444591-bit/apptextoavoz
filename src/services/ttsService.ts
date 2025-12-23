export interface TTSVoice {
  name: string;
  lang: string;
  localService: boolean;
  voiceURI: string;
}

class TTSService {
  private synth: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.synth = window.speechSynthesis;
  }

  private getVoiceScore(voice: SpeechSynthesisVoice): number {
    let score = 0;
    
    // 1. Regional Priority (Argentine Accent)
    if (voice.lang === 'es-AR') score += 1000;
    // Mexican/Latam often closer to intended rhythm than Spain for this request
    else if (voice.lang === 'es-MX' || voice.lang === 'es-419') score += 500; 
    else if (voice.lang === 'es-US') score += 400;
    else if (voice.lang.startsWith('es')) score += 100;
    else return 0; // Not Spanish

    // 2. Engine Quality Priority
    // Google voices on Android/Chrome are often neural/natural
    if (voice.name.includes('Google')) score += 50;
    // Apple/Microsoft "Premium" or "Enhanced" voices
    if (voice.name.toLowerCase().includes('premium')) score += 40;
    if (voice.name.toLowerCase().includes('enhanced')) score += 40;
    if (voice.name.toLowerCase().includes('natural')) score += 40;
    if (voice.name.toLowerCase().includes('online')) score += 30; // Often indicates cloud-based quality

    return score;
  }

  public getVoices(): SpeechSynthesisVoice[] {
    const allVoices = this.synth.getVoices();
    
    // Filter only Spanish and sort by quality score
    return allVoices
      .filter(v => v.lang.startsWith('es'))
      .sort((a, b) => {
        const scoreA = this.getVoiceScore(a);
        const scoreB = this.getVoiceScore(b);
        return scoreB - scoreA; // Descending order (best first)
    });
  }

  public previewVoice(voiceURI: string) {
    // Don't interrupt if actual book reading is happening, but if it's a preview or idle, go ahead
    if (this.synth.speaking && this.currentUtterance) {
       // If we are reading the book, don't interrupt for preview unless we pause? 
       // For simplicity, we just cancel to show preview.
       this.cancel();
    }

    const utterance = new SpeechSynthesisUtterance("Hola, así es como leo este libro.");
    const voices = this.synth.getVoices();
    const selectedVoice = voices.find(v => v.voiceURI === voiceURI);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
      utterance.rate = 1.0;
      this.synth.speak(utterance);
    }
  }

  public speak(text: string, voiceURI: string | null, rate: number = 1, onEnd: () => void, onError: (e: any) => void, volume: number = 1.0) {
    // Clean up previous utterance callbacks to avoid race conditions
    this.cancel();

    // DETECTAR SAMSUNG Y APLICAR FIX ESPECÍFICO
    const userAgent = navigator.userAgent.toLowerCase();
    const isSamsung = /samsung|sm-|galaxy|samsungbrowser/i.test(userAgent);
    
    console.log('🔊 TTS Service - Iniciando speak:', {
      isSamsung,
      userAgent: navigator.userAgent,
      voiceURI,
      textLength: text.length
    });

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;
    
    // Select Voice Logic
    const voices = this.synth.getVoices();
    console.log('🔊 Voces disponibles:', voices.map(v => ({ name: v.name, lang: v.lang, uri: v.voiceURI })));
    
    let selectedVoice: SpeechSynthesisVoice | undefined;

    if (isSamsung) {
      // LÓGICA ESPECÍFICA PARA SAMSUNG - SIMPLIFICADA
      console.log('🔊 Samsung detectado - Aplicando lógica específica');
      
      // Esperar a que las voces se carguen completamente
      if (voices.length === 0) {
        console.log('🔊 Esperando voces en Samsung...');
        setTimeout(() => {
          this.speak(text, voiceURI, rate, onEnd, onError, volume);
        }, 1000);
        return;
      }
      
      // Buscar voces en español
      const spanishVoices = voices.filter(v => 
        v.lang.includes('es') || 
        v.name.toLowerCase().includes('spanish') ||
        v.name.toLowerCase().includes('español')
      );
      
      console.log('🔊 Voces disponibles:', voices.length);
      console.log('🔊 Voces en español:', spanishVoices.length);
      
      if (spanishVoices.length === 0) {
        // Usar voz por defecto si no hay español
        console.log('⚠️ No hay voces en español, usando voz por defecto');
        selectedVoice = voices[0] || null;
      } else {
        // Usar la primera voz en español disponible
        selectedVoice = spanishVoices[0];
        console.log('✅ Voz seleccionada:', selectedVoice.name);
      }
      
      // Configuración conservadora para Samsung
      utterance.rate = Math.max(0.7, Math.min(rate, 1.3));
      utterance.pitch = 1.0;
      utterance.volume = Math.max(0.1, Math.min(volume, 1.0));
      
    } else {
      // LÓGICA NORMAL PARA OTROS DISPOSITIVOS
      // 1. Try to use the user-selected voice
      if (voiceURI) {
        selectedVoice = voices.find(v => v.voiceURI === voiceURI);
      }

      // 2. Auto-select best available if no selection or selection failed
      if (!selectedVoice) {
        const sortedVoices = this.getVoices();
        if (sortedVoices.length > 0) {
          selectedVoice = sortedVoices[0];
        }
      }
      
      utterance.rate = rate;
      utterance.pitch = 1.0;
      utterance.volume = Math.max(0.1, Math.min(volume, 1.0));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
      console.log('🔊 Configuración final:', {
        voice: selectedVoice.name,
        lang: selectedVoice.lang,
        rate: utterance.rate,
        pitch: utterance.pitch
      });
    } else {
      console.error('❌ No se pudo seleccionar ninguna voz');
      onError('No se encontró ninguna voz compatible');
      return;
    }
    
    utterance.onend = () => {
      console.log('✅ TTS completado exitosamente');
      if (this.currentUtterance === utterance) {
        this.currentUtterance = null;
        onEnd();
      }
    };

    utterance.onerror = (event) => {
      console.error('❌ TTS Error:', event.error, event);
      
      // Filter out errors caused by normal cancellation (navigation/pause)
      if (event.error === 'interrupted' || event.error === 'canceled') {
        return;
      }
      
      if (this.currentUtterance === utterance) {
        this.currentUtterance = null;
        onError(`Error TTS: ${event.error}`);
      }
    };

    utterance.onstart = () => {
      console.log('🔊 TTS iniciado correctamente');
    };

    try {
      console.log('🔊 Ejecutando speechSynthesis.speak()');
      this.synth.speak(utterance);
      
      // TIMEOUT DE SEGURIDAD PARA SAMSUNG
      if (isSamsung) {
        setTimeout(() => {
          if (this.currentUtterance === utterance && !this.synth.speaking) {
            console.error('❌ Timeout: TTS no inició en Samsung');
            onError('Timeout: La voz no se inició. Verifica la configuración de texto a voz.');
          }
        }, 3000);
      }
      
    } catch (e) {
      console.error("❌ Excepción en synth.speak:", e);
      onError(`Error al iniciar TTS: ${e}`);
    }
  }

  public pause() {
    this.synth.pause();
  }

  public resume() {
    this.synth.resume();
  }

  public cancel() {
    if (this.currentUtterance) {
      // Remove listeners to prevent "ghost" callbacks from previous pages
      this.currentUtterance.onend = null;
      this.currentUtterance.onerror = null;
      this.currentUtterance = null;
    }
    this.synth.cancel();
  }

  public isSpeaking(): boolean {
    return this.synth.speaking;
  }

  public isPaused(): boolean {
    return this.synth.paused;
  }
}

export const ttsService = new TTSService();