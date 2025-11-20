import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Aplicar configuraciones globales de accesibilidad
document.documentElement.setAttribute('lang', 'es');
document.documentElement.setAttribute('data-color-mode', 'dark');

// Configuración para lectores de pantalla
document.title = 'AudioLibro - Convierte libros a audio';

// Meta tags para SEO y accesibilidad
const metaDescription = document.createElement('meta');
metaDescription.name = 'description';
metaDescription.content = 'Convierte libros PDF y texto en experiencias de audio accesibles. Optimizado para personas con baja visión y maculopatía.';
document.head.appendChild(metaDescription);

const metaViewport = document.createElement('meta');
metaViewport.name = 'viewport';
metaViewport.content = 'width=device-width, initial-scale=1, maximum-scale=5';
document.head.appendChild(metaViewport);

const metaThemeColor = document.createElement('meta');
metaThemeColor.name = 'theme-color';
metaThemeColor.content = '#1A1A1A';
document.head.appendChild(metaThemeColor);

// Función para manejar errores globales
window.addEventListener('error', (event) => {
  console.error('Error global capturado:', event.error);
  
  // Aquí podrías enviar el error a un servicio de monitoreo
  if (process.env.NODE_ENV === 'production') {
    // reportError(event.error);
  }
});

// Función para manejar promesas rechazadas
window.addEventListener('unhandledrejection', (event) => {
  console.error('Promesa rechazada no manejada:', event.reason);
  
  if (process.env.NODE_ENV === 'production') {
    // reportError(event.reason);
  }
});

// Configuración para dispositivos móviles
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if (isMobile) {
  // Prevenir zoom en inputs
  const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], textarea');
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      input.style.fontSize = '16px';
    });
  });
}

// Configuración para compatibilidad con lectores de pantalla
const initAccessibility = () => {
  // Anunciar cambios dinámicos a lectores de pantalla
  const announcer = document.createElement('div');
  announcer.id = 'a11y-announcer';
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  document.body.appendChild(announcer);

  // Función para anunciar cambios
  window.announceToScreenReader = (message: string) => {
    const announcer = document.getElementById('a11y-announcer');
    if (announcer) {
      announcer.textContent = message;
      setTimeout(() => {
        announcer.textContent = '';
      }, 1000);
    }
  };
};

// Inicializar configuraciones de accesibilidad
initAccessibility();

// Renderizar la aplicación
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Service Worker para funcionalidad offline (opcional)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registrado: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registro falló: ', registrationError);
      });
  });
}

// Configuración para Web Speech API (compatibilidad)
if (!('speechSynthesis' in window)) {
  console.warn('Web Speech API no está soportada en este navegador');
  
  // Mostrar advertencia al usuario
  const warning = document.createElement('div');
  warning.className = 'fixed top-0 left-0 right-0 bg-yellow-600 text-black p-2 text-center text-sm z-50';
  warning.textContent = '⚠️ Tu navegador no soporta síntesis de voz. Por favor, usa Chrome, Firefox o Safari para la mejor experiencia.';
  document.body.appendChild(warning);
  
  // Ocultar después de 10 segundos
  setTimeout(() => {
    if (warning.parentNode) {
      warning.parentNode.removeChild(warning);
    }
  }, 10000);
}

// Configuración de performance
if ('requestIdleCallback' in window) {
  (window as any).requestIdleCallback(() => {
    // Precargar recursos no críticos
    console.log('Aplicación cargada correctamente');
  });
}

// Exportar utilidades globales para debugging en desarrollo
if (process.env.NODE_ENV === 'development') {
  (window as any).audioBookApp = {
    getUser: () => localStorage.getItem('audiobook_app_current_user'),
    clearAll: () => {
      localStorage.clear();
      console.log('Datos de la aplicación limpiados');
    }
  };
}