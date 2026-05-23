import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, signInAnonymously, User as FirebaseUser } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, getDoc, setDoc, updateDoc, onSnapshot, collection, query, orderBy, limit, getDocs, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);

// Initialize with offline persistence for a seamless offline-first experience
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Operation types for error handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.warn("Firestore connection check outcome:", errMsg);
    
    // Check if the connection fails due to network/offline/blocking behavior
    const isNetworkOrBlockerError = 
      errMsg.includes('offline') || 
      errMsg.includes('Could not reach') || 
      errMsg.includes('timeout') ||
      errMsg.includes('network') ||
      errMsg.includes('unreachable') ||
      errMsg.includes('failed-precondition');
      
    if (isNetworkOrBlockerError) {
      console.error(
        "Please check your Firebase configuration.\n" +
        "⚠️ CONNECTION BLOCKER DETECTED:\n" +
        "1. Active ad-blockers or privacy extensions (e.g., uBlock Origin, Brave Shield, Privacy Badger) might be blocking requests to 'firestore.googleapis.com'. Please try pausing them for this tab/domain.\n" +
        "2. If you are behind a strict corporate VPN, proxy, or firewall, verify that googleapis.com domains are allowed.\n" +
        "3. Ensure the project and billing are correctly configured in your Firebase Console."
      );
    }
  }
}
testConnection();

export type { FirebaseUser };
export { doc, getDoc, setDoc, updateDoc, onSnapshot, collection, query, orderBy, limit, getDocs, signInWithPopup, signOut, onAuthStateChanged, signInAnonymously };
