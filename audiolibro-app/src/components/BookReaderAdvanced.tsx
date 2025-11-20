import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Settings,
  List,
  Clock,
  RotateCcw,
  Volume2,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Home
} from 'lucide-react';
import { Book, Chapter, HistoryItem, ViewMode } from '../types';
import { BookIndexService, HistoryService, GestureService } from '../services/bookIndexService';
import { TextToSpeechService } from '../services/textToSpeechService';

interface BookReaderAdvancedProps {
  book: Book;
  onBackToLibrary: () => void;
}

export const BookReaderAdvanced: React.FC<BookReaderAdvancedProps> = ({
  book,
  onBackToLibrary
}) => {
  // Estados principales
  const [currentPage, setCurrentPage] = useState(book.progress.currentPage || 1);
  const [totalPages, setTotalPages] = useState(book.totalPages || 1);
  const [viewMode, setViewMode] = useState<ViewMode>('scroll');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showIndex, setShowIndex] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  // Estados de contenido
  const [bookIndex, setBookIndex] = useState<BookIndex | null>(book.index || null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  // Referencias
  const readerRef = useRef<HTMLDivElement>(null);
  const cleanupGestures = useRef<(() => void) | null>(null);

  // Inicialización
  useEffect(() => {
    if (!bookIndex && book.content) {
      // Generar índice automáticamente
      const generatedIndex = BookIndexService.generateIndex(book.content);
      setBookIndex(generatedIndex);
    }

    // Cargar historial
    const bookHistory = HistoryService.getHistoryForBook(book.id);
    setHistory(bookHistory);

    // Configurar gestos táctiles si está habilitado
    if (readerRef.current && window.innerWidth < 768) {
      cleanupGestures.current = GestureService.addGestureListeners(
        readerRef.current,
        handleNextPage,
        handlePrevPage
      );
    }

    return () => {
      if (cleanupGestures.current) {
        cleanupGestures.current();
      }
    };
  }, [book]);

  // Manejo de páginas
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      if (viewMode === 'flip') {
        setIsFlipping(true);
        setTimeout(() => {
          setCurrentPage(prev => prev + 1);
          setIsFlipping(false);
        }, 300);
      } else {
        setCurrentPage(prev => prev + 1);
      }
      addToHistory();
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      if (viewMode === 'flip') {
        setIsFlipping(true);
        setTimeout(() => {
          setCurrentPage(prev => prev - 1);
          setIsFlipping(false);
        }, 300);
      } else {
        setCurrentPage(prev => prev - 1);
      }
      addToHistory();
    }
  };

  const handlePageJump = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      addToHistory();
      if (showIndex) setShowIndex(false);
    }
  };

  // Historial
  const addToHistory = () => {
    const chapter = bookIndex ? BookIndexService.findChapterAtPosition(bookIndex, (currentPage / totalPages) * book.content.length) : undefined;
    const historyItem = HistoryService.addToHistory(book, currentPage, (currentPage / totalPages) * book.content.length, chapter?.title);
    setHistory(prev => [historyItem, ...prev.filter(h => h.page !== currentPage)].slice(0, 5));
  };

  // Audio
  const handlePlayPause = async () => {
    if (isPlaying) {
      TextToSpeechService.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      // Aquí iría la lógica de reproducción con TextToSpeechService
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    // Aplicar velocidad al reproductor de audio
  };

  // Obtener contenido de la página actual
  const getCurrentPageContent = (): string => {
    if (!book.content) return '';
    
    const paragraphs = book.content.split('\n\n').filter(p => p.trim().length > 0);
    const pageSize = Math.ceil(paragraphs.length / totalPages);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, paragraphs.length);
    
    return paragraphs.slice(startIndex, endIndex).join('\n\n');
  };

  const currentContent = getCurrentPageContent();

  return (
    <div className="min-h-screen bg-background-page text-text-primary">
      {/* Header con controles principales */}
      <header className="bg-background-surface border-b border-text-secondary/20 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Navegación */}
            <div className="flex items-center space-x-3">
              <button
                onClick={onBackToLibrary}
                className="p-2 hover:bg-background-page rounded-lg transition-colors"
              >
                <Home className="h-5 w-5" />
              </button>
              <div className="h-6 w-px bg-text-secondary/30" />
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="p-2 hover:bg-background-page rounded-lg transition-colors disabled:opacity-50"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm font-medium min-w-[80px] text-center">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="p-2 hover:bg-background-page rounded-lg transition-colors disabled:opacity-50"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Título del libro */}
            <div className="flex-1 text-center">
              <h1 className="text-lg font-semibold truncate">{book.title}</h1>
              <p className="text-sm text-text-secondary">{book.author}</p>
            </div>

            {/* Controles */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 hover:bg-background-page rounded-lg transition-colors relative"
              >
                <Clock className="h-5 w-5" />
                {history.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-primary text-black text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {history.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowIndex(!showIndex)}
                className="p-2 hover:bg-background-page rounded-lg transition-colors"
              >
                <List className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'scroll' ? 'flip' : 'scroll')}
                className="p-2 hover:bg-background-page rounded-lg transition-colors"
                title={viewMode === 'scroll' ? 'Modo Flip' : 'Modo Scroll'}
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Panel lateral de índice */}
        {showIndex && bookIndex && (
          <div className="w-80 bg-background-surface border-r border-text-secondary/20 h-screen overflow-y-auto">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Índice de Contenidos
              </h2>
              <div className="space-y-2">
                {bookIndex.chapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    onClick={() => handlePageJump(chapter.page)}
                    className={`
                      w-full text-left p-3 rounded-lg transition-colors
                      ${chapter.page === currentPage 
                        ? 'bg-accent-primary/20 text-accent-primary' 
                        : 'hover:bg-background-page'
                      }
                    `}
                    style={{ paddingLeft: `${(chapter.level - 1) * 16 + 12}px` }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{chapter.title}</span>
                      <span className="text-xs text-text-secondary">{chapter.page}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Panel lateral de historial */}
        {showHistory && history.length > 0 && (
          <div className="w-80 bg-background-surface border-r border-text-secondary/20 h-screen overflow-y-auto">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Historial Reciente
              </h2>
              <div className="space-y-2">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handlePageJump(item.page)}
                    className="w-full text-left p-3 rounded-lg hover:bg-background-page transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Página {item.page}</span>
                      <span className="text-xs text-text-secondary">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {item.title && (
                      <p className="text-xs text-text-secondary truncate">{item.title}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <div className="flex-1">
          <div
            ref={readerRef}
            className={`
              min-h-screen transition-all duration-300
              ${viewMode === 'flip' ? 'relative overflow-hidden' : ''}
            `}
          >
            {viewMode === 'scroll' ? (
              <div className="max-w-4xl mx-auto p-8">
                <div className="prose prose-lg max-w-none">
                  <div className="bg-background-page rounded-lg p-8 min-h-[calc(100vh-200px)]">
                    <div className="text-text-primary leading-relaxed space-y-6 text-lg">
                      {currentContent.split('\n\n').map((paragraph, index) => (
                        <p key={index} className="mb-6">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-screen flex items-center justify-center">
                <div className={`
                  w-80 h-96 bg-background-surface rounded-lg shadow-2xl p-8
                  transform transition-transform duration-300 relative
                  ${isFlipping ? 'scale-95 rotateY-180' : ''}
                `}>
                  <div className="h-full flex flex-col justify-center">
                    <div className="text-text-primary leading-relaxed space-y-4 text-sm">
                      {currentContent.split('\n\n').slice(0, 3).map((paragraph, index) => (
                        <p key={index} className="mb-4">
                          {paragraph.length > 200 ? paragraph.substring(0, 200) + '...' : paragraph}
                        </p>
                      ))}
                    </div>
                    <div className="mt-4 text-center text-text-secondary text-sm">
                      Página {currentPage} de {totalPages}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra de reproducción inferior */}
      <div className="fixed bottom-0 left-0 right-0 bg-background-surface border-t border-text-secondary/20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            {/* Controles principales */}
            <button
              onClick={handlePrevPage}
              className="p-2 hover:bg-background-page rounded-lg transition-colors"
            >
              <SkipBack className="h-5 w-5" />
            </button>

            <button
              onClick={handlePlayPause}
              className="p-3 bg-accent-primary hover:bg-accent-dark text-black rounded-full transition-colors"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
            </button>

            <button
              onClick={handleNextPage}
              className="p-2 hover:bg-background-page rounded-lg transition-colors"
            >
              <SkipForward className="h-5 w-5" />
            </button>

            {/* Control de velocidad */}
            <div className="flex items-center space-x-2">
              <Volume2 className="h-4 w-4 text-text-secondary" />
              <select
                value={playbackRate}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                className="bg-background-page border border-text-secondary/30 rounded px-2 py-1 text-sm"
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>

            {/* Progreso de página */}
            <div className="flex-1 mx-4">
              <input
                type="range"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => handlePageJump(parseInt(e.target.value))}
                className="w-full h-2 bg-text-secondary/20 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Indicador de modo */}
            <div className="text-xs text-text-secondary bg-background-page px-2 py-1 rounded">
              {viewMode === 'scroll' ? 'Scroll' : 'Flip'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
