import { User } from '../types';

const USERS_KEY = 'audiobook_app_users';
const CURRENT_USER_KEY = 'audiobook_app_current_user';

export class AuthService {
  // Simulación de base de datos en localStorage
  private static getUsers(): User[] {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  private static saveUsers(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  static async login(username: string, password: string): Promise<User> {
    // Simulación de autenticación
    const users = this.getUsers();
    const user = users.find(u => u.username === username);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // En una app real, verificarías la contraseña hasheada
    // Por simplicidad, cualquier contraseña funciona para usuarios existentes
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  }

  static async register(username: string, email: string, password: string): Promise<User> {
    const users = this.getUsers();
    
    // Verificar si el usuario ya existe
    if (users.some(u => u.username === username)) {
      throw new Error('El usuario ya existe');
    }

    if (users.some(u => u.email === email)) {
      throw new Error('El email ya está registrado');
    }

    // Crear nuevo usuario
    const newUser: User = {
      id: this.generateId(),
      username,
      email,
      preferences: {
        voice: {
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
          voiceURI: '',
          language: 'es-ES',
          name: ''
        },
        accessibility: {
          textSize: '150%',
          colorMode: 'standard',
          fontFamily: 'Inter',
          lineHeight: 1.8
        },
        playback: {
          autoPlay: false,
          playOnResume: true,
          bookmarkNavigation: true
        }
      },
      createdAt: new Date()
    };

    users.push(newUser);
    this.saveUsers(users);
    
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return newUser;
  }

  static async logout(): Promise<void> {
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  static getCurrentUser(): User | null {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  static updateCurrentUser(updates: Partial<User>): User | null {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;

    const updatedUser = { ...currentUser, ...updates };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

    // Actualizar también en la lista de usuarios
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      this.saveUsers(users);
    }

    return updatedUser;
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Utilidades para desarrollo
  static createDemoUser(): User {
    const demoUser: User = {
      id: 'demo-user',
      username: 'demo',
      email: 'demo@audiobook.app',
      preferences: {
        voice: {
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
          voiceURI: 'es-ES-female',
          language: 'es-ES',
          name: 'Carmen'
        },
        accessibility: {
          textSize: '150%',
          colorMode: 'yellow-tint',
          fontFamily: 'Inter',
          lineHeight: 2.0
        },
        playback: {
          autoPlay: true,
          playOnResume: true,
          bookmarkNavigation: true
        }
      },
      createdAt: new Date('2023-01-01')
    };

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(demoUser));
    const users = this.getUsers();
    if (!users.find(u => u.id === 'demo-user')) {
      users.push(demoUser);
      this.saveUsers(users);
    }

    return demoUser;
  }
}