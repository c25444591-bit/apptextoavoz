import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, BookOpen, Play, Volume2, Save, Gauge, Cloud, Laptop, Mic, Eye, Headphones } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-yellow-50">
      {/* Header mejorado con mejor contraste */}
      <header className="bg-white border-b-4 border-blue-400 sticky top-0 z-50 shadow-xl">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center gap-6">
          <button
            onClick={() => navigate('/')}
            className="p-4 hover:bg-blue-100 rounded-xl transition-all duration-200 border-2 border-blue-200 hover:border-blue-400 focus:ring-4 focus:ring-blue-200"
            aria-label="Volver al inicio"
          >
            <ArrowLeft size={28} className="text-blue-600" />
          </button>
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Headphones size={32} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-blue-700 tracking-tight">¿Cómo Funciona LibroVoz?</h1>
              <p className="text-blue-600 font-medium">Guía paso a paso para usar tu lector de libros con IA</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content mejorado */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        
        {/* Intro mejorada con mejor accesibilidad */}
        <div className="bg-gradient-to-r from-white to-blue-50 rounded-3xl p-12 shadow-2xl mb-12 border-4 border-blue-200 relative overflow-hidden">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-8">
              <div className="bg-blue-500 p-6 rounded-2xl shadow-lg">
                <Eye size={48} className="text-white" />
              </div>
              <div>
                <h2 className="text-4xl font-bold text-gray-800 mb-2 leading-tight">LibroVoz - Accesibilidad Visual</h2>
                <p className="text-xl text-blue-600 font-semibold">Tu compañero de lectura inteligente</p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-inner border-2 border-blue-100">
              <p className="text-2xl text-gray-700 leading-relaxed font-medium mb-6">
                🎯 <strong>Diseñado especialmente para personas con dificultades visuales</strong>
              </p>
              <p className="text-xl text-gray-600 leading-relaxed mb-4">
                LibroVoz convierte cualquier documento PDF en un audiolibro profesional usando inteligencia artificial avanzada. 
              </p>
              <p className="text-xl text-gray-600 leading-relaxed">
                Es como tener un narrador personal disponible las 24 horas, con voces naturales y controles grandes y fáciles de usar.
              </p>
            </div>
            
            {/* Características de accesibilidad */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                <div className="text-3xl mb-3">🔤</div>
                <h3 className="font-bold text-blue-800 text-lg mb-2">Texto Grande</h3>
                <p className="text-blue-700">Botones y texto de gran tamaño para fácil lectura</p>
              </div>
              <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
                <div className="text-3xl mb-3">🎨</div>
                <h3 className="font-bold text-green-800 text-lg mb-2">Alto Contraste</h3>
                <p className="text-green-700">Colores vibrantes y contrastes marcados</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200">
                <div className="text-3xl mb-3">🎵</div>
                <h3 className="font-bold text-purple-800 text-lg mb-2">Audio Natural</h3>
                <p className="text-purple-700">Voces de IA que suenan como personas reales</p>
              </div>
            </div>
          </div>
        </div>

        {/* Paso 1 - Mejorado para accesibilidad */}
        <div className="bg-gradient-to-r from-white to-blue-50 rounded-3xl p-8 shadow-2xl mb-8 border-l-8 border-blue-500 hover:shadow-3xl transition-all duration-300">
          <div className="flex items-start gap-6">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-6 rounded-2xl flex-shrink-0 shadow-lg">
              <Upload size={40} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-blue-500 text-white text-2xl font-bold w-12 h-12 rounded-full flex items-center justify-center shadow-lg">1</span>
                <h3 className="text-3xl font-bold text-gray-800">Sube tu Libro</h3>
              </div>
              <p className="text-xl text-gray-700 leading-relaxed mb-6 font-medium">
                📁 Arrastra un archivo PDF a la zona punteada o haz clic en el área que dice <strong>"Arrastra tu PDF o haz clic"</strong> para seleccionar un libro desde tu dispositivo.
              </p>
              <div className="bg-gradient-to-r from-blue-100 to-yellow-100 p-6 rounded-2xl border-2 border-blue-200 shadow-inner">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">💡</div>
                  <div>
                    <p className="text-lg font-bold text-blue-800 mb-2">Consejo para principiantes:</p>
                    <p className="text-blue-700 text-lg leading-relaxed">
                      Si es tu primera vez, prueba con el botón <strong>"Demo"</strong> para ver cómo funciona sin necesidad de subir ningún archivo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Paso 2 - Mejorado */}
        <div className="bg-gradient-to-r from-white to-blue-50 rounded-3xl p-8 shadow-2xl mb-8 border-l-8 border-blue-500 hover:shadow-3xl transition-all duration-300">
          <div className="flex items-start gap-6">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-6 rounded-2xl flex-shrink-0 shadow-lg">
              <Volume2 size={40} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-blue-500 text-white text-2xl font-bold w-12 h-12 rounded-full flex items-center justify-center shadow-lg">2</span>
                <h3 className="text-3xl font-bold text-gray-800">Elige el Modo de Voz</h3>
              </div>
              <p className="text-xl text-gray-700 leading-relaxed mb-6 font-medium">
                🎛️ En la barra naranja de la parte inferior verás dos opciones importantes:
              </p>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl border-2 border-gray-200 shadow-inner">
                  <div className="flex items-start gap-4">
                    <div className="bg-gray-500 p-3 rounded-xl">
                      <Laptop size={28} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-800 mb-2">💻 Modo Local</p>
                      <p className="text-lg text-gray-700 leading-relaxed">
                        Usa las voces instaladas en tu dispositivo. <strong>Funciona sin internet</strong> pero puede sonar más robótico. 
                        Ideal si tienes conexión limitada.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-6 rounded-2xl border-4 border-blue-300 shadow-lg relative overflow-hidden">
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    ⭐ RECOMENDADO
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-500 p-3 rounded-xl">
                      <Cloud size={28} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-blue-800 mb-2">☁️ Modo IA (Inteligencia Artificial)</p>
                      <p className="text-lg text-blue-700 leading-relaxed">
                        Usa la tecnología más avanzada de Google. <strong>Voces ultra naturales</strong> que suenan como personas reales. 
                        Requiere conexión a internet pero la calidad es excepcional.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Paso 3 - Mejorado */}
        <div className="bg-gradient-to-r from-white to-green-50 rounded-3xl p-8 shadow-2xl mb-8 border-l-8 border-green-500 hover:shadow-3xl transition-all duration-300">
          <div className="flex items-start gap-6">
            <div className="bg-gradient-to-br from-green-400 to-green-600 p-6 rounded-2xl flex-shrink-0 shadow-lg">
              <Play size={40} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-green-500 text-white text-2xl font-bold w-12 h-12 rounded-full flex items-center justify-center shadow-lg">3</span>
                <h3 className="text-3xl font-bold text-gray-800">Reproduce y Escucha</h3>
              </div>
              <p className="text-xl text-gray-700 leading-relaxed mb-6 font-medium">
                🎵 Toca el <strong>botón blanco grande con el símbolo ▶️</strong> en el centro de la barra naranja para empezar a escuchar. 
                El libro se leerá automáticamente página por página.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 rounded-2xl border-2 border-gray-300 shadow-inner">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-3xl">⏮️</div>
                    <p className="text-xl font-bold text-gray-800">Página Anterior</p>
                  </div>
                  <p className="text-lg text-gray-700">Vuelve a la página anterior si quieres repetir algo</p>
                </div>
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 rounded-2xl border-2 border-gray-300 shadow-inner">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-3xl">⏭️</div>
                    <p className="text-xl font-bold text-gray-800">Página Siguiente</p>
                  </div>
                  <p className="text-lg text-gray-700">Salta a la siguiente página cuando quieras avanzar</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Paso 4 - Mejorado */}
        <div className="bg-gradient-to-r from-white to-purple-50 rounded-3xl p-8 shadow-2xl mb-8 border-l-8 border-purple-500 hover:shadow-3xl transition-all duration-300">
          <div className="flex items-start gap-6">
            <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-6 rounded-2xl flex-shrink-0 shadow-lg">
              <Gauge size={40} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-purple-500 text-white text-2xl font-bold w-12 h-12 rounded-full flex items-center justify-center shadow-lg">4</span>
                <h3 className="text-3xl font-bold text-gray-800">Ajusta la Velocidad</h3>
              </div>
              <p className="text-xl text-gray-700 leading-relaxed mb-6 font-medium">
                ⚡ En la barra naranja, toca el botón <strong>"⚙️ Configuración"</strong> para ajustar qué tan rápido o lento quieres que lea:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-red-100 to-red-200 p-4 rounded-xl border-2 border-red-300 text-center">
                  <div className="text-2xl mb-2">🐌</div>
                  <span className="text-lg font-bold text-red-800">0.5x - 0.8x</span>
                  <p className="text-sm text-red-700 mt-1">Muy Lento</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-4 rounded-xl border-2 border-yellow-300 text-center">
                  <div className="text-2xl mb-2">🚶</div>
                  <span className="text-lg font-bold text-yellow-800">1.0x</span>
                  <p className="text-sm text-yellow-700 mt-1">Normal</p>
                </div>
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-xl border-2 border-blue-300 text-center">
                  <div className="text-2xl mb-2">🏃</div>
                  <span className="text-lg font-bold text-blue-800">1.5x</span>
                  <p className="text-sm text-blue-700 mt-1">Rápido</p>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-xl border-2 border-green-300 text-center">
                  <div className="text-2xl mb-2">🚀</div>
                  <span className="text-lg font-bold text-green-800">2.0x</span>
                  <p className="text-sm text-green-700 mt-1">Muy Rápido</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Paso 5 - Mejorado */}
        <div className="bg-gradient-to-r from-white to-pink-50 rounded-3xl p-8 shadow-2xl mb-8 border-l-8 border-pink-500 hover:shadow-3xl transition-all duration-300">
          <div className="flex items-start gap-6">
            <div className="bg-gradient-to-br from-pink-400 to-pink-600 p-6 rounded-2xl flex-shrink-0 shadow-lg">
              <Mic size={40} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-pink-500 text-white text-2xl font-bold w-12 h-12 rounded-full flex items-center justify-center shadow-lg">5</span>
                <h3 className="text-3xl font-bold text-gray-800">Clona tu Voz <span className="text-pink-500">(Opcional)</span></h3>
              </div>
              <p className="text-xl text-gray-700 leading-relaxed mb-6 font-medium">
                🎤 ¿Quieres que LibroVoz lea con <strong>TU propia voz</strong>? ¡Es posible! Sigue estos pasos:
              </p>
              <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-6 rounded-2xl border-2 border-pink-200">
                <ol className="space-y-4">
                  <li className="flex items-start gap-4">
                    <span className="bg-pink-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">1</span>
                    <div>
                      <p className="text-lg font-bold text-pink-800">Activa el Modo IA (☁️)</p>
                      <p className="text-pink-700">Asegúrate de estar usando inteligencia artificial</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="bg-pink-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">2</span>
                    <div>
                      <p className="text-lg font-bold text-pink-800">Toca "⚙️ Configuración"</p>
                      <p className="text-pink-700">En la barra naranja de controles</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="bg-pink-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">3</span>
                    <div>
                      <p className="text-lg font-bold text-pink-800">Busca "Clonación de Voz"</p>
                      <p className="text-pink-700">Y toca "🎤 Grabar Voz"</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="bg-pink-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">4</span>
                    <div>
                      <p className="text-lg font-bold text-pink-800">Graba 10-15 segundos</p>
                      <p className="text-pink-700">Lee cualquier texto con tu voz natural</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="bg-pink-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">5</span>
                    <div>
                      <p className="text-lg font-bold text-pink-800">¡Listo! 🎉</p>
                      <p className="text-pink-700">Ahora LibroVoz leerá con tu propia voz</p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Paso 6 - Mejorado */}
        <div className="bg-gradient-to-r from-white to-yellow-50 rounded-3xl p-8 shadow-2xl mb-12 border-l-8 border-yellow-500 hover:shadow-3xl transition-all duration-300">
          <div className="flex items-start gap-6">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-6 rounded-2xl flex-shrink-0 shadow-lg">
              <Save size={40} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-yellow-500 text-white text-2xl font-bold w-12 h-12 rounded-full flex items-center justify-center shadow-lg">6</span>
                <h3 className="text-3xl font-bold text-gray-800">Guarda en tu Biblioteca</h3>
              </div>
              <p className="text-xl text-gray-700 leading-relaxed mb-6 font-medium">
                💾 Toca el botón naranja <strong>"💾 Guardar"</strong> en la parte superior para guardar el libro en tu biblioteca personal. 
                La próxima vez que entres, podrás acceder a él desde "📚 Mi Biblioteca".
              </p>
              <div className="bg-gradient-to-r from-yellow-100 to-sky-100 p-6 rounded-2xl border-2 border-yellow-200 shadow-inner">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">💡</div>
                  <div>
                    <p className="text-lg font-bold text-yellow-800 mb-2">Información importante:</p>
                    <p className="text-yellow-700 text-lg leading-relaxed">
                      Los libros se guardan <strong>en tu navegador</strong>, no ocupan espacio en tu teléfono. 
                      Son privados y solo tú puedes acceder a ellos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ mejorada */}
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-red-500 rounded-3xl p-12 shadow-2xl text-white relative overflow-hidden mb-12">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -translate-y-20 translate-x-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-300 opacity-20 rounded-full translate-y-16 -translate-x-16"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-10">
              <div className="text-6xl mb-4">❓</div>
              <h3 className="text-4xl font-bold mb-4">Preguntas Frecuentes</h3>
              <p className="text-xl text-blue-100">Resolvemos las dudas más comunes sobre LibroVoz</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white bg-opacity-20 p-6 rounded-2xl backdrop-blur-sm border border-white border-opacity-30">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">🔊</div>
                  <div>
                    <p className="text-xl font-bold mb-3">¿Por qué no suena la voz?</p>
                    <p className="text-blue-100 text-lg leading-relaxed">
                      Asegúrate de estar en <strong>Modo IA (☁️)</strong> y tener internet activo. 
                      Si usas Modo Local, verifica que tengas voces en español instaladas.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white bg-opacity-20 p-6 rounded-2xl backdrop-blur-sm border border-white border-opacity-30">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">👤</div>
                  <div>
                    <p className="text-xl font-bold mb-3">¿Necesito crear una cuenta?</p>
                    <p className="text-blue-100 text-lg leading-relaxed">
                      <strong>No necesitas registro.</strong> LibroVoz funciona inmediatamente. 
                      Solo sube tu PDF y empieza a escuchar.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white bg-opacity-20 p-6 rounded-2xl backdrop-blur-sm border border-white border-opacity-30">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">💰</div>
                  <div>
                    <p className="text-xl font-bold mb-3">¿Es completamente gratis?</p>
                    <p className="text-blue-100 text-lg leading-relaxed">
                      <strong>Sí, 100% gratuito</strong> para uso personal. 
                      No hay límites ni pagos ocultos.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white bg-opacity-20 p-6 rounded-2xl backdrop-blur-sm border border-white border-opacity-30">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">📶</div>
                  <div>
                    <p className="text-xl font-bold mb-3">¿Funciona sin internet?</p>
                    <p className="text-blue-100 text-lg leading-relaxed">
                      Sí, en <strong>Modo Local (💻)</strong>. Para la mejor experiencia, 
                      usa Modo IA con internet.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA mejorado */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-white to-blue-50 rounded-3xl p-12 shadow-2xl border-4 border-blue-200">
            <div className="text-6xl mb-6">🚀</div>
            <h3 className="text-4xl font-bold text-gray-800 mb-6">¿Listo para empezar?</h3>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              Transforma cualquier PDF en tu audiolibro personal. 
              <strong>Fácil, rápido y diseñado para todos.</strong>
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-6 px-12 rounded-2xl shadow-2xl transition-all duration-300 active:scale-95 text-2xl border-4 border-blue-300 hover:border-blue-400 focus:ring-8 focus:ring-blue-200"
              aria-label="Ir a LibroVoz para empezar a usar la aplicación"
            >
              🎧 ¡Empezar a Usar LibroVoz Ahora!
            </button>
            <p className="text-gray-500 mt-4 text-lg">
              Sin registro • Sin descargas • Funciona en cualquier dispositivo
            </p>
          </div>
        </div>

      </main>
    </div>
  );
};
