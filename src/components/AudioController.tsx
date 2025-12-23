import React, { useState, useEffect } from 'react';
import { Pause, Play, RotateCcw, Settings, Volume2, VolumeX, SkipBack, SkipForward, Cloud, Laptop, Mic, StopCircle, Trash2, Library } from 'lucide-react';
import { VoiceName, AudioFormat } from '../types';

interface AudioControllerProps {
  isPlaying: boolean;
  isPaused: boolean;
  pageNumber: number;
  selectedVoiceURI: string | null;
  playbackRate: number;
  useCloudTTS: boolean;
  ttsMode?: 'local' | 'piper' | 'cloud';
  audioFormat: AudioFormat;
  userVoiceSample: string | null;
  onTogglePlay: () => void;
  onVoiceChange: (voiceURI: string) => void;
  onPlaybackRateChange: (rate: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onToggleCloudMode: (useCloud: boolean) => void;
  onTTSModeChange?: (mode: 'local' | 'piper' | 'cloud') => void;
  onFormatChange: (format: AudioFormat) => void;
  onRecordVoice: (base64Audio: string | null) => void;
  onExitReader: () => void;
  onLogin: () => void;
  user: any;
  canGoNext: boolean;
  canGoPrev: boolean;
}

export const AudioController: React.FC<AudioControllerProps> = ({
  isPlaying,
  isPaused,
  pageNumber,
  selectedVoiceURI,
  playbackRate,
  useCloudTTS,
  ttsMode = 'piper',
  audioFormat,
  userVoiceSample,
  onTogglePlay,
  onVoiceChange,
  onPlaybackRateChange,
  onPrevPage,
  onNextPage,
  onToggleCloudMode,
  onTTSModeChange,
  onFormatChange,
  onRecordVoice,
  onExitReader,
  onLogin,
  user,
  canGoNext,
  canGoPrev
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSamsung, setIsSamsung] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  // Detectar Samsung y forzar visibilidad
  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isSamsungDevice = /samsung|sm-|galaxy|samsungbrowser/i.test(userAgent);
      const isAndroid = /android/i.test(userAgent);
      const isMobileSmall = window.innerWidth <= 420;
      setIsSamsung(isSamsungDevice || isMobileSmall);

      if (isSamsungDevice || isAndroid) {
        console.log('🔍 Samsung/Android detectado en AudioController');
        console.log('User Agent:', navigator.userAgent);
        console.log('Ancho pantalla:', window.innerWidth);

        // FORZAR VISIBILIDAD EN ANDROID/SAMSUNG
        setTimeout(() => {
          const controles = document.getElementById('audio-controller-fixed');
          if (controles) {
            console.log('🎯 Forzando visibilidad de controles en Samsung');

            // Aplicar estilos de fuerza bruta
            controles.style.cssText = `
              position: fixed !important;
              bottom: 0px !important;
              left: 0px !important;
              right: 0px !important;
              width: 100vw !important;
              height: auto !important;
              min-height: 140px !important;
              background: linear-gradient(135deg, #1e40af, #1e3a8a) !important;
              color: white !important;
              padding: 20px 16px !important;
              z-index: 999999 !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              justify-content: center !important;
              box-sizing: border-box !important;
              font-family: system-ui, -apple-system, sans-serif !important;
              box-shadow: 0 -4px 20px rgba(0,0,0,0.3) !important;
              visibility: visible !important;
              opacity: 1 !important;
              transform: translate3d(0, 0, 0) !important;
              -webkit-transform: translate3d(0, 0, 0) !important;
              will-change: transform !important;
              overflow: visible !important;
            `;

            // Debug info
            const computedStyle = window.getComputedStyle(controles);
            console.log('📊 Debug AudioController:');
            console.log('Display:', computedStyle.display);
            console.log('Visibility:', computedStyle.visibility);
            console.log('Position:', computedStyle.position);
            console.log('Z-index:', computedStyle.zIndex);
            console.log('Bottom:', computedStyle.bottom);
            console.log('Left:', computedStyle.left);
            console.log('Width:', computedStyle.width);
          }
        }, 100);
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Cargar voces disponibles
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          onRecordVoice(base64);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setIsRecording(false);
    }
  };

  const handleDeleteVoice = () => {
    onRecordVoice(null);
  };

  // Agregar event listeners para touch en Samsung
  useEffect(() => {
    if (isSamsung) {
      const controles = document.getElementById('audio-controller-fixed');
      if (controles) {
        // Event listeners para touch
        const handleTouchStart = (e: TouchEvent) => {
          e.stopPropagation();
          console.log('🔍 TouchStart en AudioController');
        };

        const handleTouchEnd = (e: TouchEvent) => {
          e.stopPropagation();
          console.log('🔍 TouchEnd en AudioController');
        };

        controles.addEventListener('touchstart', handleTouchStart, { passive: true });
        controles.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
          controles.removeEventListener('touchstart', handleTouchStart);
          controles.removeEventListener('touchend', handleTouchEnd);
        };
      }
    }
  }, [isSamsung]);

  // VERSIÓN ULTRA SIMPLIFICADA PARA SAMSUNG - MÁXIMA COMPATIBILIDAD
  if (isSamsung) {
    return (
      <div
        id="audio-controller-samsung"
        style={{
          position: 'fixed',
          bottom: '0px',
          left: '0px',
          right: '0px',
          width: '100%',
          height: '120px',
          backgroundColor: '#1e40af',
          color: 'white',
          padding: '16px',
          zIndex: 999999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Arial, sans-serif',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.2)'
        }}
      >
        {/* INFO SIMPLE */}
        <div style={{
          fontSize: '14px',
          marginBottom: '12px',
          textAlign: 'center'
        }}>
          📖 Página {pageNumber} • {useCloudTTS ? 'IA' : 'Local'}
        </div>

        {/* CONTROLES BÁSICOS */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px'
        }}>

          {/* Salir / Biblioteca */}
          <button
            onClick={onExitReader}
            aria-label="Volver a la biblioteca"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            🏠
          </button>

          {/* Anterior */}
          <button
            onClick={onPrevPage}
            disabled={!canGoPrev}
            aria-label="Página anterior"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: canGoPrev ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '18px',
              cursor: canGoPrev ? 'pointer' : 'not-allowed',
              opacity: canGoPrev ? 1 : 0.5
            }}
          >
            ◀
          </button>

          {/* Play/Pause */}
          <button
            onClick={onTogglePlay}
            aria-label={isPlaying && !isPaused ? 'Pausar lectura' : 'Iniciar lectura'}
            aria-pressed={isPlaying && !isPaused}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'white',
              color: '#1e40af',
              fontSize: '24px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            {isPlaying && !isPaused ? '⏸' : '▶'}
          </button>

          {/* Siguiente */}
          <button
            onClick={onNextPage}
            disabled={!canGoNext}
            aria-label="Página siguiente"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: canGoNext ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '18px',
              cursor: canGoNext ? 'pointer' : 'not-allowed',
              opacity: canGoNext ? 1 : 0.5
            }}
          >
            ▶
          </button>

          {/* Configuración */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Ajustes de audio"
            aria-expanded={showSettings}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            ⚙
          </button>

          {/* Ayuda / Login */}
          {user ? (
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid white'
            }}>
              <img src={user.photoURL || ''} alt="User" style={{ width: '100%', height: '100%' }} />
            </div>
          ) : (
            <button
              onClick={onLogin}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#ef4444',
                color: 'white',
                fontSize: '10px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              LOGIN
            </button>
          )}

        </div>

        {/* CONFIGURACIÓN SIMPLE */}
        {showSettings && (
          <div style={{
            position: 'absolute',
            bottom: '130px',
            left: '16px',
            right: '16px',
            backgroundColor: 'rgba(0,0,0,0.9)',
            borderRadius: '8px',
            padding: '16px',
            color: 'white'
          }}>

            {/* Velocidad */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                Velocidad: {playbackRate.toFixed(1)}x
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={playbackRate}
                onChange={(e) => onPlaybackRateChange(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            {/* Modo */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => onToggleCloudMode(false)}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: !useCloudTTS ? '#1e40af' : 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              >
                💻 Local
              </button>
              <button
                onClick={() => onToggleCloudMode(true)}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: useCloudTTS ? '#1e40af' : 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              >
                ☁ IA
              </button>
            </div>

          </div>
        )}
      </div>
    );
  }

  // VERSIÓN NORMAL PARA OTROS DISPOSITIVOS
  return (
    <div
      id="audio-controller-fixed"
      className="w-full bg-gradient-to-br from-blue-700 to-blue-800 text-white"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100vw',
        maxWidth: '100vw',
        padding: '16px 0',
        zIndex: 99999,
        transform: 'translateX(0)',
        margin: 0,
        boxSizing: 'border-box',
        // FORZAR VISIBILIDAD EN SAMSUNG
        background: 'linear-gradient(135deg, #1e40af, #1e3a8a)',
        opacity: 1,
        visibility: 'visible',
        display: 'block',
        minHeight: '120px'
      }}
    >
      {/* CONTENEDOR PRINCIPAL - SIEMPRE CENTRADO */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '100vw',
          margin: '0 auto',
          padding: '0 16px',
          boxSizing: 'border-box'
        }}
      >

        {/* INFO PÁGINA */}
        <div style={{ textAlign: 'center', width: '100%', marginBottom: '12px' }}>
          <p style={{ fontSize: '14px', opacity: 0.9 }}>
            Página {pageNumber} {useCloudTTS ? '(IA)' : '(Local)'}
          </p>
        </div>

        {/* BOTONES DE CONTROL - SIEMPRE CENTRADOS */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            width: '100%',
            maxWidth: '280px',
            margin: '0 auto 12px auto'
          }}
        >

          {/* Botón Salir / Biblioteca - NUEVO */}
          <button
            onClick={onExitReader}
            style={{
              padding: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            aria-label="Volver al inicio"
          >
            <Library size={20} color="white" />
          </button>

          {/* Botón Anterior */}
          <button
            onClick={onPrevPage}
            disabled={!canGoPrev}
            style={{
              padding: '12px',
              backgroundColor: canGoPrev ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              border: 'none',
              cursor: canGoPrev ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              opacity: canGoPrev ? 1 : 0.5
            }}
            onMouseDown={(e) => canGoPrev && (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            aria-label="Página anterior"
          >
            <SkipBack size={20} color="white" />
          </button>

          {/* Botón Play/Pause - MÁS GRANDE */}
          <button
            onClick={onTogglePlay}
            style={{
              padding: '16px',
              backgroundColor: 'white',
              color: '#1e40af',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              // FORZAR VISIBILIDAD EN SAMSUNG
              opacity: 1,
              visibility: 'visible',
              zIndex: 1000
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            aria-label={isPlaying && !isPaused ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying && !isPaused ? (
              <Pause size={28} color="#1e40af" />
            ) : (
              <Play size={28} color="#1e40af" style={{ marginLeft: '2px' }} />
            )}
          </button>

          {/* Botón Siguiente */}
          <button
            onClick={onNextPage}
            disabled={!canGoNext}
            style={{
              padding: '12px',
              backgroundColor: canGoNext ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              border: 'none',
              cursor: canGoNext ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              opacity: canGoNext ? 1 : 0.5
            }}
            onMouseDown={(e) => canGoNext && (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            aria-label="Página siguiente"
          >
            <SkipForward size={20} color="white" />
          </button>

          {/* Botón Configuración */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Ajustes de audio"
            aria-expanded={showSettings}
            style={{
              padding: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Settings size={20} color="white" />
          </button>

          {/* Botón Login/User - NUEVO */}
          {user ? (
            <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
              <img src={user.photoURL || ''} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors shadow-lg"
            >
              LOGIN
            </button>
          )}

        </div>

      </div>

      {/* PANEL DE CONFIGURACIÓN */}
      {showSettings && (
        <div
          style={isSamsung ? {
            width: '90%',
            maxWidth: '320px',
            margin: '16px auto 0 auto',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '16px',
            backdropFilter: 'blur(8px)'
          } : {
            width: '100%',
            maxWidth: '448px',
            margin: '16px auto 0 auto',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '16px',
            backdropFilter: 'blur(8px)'
          }}
        >

          {/* Selector de Motor TTS - NUEVO */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px',
              opacity: 0.6
            }}>
              Motor de Voz
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => onTTSModeChange?.('local')}
                style={{
                  padding: '12px 8px',
                  borderRadius: '8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: ttsMode === 'local' ? '#1e40af' : 'rgba(255, 255, 255, 0.1)',
                  color: ttsMode === 'local' ? 'white' : 'rgba(255, 255, 255, 0.8)',
                  boxShadow: ttsMode === 'local' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
                }}
              >
                📱 Local
              </button>
              <button
                onClick={() => onTTSModeChange?.('piper')}
                style={{
                  padding: '12px 8px',
                  borderRadius: '8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: ttsMode === 'piper' ? '#1e40af' : 'rgba(255, 255, 255, 0.1)',
                  color: ttsMode === 'piper' ? 'white' : 'rgba(255, 255, 255, 0.8)',
                  boxShadow: ttsMode === 'piper' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
                }}
              >
                🎙️ Natural
              </button>
              <button
                onClick={() => onTTSModeChange?.('cloud')}
                style={{
                  padding: '12px 8px',
                  borderRadius: '8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: ttsMode === 'cloud' ? '#1e40af' : 'rgba(255, 255, 255, 0.1)',
                  color: ttsMode === 'cloud' ? 'white' : 'rgba(255, 255, 255, 0.8)',
                  boxShadow: ttsMode === 'cloud' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
                }}
              >
                ☁️ IA
              </button>
            </div>
            <p style={{
              fontSize: '9px',
              opacity: 0.5,
              marginTop: '8px',
              lineHeight: '1.3'
            }}>
              {ttsMode === 'local' && '• Voces básicas del sistema'}
              {ttsMode === 'piper' && '• Detecta y usa las mejores voces disponibles. Toca ℹ️ para instalar voces premium'}
              {ttsMode === 'cloud' && '• IA avanzada (requiere API key)'}
            </p>
          </div>

          {/* Velocidad */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              Velocidad: {playbackRate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={playbackRate}
              onChange={(e) => onPlaybackRateChange(Number(e.target.value))}
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                appearance: 'none',
                cursor: 'pointer'
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              marginTop: '4px',
              opacity: 0.7
            }}>
              <span>0.5x</span>
              <span>1.0x</span>
              <span>2.0x</span>
            </div>
          </div>

          {/* Voz */}
          {!useCloudTTS && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Voz del Narrador
              </label>
              <select
                value={selectedVoiceURI || ''}
                onChange={(e) => onVoiceChange(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: 'white',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="" style={{ backgroundColor: '#1e40af', color: 'white' }}>
                  Voz por defecto
                </option>
                {availableVoices.map((voice, index) => (
                  <option
                    key={index}
                    value={voice.voiceURI}
                    style={{ backgroundColor: '#1e40af', color: 'white' }}
                  >
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Clonación de Voz */}
          {useCloudTTS && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Clonación de Voz
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {!userVoiceSample ? (
                  <button
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      backgroundColor: isRecording ? '#ef4444' : 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    {isRecording ? <StopCircle size={16} /> : <Mic size={16} />}
                    {isRecording ? 'Detener' : 'Grabar Voz'}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => onVoiceChange('custom-voice')}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        backgroundColor: selectedVoiceURI === 'custom-voice' ? 'white' : 'rgba(255, 255, 255, 0.2)',
                        color: selectedVoiceURI === 'custom-voice' ? '#ea580c' : 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      Usar Mi Voz
                    </button>
                    <button
                      onClick={handleDeleteVoice}
                      style={{
                        padding: '8px',
                        backgroundColor: 'rgba(239, 68, 68, 0.8)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};