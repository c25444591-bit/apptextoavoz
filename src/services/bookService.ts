import { Book, Bookmark, ReadingProgress } from '../types';
import { AuthService } from './authService';

const BOOKS_KEY = 'audiobook_app_books';
const PROGRESS_KEY = 'audiobook_app_progress';

export class BookService {
  // Obtener todos los libros del usuario actual
  static getUserBooks(): Book[] {
    const user = AuthService.getCurrentUser();
    if (!user) return [];

    const allBooks = this.getAllBooks();
    return allBooks.filter(book => book.userId === user.id);
  }

  // Obtener todos los libros (para gestión interna)
  private static getAllBooks(): Book[] {
    const books = localStorage.getItem(BOOKS_KEY);
    return books ? JSON.parse(books) : [];
  }

  // Guardar un libro
  static saveBook(book: Book): Book {
    const books = this.getAllBooks();
    const existingIndex = books.findIndex(b => b.id === book.id);
    
    if (existingIndex >= 0) {
      books[existingIndex] = book;
    } else {
      books.push(book);
    }
    
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
    return book;
  }

  // Eliminar un libro
  static deleteBook(bookId: string): boolean {
    const books = this.getAllBooks();
    const filteredBooks = books.filter(book => book.id !== bookId);
    
    if (filteredBooks.length < books.length) {
      localStorage.setItem(BOOKS_KEY, JSON.stringify(filteredBooks));
      
      // También eliminar el progreso asociado
      const progress = this.getProgress(bookId);
      if (progress) {
        this.deleteProgress(bookId);
      }
      
      return true;
    }
    return false;
  }

  // Obtener un libro por ID
  static getBook(bookId: string): Book | null {
    const books = this.getAllBooks();
    return books.find(book => book.id === bookId) || null;
  }

  // Crear un nuevo libro desde archivo procesado
  static async createBookFromProcessed(
    fileName: string,
    content: string,
    metadata: { pageCount?: number; language?: string }
  ): Promise<Book> {
    const user = AuthService.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    // Extraer título del nombre del archivo
    const title = this.extractTitleFromFilename(fileName);
    const author = this.extractAuthorFromTitle(title) || 'Autor desconocido';

    const book: Book = {
      id: this.generateId(),
      title,
      author,
      content,
      contentType: fileName.toLowerCase().endsWith('.pdf') ? 'pdf' : 'text',
      fileSize: 0, // Se calculará en la UI
      processedAt: new Date(),
      totalPages: metadata.pageCount,
      totalWords: this.countWords(content),
      duration: this.calculateDuration(content),
      language: metadata.language || 'es',
      userId: user.id,
      bookmarks: [],
      progress: {
        currentPage: 1,
        currentPosition: 0,
        completionPercentage: 0,
        lastReadAt: new Date()
      },
      isProcessed: true
    };

    return this.saveBook(book);
  }

  // Agregar marcador
  static addBookmark(bookId: string, title: string, page: number, position: number): Book | null {
    const book = this.getBook(bookId);
    if (!book) return null;

    const bookmark: Bookmark = {
      id: this.generateId(),
      title,
      page,
      position,
      createdAt: new Date()
    };

    book.bookmarks.push(bookmark);
    return this.saveBook(book);
  }

  // Eliminar marcador
  static removeBookmark(bookId: string, bookmarkId: string): Book | null {
    const book = this.getBook(bookId);
    if (!book) return null;

    book.bookmarks = book.bookmarks.filter(bm => bm.id !== bookmarkId);
    return this.saveBook(book);
  }

  // Actualizar progreso de lectura
  static updateReadingProgress(
    bookId: string, 
    position: number, 
    page?: number
  ): Book | null {
    const book = this.getBook(bookId);
    if (!book) return null;

    const totalLength = book.content.length;
    const completionPercentage = Math.round((position / totalLength) * 100);

    book.progress = {
      ...book.progress,
      currentPosition: position,
      currentPage: page || book.progress.currentPage,
      completionPercentage: Math.min(completionPercentage, 100),
      lastReadAt: new Date()
    };

    return this.saveBook(book);
  }

  // Obtener progreso de un libro
  static getProgress(bookId: string): ReadingProgress | null {
    const progressStr = localStorage.getItem(`${PROGRESS_KEY}_${bookId}`);
    return progressStr ? JSON.parse(progressStr) : null;
  }

  // Guardar progreso
  private static saveProgress(bookId: string, progress: ReadingProgress): void {
    localStorage.setItem(`${PROGRESS_KEY}_${bookId}`, JSON.stringify(progress));
  }

  // Eliminar progreso
  private static deleteProgress(bookId: string): void {
    localStorage.removeItem(`${PROGRESS_KEY}_${bookId}`);
  }

  // Búsqueda de libros
  static searchBooks(query: string): Book[] {
    const userBooks = this.getUserBooks();
    const lowercaseQuery = query.toLowerCase();
    
    return userBooks.filter(book => 
      book.title.toLowerCase().includes(lowercaseQuery) ||
      book.author.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Obtener libros recientes
  static getRecentBooks(limit: number = 5): Book[] {
    const userBooks = this.getUserBooks();
    return userBooks
      .sort((a, b) => new Date(b.progress.lastReadAt).getTime() - new Date(a.progress.lastReadAt).getTime())
      .slice(0, limit);
  }

  // Estadísticas de biblioteca
  static getLibraryStats(): {
    totalBooks: number;
    totalWords: number;
    totalReadingTime: number; // en horas
    averageProgress: number;
  } {
    const userBooks = this.getUserBooks();
    
    const totalBooks = userBooks.length;
    const totalWords = userBooks.reduce((sum, book) => sum + book.totalWords, 0);
    const totalReadingTime = userBooks.reduce((sum, book) => sum + book.duration, 0) / 3600; // convertir a horas
    const averageProgress = userBooks.length > 0 
      ? userBooks.reduce((sum, book) => sum + book.progress.completionPercentage, 0) / userBooks.length
      : 0;

    return {
      totalBooks,
      totalWords,
      totalReadingTime,
      averageProgress: Math.round(averageProgress)
    };
  }

  // Utilidades privadas
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private static extractTitleFromFilename(filename: string): string {
    // Remover extensión
    let title = filename.replace(/\.[^/.]+$/, '');
    
    // Remover números de versión y caracteres especiales comunes
    title = title.replace(/[_\-]\d{1,2}/g, '');
    title = title.replace(/[_\-]v\d+/g, '');
    title = title.replace(/[_\-](?:rev|revision|edition)/gi, '');
    
    // Capitalizar primera letra de cada palabra
    return title
      .split(/[\s_\-]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  }

  private static extractAuthorFromTitle(title: string): string | null {
    // Buscar patrones comunes de autor
    const patterns = [
      /por\s+([A-Za-záéíóúñÑ\s]+)/i,
      /by\s+([A-Za-záéíóúñÑ\s]+)/i,
      /de\s+([A-Za-záéíóúñÑ\s]+)/i,
      /([A-Za-záéíóúñÑ]+)\s+([A-Za-záéíóúñÑ]+)/
    ];

    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  private static countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private static calculateDuration(content: string): number {
    // Estimar duración: promedio 180 palabras por minuto
    const wordsPerMinute = 180;
    const words = this.countWords(content);
    const minutes = words / wordsPerMinute;
    return Math.round(minutes * 60); // segundos
  }

  // Exportar/Importar biblioteca
  static exportLibrary(): string {
    const user = AuthService.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const data = {
      userId: user.id,
      exportDate: new Date().toISOString(),
      books: this.getUserBooks()
    };

    return JSON.stringify(data, null, 2);
  }

  static importLibrary(jsonData: string): { imported: number; skipped: number } {
    try {
      const data = JSON.parse(jsonData);
      let imported = 0;
      let skipped = 0;

      if (data.books && Array.isArray(data.books)) {
        data.books.forEach((book: Book) => {
          // Verificar si el libro ya existe
          const existing = this.getBook(book.id);
          if (!existing) {
            this.saveBook(book);
            imported++;
          } else {
            skipped++;
          }
        });
      }

      return { imported, skipped };
    } catch (error) {
      throw new Error('Formato de archivo inválido');
    }
  }
}