import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseBookContent } from './utils/textParser';
import { parsePDF } from './utils/pdfManager';
import { RAW_BOOK_CONTENT, BOOK_INDEX } from './data/bookContent';
import { BookPage } from './components/BookPage';
import { AudioController } from './components/AudioController';
import { LibraryModal } from './components/LibraryModal';
import { NoScrollWrapper } from './components/NoScrollWrapper';
import { PageData, Theme, ViewMode, VoiceName, AudioFormat, HistoryItem, TOCItem } from './types';
import { BookData } from './types/library';
import { saveBookToDB } from './utils/db';
import { ttsService } from './services/ttsService';
import { nativeTtsService } from './services/nativeTtsService';
import { generateSpeech } from './services/geminiService';
import { base64ToUint8Array, decodeAudioData } from './services/audioUtils';
import { Headphones, Settings, ZoomIn, ZoomOut, Eye, List, X, ChevronRight, Clock, History, ScrollText, Book, Upload, FileText, Loader2, AlertCircle, CheckCircle, Grid, ListTree, BookOpen, Shield, Save, Library, Download, Mic, Cloud } from 'lucide-react';
import { VoiceControl } from './components/VoiceControl';
import { VoiceControlIntro } from './components/VoiceControlIntro';
import { voiceControlService } from './services/voiceControlService';
import { HowToUploadModal } from './components/HowToUploadModal';
import { compressPDFAutomatically, shouldCompressPDF } from './utils/pdfCompressor';
// Firebase Auth
import { signInWithGoogle, signOut, onAuthStateChanged, AuthUser } from './services/authService';
import { saveBookToCloud, getBooksFromCloud, CloudBook } from './services/cloudLibraryService';

// FilePond Imports
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

// Registrar plugins de FilePond
registerPlugin(FilePondPluginFileValidateType);

// Hook para prevenir scroll horizontal
const usePreventHorizontalScroll = () => {
  useEffect(() => {
    // Prevenir scroll horizontal
    const preventScroll = () => {
      document.body.style.overflowX = 'hidden';
      document.documentElement.style.overflowX = 'hidden';
      document.body.style.maxWidth = '100vw';
      document.documentElement.style.maxWidth = '100vw';
    };

    preventScroll();

    // Observar cambios en el DOM
    const observer = new MutationObserver(preventScroll);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, []);
};

// Sonido de página (Page Flip Sound - Base64 corto para no depender de assets externos)
const PAGE_FLIP_SOUND = "data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq";

// --- Componente Toast para Notificaciones ---
const Toast: React.FC<{ message: string; type: 'error' | 'success' | 'info'; onClose: () => void }> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    error: 'bg-red-600',
    success: 'bg-green-600',
    info: 'bg-stone-800'
  };

  return (
    <div className={`fixed top-20 left-1/2 -translate-x-1/2 sm:top-4 sm:right-4 sm:left-auto sm:translate-x-0 ${bgColors[type]} text-white px-4 py-3 rounded-xl shadow-2xl z-[200] flex items-center gap-2 animate-in slide-in-from-top sm:slide-in-from-right fade-in border border-white/10 max-w-[90vw] sm:max-w-md`}>
      {type === 'error' ? <AlertCircle size={20} /> : type === 'success' ? <CheckCircle size={20} /> : <Loader2 size={20} className="animate-spin" />}
      <p className="font-medium text-sm flex-1">{message}</p>
      <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full flex-shrink-0"><X size={18} /></button>
    </div>
  );
};

const Home: React.FC = () => {
  usePreventHorizontalScroll(); // Prevenir scroll horizontal

  const navigate = useNavigate();
  // App State
  const [isLanding, setIsLanding] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pages, setPages] = useState<PageData[]>([]);
  const [activePage, setActivePage] = useState<number | null>(null);
  const [toc, setToc] = useState<TOCItem[]>([]);
  const [bookTitle, setBookTitle] = useState<string>("");
  const [currentBookId, setCurrentBookId] = useState<string | undefined>(undefined);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);

  // View Mode State (Scroll vs Flip)
  const [viewMode, setViewMode] = useState<ViewMode>('scroll');
  const [flipState, setFlipState] = useState<string>('idle');

  // TTS State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  // Voice Cloning State
  const [userVoiceSample, setUserVoiceSample] = useState<string | null>(null);

  // TTS Mode State - UNIFICADO
  const [ttsMode, setTtsMode] = useState<'local' | 'piper' | 'cloud'>('piper'); // Piper por defecto
  const [useCloudTTS, setUseCloudTTS] = useState(false); // Mantener para compatibilidad
  const [audioFormat, setAudioFormat] = useState<AudioFormat>(AudioFormat.MP3);
  const [piperAudioBuffer, setPiperAudioBuffer] = useState<AudioBuffer | null>(null);

  // Audio Context Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Visual Accessibility State
  const [fontSize, setFontSize] = useState<number>(20);
  const [theme, setTheme] = useState<Theme>('light');
  const [showSettings, setShowSettings] = useState(false);
  const [showIndex, setShowIndex] = useState(false);
  const [indexTab, setIndexTab] = useState<'chapters' | 'grid'>('chapters');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showHowToUpload, setShowHowToUpload] = useState(false);
  const [showVoiceIntro, setShowVoiceIntro] = useState(false);
  const [voiceControlEnabled, setVoiceControlEnabled] = useState(false);

  // Samsung Detection State
  const [isSamsung, setIsSamsung] = useState(false);

  // Volume Control state
  const [volume, setVolume] = useState(1.0);

  // Swipe Gesture State
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Auth State
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);

      if (currentUser) {
        showToast(`Bienvenido, ${currentUser.displayName || 'Usuario'}`, 'success');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      showToast('Iniciando sesión...', 'info');
      const user = await signInWithGoogle();
      if (!user) {
        showToast('No se pudo iniciar sesión', 'error');
      }
    } catch (error) {
      showToast('Error al iniciar sesión', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      showToast('Sesión cerrada', 'success');
      // Limpiar estado de libro actual si se desea?
      // setPages([]);
      // setBookTitle("");
    } catch (error) {
      showToast('Error al cerrar sesión', 'error');
    }
  };



  // Refs
  const activePageRef = useRef<number | null>(null);
  const pagesRef = useRef<PageData[]>([]);

  const showToast = (message: string, type: 'error' | 'success' | 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    // Detectar Samsung
    const userAgent = navigator.userAgent.toLowerCase();
    const isSamsungDevice = /samsung|sm-|galaxy|samsungbrowser/i.test(userAgent);
    setIsSamsung(isSamsungDevice);

    // Verificar si es la primera vez que usa control por voz
    const hasSeenVoiceIntro = localStorage.getItem('librovoz-voice-intro-seen');
    const isVoiceSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!hasSeenVoiceIntro && isVoiceSupported) {
      // Mostrar tutorial después de 3 segundos
      setTimeout(() => {
        setShowVoiceIntro(true);
      }, 3000);
    } else if (hasSeenVoiceIntro === 'enabled') {
      setVoiceControlEnabled(true);
    }

    if (isSamsungDevice) {
      console.log('🔍 Samsung detectado en Home - Aplicando estilos para modo scroll');

      const checkVoices = () => {
        const voices = speechSynthesis.getVoices();
        const spanishVoices = voices.filter(voice =>
          voice.lang.includes('es') ||
          voice.name.toLowerCase().includes('spanish') ||
          voice.name.toLowerCase().includes('español')
        );

        if (voices.length === 0) {
          showToast("📱 Samsung: Cargando voces del sistema...", "info");
          setTimeout(checkVoices, 2000);
        } else if (spanishVoices.length === 0) {
          showToast("📱 Samsung: Ve a Configuración → Accesibilidad → Texto a voz → Descargar voces en español", "error");
        }
      };

      setTimeout(checkVoices, 2000);
      speechSynthesis.onvoiceschanged = checkVoices;
    }

    const storedHistory = localStorage.getItem('book_history');
    if (storedHistory) {
      try {
        setHistory(JSON.parse(storedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    return () => {
      ttsService.cancel();
      stopCloudAudio();
      audioCtxRef.current?.close();
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    activePageRef.current = activePage;
  }, [activePage]);

  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  useEffect(() => {
    const body = document.body;
    body.className = '';
    if (theme === 'light') body.classList.add('bg-[#eceae4]');
    else if (theme === 'sepia') body.classList.add('bg-[#fdf6e3]');
    else if (theme === 'dark') body.classList.add('bg-[#121212]');
    else if (theme === 'high-contrast') body.classList.add('bg-black');
  }, [theme]);

  useEffect(() => {
    if (showIndex && toc.length === 0) {
      setIndexTab('grid');
    } else if (showIndex && toc.length > 0) {
      setIndexTab('chapters');
    }
  }, [showIndex, toc]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const originalFile = e.target.files?.[0];

    if (!originalFile) {
      showToast("❌ No se seleccionó archivo. Intenta de nuevo.", "error");
      return;
    }

    const fileName = originalFile.name.toLowerCase();
    const fileType = originalFile.type.toLowerCase();
    const isPDF = fileName.endsWith('.pdf') || fileType.includes('pdf') || fileType === 'application/pdf';

    if (!isPDF) {
      showToast(`❌ Solo archivos PDF. Detectado: ${originalFile.name}`, "error");
      return;
    }

    setIsProcessing(true);

    try {
      let fileToProcess = originalFile;

      if (shouldCompressPDF(originalFile)) {
        showToast("🗜️ Archivo grande detectado. Comprimiendo...", "info");
        fileToProcess = await compressPDFAutomatically(originalFile);
      }

      showToast("🔄 Procesando PDF...", "info");
      const { pages: extractedPages, toc: extractedToc } = await parsePDF(fileToProcess);

      if (extractedPages.length === 0) {
        showToast("❌ No se encontró texto en el PDF", "error");
        return;
      }

      setPages(extractedPages);
      setToc(extractedToc);
      setBookTitle(originalFile.name.replace('.pdf', ''));
      setCurrentBookId(undefined);
      setActivePage(extractedPages[0].pageNumber);
      setIsLanding(false);

      showToast(`🎉 ${originalFile.name} cargado! ${extractedPages.length} páginas`, "success");

    } catch (error: any) {
      console.error("❌ PDF PROCESSING ERROR:", error);
      showToast(`❌ Error: ${error.message || "No se pudo procesar el PDF"}`, "error");
    } finally {
      setIsProcessing(false);
      if (e.target) e.target.value = '';
    }
  };

  const loadDemoBook = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const parsedPages = parseBookContent(RAW_BOOK_CONTENT);
      setPages(parsedPages);
      setToc(BOOK_INDEX);
      setBookTitle("La Teoría Polivagal");
      setCurrentBookId('demo-book');
      if (parsedPages.length > 0) {
        setActivePage(parsedPages[0].pageNumber);
        setIsLanding(false);
        showToast("Libro demo cargado", "success");
      }
      setIsProcessing(false);
    }, 500);
  };

  const handleSaveToLibrary = async () => {
    if (pages.length === 0) return;

    const bookId = currentBookId || crypto.randomUUID();
    const bookData: BookData = {
      id: bookId,
      title: bookTitle || "Sin Título",
      uploadDate: Date.now(),
      pages: pages,
      toc: toc,
      fileName: bookTitle + ".pdf"
    };

    try {
      await saveBookToDB(bookData);

      // Save to Cloud if logged in
      if (user) {
        saveBookToCloud(user.uid, bookData).then(() => {
          showToast("☁️ Guardado en nube y dispositivo", "success");
        }).catch((err) => {
          console.error("Cloud save error:", err);
          showToast("⚠️ Guardado localmente. Error en nube.", "info");
        });
      } else {
        showToast("Libro guardado en tu biblioteca personal", "success");
      }

      setCurrentBookId(bookId);
    } catch (error) {
      console.error("Error saving book:", error);
      showToast("Error al guardar el libro", "error");
    }
  };

  const handleLoadFromLibrary = (book: BookData) => {
    setPages(book.pages);
    setToc(book.toc);
    setBookTitle(book.title);
    setCurrentBookId(book.id);
    setActivePage(book.pages[0]?.pageNumber || 1);
    setIsLanding(false);
    setShowLibrary(false);
    showToast(`Cargado: ${book.title}`, "success");
  };

  const addToHistory = (pageNumber: number) => {
    setHistory(prev => {
      const filtered = prev.filter(item => item.pageNumber !== pageNumber);
      const newEntry = { pageNumber, timestamp: Date.now() };
      const newHistory = [newEntry, ...filtered].slice(0, 10);
      localStorage.setItem('book_history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const stopCloudAudio = () => {
    if (audioSourceRef.current) {
      try { audioSourceRef.current.stop(); } catch (e) { }
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
    }
  };

  const playPageTurnSound = () => {
    const audio = new Audio('https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73467.mp3');
    audio.volume = 0.4;
    audio.play().catch(() => { });
  };

  const playPage = async (page: PageData) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    addToHistory(page.pageNumber);
    ttsService.cancel();
    stopCloudAudio();
    nativeTtsService.stop();

    setIsPaused(false);
    setActivePage(page.pageNumber);

    if (ttsMode === 'piper') {
      setIsPlaying(true);
      ttsService.speak(page.content, selectedVoiceURI, playbackRate, () => {
        setIsPlaying(false);
        handleAutoAdvance();
      }, (e) => {
        setIsPlaying(false);
        showToast("❌ Error en voz natural.", "error");
      }, volume);
      return;
    }

    if (ttsMode === 'cloud' || useCloudTTS) {
      setIsGeneratingAudio(true);
      setIsPlaying(false);
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          audioCtxRef.current = new AudioContextClass();
        }
        if (audioCtxRef.current.state === 'suspended') await audioCtxRef.current.resume();

        const isCustomVoice = selectedVoiceURI === 'custom-voice';
        const voiceToUse = isCustomVoice ? 'custom-voice' : (selectedVoiceURI as VoiceName || VoiceName.Kore);

        const b64Data = await generateSpeech(page.content, voiceToUse, audioFormat, abortController.signal, isCustomVoice ? userVoiceSample : null);
        if (!b64Data) throw new Error("No se generó audio");

        const audioBytes = base64ToUint8Array(b64Data);
        const audioBuffer = await decodeAudioData(audioBytes, audioCtxRef.current);

        if (abortController.signal.aborted) return;

        const source = audioCtxRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.playbackRate.value = playbackRate;
        source.connect(audioCtxRef.current.destination);
        source.onended = () => {
          if (!abortController.signal.aborted) {
            setIsPlaying(false);
            handleAutoAdvance();
          }
        };
        source.start(0);
        audioSourceRef.current = source;
        setIsPlaying(true);
      } catch (e: any) {
        if (e.name !== 'AbortError') showToast("❌ Cloud TTS Error", "error");
      } finally {
        if (abortControllerRef.current === abortController) setIsGeneratingAudio(false);
      }
      return;
    }

    setIsPlaying(true);
    ttsService.speak(page.content, selectedVoiceURI, playbackRate, () => {
      setIsPlaying(false);
      handleAutoAdvance();
    }, (e) => {
      setIsPlaying(false);
      showToast("🔊 Error en lector local.", "error");
    }, volume);
  };

  const handleAutoAdvance = () => {
    const currentPageNum = activePageRef.current;
    const allPages = pagesRef.current;
    if (currentPageNum !== null) {
      const currentIndex = allPages.findIndex(p => p.pageNumber === currentPageNum);
      if (currentIndex !== -1 && currentIndex < allPages.length - 1) {
        const nextPage = allPages[currentIndex + 1];
        setTimeout(() => {
          if (viewMode === 'flip') animatePageTurn('next', () => playPage(nextPage));
          else { playPage(nextPage); scrollToPage(nextPage.pageNumber); }
        }, 500);
      }
    }
  };

  const scrollToPage = (pageNum: number) => {
    if (viewMode === 'scroll') {
      const element = document.getElementById(`page-${pageNum}`);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleTogglePlay = async () => {
    const currentPage = pages.find(p => p.pageNumber === activePage);
    if (isPlaying && !isPaused) {
      if (ttsMode === 'piper') await nativeTtsService.pause();
      else if (ttsMode === 'cloud' && audioCtxRef.current) await audioCtxRef.current.suspend();
      else ttsService.pause();
      setIsPaused(true);
    } else if (isPlaying && isPaused) {
      if (ttsMode === 'piper') await nativeTtsService.resume(playbackRate, () => { setIsPlaying(false); handleAutoAdvance(); });
      else if (ttsMode === 'cloud' && audioCtxRef.current) await audioCtxRef.current.resume();
      else ttsService.resume();
      setIsPaused(false);
    } else if (currentPage) {
      playPage(currentPage);
    }
  };

  const handlePauseResume = async () => await handleTogglePlay();
  const handleStop = () => {
    ttsService.cancel();
    stopCloudAudio();
    nativeTtsService.stop();
    setIsPlaying(false);
    setIsPaused(false);
    setIsGeneratingAudio(false);
  };

  const handlePageSelect = (page: PageData) => {
    playPage(page);
    if (viewMode === 'scroll') scrollToPage(page.pageNumber);
  };

  const handleIndexJump = (pageNumber: number) => {
    const targetPage = pages.find(p => p.pageNumber === pageNumber);
    if (targetPage) {
      if (isPlaying) playPage(targetPage);
      else setActivePage(targetPage.pageNumber);
      scrollToPage(targetPage.pageNumber);
      setShowIndex(false);
    }
  };

  const handleHistoryJump = (pageNumber: number) => {
    handleIndexJump(pageNumber);
    setShowHistory(false);
  };

  const handleSpeedChange = (newRate: number) => {
    setPlaybackRate(newRate);
    if (useCloudTTS && audioSourceRef.current) {
      audioSourceRef.current.playbackRate.value = newRate;
    } else if (isPlaying && !isPaused && activePage) {
      const currentPage = pages.find(p => p.pageNumber === activePage);
      if (currentPage) playPage(currentPage);
    }
  };

  const handleTTSModeChange = (mode: 'local' | 'piper' | 'cloud') => {
    handleStop();
    setTtsMode(mode);
    setUseCloudTTS(mode === 'cloud');
    setSelectedVoiceURI(null);
    showToast(`Modo ${mode} activado`, "success");
  };

  const handleRecordVoice = (base64Audio: string | null) => {
    if (base64Audio) {
      setUserVoiceSample(base64Audio);
      setSelectedVoiceURI('custom-voice');
      showToast("Voz clonada guardada.", "success");
    } else {
      setUserVoiceSample(null);
      setSelectedVoiceURI(null);
      showToast("Voz clonada eliminada.", "info");
    }
  };

  const animatePageTurn = (direction: 'next' | 'prev', callback: () => void) => {
    playPageTurnSound();
    if ('vibrate' in navigator) navigator.vibrate(50);
    if (viewMode === 'scroll') { callback(); return; }
    setFlipState('flipping-out-left');
    setTimeout(() => {
      callback();
      setFlipState('flipping-in-right');
      setTimeout(() => setFlipState('idle'), 600);
    }, 300);
  };

  const handleNext = () => {
    const currentIndex = pages.findIndex(p => p.pageNumber === activePage);
    if (currentIndex < pages.length - 1) handlePageSelect(pages[currentIndex + 1]);
  };

  const handlePrev = () => {
    const currentIndex = pages.findIndex(p => p.pageNumber === activePage);
    if (currentIndex > 0) handlePageSelect(pages[currentIndex - 1]);
  };

  const onTouchStart = (e: React.TouchEvent) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) handleNext();
    else if (distance < -50) handlePrev();
  };

  const handleVoiceCommand = (action: string, parameters?: Record<string, any>) => {
    console.log('🎤 Comando de voz:', action, parameters);
    switch (action) {
      case 'nextPage': handleNext(); break;
      case 'previousPage': handlePrev(); break;
      case 'play': handleTogglePlay(); break;
      case 'pause': handlePauseResume(); break;
      case 'stop': handleStop(); break;
      case 'increaseSpeed': handleSpeedChange(Math.min(playbackRate + 0.25, 3.0)); break;
      case 'decreaseSpeed': handleSpeedChange(Math.max(playbackRate - 0.25, 0.5)); break;
      case 'increaseVolume': setVolume(prev => Math.min(prev + 0.1, 1.0)); break;
      case 'decreaseVolume': setVolume(prev => Math.max(prev - 0.1, 0.0)); break;
      case 'goToPage': if (parameters?.page) handleIndexJump(parameters.page); break;
      case 'zoomIn': setFontSize(prev => Math.min(prev + 2, 48)); break;
      case 'zoomOut': setFontSize(prev => Math.max(prev - 2, 16)); break;
      case 'setTheme': if (parameters?.theme) setTheme(parameters.theme as Theme); break;
      case 'openLibrary': setShowLibrary(true); break;
      case 'showHelp': showToast('Di "ayuda" para ver comandos', 'info'); break;
      case 'whereAmI': {
        const announcement = `Estás leyendo ${bookTitle || "un libro"}, página ${activePage || 1}.`;
        voiceControlService.announce(announcement);
        showToast(announcement, 'info');
      } break;
      default: showToast('Comando no reconocido', 'error');
    }
  };

  const handleEnableVoiceControl = () => {
    setVoiceControlEnabled(true);
    setShowVoiceIntro(false);
    localStorage.setItem('librovoz-voice-intro-seen', 'enabled');
    showToast('🎤 Control por voz activado', 'success');
  };

  const handleCloseVoiceIntro = () => { setShowVoiceIntro(false); localStorage.setItem('librovoz-voice-intro-seen', 'dismissed'); };

  const headerBg = theme === 'high-contrast' ? 'bg-black border-yellow-900' : theme === 'dark' ? 'bg-[#121212] border-stone-800' : 'bg-[#1e40af]/90 border-[#e5e3dc]';
  const headerText = 'text-white';
  const drawerBg = theme === 'high-contrast' ? 'bg-stone-950 border-r border-yellow-900' : theme === 'dark' ? 'bg-stone-900 border-r border-stone-700' : 'bg-[#f5f4f0] border-r border-[#e5e3dc]';

  return (
    <NoScrollWrapper>
      <div className={`min-h-screen pb-32 sm:pb-40 transition-colors duration-500 bg-[#eceae4] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] bg-fixed overflow-x-hidden w-full`} style={{ overflowX: 'hidden', maxWidth: '100vw', width: '100%' }}>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <LibraryModal
          isOpen={showLibrary}
          onClose={() => setShowLibrary(false)}
          onLoadBook={handleLoadFromLibrary}
          currentBookId={currentBookId}
          theme={theme}
          user={user}
          onLogin={handleLogin}
        />

        <HowToUploadModal
          isOpen={showHowToUpload}
          onClose={() => setShowHowToUpload(false)}
          theme={theme}
        />

        <header className={`${headerBg} border-b sticky top-0 z-40 backdrop-blur-md shadow-sm transition-all`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group" onClick={() => setIsLanding(true)} role="button">
              <div className="bg-white p-1.5 sm:p-2 rounded-xl shadow-inner group-hover:scale-110 transition-transform">
                <Headphones className="text-[#1e40af]" size={24} />
              </div>
              <div>
                <h1 className={`text-lg sm:text-2xl font-black tracking-tighter ${headerText}`}>LIBRO<span className="opacity-80">VOZ</span> <span className="text-[10px] font-normal opacity-50">v1.2 Blue Deploy Test</span></h1>
                <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest leading-none">Accesible</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isLanding ? (
                <>
                  <button onClick={() => setShowIndex(!showIndex)} className={`p-2.5 rounded-xl border ${showIndex ? 'bg-white text-[#1e40af]' : 'bg-white text-stone-600'}`}><List size={22} /></button>
                  <button onClick={handleSaveToLibrary} className="bg-[#1e40af] text-white px-4 py-2 rounded-xl font-bold text-xs"><Save size={18} /></button>
                  <button onClick={() => setShowSettings(!showSettings)} className="p-2.5 rounded-xl bg-white border"><Settings size={22} /></button>
                </>
              ) : (
                <button onClick={() => setShowLibrary(true)} className="p-2.5 rounded-xl bg-white text-blue-600 border"><Library size={22} /></button>
              )}
            </div>
          </div>
        </header>

        {showSettings && (
          <div className="fixed top-20 right-4 w-72 p-5 rounded-2xl border bg-white shadow-2xl z-50 animate-in slide-in-from-top-4">
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase text-stone-400 mb-2 block">Tema</label>
                <div className="grid grid-cols-4 gap-2">
                  <button onClick={() => setTheme('light')} className="h-10 rounded-full bg-[#fdfbf7] border-2 border-stone-200"></button>
                  <button onClick={() => setTheme('sepia')} className="h-10 rounded-full bg-[#fdf6e3] border-2 border-[#eee8d5]"></button>
                  <button onClick={() => setTheme('dark')} className="h-10 rounded-full bg-[#1e1e1e] border-2 border-stone-700"></button>
                  <button onClick={() => setTheme('high-contrast')} className="h-10 rounded-full bg-black border-2 border-stone-800"></button>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-stone-400 mb-2 block">Voz</label>
                <button onClick={() => setVoiceControlEnabled(!voiceControlEnabled)} className={`w-full py-2 rounded-xl font-bold ${voiceControlEnabled ? 'bg-green-600 text-white' : 'bg-stone-100 text-stone-500'}`}>
                  {voiceControlEnabled ? 'Voz Activa' : 'Activar Voz'}
                </button>
              </div>
            </div>
          </div>
        )}

        {isLanding ? (
          <main className="flex-1 flex flex-col items-center justify-center p-4 min-h-[calc(100vh-80px)]">
            <div className="w-full max-w-xl text-center space-y-8 animate-in fade-in zoom-in duration-700">
              <div className="space-y-4">
                <div className="inline-block p-4 bg-white rounded-3xl shadow-2xl mb-4">
                  <BookOpen size={48} className="text-[#1e40af]" />
                </div>
                <h2 className="text-4xl sm:text-6xl font-black text-stone-900 tracking-tight leading-none px-4">
                  Tu biblioteca <br /> personal, <span className="text-[#1e40af]">narrada con IA</span>
                </h2>
                <p className="text-lg text-stone-600 px-6 max-w-md mx-auto">
                  Sube tus documentos y escucha con voces naturales y control por voz total.
                </p>
              </div>

              <div className="bg-white p-4 sm:p-8 rounded-[2.5rem] shadow-2xl border-4 border-white relative group mx-4">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#1e40af]/20 to-blue-500/20 rounded-[3rem] blur-2xl opacity-50"></div>
                <div className="relative space-y-6">
                  <FilePond
                    onupdatefiles={(fileItems) => { if (fileItems.length > 0) handleFileUpload({ target: { files: [fileItems[0].file] } } as any); }}
                    acceptedFileTypes={['application/pdf']}
                    labelIdle='Arrastra tu PDF aquí o <span class="filepond--label-action">Búscalo</span><br/><small><a href="#" id="open-tutorial" style="color:#1e40af; font-weight:bold;">¿Cómo subir?</a></small>'
                    oninit={() => {
                      const link = document.getElementById('open-tutorial');
                      if (link) link.onclick = (e) => { e.preventDefault(); setShowHowToUpload(true); };
                    }}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setShowLibrary(true)} className="p-5 bg-blue-50 rounded-2xl border-2 border-blue-100 text-blue-900 font-bold flex flex-col items-center gap-2"><Library size={28} />Biblioteca</button>
                    <button onClick={loadDemoBook} className="p-5 bg-stone-900 rounded-2xl border-2 border-stone-800 text-white font-bold flex flex-col items-center gap-2"><Book size={28} />Demo</button>
                  </div>
                </div>
              </div>

              <div className="w-full max-w-4xl mt-8">
                <h3 className="text-xl font-black text-stone-900 mb-6 uppercase tracking-wider text-center">Tú eliges cómo leer</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Nube */}
                  <div className="bg-white/70 p-6 rounded-[2rem] border-2 border-white shadow-sm flex flex-col items-center text-center space-y-3 backdrop-blur-sm">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl mb-2">
                      <Cloud size={32} />
                    </div>
                    <h4 className="font-black text-stone-900 text-lg">Modo Nube</h4>
                    <p className="text-xs font-medium text-stone-500 leading-relaxed px-4">
                      Inicia sesión con WiFi para guardar tus libros y acceder desde cualquier dispositivo.
                    </p>
                  </div>

                  {/* Local */}
                  <div className="bg-white/70 p-6 rounded-[2rem] border-2 border-white shadow-sm flex flex-col items-center text-center space-y-3 backdrop-blur-sm">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl mb-2">
                      <Book size={32} />
                    </div>
                    <h4 className="font-black text-stone-900 text-lg">Modo Local</h4>
                    <p className="text-xs font-medium text-stone-500 leading-relaxed px-4">
                      Sube PDFs directamente a tu celular. Se guardan en la memoria para leer <b>sin internet</b>.
                    </p>
                  </div>

                  {/* Offline */}
                  <div className="bg-white/70 p-6 rounded-[2rem] border-2 border-white shadow-sm flex flex-col items-center text-center space-y-3 backdrop-blur-sm">
                    <div className="p-3 bg-green-100 text-green-600 rounded-2xl mb-2">
                      <Download size={32} />
                    </div>
                    <h4 className="font-black text-stone-900 text-lg">Descargar</h4>
                    <p className="text-xs font-medium text-stone-500 leading-relaxed px-4">
                      ¿Sin datos? Descarga tus libros de la nube al celular con WiFi y escúchalos después offline.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        ) : (
          <>
            {(showIndex || showHistory) && (
              <>
                <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => { setShowIndex(false); setShowHistory(false); }} />
                <div className={`fixed top-0 left-0 h-full w-[85%] max-w-xs z-50 shadow-2xl ${drawerBg} overflow-hidden flex flex-col animate-in slide-in-from-left duration-300`}>
                  <div className="p-4 flex justify-between items-center bg-[#1e40af] text-white">
                    <h2 className="text-base font-bold uppercase tracking-wider">{showIndex ? 'Índice' : 'Historial'}</h2>
                    <button onClick={() => { setShowIndex(false); setShowHistory(false); }} className="p-2 rounded-full hover:bg-white/20"><X size={24} /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {showIndex ? (
                      <div className="grid grid-cols-4 gap-2 p-3">
                        {pages.map((p) => (
                          <button key={p.pageNumber} onClick={() => handleIndexJump(p.pageNumber)} className={`aspect-square flex items-center justify-center rounded text-sm font-bold ${activePage === p.pageNumber ? 'bg-[#1e40af] text-white' : 'bg-white text-stone-400 border border-stone-100'}`}>{p.pageNumber}</button>
                        ))}
                      </div>
                    ) : (
                      <div className="divide-y divide-black/5">
                        {history.map((h, i) => (
                          <div key={i} onClick={() => handleHistoryJump(h.pageNumber)} className="p-4 cursor-pointer hover:bg-black/5 text-sm font-bold">Página {h.pageNumber}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <main className="w-full max-w-4xl mx-auto px-4 py-8 sm:px-6">
              <div className="space-y-8" style={{ paddingBottom: '180px' }}>
                {pages.map((page) => (
                  <div key={page.pageNumber} id={`page-${page.pageNumber}`} className={activePage === page.pageNumber || viewMode === 'scroll' ? 'block' : 'hidden'}>
                    <BookPage
                      page={page}
                      isActive={activePage === page.pageNumber}
                      isPlaying={isPlaying && !isPaused && activePage === page.pageNumber}
                      isLoading={isGeneratingAudio && activePage === page.pageNumber}
                      onPlay={handlePageSelect}
                      fontSize={fontSize}
                      theme={theme}
                      viewMode={viewMode}
                      isSamsung={isSamsung}
                    />
                  </div>
                ))}
              </div>
            </main>

            {activePage !== null && (
              <AudioController
                isPlaying={isPlaying}
                isPaused={isPaused}
                pageNumber={activePage}
                selectedVoiceURI={selectedVoiceURI}
                playbackRate={playbackRate}
                useCloudTTS={ttsMode === 'cloud'}
                ttsMode={ttsMode}
                audioFormat={audioFormat}
                userVoiceSample={userVoiceSample}
                onTogglePlay={handleTogglePlay}
                onVoiceChange={setSelectedVoiceURI}
                onPlaybackRateChange={handleSpeedChange}
                onNextPage={handleNext}
                onPrevPage={handlePrev}
                onToggleCloudMode={(useCloud) => handleTTSModeChange(useCloud ? 'cloud' : 'local')}
                onTTSModeChange={handleTTSModeChange}
                onFormatChange={setAudioFormat}
                onRecordVoice={handleRecordVoice}
                onLogin={handleLogin}
                user={user}
                onExitReader={() => {
                  stopCloudAudio();
                  setIsPlaying(false);
                  setIsPaused(false);
                  setActivePage(null);
                  setIsLanding(true);
                  if (activePageRef.current) addToHistory(activePageRef.current);
                }}
                canGoNext={pages.findIndex(p => p.pageNumber === activePage) < pages.length - 1}
                canGoPrev={pages.findIndex(p => p.pageNumber === activePage) > 0}
              />
            )}
          </>
        )}

        {voiceControlEnabled && (
          <div className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-[45] animate-in slide-in-from-top duration-500">
            <VoiceControl onCommand={handleVoiceCommand} className="voice-control-overlay" />
          </div>
        )}

        {showVoiceIntro && (
          <VoiceControlIntro onClose={handleCloseVoiceIntro} onEnable={handleEnableVoiceControl} />
        )}
      </div>
    </NoScrollWrapper>
  );
};

export default Home;