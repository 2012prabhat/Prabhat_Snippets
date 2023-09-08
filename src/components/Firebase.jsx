import { initializeApp } from 'firebase/app';
import { getAuth,signInWithEmailAndPassword} from 'firebase/auth'; // If you need authentication
import { getFirestore } from 'firebase/firestore'; // If you need Firestore
import { getStorage} from 'firebase/storage'; // If you need Firestore

  const firebaseConfig = {
    apiKey: "AIzaSyBweVgTHLmqmIe406tlfilz3AeCw4gHnBQ",
    authDomain: "prabhat-snippets.firebaseapp.com",
    projectId: "prabhat-snippets",
    storageBucket: "prabhat-snippets.appspot.com",
    messagingSenderId: "930624022982",
    appId: "1:930624022982:web:dc08156efb5e409fee6ac7"
  };
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app); // Export authentication if needed
export const firestore = getFirestore(app); 
export const storage = getStorage(app);