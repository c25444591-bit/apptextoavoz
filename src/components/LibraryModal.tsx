import React, { useEffect, useState } from 'react';
import { X, BookOpen, Trash2, Calendar, FileText, Download, Cloud, Check, Loader2, WifiOff } from 'lucide-react';
import { BookData } from '../types/library';
import { getBooksFromDB, deleteBookFromDB } from '../utils/db';
import { AuthUser } from '../services/authService';
import { getBooksFromCloud, CloudBook, deleteBookFromCloud, downloadBookForOffline } from '../services/cloudLibraryService';

interface LibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoadBook: (book: BookData) => void;
    currentBookId?: string;
    theme: 'light' | 'sepia' | 'dark' | 'high-contrast';
    user: AuthUser | null;
    onLogin: () => void;
}

export const LibraryModal: React.FC<LibraryModalProps> = ({ isOpen, onClose, onLoadBook, currentBookId, theme, user, onLogin }) => {
    const [activeTab, setActiveTab] = useState<'local' | 'cloud'>('local');
    const [localBooks, setLocalBooks] = useState<BookData[]>([]);
    const [cloudBooks, setCloudBooks] = useState<CloudBook[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const loadLocalBooks = async () => {
        setLoading(true);
        try {
            const storedBooks = await getBooksFromDB();
            setLocalBooks(storedBooks.sort((a, b) => b.uploadDate - a.uploadDate));
        } catch (error) {
            console.error("Error loading local library:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadCloudBooks = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const books = await getBooksFromCloud(user.uid);
            setCloudBooks(books);
        } catch (error) {
            console.error("Error loading cloud library:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            if (activeTab === 'local') loadLocalBooks();
            else loadCloudBooks();
        }
    }, [isOpen, activeTab, user]);

    const handleDeleteLocal = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('¿Eliminar de este dispositivo?')) {
            await deleteBookFromDB(id);
            loadLocalBooks();
        }
    };

    const handleDeleteCloud = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('¿Eliminar de la nube? Se borrará de todos tus dispositivos sincronizados.')) {
            if (user) {
                await deleteBookFromCloud(user.uid, id);
                loadCloudBooks();
            }
        }
    };

    const handleDownloadForOffline = async (e: React.MouseEvent, bookId: string) => {
        e.stopPropagation();
        if (!user) return;

        setDownloadingId(bookId);
        try {
            const success = await downloadBookForOffline(user.uid, bookId);
            if (success) {
                // Update local list to reflect changes
                const updatedCloudBooks = cloudBooks.map(b =>
                    b.id === bookId ? { ...b, isDownloaded: true } : b
                );
                setCloudBooks(updatedCloudBooks);
                // Also refresh local books if we switch tabs
                loadLocalBooks();
            }
        } finally {
            setDownloadingId(null);
        }
    };

    if (!isOpen) return null;

    const bgClass = theme === 'high-contrast' ? 'bg-stone-950 border-yellow-600' : theme === 'dark' ? 'bg-stone-900 border-stone-700' : 'bg-white border-stone-200';
    const textClass = theme === 'high-contrast' ? 'text-yellow-400' : theme === 'dark' ? 'text-stone-200' : 'text-stone-800';
    const subTextClass = theme === 'high-contrast' ? 'text-yellow-600' : 'text-stone-500';

    return (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className={`w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl shadow-2xl border ${bgClass} animate-in zoom-in-95 duration-200`}>

                {/* Header */}
                <div className={`p-5 border-b ${theme === 'high-contrast' ? 'border-yellow-900' : 'border-stone-200/10'} flex justify-between items-center`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${theme === 'high-contrast' ? 'bg-yellow-900/30 text-yellow-500' : 'bg-blue-100 text-blue-600'}`}>
                            {activeTab === 'local' ? <BookOpen size={24} /> : <Cloud size={24} />}
                        </div>
                        <div>
                            <h2 className={`text-xl font-bold font-serif ${textClass}`}>Biblioteca</h2>
                            <p className={`text-xs ${subTextClass}`}>
                                {activeTab === 'local' ? 'Libros en este dispositivo' : 'Libros guardados en la nube'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className={`p-2 rounded-full hover:bg-black/5 transition-colors ${textClass}`}>
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-stone-200">
                    <button
                        onClick={() => setActiveTab('local')}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors
                            ${activeTab === 'local'
                                ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50/50'
                                : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
                            }`}
                    >
                        <WifiOff size={16} /> En este dispositivo
                    </button>
                    <button
                        onClick={() => setActiveTab('cloud')}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors
                            ${activeTab === 'cloud'
                                ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50/50'
                                : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
                            }`}
                    >
                        <Cloud size={16} /> Nube {user ? '' : '(Login requerido)'}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    {activeTab === 'cloud' && !user ? (
                        <div className="text-center py-12 flex flex-col items-center">
                            <Cloud size={48} className="mb-4 text-stone-300" />
                            <p className="text-lg font-medium text-stone-600 mb-2">Inicia sesión para sincronizar</p>
                            <p className="text-sm text-stone-500 mb-6 max-w-xs">Guarda tus libros en la nube y accede a ellos desde cualquier dispositivo.</p>
                            <button
                                onClick={() => { onLogin(); onClose(); }}
                                className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors"
                            >
                                Iniciar Sesión con Google
                            </button>
                        </div>
                    ) : loading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="animate-spin text-blue-500" size={32} />
                        </div>
                    ) : (activeTab === 'local' ? localBooks : cloudBooks).length === 0 ? (
                        <div className="text-center py-16 opacity-60 flex flex-col items-center">
                            <BookOpen size={48} className="mb-4 opacity-30" />
                            <p className={`text-lg font-medium ${textClass}`}>
                                {activeTab === 'local' ? 'Dispositivo vacío' : 'Nube vacía'}
                            </p>
                            <p className={`text-sm ${subTextClass} mt-2`}>
                                {activeTab === 'local' ? 'Carga un PDF para empezar.' : 'Sube libros para verlos aquí.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {(activeTab === 'local' ? localBooks : cloudBooks).map((book: any) => (
                                <div
                                    key={book.id}
                                    onClick={() => activeTab === 'local' ? onLoadBook(book) : null}
                                    className={`group relative p-4 rounded-xl border transition-all flex items-center gap-4
                                        ${currentBookId === book.id && activeTab === 'local'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-stone-200 hover:border-blue-300 hover:bg-stone-50 bg-white'
                                        }
                                        ${activeTab === 'cloud' ? 'cursor-default' : 'cursor-pointer'}
                                    `}
                                >
                                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center shrink-0 
                                        ${book.isDownloaded ? 'bg-green-100 text-green-600' : 'bg-stone-100 text-stone-400'}`}>
                                        <FileText size={24} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-bold text-base truncate ${textClass}`}>{book.title}</h3>
                                        <div className={`flex items-center gap-3 text-xs ${subTextClass} mt-1`}>
                                            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(book.uploadDate).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1"><BookOpen size={12} /> {book.pageCount || book.pages?.length} págs</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        {activeTab === 'cloud' && (
                                            book.isDownloaded ? (
                                                <div className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1 font-medium">
                                                    <Check size={12} /> En dispositivo
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={(e) => handleDownloadForOffline(e, book.id)}
                                                    disabled={downloadingId === book.id}
                                                    className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition-colors disabled:opacity-50"
                                                    title="Descargar para offline"
                                                >
                                                    {downloadingId === book.id ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                                                </button>
                                            )
                                        )}

                                        <button
                                            onClick={(e) => activeTab === 'local' ? handleDeleteLocal(e, book.id) : handleDeleteCloud(e, book.id)}
                                            className="p-2 rounded-full hover:bg-red-100 text-stone-400 hover:text-red-600 transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
