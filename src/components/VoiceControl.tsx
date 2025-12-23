import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, HelpCircle } from 'lucide-react';
import { voiceControlService } from '../services/voiceControlService';

interface VoiceControlProps {
  onCommand: (action: string, parameters?: Record<string, any>) => void;
  className?: string;
}

export const VoiceControl: React.FC<VoiceControlProps> = ({ onCommand, className = '' }) => {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Verificar soporte
    setIsSupported(voiceControlService.isSupported());

    // Configurar callbacks
    voiceControlService.onCommand((command) => {
      console.log('Comando recibido:', command);
      if (command.action === 'showHelp') {
        setShowHelp(true);
      }
      onCommand(command.action, command.parameters);
    });

    voiceControlService.onStatusChange((statusText, listening) => {
      setStatus(statusText);
      setIsListening(listening);
    });

    return () => {
      voiceControlService.stopListening();
    };
  }, [onCommand]);

  const toggleVoiceControl = () => {
    voiceControlService.toggleListening();
  };

  const showHelpModal = () => {
    setShowHelp(true);
  };

  if (!isSupported) {
    return (
      <div className={`voice-control-unsupported ${className}`}>
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <MicOff size={16} />
          <span>Control por voz no disponible</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`voice-control ${className}`}>
        <div className="flex items-center gap-2">
          {/* Botón principal de micrófono con etiqueta visible */}
          <button
            onClick={toggleVoiceControl}
            className={`voice-control-btn ${isListening ? 'listening' : ''} flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all shadow-md active:scale-95`}
            title={isListening ? 'Detener control por voz' : 'Activar control por voz'}
            aria-label={isListening ? 'Detener control por voz' : 'Activar control por voz'}
            aria-pressed={isListening}
          >
            {isListening ? (
              <Mic className="text-red-600 animate-pulse" size={24} />
            ) : (
              <MicOff className="text-gray-700 font-bold" size={24} />
            )}
            <span className={`text-sm font-black uppercase tracking-widest ${isListening ? 'text-red-700' : 'text-gray-800'}`}>
              {isListening ? 'Escuchando' : 'Comandos'}
            </span>
          </button>

          {/* Estado del reconocimiento - Letra más grande y contraste */}
          {status && (
            <div className="voice-status" aria-live="polite">
              <span className={`status-text ${isListening ? 'listening' : ''} text-base font-bold px-3 py-1 bg-white/80 rounded-lg shadow-sm border border-stone-200`}>
                {status}
              </span>
            </div>
          )}

          {/* Botón de ayuda más visible */}
          <button
            onClick={showHelpModal}
            className="help-btn p-2 bg-white rounded-full shadow-md border border-stone-200 hover:scale-110 transition-transform active:scale-90"
            title="Ver lista de comandos"
            aria-label="Abrir ayuda de comandos de voz"
          >
            <HelpCircle size={24} className="text-blue-600" />
          </button>
        </div>

        {/* Indicador visual cuando está escuchando */}
        {isListening && (
          <div className="listening-indicator">
            <div className="sound-wave">
              <div className="wave"></div>
              <div className="wave"></div>
              <div className="wave"></div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de ayuda - Letra GRANDE y contraste WCAG */}
      {showHelp && (
        <div className="voice-help-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-overlay" onClick={() => setShowHelp(false)} />
          <div className="modal-content border-4 border-[#1e40af]">
            <div className="modal-header bg-[#1e40af] text-white">
              <h3 id="modal-title" className="text-2xl font-black uppercase tracking-tight">Comandos de Voz Disponibles</h3>
              <button
                onClick={() => setShowHelp(false)}
                className="close-btn text-white hover:bg-white/20 rounded-full"
                aria-label="Cerrar modal"
              >
                ×
              </button>
            </div>
            <div className="modal-body bg-white">
              <div className="commands-grid">
                <div className="command-category">
                  <h4 className="flex items-center gap-2 text-[28px] font-black border-b-4 border-blue-100 pb-3 mb-6 text-stone-900">📖 Navegación</h4>
                  <ul className="space-y-4">
                    <li className="text-xl font-bold text-stone-900 bg-stone-50 p-4 rounded-2xl border-2 border-stone-100 italic">"siguiente página"</li>
                    <li className="text-xl font-bold text-stone-900 bg-stone-50 p-4 rounded-2xl border-2 border-stone-100 italic">"página anterior"</li>
                    <li className="text-xl font-bold text-stone-900 bg-stone-50 p-4 rounded-2xl border-2 border-stone-100 italic">"toca 7" (Ir a página)</li>
                  </ul>
                </div>

                <div className="command-category">
                  <h4 className="flex items-center gap-2 text-[28px] font-black border-b-4 border-blue-100 pb-3 mb-6 text-stone-900">🔊 Audio</h4>
                  <ul className="space-y-4">
                    <li className="text-xl font-bold text-stone-900 bg-stone-50 p-4 rounded-2xl border-2 border-stone-100 italic">"leer texto" / "reproducir"</li>
                    <li className="text-xl font-bold text-stone-900 bg-stone-50 p-4 rounded-2xl border-2 border-stone-100 italic">"pausar" / "detener"</li>
                    <li className="text-xl font-bold text-stone-900 bg-stone-50 p-4 rounded-2xl border-2 border-stone-100 italic">"más rápido" / "despacio"</li>
                    <li className="text-xl font-bold text-stone-900 bg-stone-50 p-4 rounded-2xl border-2 border-stone-100 italic">"subir volumen"</li>
                  </ul>
                </div>

                <div className="command-category">
                  <h4 className="flex items-center gap-2 text-[28px] font-black border-b-4 border-blue-100 pb-3 mb-6 text-stone-900">👁️ Vista</h4>
                  <ul className="space-y-4">
                    <li className="text-xl font-bold text-stone-900 bg-stone-50 p-4 rounded-2xl border-2 border-stone-100 italic">"zoom más grande"</li>
                    <li className="text-xl font-bold text-stone-900 bg-stone-50 p-4 rounded-2xl border-2 border-stone-100 italic">"alto contraste"</li>
                    <li className="text-xl font-bold text-stone-900 bg-stone-50 p-4 rounded-2xl border-2 border-stone-100 italic">"modo oscuro"</li>
                  </ul>
                </div>

                <div className="command-category">
                  <h4 className="flex items-center gap-2 text-[28px] font-black border-b-4 border-blue-100 pb-3 mb-6 text-stone-900">📚 General</h4>
                  <ul className="space-y-4">
                    <li className="text-xl font-bold text-stone-900 bg-stone-50 p-4 rounded-2xl border-2 border-stone-100 italic">"donde estoy" (Orientación)</li>
                    <li className="text-xl font-bold text-stone-900 bg-stone-50 p-4 rounded-2xl border-2 border-stone-100 italic">"repite" (Repite mensaje)</li>
                    <li className="text-xl font-bold text-stone-900 bg-stone-50 p-4 rounded-2xl border-2 border-stone-100 italic">"menú" / "opciones"</li>
                    <li className="text-xl font-bold text-stone-900 bg-stone-50 p-4 rounded-2xl border-2 border-stone-100 italic">"abrir biblioteca"</li>
                  </ul>
                </div>
              </div>

              <div className="help-tip mt-8 bg-blue-50 border-2 border-blue-200 p-6 rounded-2xl flex items-start gap-4 shadow-inner">
                <Volume2 size={32} className="text-blue-600 shrink-0" />
                <span className="text-lg font-bold text-blue-900 leading-tight">
                  Habla claramente y espera a que aparezca el ícono en <span className="text-red-600 underline">rojo</span> para indicar que el sistema te está escuchando.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .voice-control {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: fit-content;
          margin: 0 auto;
        }

        .voice-control-btn {
          background: white;
          border-color: #e5e7eb;
          color: #1f2937;
        }

        .voice-control-btn.listening {
          background: #fef2f2;
          border-color: #ef4444;
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
        }

        .modal-content {
          position: relative;
          background: white;
          border-radius: 2rem;
          width: 95%;
          max-width: 800px;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .modal-header {
          padding: 1.5rem 2rem;
        }

        .modal-body {
          padding: 2rem;
          overflow-y: auto;
          max-height: 75vh;
        }

        .commands-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }

        @media (max-width: 768px) {
          .commands-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .modal-content {
            width: 100%;
            height: 100vh;
            max-height: 100vh;
            border-radius: 0;
            border: none;
          }
          
          .modal-header h3 {
            font-size: 1.25rem;
          }
          
          .command-category li {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </>
  );
};