
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collection and Document ID for API keys
const CONFIG_COLLECTION = "config";
const KEYS_DOCUMENT = "keys";

/**
 * Retrieves a specific API key from the Firestore 'config/keys' document.
 * @param keyName - The name of the key to retrieve (e.g., "OPENAI_API_KEY").
 * @returns The API key string.
 * @throws An error if the key is not found or the document doesn't exist.
 */
export async function getApiKey(keyName: string): Promise<string> {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, KEYS_DOCUMENT);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const apiKey = data[keyName];
      if (apiKey && typeof apiKey === 'string') {
        return apiKey;
      } else {
        throw new Error(`API key "${keyName}" not found or is not a string in the config document.`);
      }
    } else {
      throw new Error("Firestore configuration document 'config/keys' does not exist.");
    }
  } catch (error) {
    console.error("Error fetching API key from Firestore:", error);
    // Re-throw a more user-friendly error to be caught by the calling flow.
    throw new Error("Failed to retrieve API key from server configuration.");
  }
}
