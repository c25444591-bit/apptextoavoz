import React, { useState } from 'react';
import { User, BookOpen, Headphones, Volume2 } from 'lucide-react';

interface AuthFormProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (username: string, email: string, password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  onLogin,
  onRegister,
  isLoading,
  error
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      return;
    }

    try {
      if (isLogin) {
        await onLogin(formData.username, formData.password);
      } else {
        await onRegister(formData.username, formData.email, formData.password);
      }
    } catch (error) {
      console.error('Error en autenticación:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDemoLogin = async () => {
    try {
      await onLogin('demo', 'demo123');
    } catch (error) {
      console.error('Error con cuenta demo:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-page px-4">
      <div className="max-w-md w-full">
        {/* Header con íconos y título */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <BookOpen className="h-12 w-12 text-accent-primary mr-2" />
            <Headphones className="h-12 w-12 text-accent-primary mr-2" />
            <Volume2 className="h-12 w-12 text-accent-primary" />
          </div>
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            AudioLibro
          </h1>
          <p className="text-text-secondary text-lg">
            Convierte tus libros en experiencias de audio accesibles
          </p>
        </div>

        {/* Formulario de autenticación */}
        <div className="bg-background-surface rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-text-primary mb-2">
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h2>
            <p className="text-text-secondary">
              {isLogin 
                ? 'Accede a tu biblioteca personal de audiolibros' 
                : 'Crea tu cuenta para comenzar'
              }
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-900/20 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-text-primary font-medium mb-2">
                Nombre de usuario
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-background-page border border-text-secondary rounded-lg text-text-primary placeholder-text-secondary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                placeholder="Tu nombre de usuario"
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="email" className="block text-text-primary font-medium mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="w-full px-4 py-3 bg-background-page border border-text-secondary rounded-lg text-text-primary placeholder-text-secondary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                  placeholder="tu@email.com"
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-text-primary font-medium mb-2">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-background-page border border-text-secondary rounded-lg text-text-primary placeholder-text-secondary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                placeholder="Tu contraseña"
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-text-primary font-medium mb-2">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="w-full px-4 py-3 bg-background-page border border-text-secondary rounded-lg text-text-primary placeholder-text-secondary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                  placeholder="Repite tu contraseña"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent-primary hover:bg-accent-dark disabled:bg-text-secondary text-black font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
            >
              {isLoading 
                ? 'Cargando...' 
                : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')
              }
            </button>
          </form>

          {isLogin && (
            <div className="mt-4">
              <button
                onClick={handleDemoLogin}
                className="w-full bg-background-page border border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-black font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
              >
                Continuar con cuenta demo
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-accent-primary hover:text-accent-dark underline transition-colors duration-200"
            >
              {isLogin 
                ? '¿No tienes cuenta? Regístrate' 
                : '¿Ya tienes cuenta? Inicia sesión'
              }
            </button>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 text-center text-text-secondary text-sm">
          <div className="flex items-center justify-center space-x-4 mb-2">
            <div className="flex items-center">
              <Volume2 className="h-4 w-4 mr-1" />
              <span>Voces en español</span>
            </div>
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              <span>PDF y texto</span>
            </div>
          </div>
          <p>Optimizado para personas con baja visión</p>
        </div>
      </div>
    </div>
  );
};