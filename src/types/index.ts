// Tipos principales de la aplicación

export interface User {
  id: string;
  username: string;
  email: string;
  preferences: UserPreferences;
  createdAt: Date;
}

export interface UserPreferences {
  voice: VoiceSettings;
  accessibility: AccessibilitySettings;
  playback: PlaybackSettings;
}

export interface VoiceSettings {
  rate: number; // 0.5 - 2.0
  pitch: number; // 0.0 - 2.0
  volume: number; // 0.0 - 1.0
  voiceURI: string;
  language: string;
  name: string;
}

export interface AccessibilitySettings {
  textSize: TextSize;
  colorMode: ColorMode;
  fontFamily: string;
  lineHeight: number;
  viewMode: ViewMode; // Nuevo: modo scroll o flip
  enableGestures: boolean; // Nuevo: gestos táctiles
  flipAnimationSpeed: number; // Nuevo: velocidad de animación flip
}

export type TextSize = '100%' | '125%' | '150%' | '200%' | '250%';
export type ColorMode = 'standard' | 'high-contrast' | 'yellow-tint';

export interface PlaybookSettings {
  autoPlay: boolean;
  playOnResume: boolean;
  bookmarkNavigation: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  content: string;
  contentType: 'pdf' | 'text';
  fileSize: number;
  processedAt: Date;
  totalPages?: number;
  totalWords: number;
  duration: number; // en segundos
  language: string;
  userId: string;
  bookmarks: Bookmark[];
  progress: ReadingProgress;
  index?: BookIndex; // Índice de capítulos
  history: HistoryItem[]; // Historial de navegación
  isProcessed: boolean;
}

export interface Bookmark {
  id: string;
  title: string;
  page: number;
  position: number; // en el texto
  createdAt: Date;
}

export interface Chapter {
  id: string;
  title: string;
  page: number;
  startPosition: number;
  endPosition: number;
  level: number; // nivel jerárquico (1 para principales, 2 para subcapítulos)
}

export interface BookIndex {
  chapters: Chapter[];
  generatedAt: Date;
}

export interface HistoryItem {
  id: string;
  page: number;
  position: number;
  title?: string;
  timestamp: Date;
  bookId: string;
}

export interface VoiceInfo {
  name: string;
  lang: string;
  voiceURI: string;
  origin?: string;
  engine?: string;
  isDefault?: boolean;
  isLocal?: boolean;
  quality?: 'low' | 'medium' | 'high';
}

export type ViewMode = 'scroll' | 'flip';

export interface BookViewSettings {
  viewMode: ViewMode;
  showIndex: boolean;
  showHistory: boolean;
  flipAnimationSpeed: number;
}

export interface ReadingProgress {
  currentPage: number;
  currentPosition: number; // posición en el texto
  completionPercentage: number;
  lastReadAt: Date;
}

export interface ProcessedFile {
  originalFile: File;
  cleanedContent: string;
  metadata: FileMetadata;
  warnings: string[];
}

export interface FileMetadata {
  title?: string;
  author?: string;
  subject?: string;
  language?: string;
  pageCount?: number;
  wordCount: number;
  characterCount: number;
}

export interface AudioControlState {
  isPlaying: boolean;
  currentPosition: number;
  duration: number;
  rate: number;
  voiceURI: string;
}

export interface TextProcessingResult {
  cleanedText: string;
  metadata: Partial<FileMetadata>;
  removedElements: string[];
  wordCount: number;
}

// Estados de la aplicación
export interface AppState {
  user: User | null;
  books: Book[];
  currentBook: Book | null;
  currentBookProgress: AudioControlState;
  isLoading: boolean;
  error: string | null;
}

// Eventos de la aplicación
export type AppEvent = 
  | { type: 'USER_LOGIN'; payload: User }
  | { type: 'USER_LOGOUT' }
  | { type: 'BOOK_ADDED'; payload: Book }
  | { type: 'BOOK_UPDATED'; payload: Book }
  | { type: 'BOOK_REMOVED'; payload: string }
  | { type: 'CURRENT_BOOK_CHANGED'; payload: Book | null }
  | { type: 'PREFERENCES_UPDATED'; payload: Partial<UserPreferences> }
  | { type: 'BOOKMARK_ADDED'; payload: { bookId: string; bookmark: Bookmark } }
  | { type: 'PROGRESS_UPDATED'; payload: { bookId: string; progress: Partial<ReadingProgress> } }
  | { type: 'LOADING_STARTED' }
  | { type: 'LOADING_COMPLETED' }
  | { type: 'ERROR_OCCURRED'; payload: string };

// Configuración de voces
export interface VoiceOption {
  voiceURI: string;
  name: string;
  lang: string;
  gender?: 'male' | 'female';
  isLocal: boolean;
  quality: 'low' | 'medium' | 'high';
}

// Tipos de archivos soportados
export const SUPPORTED_FILE_TYPES = {
  PDF: '.pdf',
  TEXT: '.txt',
  MARKDOWN: '.md'
} as const;

export type SupportedFileType = typeof SUPPORTED_FILE_TYPES[keyof typeof SUPPORTED_FILE_TYPES];