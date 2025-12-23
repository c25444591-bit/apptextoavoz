import React, { useEffect, useState } from 'react';
import { X, BookOpen, Trash2, Calendar, FileText, Download } from 'lucide-react';
import { BookData } from '../types/library';
import { getBooksFromDB, deleteBookFromDB } from '../utils/db';

interface LibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoadBook: (book: BookData) => void;
    currentBookId?: string;
    theme: 'light' | 'sepia' | 'dark' | 'high-contrast';
}

export const LibraryModal: React.FC<LibraryModalProps> = ({ isOpen, onClose, onLoadBook, currentBookId, theme }) => {
    const [books, setBooks] = useState<BookData[]>([]);
    const [loading, setLoading] = useState(true);

    const loadBooks = async () => {
        setLoading(true);
        try {
            const storedBooks = await getBooksFromDB();
            setBooks(storedBooks.sort((a, b) => b.uploadDate - a.uploadDate));
        } catch (error) {
            console.error("Error loading library:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadBooks();
        }
    }, [isOpen]);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('¿Estás seguro de que quieres eliminar este libro de tu biblioteca?')) {
            await deleteBookFromDB(id);
            loadBooks();
        }
    };

    const handleDownload = (e: React.MouseEvent, book: BookData) => {
        e.stopPropagation();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(book));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${book.title || 'libro'}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
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
                        <div className={`p-2 rounded-lg ${theme === 'high-contrast' ? 'bg-yellow-900/30 text-yellow-500' : 'bg-orange-100 text-orange-600'}`}>
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <h2 className={`text-xl font-bold font-serif ${textClass}`}>Tu Biblioteca</h2>
                            <p className={`text-xs ${subTextClass}`}>Libros guardados en este dispositivo</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-full hover:bg-black/5 transition-colors ${textClass}`}
                        title="Cerrar"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        </div>
                    ) : books.length === 0 ? (
                        <div className="text-center py-16 opacity-60 flex flex-col items-center">
                            <BookOpen size={48} className="mb-4 opacity-30" />
                            <p className={`text-lg font-medium ${textClass}`}>Tu biblioteca está vacía</p>
                            <p className={`text-sm ${subTextClass} mt-2`}>Carga un PDF y guárdalo para verlo aquí.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {books.map((book) => (
                                <div
                                    key={book.id}
                                    onClick={() => onLoadBook(book)}
                                    className={`group relative p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4
                    ${currentBookId === book.id
                                            ? (theme === 'high-contrast' ? 'border-yellow-500 bg-yellow-900/20' : 'border-orange-500 bg-orange-50')
                                            : (theme === 'high-contrast' ? 'border-stone-800 hover:border-yellow-700 bg-stone-900' : 'border-stone-200 hover:border-orange-300 hover:bg-stone-50 bg-white')
                                        }
                  `}
                                >
                                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center shrink-0 
                    ${theme === 'high-contrast' ? 'bg-stone-950 text-yellow-600' : 'bg-stone-100 text-stone-400 group-hover:text-orange-500 group-hover:bg-white'} transition-colors`}>
                                        <FileText size={24} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-bold text-base truncate ${textClass}`}>{book.title}</h3>
                                        <div className={`flex items-center gap-3 text-xs ${subTextClass} mt-1`}>
                                            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(book.uploadDate).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1"><BookOpen size={12} /> {book.pages.length} págs</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => handleDelete(e, book.id)}
                                            className="p-3 rounded-full hover:bg-red-100 text-stone-400 hover:text-red-600 transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={22} />
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
