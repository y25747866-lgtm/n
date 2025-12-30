'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

// Internal state for user authentication
interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Combined state for the Firebase context
export interface FirebaseContextState {
  areServicesAvailable: boolean; // True if core services (app, firestore, auth instance) are provided
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null; // The Auth service instance
}

// Return type for useFirebase()
export interface FirebaseServices {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

// Hook for components to get the user's auth state
export const useUser = (): UserAuthState => {
  const context = useContext(FirebaseContext);
  if (!context || !context.auth) {
    // Return a loading state if auth service is not yet available
    return { user: null, isUserLoading: true, userError: null };
  }

  const [userState, setUserState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      context.auth!,
      (user) => {
        setUserState({ user, isUserLoading: false, userError: null });
      },
      (error) => {
        setUserState({ user: null, isUserLoading: false, userError: error });
      }
    );
    return () => unsubscribe();
  }, [context.auth]);

  return userState;
};

export function FirebaseProvider({
  children,
  firebaseApp,
  firestore,
  auth,
}: FirebaseProviderProps) {
  const contextValue = useMemo(() => {
    const areServicesAvailable = !!(firebaseApp && firestore && auth);
    return {
      areServicesAvailable,
      firebaseApp: areServicesAvailable ? firebaseApp : null,
      firestore: areServicesAvailable ? firestore : null,
      auth: areServicesAvailable ? auth : null,
    };
  }, [firebaseApp, firestore, auth]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      {contextValue.areServicesAvailable && <FirebaseErrorListener />}
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = (): FirebaseServices => {
  const context = useContext(FirebaseContext);
  if (!context || !context.areServicesAvailable) {
    throw new Error('useFirebase must be used within a FirebaseProvider with initialized services.');
  }
  return {
    firebaseApp: context.firebaseApp!,
    firestore: context.firestore!,
    auth: context.auth!,
  };
};

export const useFirebaseApp = (): FirebaseApp => useFirebase().firebaseApp;
export const useFirestore = (): Firestore => useFirebase().firestore;
export const useAuth = (): Auth => useFirebase().auth;


type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}
