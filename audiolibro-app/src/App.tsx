import React, { useState, useEffect } from 'react';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import { AccessibilityPanel } from './components/AccessibilityPanel';
import { useAuth, useBooks } from './hooks';
import { FileProcessorService } from './services/fileProcessorService';
import { Book, User } from './types';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import './index.css';

function App() {
  // Estado de la aplicación
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning';
    message: string;
    timestamp: Date;
  }>>([]);

  // Hooks personalizados
  const { 
    user, 
    isLoading: authLoading, 
    error: authError, 
    login, 
    register, 
    logout, 
    updateUser,
    clearError: clearAuthError 
  } = useAuth();

  const {
    books,
    currentBook,
    isLoading: booksLoading,
    error: booksError,
    loadBooks,
    createBook,
    deleteBook,
    setCurrentBook,
    clearError: clearBooksError
  } = useBooks();

  // Mostrar panel de accesibilidad automáticamente en la primera visita
  useEffect(() => {
    const hasVisited = localStorage.getItem('audiobook_app_visited');
    if (!hasVisited && user) {
      setTimeout(() => {
        setShowAccessibilityPanel(true);
        localStorage.setItem('audiobook_app_visited', 'true');
      }, 1000);
    }
  }, [user]);

  // Manejo de notificaciones
  const addNotification = (type: 'success' | 'error' | 'warning', message: string) => {
    const notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Manejo de autenticación
  const handleLogin = async (username: string, password: string) => {
    try {
      await login(username, password);
      addNotification('success', '¡Bienvenido de vuelta!');
      await loadBooks();
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const handleRegister = async (username: string, email: string, password: string) => {
    try {
      await register(username, email, password);
      addNotification('success', '¡Cuenta creada exitosamente!');
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentBook(null);
      addNotification('success', 'Sesión cerrada correctamente');
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      addNotification('error', 'Error cerrando sesión');
    }
  };

  // Manejo de libros
  const handleAddBook = async (file: File) => {
    if (!user) {
      addNotification('error', 'Debes iniciar sesión para agregar libros');
      return;
    }

    try {
      // Validar archivo
      if (file.size > 50 * 1024 * 1024) { // 50MB
        throw new Error('El archivo es demasiado grande (máximo 50MB)');
      }

      if (!['application/pdf', 'text/plain'].includes(file.type) && 
          !file.name.endsWith('.md')) {
        throw new Error('Tipo de archivo no soportado');
      }

      // Procesar archivo
      addNotification('success', 'Procesando archivo...');
      
      const processedFile = await FileProcessorService.processFile(file);
      
      if (processedFile.warnings.length > 0) {
        processedFile.warnings.forEach(warning => {
          addNotification('warning', warning);
        });
      }

      // Crear libro
      const newBook = await createBook(
        file.name,
        processedFile.cleanedContent,
        processedFile.metadata
      );

      addNotification('success', `¡Libro "${newBook.title}" agregado exitosamente!`);
      
    } catch (error) {
      console.error('Error agregando libro:', error);
      const message = error instanceof Error ? error.message : 'Error procesando archivo';
      addNotification('error', message);
    }
  };

  const handleBookSelect = async (book: Book | null) => {
    setCurrentBook(book?.id || null);
    
    if (book) {
      addNotification('success', `Abriendo "${book.title}"`);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    if (window.confirm(`¿Estás seguro de que quieres eliminar "${book.title}"?`)) {
      try {
        await deleteBook(bookId);
        addNotification('success', `Libro "${book.title}" eliminado`);
      } catch (error) {
        addNotification('error', 'Error eliminando libro');
      }
    }
  };

  // Manejo de preferencias de usuario
  const handlePreferencesChange = (updates: Partial<User['preferences']>) => {
    if (user) {
      updateUser({
        ...user,
        preferences: {
          ...user.preferences,
          ...updates,
          accessibility: {
            ...user.preferences.accessibility,
            ...updates.accessibility
          },
          voice: {
            ...user.preferences.voice,
            ...updates.voice
          },
          playback: {
            ...user.preferences.playback,
            ...updates.playback
          }
        }
      });
    }
  };

  // Aplicar preferencias de accesibilidad al documento
  useEffect(() => {
    if (user) {
      const root = document.documentElement;
      
      // Aplicar tamaño de texto
      const textScale = user.preferences.accessibility.textSize === '100%' ? '1' :
                       user.preferences.accessibility.textSize === '125%' ? '1.25' :
                       user.preferences.accessibility.textSize === '150%' ? '1.5' :
                       user.preferences.accessibility.textSize === '200%' ? '2' :
                       '2.5';
      
      root.style.setProperty('--text-scale', textScale);
      
      // Aplicar modo de color
      root.className = root.className
        .replace(/color-mode-\w+/g, '')
        .replace(/text-size-\w+/g, '');
      
      root.classList.add(`color-mode-${user.preferences.accessibility.colorMode}`);
      root.classList.add(`text-size-${user.preferences.accessibility.textSize.replace('%', '')}`);
      
      // Aplicar fuente
      root.style.setProperty('--font-family', user.preferences.accessibility.fontFamily);
    }
  }, [user]);

  // Limpiar errores cuando cambien los datos
  useEffect(() => {
    if (authError) clearAuthError();
    if (booksError) clearBooksError();
  }, [user, books, authError, booksError, clearAuthError, clearBooksError]);

  // Pantalla de carga
  if (authLoading || booksLoading) {
    return (
      <div className="min-h-screen bg-background-page flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-accent-primary mx-auto mb-4" />
          <p className="text-text-primary text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  // Pantalla de autenticación
  if (!user) {
    return (
      <>
        <AuthForm
          onLogin={handleLogin}
          onRegister={handleRegister}
          isLoading={authLoading}
          error={authError}
        />
        
        {/* Panel de accesibilidad siempre disponible en login */}
        <AccessibilityPanel
          preferences={{
            voice: { rate: 1, pitch: 1, volume: 1, voiceURI: '', language: 'es-ES', name: '' },
            accessibility: { textSize: '150%', colorMode: 'yellow-tint', fontFamily: 'Inter', lineHeight: 1.8 },
            playback: { autoPlay: false, playOnResume: true, bookmarkNavigation: true }
          }}
          onPreferencesChange={() => {}} // No se guardan preferencias sin usuario
          isOpen={true}
          onClose={() => {}} // No se cierra en login
        />
        
        {/* Notificaciones en login */}
        <NotificationContainer 
          notifications={notifications}
          onRemove={removeNotification}
        />
      </>
    );
  }

  // Pantalla principal
  return (
    <>
      <Dashboard
        books={books}
        currentBook={currentBook}
        onBookSelect={handleBookSelect}
        onAddBook={handleAddBook}
        onLogout={handleLogout}
        onDeleteBook={handleDeleteBook}
        isLoading={booksLoading}
      />
      
      {/* Panel de accesibilidad */}
      <AccessibilityPanel
        preferences={user.preferences}
        onPreferencesChange={handlePreferencesChange}
        isOpen={showAccessibilityPanel}
        onClose={() => setShowAccessibilityPanel(false)}
      />
      
      {/* Notificaciones */}
      <NotificationContainer 
        notifications={notifications}
        onRemove={removeNotification}
      />
    </>
  );
}

// Componente de notificaciones
interface NotificationContainerProps {
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning';
    message: string;
    timestamp: Date;
  }>;
  onRemove: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onRemove
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

// Componente individual de notificación
interface NotificationToastProps {
  notification: {
    id: string;
    type: 'success' | 'error' | 'warning';
    message: string;
    timestamp: Date;
  };
  onRemove: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onRemove
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getColorClasses = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-900/90 border-green-500 text-green-100';
      case 'error':
        return 'bg-red-900/90 border-red-500 text-red-100';
      case 'warning':
        return 'bg-yellow-900/90 border-yellow-500 text-yellow-100';
    }
  };

  return (
    <div
      className={`
        p-4 rounded-lg border backdrop-blur-sm shadow-lg
        ${getColorClasses()}
        animate-slide-in
      `}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">
            {notification.message}
          </p>
        </div>
        <button
          onClick={() => onRemove(notification.id)}
          className="flex-shrink-0 ml-3 text-current opacity-70 hover:opacity-100"
          aria-label="Cerrar notificación"
        >
          <span className="sr-only">Cerrar</span>
          ×
        </button>
      </div>
    </div>
  );
};

export default App;