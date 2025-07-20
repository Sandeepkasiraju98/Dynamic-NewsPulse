import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getToken, onMessage } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";
import { auth, db, messaging } from "./firebase";
import Login from "./components/Login";
import NewsFeed from "./components/NewsFeed";
import ChartSection from "./components/ChartSection";
import SavedArticles from "./components/SavedArticles";
import "./index.css";

function App() {
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [country] = useState("us");
  const [category, setCategory] = useState("technology");
  const [keyword, setKeyword] = useState("");
  const [viewSaved, setViewSaved] = useState(false);

  // Your GNews API key here
  const apiKey = "ce2847efc17c254213a21b9a7d63d3fc";

  // 🔐 Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 🔔 Get and save FCM token on login
  useEffect(() => {
    if (!user) return;

    async function setupFcm() {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.log("Notification permission denied");
          return;
        }

        const token = await getToken(messaging, {
          vapidKey:
            "BN-dNKX2LZKTzPGgvG1XUjr7yNYSTH8caqNdQq-cMsD5yLkVP9Zaz1WwbbE1KL9BwvyFbY880ik21YSld6MQm2w",
        });

        if (token) {
          await setDoc(doc(db, "users", user.uid), { fcmToken: token }, { merge: true });
          console.log("✅ FCM Token saved:", token);
        }
      } catch (err) {
        console.error("❌ Failed to get or refresh FCM token:", err);
      }
    }

    setupFcm();
  }, [user]);

  // 📥 Save user preferences
  useEffect(() => {
    if (user) {
      setDoc(doc(db, "users", user.uid), { preferences: { category, keyword } }, { merge: true });
    }
  }, [category, keyword, user]);

  // 📩 Handle foreground FCM messages
  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("📨 Foreground message received:", payload);
      alert(`🔔 ${payload.notification?.title || "Notification"}\n${payload.notification?.body || ""}`);
    });

    return () => unsubscribe();
  }, []);

  // 📰 Fetch news using GNews API with your API key
  useEffect(() => {
    if (!user || viewSaved) return;

    async function fetchNews() {
      setLoading(true);
      try {
        let url = `https://gnews.io/api/v4/top-headlines?token=${apiKey}&lang=en&country=${country}&topic=${category}`;
        if (keyword.trim() !== "") {
          url += `&q=${encodeURIComponent(keyword)}`;
        }

        const response = await fetch(url, {
          headers: {
            Accept: "application/json",
            "User-Agent": "Mozilla/5.0",
          },
        });

        if (!response.ok) throw new Error(`Server responded with status ${response.status}`);

        const data = await response.json();
        setArticles(data.articles || []);
      } catch (error) {
        console.error("❌ Error fetching news:", error);
      }
      setLoading(false);
    }

    fetchNews();
  }, [country, category, keyword, user, viewSaved]);

  if (!user) return <Login onLogin={() => {}} />;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased relative">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight">News Dashboard</h1>
          <button
            onClick={() => signOut(auth)}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Toggle */}
      <section className="max-w-7xl mx-auto px-6 py-6 flex justify-center gap-4 border-b border-gray-100">
        <button
          onClick={() => setViewSaved(false)}
          className={`px-4 py-2 rounded ${!viewSaved ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"} transition`}
        >
          Latest News
        </button>
        <button
          onClick={() => setViewSaved(true)}
          className={`px-4 py-2 rounded ${viewSaved ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"} transition`}
        >
          Saved Articles
        </button>
      </section>

      {/* Filters */}
      {!viewSaved && (
        <section className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100">
          <div className="text-sm font-semibold text-gray-700 select-none">USA</div>
          <select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            className="border border-gray-300 rounded-md py-2 px-3 text-sm"
          >
            <option value="technology">Technology</option>
            <option value="business">Business</option>
            <option value="sports">Sports</option>
            <option value="general">General</option>
          </select>
          <input
            type="text"
            placeholder="Search news..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="border border-gray-300 rounded-md py-2 px-3 text-sm"
          />
        </section>
      )}

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {viewSaved ? (
          <SavedArticles user={user} db={db} />
        ) : loading ? (
          <p className="text-center text-gray-500 mt-20 text-lg">Loading news...</p>
        ) : articles.length > 0 ? (
          <>
            <ChartSection articles={articles} />
            <NewsFeed articles={articles} />
          </>
        ) : (
          <p className="text-center text-gray-500 mt-20 text-lg">
            No articles found. Try changing your search or category.
          </p>
        )}
      </main>
    </div>
  );
}

export default App;
