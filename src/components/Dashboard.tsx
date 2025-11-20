import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Upload, 
  BookOpen, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Settings, 
  LogOut,
  Search,
  Volume2,
  VolumeX,
  User,
  Library,
  FileText,
  AlertTriangle,
  Reader
} from 'lucide-react';
import { Book } from '../types';
import { BookReaderAdvanced } from './BookReaderAdvanced';

interface DashboardProps {
  books: Book[];
  currentBook: Book | null;
  onBookSelect: (book: Book | null) => void;
  onAddBook: (file: File) => void;
  onLogout: () => void;
  onDeleteBook: (bookId: string) => void;
  isLoading: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  books,
  currentBook,
  onBookSelect,
  onAddBook,
  onLogout,
  onDeleteBook,
  isLoading
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showAdvancedReader, setShowAdvancedReader] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const supportedFiles = files.filter(file => 
      file.type === 'application/pdf' || 
      file.type === 'text/plain' ||
      file.name.endsWith('.md')
    );

    if (supportedFiles.length > 0) {
      if (!showDisclaimer) {
        setShowDisclaimer(true);
        return;
      }
      onAddBook(supportedFiles[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!showDisclaimer) {
        setShowDisclaimer(true);
        return;
      }
      onAddBook(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleAcceptDisclaimer = () => {
    setShowDisclaimer(false);
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <>
      {showAdvancedReader && currentBook ? (
        <BookReaderAdvanced 
          book={currentBook} 
          onBackToLibrary={() => setShowAdvancedReader(false)}
        />
      ) : (
        <div className="min-h-screen bg-background-page text-text-primary">
          {/* Header */}
          <header className="bg-background-surface border-b border-text-secondary/20 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-accent-primary mr-3" />
                  <h1 className="text-2xl font-bold">AudioLibro</h1>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Búsqueda */}
                  <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
                    <input
                      type="text"
                      placeholder="Buscar libros..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-background-page border border-text-secondary/30 rounded-lg text-text-primary placeholder-text-secondary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 w-64"
                    />
                  </div>

                  {/* Controles de usuario */}
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 hover:bg-background-page rounded-lg transition-colors"
                  >
                    <Settings className="h-6 w-6" />
                  </button>

                  <button
                    onClick={onLogout}
                    className="p-2 hover:bg-background-page rounded-lg transition-colors"
                  >
                    <LogOut className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel izquierdo - Biblioteca */}
          <div className="lg:col-span-1">
            <div className="bg-background-surface rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <Library className="h-6 w-6 mr-2 text-accent-primary" />
                  Mi Biblioteca
                </h2>
                <span className="text-text-secondary text-sm">
                  {filteredBooks.length} libro{filteredBooks.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Área de carga de archivos */}
              <div
                onDrop={handleFileDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors relative
                  ${isDragOver 
                    ? 'border-accent-primary bg-accent-primary/10' 
                    : 'border-text-secondary/30 hover:border-accent-primary/50'
                  }
                `}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragOver ? 'text-accent-primary' : 'text-text-secondary'}`} />
                <p className="text-text-primary font-medium mb-2">
                  {isDragOver ? 'Suelta el archivo aquí' : 'Arrastra un archivo o haz clic para subir'}
                </p>
                <p className="text-text-secondary text-sm mb-2">
                  Soporta PDF, TXT y MD
                </p>
                <div className="flex items-center justify-center text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 rounded px-2 py-1">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Se aplicará aviso legal al subir archivos
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.md"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Lista de libros */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredBooks.length === 0 ? (
                  <div className="text-center py-8 text-text-secondary">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>
                      {searchQuery ? 'No se encontraron libros' : 'No tienes libros aún'}
                    </p>
                    {!searchQuery && (
                      <p className="text-sm mt-2">
                        Sube tu primer libro para comenzar
                      </p>
                    )}
                  </div>
                ) : (
                  filteredBooks.map((book) => (
                    <div
                      key={book.id}
                      className={`
                        p-4 rounded-lg border cursor-pointer transition-all hover:border-accent-primary/50
                        ${currentBook?.id === book.id 
                          ? 'border-accent-primary bg-accent-primary/10' 
                          : 'border-text-secondary/20 hover:bg-background-page'
                        }
                      `}
                      onClick={() => onBookSelect(book)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-text-primary text-lg leading-tight">
                          {book.title}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteBook(book.id);
                          }}
                          className="text-text-secondary hover:text-red-400 ml-2"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-text-secondary text-sm mb-3">{book.author}</p>
                      
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex space-x-4 text-text-secondary">
                          <span>{formatDuration(book.duration)}</span>
                          <span>{book.totalWords} palabras</span>
                        </div>
                        <div className="text-accent-primary font-medium">
                          {book.progress.completionPercentage}% leído
                        </div>
                      </div>
                      
                      <div className="mt-2 bg-background-page rounded-full h-2">
                        <div
                          className="bg-accent-primary h-2 rounded-full transition-all"
                          style={{ width: `${book.progress.completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Panel derecho - Lector */}
          <div className="lg:col-span-2">
            {currentBook ? (
              <div>
                {/* Botón de modo avanzado */}
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={() => setShowAdvancedReader(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-accent-primary hover:bg-accent-dark text-black rounded-lg transition-colors text-sm font-medium"
                    title="Modo Avanzado con Índice, Historial y Gestos"
                  >
                    <Reader className="h-4 w-4" />
                    <span>Modo Avanzado</span>
                  </button>
                </div>
                <BookReader book={currentBook} />
              </div>
            ) : (
              <div className="bg-background-surface rounded-lg p-12 text-center">
                <BookOpen className="h-24 w-24 mx-auto mb-6 text-text-secondary" />
                <h3 className="text-2xl font-semibold text-text-primary mb-4">
                  Selecciona un libro para comenzar
                </h3>
                <p className="text-text-secondary text-lg">
                  Elige un libro de tu biblioteca o sube uno nuevo para comenzar a escuchar
                </p>
                <div className="mt-6 p-4 bg-background-page rounded-lg">
                  <h4 className="text-lg font-medium text-text-primary mb-2">✨ Características Avanzadas</h4>
                  <ul className="text-sm text-text-secondary space-y-1">
                    <li>• Índice de contenidos navegable</li>
                    <li>• Historial de las últimas 5 páginas</li>
                    <li>• Modo flip con efecto de libro</li>
                    <li>• Gestos swipe en móviles</li>
                    <li>• Voces argentinas preferidas</li>
                    <li>• Accesibilidad para maculopatía</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background-surface rounded-lg p-8">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary mr-4"></div>
              <p className="text-text-primary">Procesando archivo...</p>
            </div>
          </div>
        </div>
      )}
      </>
      )}

      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-background-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <AlertTriangle className="h-8 w-8 text-yellow-500 mr-3" />
                <h2 className="text-2xl font-bold text-text-primary">Aviso Legal Importante</h2>
              </div>
              
              <div className="space-y-6 text-text-primary">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-yellow-500">Responsabilidad del Usuario</h3>
                  <p className="text-sm leading-relaxed">
                    Al subir un archivo a esta aplicación, usted declara y garantiza que:
                  </p>
                  <ul className="list-disc list-inside mt-3 space-y-2 text-sm">
                    <li>Es el propietario del contenido o tiene autorización legal para usarlo</li>
                    <li>El archivo no está protegido por derechos de autor de terceros</li>
                    <li>El uso previsto no infringe derechos de propiedad intelectual</li>
                    <li>Comprende que la conversión a audio es para uso personal y educativo</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-red-500">Limitación de Responsabilidad</h3>
                  <p className="text-sm leading-relaxed">
                    Esta aplicación es una herramienta técnica que facilita la conversión de texto a audio. 
                    Los desarrolladores y operadores de esta aplicación NO se responsabilizan por:
                  </p>
                  <ul className="list-disc list-inside mt-3 space-y-2 text-sm">
                    <li>Infracciones de derechos de autor</li>
                    <li>Uso indebido del contenido</li>
                    <li>Violación de leyes de propiedad intelectual</li>
                    <li>Daños derivados del uso no autorizado de materiales</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-accent-primary">Uso Responsable</h3>
                  <p className="text-sm leading-relaxed">
                    Esta herramienta está diseñada para:
                  </p>
                  <ul className="list-disc list-inside mt-3 space-y-2 text-sm">
                    <li>Convertir contenido propio a audio</li>
                    <li>Crear audiolibros de obras en dominio público</li>
                    <li>Facilitar el acceso a contenidos para personas con discapacidades visuales</li>
                    <li>Uso educativo y académico autorizado</li>
                  </ul>
                </div>

                <div className="bg-background-page p-4 rounded-lg">
                  <p className="text-sm font-medium">
                    ⚠️ Al continuar, usted acepta estos términos y asume toda la responsabilidad legal del contenido que suba a esta aplicación.
                  </p>
                  <p className="text-xs text-text-secondary mt-2">
                    Para términos completos, consulte: 
                    <a 
                      href="/TERMINOS_CONDICIONES.md" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-accent-primary hover:underline ml-1"
                    >
                      Términos y Condiciones Completos
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={() => setShowDisclaimer(false)}
                  className="px-6 py-2 bg-background-page text-text-secondary border border-text-secondary/30 rounded-lg hover:bg-text-secondary/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAcceptDisclaimer}
                  className="px-6 py-2 bg-accent-primary hover:bg-accent-dark text-black rounded-lg transition-colors font-medium"
                >
                  Acepto y Continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente del lector de libros
interface BookReaderProps {
  book: Book;
}

const BookReader: React.FC<BookReaderProps> = ({ book }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(book.progress.currentPosition);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showControls, setShowControls] = useState(false);

  // Simulación de controles de reproducción
  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    // Aquí se integraría con el servicio de TTS
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const position = parseInt(e.target.value);
    setCurrentPosition(position);
    // Aquí se buscaría en el texto
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Dividir el contenido en párrafos
  const paragraphs = book.content.split('\n\n').filter(p => p.trim().length > 0);
  const currentParagraph = Math.floor((currentPosition / book.content.length) * paragraphs.length);

  return (
    <div className="bg-background-surface rounded-lg overflow-hidden">
      {/* Header del libro */}
      <div className="p-6 border-b border-text-secondary/20">
        <h1 className="text-3xl font-bold text-text-primary mb-2">{book.title}</h1>
        <p className="text-text-secondary text-lg mb-4">{book.author}</p>
        
        <div className="flex justify-between items-center">
          <div className="flex space-x-6 text-sm text-text-secondary">
            <span>{formatTime(book.duration)} duración</span>
            <span>{book.totalWords} palabras</span>
            <span>{book.contentType.toUpperCase()}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowControls(!showControls)}
              className="p-2 hover:bg-background-page rounded-lg transition-colors"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Controles de reproducción */}
      <div className="p-6 bg-background-page">
        <div className="flex items-center space-x-4 mb-4">
          <button className="p-3 hover:bg-background-surface rounded-lg transition-colors">
            <SkipBack className="h-6 w-6" />
          </button>
          
          <button
            onClick={handlePlay}
            className="p-4 bg-accent-primary hover:bg-accent-dark text-black rounded-full transition-colors"
          >
            {isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8 ml-1" />
            )}
          </button>
          
          <button className="p-3 hover:bg-background-surface rounded-lg transition-colors">
            <SkipForward className="h-6 w-6" />
          </button>

          <div className="flex-1 mx-4">
            <input
              type="range"
              min="0"
              max={book.content.length}
              value={currentPosition}
              onChange={handleSeek}
              className="w-full h-2 bg-text-secondary/20 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Volume2 className="h-5 w-5" />
            <select
              value={playbackRate}
              onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
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
        </div>
      </div>

      {/* Contenido del libro */}
      <div className="p-6">
        <div className="prose prose-lg max-w-none">
          <div className="bg-background-page rounded-lg p-8 min-h-96">
            <div className="text-text-primary leading-relaxed space-y-4">
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className={`
                      transition-all duration-200
                      ${index === currentParagraph 
                        ? 'bg-accent-primary/20 text-accent-primary border-l-4 border-accent-primary pl-4' 
                        : index < currentParagraph 
                          ? 'opacity-70' 
                          : ''
                      }
                    `}
                  >
                    {paragraph}
                  </p>
                ))
              ) : (
                <div className="text-center text-text-secondary">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No se pudo cargar el contenido del libro</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};