import React, { useEffect, useRef, useState } from 'react';
import { Book, ViewMode, PageHistory } from '../types';

interface BookReaderUnicornProps {
  book: Book;
  onClose: () => void;
  initialPage?: number;
  viewMode?: ViewMode;
}

// Declaración de tipos para Unicornstudio.js
declare global {
  interface Window {
    UnicornStudio: {
      init: (config: any) => Promise<void>;
      destroy: () => void;
      play: (animationName: string) => void;
      pause: (animationName: string) => void;
    };
  }
}

const BookReaderUnicorn: React.FC<BookReaderUnicornProps> = ({
  book,
  onClose,
  initialPage = 1,
  viewMode = 'flip'
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isUnicornLoaded, setIsUnicornLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageHistory, setPageHistory] = useState<PageHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar Unicornstudio.js dinámicamente
  useEffect(() => {
    const loadUnicornStudio = async () => {
      try {
        // Cargar script de Unicornstudio
        const script = document.createElement('script');
        script.src = 'https://cdn.unicorn.studio/v1.4.35/unicornstudio.js';
        script.async = true;
        
        script.onload = async () => {
          try {
            // Configurar escena 3D del libro
            await window.UnicornStudio.init({
              container: canvasRef.current,
              projectUrl: 'https://demo.unicorn.studio/book-flip-animation',
              width: '100%',
              height: '100%',
              autoplay: true,
              loop: true
            });
            
            setIsUnicornLoaded(true);
            setIsLoading(false);
            
            // Configurar eventos de interacción
            window.UnicornStudio.play('pageFlip');
            
          } catch (error) {
            console.error('Error inicializando Unicornstudio:', error);
            setIsLoading(false);
          }
        };

        script.onerror = () => {
          console.error('Error cargando Unicornstudio.js');
          setIsLoading(false);
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error('Error cargando Unicornstudio:', error);
        setIsLoading(false);
      }
    };

    loadUnicornStudio();

    // Cleanup
    return () => {
      if (window.UnicornStudio) {
        window.UnicornStudio.destroy();
      }
    };
  }, []);

  // Navegación de páginas con animaciones 3D
  const goToPage = async (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > book.totalPages) return;

    // Añadir a historial
    const newHistoryItem: PageHistory = {
      pageNumber,
      timestamp: new Date().toISOString(),
      timeSpent: 0
    };
    
    setPageHistory(prev => {
      const updated = [newHistoryItem, ...prev].slice(0, 5);
      return updated;
    });

    // Reproducir animación de página
    if (isUnicornLoaded) {
      window.UnicornStudio.play(`flip-to-page-${pageNumber}`);
    }

    setCurrentPage(pageNumber);
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  // Controles de audio con animaciones visuales
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  const toggleAudio = () => {
    setIsPlaying(!isPlaying);
    if (isUnicornLoaded) {
      if (!isPlaying) {
        window.UnicornStudio.play('audioWave');
        window.UnicornStudio.play('bookOpen');
      } else {
        window.UnicornStudio.pause('audioWave');
        window.UnicornStudio.pause('bookOpen');
      }
    }
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (isUnicornLoaded) {
      const animationName = rate > 1 ? 'speedUp' : rate < 1 ? 'slowDown' : 'normalSpeed';
      window.UnicornStudio.play(animationName);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando experiencia 3D...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Header con controles */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            ✕ Cerrar
          </button>
          <h2 className="text-white font-semibold truncate">
            {book.title} - Página {currentPage}/{book.totalPages}
          </h2>
        </div>

        {/* Controles de audio */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleAudio}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isPlaying 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isPlaying ? '⏸️ Pausar' : '▶️ Reproducir'}
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-white text-sm">Velocidad:</span>
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
              <button
                key={rate}
                onClick={() => changePlaybackRate(rate)}
                className={`px-2 py-1 rounded text-sm transition-colors ${
                  playbackRate === rate
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenedor principal 3D */}
      <div className="flex-1 relative overflow-hidden">
        {/* Canvas de Unicornstudio */}
        <div 
          ref={canvasRef} 
          className="w-full h-full"
          style={{ minHeight: '600px' }}
        />

        {/* Controles de navegación (fallback si no funciona 3D) */}
        {!isUnicornLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-2xl font-bold mb-4">Experiencia de lectura inmersiva</h3>
              <p className="mb-6">Navega con las flechas o gestos</p>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Página Anterior
                </button>
                <button
                  onClick={nextPage}
                  disabled={currentPage === book.totalPages}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Página Siguiente →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Overlay de navegación */}
        {isUnicornLoaded && (
          <>
            {/* Botones de navegación invisibles pero clickeables */}
            <button
              onClick={prevPage}
              className="absolute left-0 top-0 w-1/3 h-full z-10"
              style={{ background: 'transparent' }}
              disabled={currentPage === 1}
            />
            <button
              onClick={nextPage}
              className="absolute right-0 top-0 w-1/3 h-full z-10"
              style={{ background: 'transparent' }}
              disabled={currentPage === book.totalPages}
            />
          </>
        )}
      </div>

      {/* Footer con historial y estadísticas */}
      <div className="bg-gray-800 p-4">
        <div className="flex items-center justify-between text-sm text-gray-300">
          <div>
            <span>Página actual: {currentPage}</span>
            <span className="mx-4">|</span>
            <span>Progreso: {Math.round((currentPage / book.totalPages) * 100)}%</span>
          </div>
          
          <div>
            <span>Última página: {pageHistory[0]?.pageNumber || 'N/A'}</span>
            <span className="mx-4">|</span>
            <span>Páginas en historial: {pageHistory.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookReaderUnicorn;