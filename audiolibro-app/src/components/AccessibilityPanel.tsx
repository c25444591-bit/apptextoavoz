import React, { useState, useEffect } from 'react';
import { 
  Accessibility, 
  Type, 
  Palette, 
  Eye, 
  Sun, 
  Moon, 
  Zap,
  Settings as SettingsIcon
} from 'lucide-react';
import { TextSize, ColorMode, UserPreferences } from '../types';

interface AccessibilityPanelProps {
  preferences: UserPreferences;
  onPreferencesChange: (preferences: Partial<UserPreferences>) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({
  preferences,
  onPreferencesChange,
  isOpen,
  onClose
}) => {
  const [activeSection, setActiveSection] = useState<'text' | 'color' | 'font'>('text');

  // Aplicar preferencias al documento
  useEffect(() => {
    const root = document.documentElement;
    
    // Aplicar tamaño de texto
    root.style.setProperty('--text-scale', 
      preferences.accessibility.textSize === '100%' ? '1' :
      preferences.accessibility.textSize === '125%' ? '1.25' :
      preferences.accessibility.textSize === '150%' ? '1.5' :
      preferences.accessibility.textSize === '200%' ? '2' :
      preferences.accessibility.textSize === '250%' ? '2.5' : '1'
    );

    // Aplicar modo de color
    root.className = root.className
      .replace(/color-mode-\w+/g, '')
      .replace(/text-size-\w+/g, '');
    
    root.classList.add(`color-mode-${preferences.accessibility.colorMode}`);
    root.classList.add(`text-size-${preferences.accessibility.textSize.replace('%', '')}`);
    
    // Aplicar familia de fuente
    root.style.setProperty('--font-family', preferences.accessibility.fontFamily);
    
    // Aplicar altura de línea
    root.style.setProperty('--line-height', preferences.accessibility.lineHeight.toString());

  }, [preferences]);

  const handleTextSizeChange = (size: TextSize) => {
    onPreferencesChange({
      accessibility: {
        ...preferences.accessibility,
        textSize: size
      }
    });
  };

  const handleColorModeChange = (mode: ColorMode) => {
    onPreferencesChange({
      accessibility: {
        ...preferences.accessibility,
        colorMode: mode
      }
    });
  };

  const handleFontChange = (fontFamily: string) => {
    onPreferencesChange({
      accessibility: {
        ...preferences.accessibility,
        fontFamily
      }
    });
  };

  const handleLineHeightChange = (lineHeight: number) => {
    onPreferencesChange({
      accessibility: {
        ...preferences.accessibility,
        lineHeight
      }
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-50 p-3 bg-background-surface hover:bg-background-page border border-text-secondary/20 rounded-lg shadow-lg transition-colors"
        aria-label="Abrir panel de accesibilidad"
      >
        <Accessibility className="h-6 w-6 text-accent-primary" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background-surface rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-text-secondary/20">
          <div className="flex items-center">
            <Accessibility className="h-8 w-8 text-accent-primary mr-3" />
            <h2 className="text-2xl font-bold text-text-primary">Configuración de Accesibilidad</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background-page rounded-lg transition-colors"
          >
            <span className="text-2xl text-text-secondary hover:text-text-primary">×</span>
          </button>
        </div>

        <div className="p-6">
          {/* Navegación por pestañas */}
          <div className="flex space-x-1 mb-8 bg-background-page rounded-lg p-1">
            <button
              onClick={() => setActiveSection('text')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md font-medium transition-colors ${
                activeSection === 'text'
                  ? 'bg-accent-primary text-black'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Type className="h-5 w-5 mr-2" />
              Tamaño de Texto
            </button>
            <button
              onClick={() => setActiveSection('color')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md font-medium transition-colors ${
                activeSection === 'color'
                  ? 'bg-accent-primary text-black'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Palette className="h-5 w-5 mr-2" />
              Modo de Color
            </button>
            <button
              onClick={() => setActiveSection('font')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md font-medium transition-colors ${
                activeSection === 'font'
                  ? 'bg-accent-primary text-black'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Eye className="h-5 w-5 mr-2" />
              Fuente y Espaciado
            </button>
          </div>

          {/* Contenido de las pestañas */}
          {activeSection === 'text' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Tamaño de Texto
                </h3>
                <p className="text-text-secondary mb-6">
                  Ajusta el tamaño del texto para mejorar la legibilidad. Los cambios se aplicarán a toda la aplicación.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(['100%', '125%', '150%', '200%', '250%'] as TextSize[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => handleTextSizeChange(size)}
                      className={`p-4 border-2 rounded-lg text-center transition-all ${
                        preferences.accessibility.textSize === size
                          ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                          : 'border-text-secondary/20 hover:border-accent-primary/50 text-text-primary'
                      }`}
                    >
                      <div 
                        className="font-semibold"
                        style={{ 
                          fontSize: size === '100%' ? '16px' : 
                                   size === '125%' ? '20px' :
                                   size === '150%' ? '24px' :
                                   size === '200%' ? '32px' :
                                   '40px'
                        }}
                      >
                        {size}
                      </div>
                      <div className="text-sm text-text-secondary mt-1">
                        Texto {size}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview del texto */}
              <div className="bg-background-page rounded-lg p-6">
                <h4 className="font-semibold text-text-primary mb-3">Vista previa:</h4>
                <div 
                  className="text-text-primary space-y-2"
                  style={{ 
                    fontSize: preferences.accessibility.textSize === '100%' ? '16px' : 
                             preferences.accessibility.textSize === '125%' ? '20px' :
                             preferences.accessibility.textSize === '150%' ? '24px' :
                             preferences.accessibility.textSize === '200%' ? '32px' :
                             '40px',
                    lineHeight: preferences.accessibility.lineHeight
                  }}
                >
                  <p><strong>Título del libro:</strong> La teoría polivagal en terapia</p>
                  <p><strong>Autor:</strong> Deb Dana</p>
                  <p>Este es un ejemplo de cómo se verá el texto con el tamaño seleccionado. El contenido se adapta automáticamente para mejorar la legibilidad y comodidad de lectura.</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'color' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Modo de Color
                </h3>
                <p className="text-text-secondary mb-6">
                  Elige el modo de color que mejor se adapte a tus necesidades visuales. Especialmente optimizado para personas con maculopatía.
                </p>
                
                <div className="space-y-4">
                  {/* Modo Estándar */}
                  <button
                    onClick={() => handleColorModeChange('standard')}
                    className={`w-full p-6 border-2 rounded-lg text-left transition-all ${
                      preferences.accessibility.colorMode === 'standard'
                        ? 'border-accent-primary bg-accent-primary/10'
                        : 'border-text-secondary/20 hover:border-accent-primary/50'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-background-page rounded border-2 border-text-secondary/20 flex items-center justify-center">
                        <div className="w-8 h-8 bg-background-surface rounded"></div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-text-primary mb-2">Modo Estándar (Suave)</h4>
                        <p className="text-text-secondary text-sm mb-2">
                          Diseño con fondo gris oscuro y texto claro, optimizado para reducir el brillo y la fatiga visual.
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="flex items-center">
                            <div className="w-4 h-4 bg-background-page rounded mr-2"></div>
                            <span>Fondo suave</span>
                          </span>
                          <span className="flex items-center">
                            <div className="w-4 h-4 bg-background-surface rounded mr-2"></div>
                            <span>Tarjetas</span>
                          </span>
                          <span className="flex items-center">
                            <div className="w-4 h-4 bg-accent-primary rounded mr-2"></div>
                            <span>Acentos</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Modo Alto Contraste */}
                  <button
                    onClick={() => handleColorModeChange('high-contrast')}
                    className={`w-full p-6 border-2 rounded-lg text-left transition-all ${
                      preferences.accessibility.colorMode === 'high-contrast'
                        ? 'border-accent-primary bg-accent-primary/10'
                        : 'border-text-secondary/20 hover:border-accent-primary/50'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-black rounded border-2 border-gray-400 flex items-center justify-center">
                        <div className="w-8 h-8 bg-white rounded"></div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-text-primary mb-2">Alto Contraste</h4>
                        <p className="text-text-secondary text-sm mb-2">
                          Máximo contraste con fondo negro puro y texto blanco para una definición clara de elementos.
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="flex items-center">
                            <div className="w-4 h-4 bg-black rounded mr-2"></div>
                            <span>Fondo negro</span>
                          </span>
                          <span className="flex items-center">
                            <div className="w-4 h-4 bg-white rounded mr-2"></div>
                            <span>Texto blanco</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Modo Lentes Amarillos */}
                  <button
                    onClick={() => handleColorModeChange('yellow-tint')}
                    className={`w-full p-6 border-2 rounded-lg text-left transition-all ${
                      preferences.accessibility.colorMode === 'yellow-tint'
                        ? 'border-accent-primary bg-accent-primary/10'
                        : 'border-text-secondary/20 hover:border-accent-primary/50'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-black rounded border-2 border-yellow-300 flex items-center justify-center">
                        <div className="w-8 h-8 bg-yellow-400 rounded"></div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-text-primary mb-2">Lentes Amarillos</h4>
                        <p className="text-text-secondary text-sm mb-2">
                          Simula el efecto de usar lentes amarillos con fondo negro y texto amarillo brillante, ideal para maculopatía.
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="flex items-center">
                            <div className="w-4 h-4 bg-black rounded mr-2"></div>
                            <span>Fondo negro</span>
                          </span>
                          <span className="flex items-center">
                            <div className="w-4 h-4 bg-yellow-400 rounded mr-2"></div>
                            <span>Texto amarillo</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Vista previa del modo actual */}
              <div className="bg-background-page rounded-lg p-6">
                <h4 className="font-semibold text-text-primary mb-3">Vista previa del modo actual:</h4>
                <div className={`p-4 rounded-lg border-2 ${
                  preferences.accessibility.colorMode === 'standard' 
                    ? 'bg-background-page border-text-secondary/20' 
                    : preferences.accessibility.colorMode === 'high-contrast'
                      ? 'bg-black border-white'
                      : 'bg-black border-yellow-400'
                }`}>
                  <div className={`space-y-2 ${
                    preferences.accessibility.colorMode === 'standard'
                      ? 'text-text-primary'
                      : preferences.accessibility.colorMode === 'high-contrast'
                        ? 'text-white'
                        : 'text-yellow-400'
                  }`}>
                    <h5 className="font-semibold">La teoría polivagal en terapia</h5>
                    <p className="text-sm opacity-80">Deb Dana</p>
                    <p className="text-sm">
                      Este es un ejemplo del modo de color seleccionado. Los elementos se adaptan automáticamente para ofrecer la mejor experiencia visual.
                    </p>
                    <button className={`px-4 py-2 rounded text-sm font-medium ${
                      preferences.accessibility.colorMode === 'standard'
                        ? 'bg-accent-primary text-black hover:bg-accent-dark'
                        : 'bg-yellow-400 text-black hover:bg-yellow-300'
                    }`}>
                      Botón de ejemplo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'font' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Fuente y Espaciado
                </h3>
                <p className="text-text-secondary mb-6">
                  Personaliza la fuente y el espaciado para optimizar tu experiencia de lectura.
                </p>
                
                {/* Selección de fuente */}
                <div className="mb-8">
                  <h4 className="font-medium text-text-primary mb-3">Tipo de Fuente</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { name: 'Inter', family: 'Inter, system-ui, sans-serif', preview: 'Inter (recomendada)' },
                      { name: 'System', family: 'system-ui, -apple-system, sans-serif', preview: 'Fuente del sistema' },
                      { name: 'Serif', family: 'Georgia, serif', preview: 'Georgia (serif)' },
                      { name: 'Monospace', family: 'ui-monospace, monospace', preview: 'Fuente monoespaciada' }
                    ].map((font) => (
                      <button
                        key={font.name}
                        onClick={() => handleFontChange(font.family)}
                        className={`p-4 border rounded-lg text-left transition-all ${
                          preferences.accessibility.fontFamily === font.family
                            ? 'border-accent-primary bg-accent-primary/10'
                            : 'border-text-secondary/20 hover:border-accent-primary/50'
                        }`}
                      >
                        <div className="font-medium text-text-primary">{font.name}</div>
                        <div className="text-sm text-text-secondary">{font.preview}</div>
                        <div 
                          className="mt-2 text-text-primary"
                          style={{ fontFamily: font.family }}
                        >
                          Texto de ejemplo con {font.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Altura de línea */}
                <div>
                  <h4 className="font-medium text-text-primary mb-3">
                    Altura de Línea
                  </h4>
                  <p className="text-text-secondary mb-4">
                    Ajusta el espacio entre líneas para mejorar la legibilidad.
                  </p>
                  
                  <div className="space-y-4">
                    <input
                      type="range"
                      min="1.2"
                      max="2.5"
                      step="0.1"
                      value={preferences.accessibility.lineHeight}
                      onChange={(e) => handleLineHeightChange(parseFloat(e.target.value))}
                      className="w-full h-2 bg-background-page rounded-lg appearance-none cursor-pointer"
                    />
                    
                    <div className="flex justify-between text-sm text-text-secondary">
                      <span>1.2 ( compacta )</span>
                      <span className="font-medium text-accent-primary">
                        {preferences.accessibility.lineHeight}
                      </span>
                      <span>2.5 ( espaciosa )</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vista previa final */}
              <div className="bg-background-page rounded-lg p-6">
                <h4 className="font-semibold text-text-primary mb-3">Vista previa final:</h4>
                <div 
                  className="text-text-primary space-y-3"
                  style={{ 
                    fontFamily: preferences.accessibility.fontFamily,
                    fontSize: preferences.accessibility.textSize === '100%' ? '16px' : 
                             preferences.accessibility.textSize === '125%' ? '20px' :
                             preferences.accessibility.textSize === '150%' ? '24px' :
                             preferences.accessibility.textSize === '200%' ? '32px' :
                             '40px',
                    lineHeight: preferences.accessibility.lineHeight
                  }}
                >
                  <h5 className="font-semibold">La teoría polivagal en terapia</h5>
                  <p className="text-sm opacity-80">Deb Dana</p>
                  <p>
                    El sistema nervioso autónomo es un sistema complejo que regula automáticamente 
                    las funciones corporales básicas. A través de la teoría polivagal, podemos 
                    entender mejor cómo funciona nuestro sistema nervioso y aprender a trabajar 
                    con él de manera más efectiva.
                  </p>
                  <p>
                    Esta configuración personaliza la experiencia de lectura para adaptarse 
                    a tus necesidades visuales específicas.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};