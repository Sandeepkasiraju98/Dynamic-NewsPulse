import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCv0G8KeJScrXOIZIEsPgH0Ejxc-GuHLtc",
  authDomain: "newsdashboard-56ee3.firebaseapp.com",
  projectId: "newsdashboard-56ee3",
  storageBucket: "newsdashboard-56ee3.appspot.com",  
  messagingSenderId: "916503646880",
  appId: "1:916503646880:web:bc2dc4e236a9dbaca4efc5"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);
