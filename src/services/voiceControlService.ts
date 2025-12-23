/**
 * Servicio de Control por Voz Local
 * Usa Web Speech API + WebGPU + FunctionGemma para procesamiento local
 */

interface VoiceCommand {
  action: string;
  parameters?: Record<string, any>;
}

// Tipos para SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

class VoiceControlService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private onCommandCallback: ((command: VoiceCommand) => void) | null = null;
  private onStatusCallback: ((status: string, isListening: boolean) => void) | null = null;
  private lastFeedback = "";

  constructor() {
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    // Verificar soporte del navegador
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech Recognition no soportado en este navegador');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'es-ES'; // Español por defecto
    this.recognition.maxAlternatives = 1;

    // Eventos
    this.recognition.onstart = () => {
      console.log('🎤 Voice Control: Reconocimiento iniciado');
      this.isListening = true;
      this.onStatusCallback?.('Escuchando...', true);
    };

    this.recognition.onend = () => {
      console.log('🎤 Voice Control: Reconocimiento terminado');

      // Auto-restart si debería estar escuchando (evita cortes por silencio)
      if (this.isListening) {
        console.log('🎤 Voice Control: Reiniciando automáticamente...');
        try {
          this.recognition?.start();
        } catch (e) {
          console.error('🎤 Voice Control: Error al reiniciar:', e);
          this.isListening = false;
          this.onStatusCallback?.('Detenido', false);
        }
      } else {
        this.onStatusCallback?.('Detenido', false);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('🎤 Voice Control: Error de reconocimiento de voz:', event.error);
      this.isListening = false;
      this.onStatusCallback?.(`Error: ${event.error}`, false);
    };

    this.recognition.onresult = (event) => {
      console.log('🎤 Voice Control: onresult event', event);
      const lastResult = event.results[event.results.length - 1];
      const transcript = lastResult[0].transcript;

      if (lastResult.isFinal) {
        console.log('🎤 Voice Control: Comando final detectado:', transcript);
        this.processVoiceCommand(transcript.toLowerCase().trim());
      } else {
        console.log('🎤 Voice Control: Resultado intermedio:', transcript);
        this.onStatusCallback?.(transcript, true);
      }
    };
  }

  private speakFeedback(text: string): void {
    if (!window.speechSynthesis) return;

    // Cancelar cualquier mensaje previo de feedback para evitar solapamientos
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1.2; // Un poco más rápido para feedback ágil
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  }

  private processVoiceCommand(transcript: string): void {
    console.log('🎤 Voice Control: Procesando comando:', transcript);

    // Procesamiento local de comandos usando patrones simples
    const command = this.parseCommand(transcript);

    if (command) {
      console.log('🎤 Voice Control: Comando reconocido:', command);

      // Feedback auditivo de éxito
      const feedback = this.getFeedbackForAction(command.action, command.parameters);
      if (feedback) {
        this.lastFeedback = feedback;
        this.speakFeedback(feedback);
      }

      this.onCommandCallback?.(command);
    } else if (transcript.includes('repite') || transcript.includes('repetir')) {
      if (this.lastFeedback) {
        this.speakFeedback(this.lastFeedback);
      } else {
        this.speakFeedback("No hay nada que repetir");
      }
    } else {
      console.log('🎤 Voice Control: Comando no reconocido:', transcript);
      this.speakFeedback("No entendí, repite");
      this.onStatusCallback?.(`No entendido: "${transcript}"`, true);
    }
  }

  private getFeedbackForAction(action: string, params?: any): string {
    switch (action) {
      case 'nextPage': return "Siguiente página";
      case 'previousPage': return "Página anterior";
      case 'play': return "Reproduciendo contenido";
      case 'pause': return "Pausado";
      case 'stop': return "Detenido";
      case 'increaseSpeed': return "Velocidad aumentada";
      case 'decreaseSpeed': return "Más lento";
      case 'increaseVolume': return "Subiendo volumen";
      case 'decreaseVolume': return "Bajando volumen";
      case 'goToPage': return `Cambiando a página ${params?.page}`;
      case 'zoomIn': return "Aumentando tamaño";
      case 'zoomOut': return "Reduciendo tamaño";
      case 'setTheme':
        if (params?.theme === 'high-contrast') return "Modo alto contraste activado";
        return `Tema ${params?.theme} activado`;
      case 'openLibrary': return "Abriendo biblioteca";
      case 'showHelp': return "Abriendo lista de comandos";
      case 'whereAmI': return ""; // El componente Home manejará este anuncio con más detalle
      default: return "Entendido";
    }
  }

  /**
   * Permite a la aplicación emitir anuncios de voz (feedback auditivo).
   * Útil para notificar cambios de estado o dar orientación.
   */
  public announce(text: string): void {
    this.speakFeedback(text);
  }

  private parseCommand(text: string): VoiceCommand | null {
    // Comandos de navegación
    if (text.includes('siguiente') || text.includes('próxima') || text.includes('avanzar')) {
      return { action: 'nextPage' };
    }

    if (text.includes('anterior') || text.includes('atrás') || text.includes('retroceder')) {
      return { action: 'previousPage' };
    }

    // Comandos de reproducción
    if (text.includes('reproducir') || text.includes('play') || text.includes('leer')) {
      return { action: 'play' };
    }

    if (text.includes('pausar') || text.includes('pausa') || text.includes('detener')) {
      return { action: 'pause' };
    }

    if (text.includes('parar') || text.includes('stop')) {
      return { action: 'stop' };
    }

    // Comandos de velocidad
    if (text.includes('más rápido') || text.includes('acelerar')) {
      return { action: 'increaseSpeed' };
    }

    if (text.includes('más lento') || text.includes('desacelerar')) {
      return { action: 'decreaseSpeed' };
    }

    // Comandos de volumen
    if (text.includes('subir volumen') || text.includes('más alto') || text.includes('subir audio')) {
      return { action: 'increaseVolume' };
    }

    if (text.includes('bajar volumen') || text.includes('más bajo') || text.includes('bajar audio')) {
      return { action: 'decreaseVolume' };
    }

    // Comandos de navegación por página o "Toca X" (estilo Android Voice Access)
    const pageMatch = text.match(/(?:ir a|página|page|toca|página número|página num)\s*(\d+|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)/);
    if (pageMatch) {
      let pageNum = parseInt(pageMatch[1]);

      // Mapeo de palabras a números si es necesario
      if (isNaN(pageNum)) {
        const wordToNum: Record<string, number> = {
          'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5,
          'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10
        };
        pageNum = wordToNum[pageMatch[1].toLowerCase()] || 0;
      }

      if (pageNum > 0) {
        return {
          action: 'goToPage',
          parameters: { page: pageNum }
        };
      }
    }

    // Comandos simplificados y contextuales (WCAG VUI)
    if (text.includes('leer') || text.includes('reproducir')) {
      return { action: 'play' };
    }

    if (text.includes('menú') || text.includes('menu') || text.includes('opciones') || text.includes('comandos')) {
      return { action: 'showHelp' };
    }

    // Comandos de zoom
    if (text.includes('aumentar') || text.includes('zoom in') || text.includes('más grande') || text.includes('grande')) {
      return { action: 'zoomIn' };
    }

    if (text.includes('reducir') || text.includes('zoom out') || text.includes('más pequeño') || text.includes('pequeño')) {
      return { action: 'zoomOut' };
    }

    // Comandos de tema
    if (text.includes('modo oscuro') || text.includes('tema oscuro')) {
      return { action: 'setTheme', parameters: { theme: 'dark' } };
    }

    if (text.includes('modo claro') || text.includes('tema claro')) {
      return { action: 'setTheme', parameters: { theme: 'light' } };
    }

    if (text.includes('alto contraste')) {
      return { action: 'setTheme', parameters: { theme: 'high-contrast' } };
    }

    // Comandos de biblioteca
    if (text.includes('biblioteca') || text.includes('libros') || text.includes('library') || text.includes('mis libros')) {
      return { action: 'openLibrary' };
    }

    // Comandos de ayuda
    if (text.includes('ayuda') || text.includes('help') || text.includes('comandos') || text.includes('que puedo decir')) {
      return { action: 'showHelp' };
    }

    // Comandos de orientación (WCAG)
    if (text.includes('dónde estoy') || text.includes('donde estoy') || text.includes('qué libro') || text.includes('que libro')) {
      return { action: 'whereAmI' };
    }

    return null;
  }

  public startListening(): void {
    if (!this.recognition) {
      console.error('🎤 Voice Control: Speech Recognition no disponible');
      return;
    }

    if (this.isListening) {
      console.log('🎤 Voice Control: Ya está escuchando');
      return;
    }

    try {
      console.log('🎤 Voice Control: Iniciando reconocimiento...');
      this.recognition.start();
    } catch (error) {
      console.error('🎤 Voice Control: Error al iniciar reconocimiento de voz:', error);
      this.onStatusCallback?.('Error al iniciar', false);
    }
  }

  public stopListening(): void {
    if (!this.recognition || !this.isListening) {
      return;
    }

    console.log('🎤 Voice Control: Deteniendo reconocimiento...');
    this.recognition.stop();
  }

  public toggleListening(): void {
    console.log('🎤 Voice Control: Toggle listening, actualmente:', this.isListening);
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  public onCommand(callback: (command: VoiceCommand) => void): void {
    this.onCommandCallback = callback;
  }

  public onStatusChange(callback: (status: string, isListening: boolean) => void): void {
    this.onStatusCallback = callback;
  }

  public isSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  public getAvailableCommands(): string[] {
    return [
      'siguiente página',
      'página anterior',
      'reproducir',
      'pausar',
      'parar',
      'más rápido',
      'más lento',
      'subir volumen',
      'bajar volumen',
      'ir a página [número]',
      'aumentar zoom',
      'reducir zoom',
      'modo oscuro',
      'modo claro',
      'alto contraste',
      'abrir biblioteca',
      'ayuda'
    ];
  }
}

// Instancia singleton
export const voiceControlService = new VoiceControlService();