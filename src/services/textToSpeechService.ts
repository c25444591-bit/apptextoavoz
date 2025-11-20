import { VoiceInfo, VoiceSettings, AudioControlState } from '../types';

export class TextToSpeechService {
  private static synth: SpeechSynthesis;
  private static voices: SpeechSynthesisVoice[] = [];
  private static currentUtterance: SpeechSynthesisUtterance | null = null;
  private static currentPosition: number = 0;
  private static textChunks: string[] = [];
  private static currentChunkIndex: number = 0;
  private static isInitialized: boolean = false;

  static async initialize(): Promise<void> {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      throw new Error('El navegador no soporta síntesis de voz');
    }

    this.synth = window.speechSynthesis;
    
    // Esperar a que las voces estén disponibles
    return new Promise((resolve) => {
      const loadVoices = () => {
        this.voices = this.synth.getVoices();
        if (this.voices.length > 0) {
          this.isInitialized = true;
          resolve();
        } else {
          // Intentar de nuevo si las voces no están cargadas
          setTimeout(loadVoices, 100);
        }
      };

      loadVoices();
      
      // También escuchar el evento onvoiceschanged
      this.synth.addEventListener('voiceschanged', () => {
        this.voices = this.synth.getVoices();
        if (this.voices.length > 0 && !this.isInitialized) {
          this.isInitialized = true;
          resolve();
        }
      });
    });
  }

  static getAvailableVoices(): VoiceInfo[] {
    if (!this.isInitialized) {
      console.warn('TextToSpeechService no está inicializado');
      return [];
    }

    const voiceOptions: VoiceInfo[] = [];
    
    // Voces en español primero
    const spanishVoices = this.voices.filter(voice => 
      voice.lang.startsWith('es') || voice.name.toLowerCase().includes('español')
    );

    const otherVoices = this.voices.filter(voice => 
      !voice.lang.startsWith('es') && !voice.name.toLowerCase().includes('español')
    );

    // Patrones para identificar voces argentinas y de alta calidad
    const argentinaPatterns = [
      /argentina/i, /argentinian/i, /es-AR/i, /arg/i, /buenos/i
    ];
    
    const premiumPatterns = [
      /google/i, /premium/i, /enhanced/i, /natural/i, /neural/i,
      /samantha/i, /karen/i, /maría/i, /carmen/i, /sofia/i, /elena/i
    ];

    // Procesar voces españolas con prioridad a argentinas
    spanishVoices.forEach(voice => {
      const name = voice.name.toLowerCase();
      const lang = voice.lang.toLowerCase();
      
      const isArgentina = argentinaPatterns.some(pattern => 
        pattern.test(voice.name) || pattern.test(lang)
      );
      
      const isPremium = premiumPatterns.some(pattern => pattern.test(name));
      const isFemale = name.includes('maria') || name.includes('carmen') || 
                      name.includes('sofia') || name.includes('elena') || 
                      name.includes('paula') || name.includes('monica') ||
                      name.includes('femenino') || name.includes('female') ||
                      name.includes('samantha') || name.includes('karen') ||
                      name.includes('woman') || name.includes('mujer');

      // Determinar origen y motor
      let origin = 'España';
      let engine = 'Sistema';
      
      if (isArgentina || lang.includes('ar')) {
        origin = 'Argentina';
      } else if (lang.includes('mx')) {
        origin = 'México';
      } else if (lang.includes('co') || lang.includes('419')) {
        origin = 'Latinoamérica';
      }

      if (name.includes('google')) {
        engine = 'Google';
      } else if (name.includes('samsung')) {
        engine = 'Samsung';
      } else if (name.includes('microsoft')) {
        engine = 'Microsoft';
      } else if (name.includes('apple')) {
        engine = 'Apple';
      }

      voiceOptions.push({
        voiceURI: voice.voiceURI,
        name: voice.name,
        lang: voice.lang,
        origin,
        engine,
        isLocal: voice.localService,
        quality: isPremium ? 'high' : (isArgentina ? 'high' : 'medium')
      });
    });

    // Procesar otras voces
    otherVoices.forEach(voice => {
      const name = voice.name.toLowerCase();
      const isPremium = premiumPatterns.some(pattern => pattern.test(name));
      const isFemale = name.includes('female') || name.includes('femenino') ||
                      name.includes('woman') || name.includes('mujer');
      
      voiceOptions.push({
        voiceURI: voice.voiceURI,
        name: voice.name,
        lang: voice.lang,
        origin: 'Internacional',
        engine: name.includes('google') ? 'Google' : 'Sistema',
        isLocal: voice.localService,
        quality: isPremium ? 'high' : 'low'
      });
    });

    // Ordenar por prioridad: Argentina > España > Internacional, Femeninas primero
    return voiceOptions.sort((a, b) => {
      // Prioridad por origen
      if (a.origin === 'Argentina' && b.origin !== 'Argentina') return -1;
      if (a.origin !== 'Argentina' && b.origin === 'Argentina') return 1;
      
      if (a.origin === 'España' && !['Argentina', 'España'].includes(b.origin)) return -1;
      if (!['Argentina', 'España'].includes(a.origin) && b.origin === 'España') return 1;
      
      // Prioridad por calidad
      const qualityOrder = { high: 3, medium: 2, low: 1 };
      const qualityDiff = qualityOrder[b.quality] - qualityOrder[a.quality];
      if (qualityDiff !== 0) return qualityDiff;
      
      // Voces femeninas primero
      const aIsFemale = a.name.toLowerCase().includes('maria') || a.name.toLowerCase().includes('carmen');
      const bIsFemale = b.name.toLowerCase().includes('maria') || b.name.toLowerCase().includes('carmen');
      if (aIsFemale && !bIsFemale) return -1;
      if (!aIsFemale && bIsFemale) return 1;
      
      return 0;
    });
  }

  static findBestSpanishVoice(): VoiceInfo | null {
    const voices = this.getAvailableVoices();
    
    // Prioridad 1: Voces argentinas femeninas de alta calidad
    let bestVoice = voices.find(v => 
      v.origin === 'Argentina' && 
      (v.name.toLowerCase().includes('maria') || v.name.toLowerCase().includes('carmen') || v.quality === 'high')
    );
    
    // Prioridad 2: Cualquier voz argentina
    if (!bestVoice) {
      bestVoice = voices.find(v => v.origin === 'Argentina');
    }
    
    // Prioridad 3: Voces femeninas españolas de alta calidad
    if (!bestVoice) {
      bestVoice = voices.find(v => 
        v.origin === 'España' && v.quality === 'high' &&
        (v.name.toLowerCase().includes('maria') || v.name.toLowerCase().includes('carmen'))
      );
    }
    
    // Prioridad 4: Cualquier voz española de alta calidad
    if (!bestVoice) {
      bestVoice = voices.find(v => v.lang.startsWith('es') && v.quality === 'high');
    }
    
    // Prioridad 5: Cualquier voz española
    if (!bestVoice) {
      bestVoice = voices.find(v => v.lang.startsWith('es'));
    }
    
    // Prioridad 6: Cualquier voz femenina de alta calidad
    if (!bestVoice) {
      bestVoice = voices.find(v => 
        (v.name.toLowerCase().includes('maria') || v.name.toLowerCase().includes('carmen')) && v.quality === 'high'
      );
    }
    
    // Fallback: Primera voz disponible
    return bestVoice || voices[0] || null;
  }

  static setText(text: string): void {
    this.textChunks = this.splitTextIntoChunks(text);
    this.currentChunkIndex = 0;
    this.currentPosition = 0;
  }

  static speak(settings: VoiceSettings): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.textChunks.length === 0) {
        reject(new Error('No hay texto para reproducir'));
        return;
      }

      this.stop(); // Detener cualquier reproducción anterior

      const speakChunk = (index: number) => {
        if (index >= this.textChunks.length) {
          resolve();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(this.textChunks[index]);
        const selectedVoice = this.voices.find(v => v.voiceURI === settings.voiceURI);
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        utterance.rate = settings.rate;
        utterance.pitch = settings.pitch;
        utterance.volume = settings.volume;

        utterance.onend = () => {
          this.currentChunkIndex++;
          this.currentPosition += this.textChunks[index].length;
          speakChunk(this.currentChunkIndex);
        };

        utterance.onerror = (event) => {
          console.error('Error en síntesis de voz:', event.error);
          this.currentChunkIndex++;
          speakChunk(this.currentChunkIndex); // Continuar con el siguiente chunk
        };

        utterance.onboundary = (event) => {
          // Actualizar posición en tiempo real
          const charIndex = event.charIndex || 0;
          const totalChars = this.textChunks[index].length;
          const chunkStart = this.textChunks.slice(0, index).join('').length;
          this.currentPosition = chunkStart + charIndex;
        };

        this.currentUtterance = utterance;
        this.synth.speak(utterance);
      };

      speakChunk(this.currentChunkIndex);
    });
  }

  static pause(): void {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  static resume(): void {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  static stop(): void {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }

  static getCurrentState(): AudioControlState {
    return {
      isPlaying: this.synth?.speaking || false,
      isPaused: this.synth?.paused || false,
      currentPosition: this.currentPosition,
      totalLength: this.textChunks.join('').length,
      rate: this.currentUtterance?.rate || 1.0
    };
  }

  static seekTo(position: number): void {
    this.stop();
    this.currentPosition = position;
    
    // Encontrar el chunk correspondiente
    let charCount = 0;
    for (let i = 0; i < this.textChunks.length; i++) {
      const chunkLength = this.textChunks[i].length;
      if (charCount + chunkLength > position) {
        this.currentChunkIndex = i;
        this.currentPosition = position - charCount;
        break;
      }
      charCount += chunkLength;
    }
  }

  private static splitTextIntoChunks(text: string, maxChunkLength: number = 500): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      
      if (currentChunk.length + trimmedSentence.length > maxChunkLength) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
        
        // Si la oración es muy larga, dividirla
        if (trimmedSentence.length > maxChunkLength) {
          const words = trimmedSentence.split(' ');
          let wordChunk = '';
          
          for (const word of words) {
            if (wordChunk.length + word.length + 1 > maxChunkLength) {
              chunks.push(wordChunk.trim());
              wordChunk = '';
            }
            wordChunk += (wordChunk ? ' ' : '') + word;
          }
          
          if (wordChunk) {
            currentChunk = wordChunk;
          }
        } else {
          currentChunk = trimmedSentence;
        }
      } else {
        currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  // Métodos de utilidad para estadísticas
  static getEstimatedDuration(text: string, wordsPerMinute: number = 180): number {
    const words = text.split(/\s+/).length;
    const minutes = words / wordsPerMinute;
    return Math.round(minutes * 60); // en segundos
  }

  static getPlaybackProgress(): number {
    if (this.textChunks.length === 0) return 0;
    const totalChars = this.textChunks.join('').length;
    return (this.currentPosition / totalChars) * 100;
  }

  /**
   * Reproduce una muestra de la voz especificada
   */
  static previewVoice(voiceURI: string, text: string = 'Hola, esta es una muestra de mi voz'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.stop(); // Detener cualquier reproducción

        const utterance = new SpeechSynthesisUtterance(text);
        const selectedVoice = this.voices.find(v => v.voiceURI === voiceURI);
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        // Configuración para preview: más lento y claro
        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;

        utterance.onend = () => resolve();
        utterance.onerror = (event) => {
          console.error('Error en preview de voz:', event.error);
          reject(new Error('Error al reproducir muestra de voz'));
        };

        this.currentUtterance = utterance;
        this.synth.speak(utterance);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Obtiene una descripción legible de la voz
   */
  static getVoiceDescription(voice: VoiceInfo): string {
    const parts = [];
    
    // Origen
    if (voice.origin) {
      parts.push(voice.origin);
    }
    
    // Motor/Engine
    if (voice.engine && voice.engine !== 'Sistema') {
      parts.push(voice.engine);
    }
    
    // Calidad
    if (voice.quality === 'high') {
      parts.push('Premium');
    } else if (voice.quality === 'medium') {
      parts.push('Estándar');
    }
    
    return parts.join(' - ');
  }

  /**
   * Verifica si una voz es adecuada para español argentino
   */
  static isArgentineVoice(voice: VoiceInfo): boolean {
    return voice.origin === 'Argentina' || 
           voice.lang.toLowerCase().includes('ar') ||
           /argentina|argentinian|es-AR/i.test(voice.name);
  }

  /**
   * Obtiene las mejores voces para español argentino
   */
  static getBestArgentineVoices(): VoiceInfo[] {
    const voices = this.getAvailableVoices();
    return voices.filter(voice => this.isArgentineVoice(voice));
  }
}
}