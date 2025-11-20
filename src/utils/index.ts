// Utilidades generales para la aplicación AudioLibro

// Utilidades de formato
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return remainingMinutes > 0 
    ? `${hours}h ${remainingMinutes}m` 
    : `${hours}h`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatReadingTime = (wordCount: number, wordsPerMinute: number = 180): string => {
  const minutes = wordCount / wordsPerMinute;
  
  if (minutes < 1) {
    return 'menos de 1 minuto';
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  
  if (hours > 0) {
    return remainingMinutes > 0 
      ? `${hours}h ${remainingMinutes}min`
      : `${hours}h`;
  }
  
  return `${remainingMinutes} min`;
};

// Utilidades de validación
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe incluir al menos una mayúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe incluir al menos una minúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('La contraseña debe incluir al menos un número');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = [
    'application/pdf',
    'text/plain',
    'text/markdown'
  ];
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'El archivo es demasiado grande (máximo 50MB)'
    };
  }
  
  if (!allowedTypes.includes(file.type) && !file.name.endsWith('.md')) {
    return {
      isValid: false,
      error: 'Tipo de archivo no soportado. Use PDF, TXT o MD'
    };
  }
  
  return { isValid: true };
};

// Utilidades de fecha
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatRelativeDate = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'hace un momento';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  }
  
  return formatDate(date);
};

// Utilidades de texto
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9áéíóúñÑ\s.-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const extractTitleFromFileName = (fileName: string): string => {
  // Remover extensión
  let title = fileName.replace(/\.[^/.]+$/, '');
  
  // Patrones comunes para limpiar títulos
  title = title
    .replace(/[_\-]\d{4}/g, '') // Años
    .replace(/[_\-]v\d+/g, '') // Versiones
    .replace(/[_\-](?:rev|revision|edition)/gi, '') // Ediciones
    .replace(/[_\-](?:complete|full|final)/gi, '') // Palabras comunes
    .replace(/\s+/g, ' ') // Normalizar espacios
    .trim();
  
  // Capitalizar
  return title
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Utilidades de almacenamiento
export const getLocalStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

export const setLocalStorageItem = <T>(key: string, value: T): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
    return false;
  }
};

export const removeLocalStorageItem = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
    return false;
  }
};

// Utilidades de performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Utilidades de accesibilidad
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
  const announcer = document.getElementById('a11y-announcer');
  if (announcer) {
    announcer.setAttribute('aria-live', priority);
    announcer.textContent = message;
    
    // Limpiar después de un breve delay
    setTimeout(() => {
      announcer.textContent = '';
    }, 1000);
  }
};

export const trapFocus = (element: HTMLElement): () => void => {
  const focusableElements = element.querySelectorAll(
    'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
  );
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
    
    if (e.key === 'Escape') {
      // Permitir escapar del trap
      element.blur();
    }
  };

  element.addEventListener('keydown', handleKeyDown);
  firstElement?.focus();

  // Retornar función de cleanup
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
};

// Utilidades de compatibilidad
export const isWebSpeechApiSupported = (): boolean => {
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
};

export const isFileApiSupported = (): boolean => {
  return 'File' in window && 'FileReader' in window && 'FileList' in window && 'Blob' in window;
};

export const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let version = 'Unknown';
  
  if (ua.indexOf('Chrome') > -1) {
    browser = 'Chrome';
    version = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Safari') > -1) {
    browser = 'Safari';
    version = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Firefox') > -1) {
    browser = 'Firefox';
    version = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Edge') > -1) {
    browser = 'Edge';
    version = ua.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
  }
  
  return { browser, version };
};

// Utilidades de cálculo
export const calculateReadingProgress = (currentPosition: number, totalLength: number): number => {
  if (totalLength === 0) return 0;
  return Math.min(Math.round((currentPosition / totalLength) * 100), 100);
};

export const calculateEstimatedTimeRemaining = (
  currentPosition: number,
  totalLength: number,
  wordsPerMinute: number = 180
): number => {
  const wordsRead = Math.floor((currentPosition / totalLength) * 50000); // Estimación
  const wordsPerSecond = wordsPerMinute / 60;
  const remainingWords = 50000 - wordsRead; // Estimación
  
  return Math.max(0, Math.floor(remainingWords / wordsPerSecond));
};

// Utilidades de configuración
export const saveUserPreferences = (preferences: any): boolean => {
  return setLocalStorageItem('audiobook_user_preferences', preferences);
};

export const loadUserPreferences = (): any => {
  return getLocalStorageItem('audiobook_user_preferences', {
    accessibility: {
      textSize: '150%',
      colorMode: 'standard',
      fontFamily: 'Inter, system-ui, sans-serif',
      lineHeight: 1.8
    },
    voice: {
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      voiceURI: '',
      language: 'es-ES'
    },
    playback: {
      autoPlay: false,
      playOnResume: true,
      bookmarkNavigation: true
    }
  });
};

// Utilidades de debugging (solo en desarrollo)
export const debugLog = (message: string, data?: any): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AudioLibro] ${message}`, data);
  }
};

export const debugError = (message: string, error?: any): void => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[AudioLibro Error] ${message}`, error);
  }
};