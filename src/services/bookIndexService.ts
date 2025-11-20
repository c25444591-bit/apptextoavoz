import { Chapter, BookIndex, HistoryItem, Book } from '../types';

export class BookIndexService {
  
  /**
   * Genera un índice de capítulos analizando el contenido del libro
   */
  static generateIndex(content: string): BookIndex {
    const lines = content.split('\n');
    const chapters: Chapter[] = [];
    let currentPosition = 0;

    // Patrones para detectar capítulos y secciones
    const chapterPatterns = [
      /^(chapter|capítulo)\s+(\d+|[ivxlc]+)\.?/i,
      /^(\d+)\.?\s+([A-ZÁÉÍÓÚÑ][^.]*)/,
      /^([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s]{10,50})$/, // Títulos en mayúsculas
      /^#\s+(.+)$/, // Markdown headers
      /^##\s+(.+)$/, // Markdown subheaders
      /^###\s+(.+)$/ // Markdown sub-subheaders
    ];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      for (let i = 0; i < chapterPatterns.length; i++) {
        const pattern = chapterPatterns[i];
        const match = trimmedLine.match(pattern);
        
        if (match) {
          let title = '';
          let level = 1;

          if (i === 0) { // Capítulo
            title = match[2] ? `Capítulo ${match[2]}` : trimmedLine;
            level = 1;
          } else if (i === 1) { // Número + Título
            title = `${match[1]}. ${match[2]}`;
            level = 1;
          } else if (i === 2) { // Título en mayúsculas
            title = trimmedLine;
            level = 1;
          } else if (i === 3) { // Header H1
            title = match[1];
            level = 1;
          } else if (i === 4) { // Header H2
            title = match[1];
            level = 2;
          } else if (i === 5) { // Header H3
            title = match[1];
            level = 3;
          }

          if (title && title.length > 3) {
            const chapter: Chapter = {
              id: `chapter-${index}`,
              title: title,
              page: chapters.length + 1,
              startPosition: currentPosition,
              endPosition: currentPosition + line.length,
              level: level
            };
            
            chapters.push(chapter);
          }
          break;
        }
      }

      currentPosition += line.length + 1; // +1 para el \n
    });

    // Si no se encontraron capítulos, crear índice por párrafos
    if (chapters.length === 0) {
      const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
      paragraphs.forEach((paragraph, index) => {
        const firstLine = paragraph.split('\n')[0];
        const title = firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine;
        
        if (title.trim().length > 5) {
          const chapter: Chapter = {
            id: `chapter-${index}`,
            title: title.trim(),
            page: index + 1,
            startPosition: content.indexOf(paragraph),
            endPosition: content.indexOf(paragraph) + paragraph.length,
            level: 1
          };
          
          chapters.push(chapter);
        }
      });
    }

    return {
      chapters: chapters,
      generatedAt: new Date()
    };
  }

  /**
   * Encuentra la página/chapter más cercana a una posición dada
   */
  static findChapterAtPosition(index: BookIndex, position: number): Chapter | null {
    let closestChapter: Chapter | null = null;
    let minDistance = Infinity;

    for (const chapter of index.chapters) {
      const chapterMiddle = (chapter.startPosition + chapter.endPosition) / 2;
      const distance = Math.abs(position - chapterMiddle);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestChapter = chapter;
      }
    }

    return closestChapter;
  }

  /**
   * Busca capítulos por texto
   */
  static searchChapters(index: BookIndex, query: string): Chapter[] {
    const searchTerm = query.toLowerCase();
    return index.chapters.filter(chapter =>
      chapter.title.toLowerCase().includes(searchTerm)
    );
  }
}

export class HistoryService {
  private static readonly MAX_HISTORY_ITEMS = 5;
  private static readonly STORAGE_KEY = 'audiolibro_history';

  /**
   * Añade una página al historial
   */
  static addToHistory(book: Book, page: number, position: number, title?: string): HistoryItem {
    const newItem: HistoryItem = {
      id: `history-${Date.now()}`,
      page,
      position,
      title,
      timestamp: new Date(),
      bookId: book.id
    };

    // Cargar historial existente
    const existingHistory = this.getHistoryForBook(book.id);
    
    // Remover duplicados
    const filteredHistory = existingHistory.filter(item => 
      !(item.page === page && Math.abs(item.position - position) < 100)
    );

    // Añadir al inicio
    filteredHistory.unshift(newItem);

    // Mantener solo los últimos elementos
    const finalHistory = filteredHistory.slice(0, this.MAX_HISTORY_ITEMS);

    // Guardar historial actualizado
    const allHistory = this.getAllHistory();
    allHistory[book.id] = finalHistory;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allHistory));

    return newItem;
  }

  /**
   * Obtiene el historial de un libro específico
   */
  static getHistoryForBook(bookId: string): HistoryItem[] {
    const allHistory = this.getAllHistory();
    return allHistory[bookId] || [];
  }

  /**
   * Obtiene todo el historial
   */
  static getAllHistory(): Record<string, HistoryItem[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  /**
   * Limpia el historial de un libro
   */
  static clearHistory(bookId: string): void {
    const allHistory = this.getAllHistory();
    delete allHistory[bookId];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allHistory));
  }

  /**
   * Actualiza el título de un elemento del historial
   */
  static updateHistoryTitle(bookId: string, page: number, title: string): void {
    const allHistory = this.getAllHistory();
    const bookHistory = allHistory[bookId] || [];
    
    bookHistory.forEach(item => {
      if (item.page === page) {
        item.title = title;
      }
    });

    allHistory[bookId] = bookHistory;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allHistory));
  }
}

export class GestureService {
  private static touchStartX = 0;
  private static touchStartY = 0;
  private static readonly SWIPE_THRESHOLD = 50;

  /**
   * Maneja el inicio del toque para gestos
   */
  static handleTouchStart = (e: TouchEvent): void => {
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
  };

  /**
   * Maneja el fin del toque para detectar gestos swipe
   */
  static handleTouchEnd = (
    e: TouchEvent,
    onSwipeLeft: () => void,
    onSwipeRight: () => void
  ): void => {
    if (!e.changedTouches.length) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - this.touchStartX;
    const deltaY = touchEndY - this.touchStartY;

    // Verificar si es un swipe horizontal (no vertical)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.SWIPE_THRESHOLD) {
      e.preventDefault();
      
      if (deltaX > 0) {
        // Swipe hacia la derecha - página anterior
        onSwipeRight();
      } else {
        // Swipe hacia la izquierda - página siguiente
        onSwipeLeft();
      }
    }
  };

  /**
   * Añade listeners de gestos a un elemento
   */
  static addGestureListeners = (
    element: HTMLElement,
    onSwipeLeft: () => void,
    onSwipeRight: () => void
  ): (() => void) => {
    const handleTouchStart = (e: Event) => this.handleTouchStart(e as TouchEvent);
    const handleTouchEnd = (e: Event) => 
      this.handleTouchEnd(e as TouchEvent, onSwipeLeft, onSwipeRight);

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);

    // Función de cleanup
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  };
}
