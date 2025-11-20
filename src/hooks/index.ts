import { useState, useEffect, useCallback } from 'react';
import { User, Book, AudioControlState, UserPreferences } from '../types';
import { AuthService } from '../services/authService';
import { BookService } from '../services/bookService';
import { TextToSpeechService } from '../services/textToSpeechService';

export function useAuth() {
  const [user, setUser] = useState<User | null>(AuthService.getCurrentUser());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await AuthService.login(username, password);
      setUser(user);
      return user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error de autenticación';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await AuthService.register(username, email, password);
      setUser(user);
      return user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error de registro';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
    } catch (err) {
      setError('Error cerrando sesión');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    const updatedUser = AuthService.updateCurrentUser(updates);
    if (updatedUser) {
      setUser(updatedUser);
    }
  }, []);

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    updateUser,
    clearError: () => setError(null)
  };
}

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar libros al montar el componente
  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = useCallback(() => {
    setIsLoading(true);
    try {
      const userBooks = BookService.getUserBooks();
      setBooks(userBooks);
    } catch (err) {
      setError('Error cargando libros');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createBook = useCallback(async (
    fileName: string,
    content: string,
    metadata: { pageCount?: number; language?: string }
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newBook = await BookService.createBookFromProcessed(fileName, content, metadata);
      setBooks(prev => [...prev, newBook]);
      return newBook;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creando libro';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteBook = useCallback(async (bookId: string) => {
    try {
      const success = BookService.deleteBook(bookId);
      if (success) {
        setBooks(prev => prev.filter(book => book.id !== bookId));
        if (currentBook?.id === bookId) {
          setCurrentBook(null);
        }
      }
      return success;
    } catch (err) {
      setError('Error eliminando libro');
      return false;
    }
  }, [currentBook]);

  const updateBook = useCallback((bookId: string, updates: Partial<Book>) => {
    setBooks(prev => prev.map(book => 
      book.id === bookId ? { ...book, ...updates } : book
    ));
    
    if (currentBook?.id === bookId) {
      setCurrentBook(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [currentBook]);

  const setCurrentBookById = useCallback((bookId: string | null) => {
    if (bookId) {
      const book = books.find(b => b.id === bookId);
      setCurrentBook(book || null);
    } else {
      setCurrentBook(null);
    }
  }, [books]);

  const searchBooks = useCallback((query: string) => {
    return BookService.searchBooks(query);
  }, []);

  const getRecentBooks = useCallback((limit: number = 5) => {
    return BookService.getRecentBooks(limit);
  }, []);

  return {
    books,
    currentBook,
    isLoading,
    error,
    loadBooks,
    createBook,
    deleteBook,
    updateBook,
    setCurrentBook: setCurrentBookById,
    searchBooks,
    getRecentBooks,
    clearError: () => setError(null)
  };
}

export function useTextToSpeech() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [totalLength, setTotalLength] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [error, setError] = useState<string | null>(null);

  // Inicializar el servicio
  useEffect(() => {
    const init = async () => {
      try {
        await TextToSpeechService.initialize();
        setIsInitialized(true);
      } catch (err) {
        setError('Error inicializando síntesis de voz');
      }
    };
    init();
  }, []);

  const loadText = useCallback((text: string) => {
    if (!isInitialized) {
      setError('Servicio no inicializado');
      return;
    }

    try {
      TextToSpeechService.setText(text);
      setTotalLength(text.length);
      setCurrentPosition(0);
      setError(null);
    } catch (err) {
      setError('Error cargando texto');
    }
  }, [isInitialized]);

  const speak = useCallback(async (settings: {
    voiceURI: string;
    rate: number;
    pitch: number;
    volume: number;
  }) => {
    if (!isInitialized) {
      setError('Servicio no inicializado');
      return;
    }

    setError(null);
    setIsPlaying(true);
    setIsPaused(false);

    try {
      await TextToSpeechService.speak({
        voiceURI: settings.voiceURI,
        rate: settings.rate,
        pitch: settings.pitch,
        volume: settings.volume
      });
    } catch (err) {
      setError('Error reproduciendo audio');
    } finally {
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, [isInitialized]);

  const pause = useCallback(() => {
    if (isPlaying) {
      TextToSpeechService.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const resume = useCallback(() => {
    if (isPaused) {
      TextToSpeechService.resume();
      setIsPaused(false);
      setIsPlaying(true);
    }
  }, [isPaused]);

  const stop = useCallback(() => {
    TextToSpeechService.stop();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentPosition(0);
  }, []);

  const seek = useCallback((position: number) => {
    TextToSpeechService.seekTo(position);
    setCurrentPosition(position);
  }, []);

  // Actualizar estado de reproducción periódicamente
  useEffect(() => {
    if (!isPlaying && !isPaused) return;

    const interval = setInterval(() => {
      const state = TextToSpeechService.getCurrentState();
      setCurrentPosition(state.currentPosition || 0);
      setIsPlaying(state.isPlaying);
      setIsPaused(state.isPaused || false);
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, isPaused]);

  return {
    isInitialized,
    isPlaying,
    isPaused,
    currentPosition,
    totalLength,
    playbackRate,
    error,
    loadText,
    speak,
    pause,
    resume,
    stop,
    seek,
    setPlaybackRate,
    getProgress: () => totalLength > 0 ? (currentPosition / totalLength) * 100 : 0,
    clearError: () => setError(null)
  };
}

export function useAudioControl() {
  const [audioState, setAudioState] = useState<AudioControlState>({
    isPlaying: false,
    currentPosition: 0,
    duration: 0,
    rate: 1.0,
    voiceURI: ''
  });

  const [bookmarks, setBookmarks] = useState<Array<{
    id: string;
    title: string;
    position: number;
    timestamp: Date;
  }>>([]);

  const addBookmark = useCallback((title: string, position: number) => {
    const bookmark = {
      id: Date.now().toString(),
      title,
      position,
      timestamp: new Date()
    };
    setBookmarks(prev => [...prev, bookmark]);
  }, []);

  const removeBookmark = useCallback((bookmarkId: string) => {
    setBookmarks(prev => prev.filter(bm => bm.id !== bookmarkId));
  }, []);

  const updateAudioState = useCallback((updates: Partial<AudioControlState>) => {
    setAudioState(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    audioState,
    bookmarks,
    addBookmark,
    removeBookmark,
    updateAudioState
  };
}