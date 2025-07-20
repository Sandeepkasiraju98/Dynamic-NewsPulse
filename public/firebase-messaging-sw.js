// public/firebase-messaging-sw.js

// Import the Firebase Messaging service worker library
importScripts("https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js");

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyCv0G8KeJScrXOIZIEsPgH0Ejxc-GuHLtc",
  authDomain: "newsdashboard-56ee3.firebaseapp.com",
  projectId: "newsdashboard-56ee3",
  storageBucket: "newsdashboard-56ee3.appspot.com",
  messagingSenderId: "916503646880",
  appId: "1:916503646880:web:bc2dc4e236a9dbaca4efc5",
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background push
messaging.onBackgroundMessage(function (payload) {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);

  const notificationTitle = payload.notification?.title || "News Alert";
  const notificationOptions = {
    body: payload.notification?.body || "Click to view more",
    icon: "/logo192.png", // Optional: add your icon
    click_action: "https://your-app-url.com" // Replace with your app’s URL
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
