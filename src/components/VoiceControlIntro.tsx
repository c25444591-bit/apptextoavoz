import React, { useState, useEffect } from 'react';
import { Mic, Volume2, CheckCircle } from 'lucide-react';

interface VoiceControlIntroProps {
  onClose: () => void;
  onEnable: () => void;
}

export const VoiceControlIntro: React.FC<VoiceControlIntroProps> = ({ onClose, onEnable }) => {
  const [step, setStep] = useState(0);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Verificar soporte del navegador
    const supported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    setIsSupported(supported);
  }, []);

  const steps = [
    {
      title: "🎤 Control por Voz",
      content: "LibroVoz ahora incluye control por voz para una experiencia completamente manos libres.",
      icon: <Mic size={48} className="text-blue-500" />
    },
    {
      title: "🗣️ Comandos Disponibles",
      content: "Puedes usar comandos como 'siguiente página', 'reproducir', 'pausar', 'más rápido', y muchos más.",
      icon: <Volume2 size={48} className="text-green-500" />
    },
    {
      title: "♿ Accesibilidad Mejorada",
      content: "Especialmente útil para personas con discapacidades visuales o motoras. Todo funciona localmente en tu navegador.",
      icon: <CheckCircle size={48} className="text-purple-500" />
    }
  ];

  if (!isSupported) {
    return (
      <div className="voice-intro-modal">
        <div className="modal-overlay" onClick={onClose} />
        <div className="modal-content">
          <div className="modal-header">
            <h3>Control por Voz No Disponible</h3>
            <button onClick={onClose} className="close-btn">×</button>
          </div>
          <div className="modal-body text-center">
            <div className="mb-4">
              <Mic size={64} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Tu navegador no soporta reconocimiento de voz. 
                Prueba con Chrome, Edge o Safari en un dispositivo compatible.
              </p>
            </div>
            <button onClick={onClose} className="btn-primary">
              Entendido
            </button>
          </div>
        </div>
        <style>{`
          .voice-intro-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
          }
          .modal-content {
            position: relative;
            background: white;
            border-radius: 16px;
            max-width: 500px;
            margin: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          }
          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24px;
            border-bottom: 1px solid #e5e7eb;
          }
          .modal-header h3 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
          }
          .close-btn {
            border: none;
            background: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .modal-body {
            padding: 24px;
          }
          .btn-primary {
            background: #ff6600;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
          }
          .btn-primary:hover {
            background: #e55a00;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="voice-intro-modal">
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content">
        <div className="modal-header">
          <h3>Nuevo: Control por Voz</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <div className="modal-body">
          <div className="step-content">
            <div className="step-icon">
              {steps[step].icon}
            </div>
            <h4>{steps[step].title}</h4>
            <p>{steps[step].content}</p>
          </div>

          {step === 1 && (
            <div className="commands-preview">
              <div className="command-examples">
                <div className="command">"siguiente página"</div>
                <div className="command">"reproducir"</div>
                <div className="command">"pausar"</div>
                <div className="command">"más rápido"</div>
                <div className="command">"modo oscuro"</div>
                <div className="command">"ir a página 5"</div>
              </div>
            </div>
          )}

          <div className="step-navigation">
            <div className="step-indicators">
              {steps.map((_, index) => (
                <div 
                  key={index}
                  className={`step-dot ${index === step ? 'active' : ''} ${index < step ? 'completed' : ''}`}
                />
              ))}
            </div>

            <div className="step-buttons">
              {step > 0 && (
                <button onClick={() => setStep(step - 1)} className="btn-secondary">
                  Anterior
                </button>
              )}
              
              {step < steps.length - 1 ? (
                <button onClick={() => setStep(step + 1)} className="btn-primary">
                  Siguiente
                </button>
              ) : (
                <div className="final-buttons">
                  <button onClick={onClose} className="btn-secondary">
                    Más tarde
                  </button>
                  <button onClick={onEnable} className="btn-primary">
                    Activar Control por Voz
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .voice-intro-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }

        .modal-content {
          position: relative;
          background: white;
          border-radius: 16px;
          max-width: 500px;
          margin: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #ff6600 0%, #ff8533 100%);
          color: white;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
        }

        .close-btn {
          border: none;
          background: rgba(255, 255, 255, 0.2);
          font-size: 20px;
          cursor: pointer;
          color: white;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .modal-body {
          padding: 32px 24px 24px;
        }

        .step-content {
          text-align: center;
          margin-bottom: 32px;
        }

        .step-icon {
          margin-bottom: 16px;
        }

        .step-content h4 {
          margin: 0 0 12px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .step-content p {
          margin: 0;
          color: #6b7280;
          line-height: 1.6;
        }

        .commands-preview {
          margin: 24px 0;
          padding: 20px;
          background: #f9fafb;
          border-radius: 12px;
        }

        .command-examples {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .command {
          background: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-family: monospace;
          color: #374151;
          border: 1px solid #e5e7eb;
        }

        .step-navigation {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .step-indicators {
          display: flex;
          justify-content: center;
          gap: 8px;
        }

        .step-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #d1d5db;
          transition: all 0.2s;
        }

        .step-dot.active {
          background: #ff6600;
          transform: scale(1.2);
        }

        .step-dot.completed {
          background: #10b981;
        }

        .step-buttons {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .final-buttons {
          display: flex;
          gap: 12px;
          width: 100%;
          justify-content: flex-end;
        }

        .btn-primary {
          background: #ff6600;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-primary:hover {
          background: #e55a00;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        @media (max-width: 640px) {
          .modal-content {
            margin: 10px;
            max-width: calc(100vw - 20px);
          }
          
          .command-examples {
            grid-template-columns: 1fr;
          }
          
          .step-buttons {
            flex-direction: column;
            gap: 12px;
          }
          
          .final-buttons {
            flex-direction: column;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};