// sendBreakingNews.js

require("dotenv").config(); // Load env variables
const admin = require("firebase-admin");
const fetch = require("node-fetch");

// Initialize Firebase Admin SDK with service account
admin.initializeApp({
  credential: admin.credential.cert(require("./serviceAccountKey.json")), // Make sure this is in .gitignore
});

const db = admin.firestore();
const messaging = admin.messaging();

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

async function sendNotifications() {
  const usersSnapshot = await db.collection("users").get();

  for (const doc of usersSnapshot.docs) {
    const user = doc.data();
    const { preferences, fcmToken } = user;
    if (!preferences || !fcmToken) continue;

    const { category, keyword } = preferences;

    let url = `https://gnews.io/api/v4/top-headlines?token=${GNEWS_API_KEY}&lang=en&country=us&topic=${category}`;
    if (keyword) url += `&q=${encodeURIComponent(keyword)}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.articles && data.articles.length > 0) {
        const topArticle = data.articles[0];

        const payload = {
          token: fcmToken,
          notification: {
            title: `📰 Breaking: ${topArticle.title}`,
            body: topArticle.description || "Check out this news!",
          },
          webpush: {
            notification: {
              click_action: topArticle.url,
            },
          },
        };

        await messaging.send(payload);
        console.log(`✅ Notification sent to user ${doc.id}`);
      }
    } catch (error) {
      if (error.code === "messaging/registration-token-not-registered") {
        console.log(`⚠️ Token invalid for user ${doc.id}. Removing from Firestore.`);
        await db.collection("users").doc(doc.id).update({
          fcmToken: admin.firestore.FieldValue.delete(),
        });
      } else {
        console.error(`❌ Error for user ${doc.id}:`, error);
      }
    }
  }
}

sendNotifications()
  .then(() => console.log("✅ Notifications process finished"))
  .catch(console.error);
