import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "newsdashboard-56ee3.firebaseapp.com",
  projectId: "newsdashboard-56ee3",
  storageBucket: "newsdashboard-56ee3.appspot.com",
  messagingSenderId: "916503646880",
  appId: "1:916503646880:web:bc2dc4e236a9dbaca4efc5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app);

export { auth, db, messaging };

