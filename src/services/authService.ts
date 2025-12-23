// Authentication Service for LibroVoz
import {
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged as firebaseOnAuthStateChanged,
    User
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}

// Sign in with Google
export const signInWithGoogle = async (): Promise<AuthUser | null> => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        return {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
        };
    } catch (error: any) {
        console.error('Error signing in with Google:', error);
        // Handle specific errors
        if (error.code === 'auth/popup-closed-by-user') {
            console.log('User closed the popup');
        } else if (error.code === 'auth/popup-blocked') {
            console.log('Popup was blocked by browser');
        }
        return null;
    }
};

// Sign out
export const signOut = async (): Promise<void> => {
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
};

// Get current user
export const getCurrentUser = (): AuthUser | null => {
    const user = auth.currentUser;
    if (!user) return null;
    return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
    };
};

// Listen to auth state changes
export const onAuthStateChanged = (callback: (user: AuthUser | null) => void): (() => void) => {
    return firebaseOnAuthStateChanged(auth, (user: User | null) => {
        if (user) {
            callback({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL
            });
        } else {
            callback(null);
        }
    });
};
