import { initializeApp, getApps, FirebaseApp } from "firebase/app"
import { getAuth, Auth } from "firebase/auth"
import { getFirestore, Firestore } from "firebase/firestore"

// Firebase configuration
// TODO: Replace these with your actual Firebase project configuration
// You can find these in your Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Validate Firebase configuration
const isFirebaseConfigured = () => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId &&
    firebaseConfig.apiKey !== "your-api-key" &&
    firebaseConfig.projectId !== "your-project-id"
  )
}

// Initialize Firebase
let app: FirebaseApp | undefined
let auth: Auth | undefined
let db: Firestore | undefined

if (typeof window !== "undefined") {
  // Initialize Firebase only on client side
  if (!isFirebaseConfigured()) {
    console.error(
      "Firebase configuration is missing or invalid. Please check your .env.local file and ensure all NEXT_PUBLIC_FIREBASE_* variables are set."
    )
  } else {
    try {
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig)
      } else {
        app = getApps()[0]
      }
      auth = getAuth(app)
      db = getFirestore(app)
    } catch (error) {
      console.error("Error initializing Firebase:", error)
    }
  }
}

export { auth, db, app }
export default app

