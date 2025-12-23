// Cloud Library Service for LibroVoz
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { BookData } from '../types/library';
import { saveBookToDB, getBookFromDB } from '../utils/db';

export interface CloudBook {
    id: string;
    title: string;
    uploadDate: number;
    pageCount: number;
    userId: string;
    isDownloaded?: boolean; // Local flag, not stored in Firestore
}

// Save book to cloud (Firestore)
export const saveBookToCloud = async (userId: string, book: BookData): Promise<void> => {
    try {
        const bookRef = doc(db, 'users', userId, 'books', book.id);

        // Save book metadata and content
        await setDoc(bookRef, {
            id: book.id,
            title: book.title,
            uploadDate: book.uploadDate,
            fileName: book.fileName || book.title,
            pageCount: book.pages.length,
            pages: book.pages.map(p => ({
                pageNumber: p.pageNumber,
                content: p.content
            })),
            toc: book.toc || [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        console.log('✅ Book saved to cloud:', book.title);
    } catch (error) {
        console.error('❌ Error saving book to cloud:', error);
        throw error;
    }
};

// Get all books from cloud
export const getBooksFromCloud = async (userId: string): Promise<CloudBook[]> => {
    try {
        const booksRef = collection(db, 'users', userId, 'books');
        const q = query(booksRef, orderBy('uploadDate', 'desc'));
        const snapshot = await getDocs(q);

        const books: CloudBook[] = [];
        for (const docSnap of snapshot.docs) {
            const data = docSnap.data();

            // Check if book is downloaded locally
            const localBook = await getBookFromDB(data.id);

            books.push({
                id: data.id,
                title: data.title,
                uploadDate: data.uploadDate,
                pageCount: data.pageCount || data.pages?.length || 0,
                userId: userId,
                isDownloaded: !!localBook
            });
        }

        return books;
    } catch (error) {
        console.error('❌ Error getting books from cloud:', error);
        return [];
    }
};

// Get full book data from cloud
export const getBookFromCloud = async (userId: string, bookId: string): Promise<BookData | null> => {
    try {
        const bookRef = doc(db, 'users', userId, 'books', bookId);
        const docSnap = await getDoc(bookRef);

        if (!docSnap.exists()) {
            console.log('Book not found in cloud:', bookId);
            return null;
        }

        const data = docSnap.data();
        return {
            id: data.id,
            title: data.title,
            uploadDate: data.uploadDate,
            fileName: data.fileName,
            pages: data.pages,
            toc: data.toc || []
        };
    } catch (error) {
        console.error('❌ Error getting book from cloud:', error);
        return null;
    }
};

// Download book for offline use
export const downloadBookForOffline = async (userId: string, bookId: string): Promise<boolean> => {
    try {
        // Get full book from cloud
        const book = await getBookFromCloud(userId, bookId);
        if (!book) {
            console.error('Book not found in cloud');
            return false;
        }

        // Save to local IndexedDB
        await saveBookToDB(book);
        console.log('✅ Book downloaded for offline:', book.title);
        return true;
    } catch (error) {
        console.error('❌ Error downloading book for offline:', error);
        return false;
    }
};

// Delete book from cloud
export const deleteBookFromCloud = async (userId: string, bookId: string): Promise<void> => {
    try {
        const bookRef = doc(db, 'users', userId, 'books', bookId);
        await deleteDoc(bookRef);
        console.log('✅ Book deleted from cloud:', bookId);
    } catch (error) {
        console.error('❌ Error deleting book from cloud:', error);
        throw error;
    }
};

// Sync local books to cloud
export const syncLocalBooksToCloud = async (userId: string, localBooks: BookData[]): Promise<number> => {
    let synced = 0;
    for (const book of localBooks) {
        try {
            await saveBookToCloud(userId, book);
            synced++;
        } catch (error) {
            console.error('Error syncing book:', book.title, error);
        }
    }
    return synced;
};
