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
  const [loadingUser, setLoadingUser] = useState(true);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [country] = useState("us");
  const [category, setCategory] = useState("technology");
  const [keyword, setKeyword] = useState("");
  const [viewSaved, setViewSaved] = useState(() => localStorage.getItem("viewSaved") === "true");

  const apiKey = "ce2847efc17c254213a21b9a7d63d3fc";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

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

  useEffect(() => {
    if (user) {
      setDoc(doc(db, "users", user.uid), { preferences: { category, keyword } }, { merge: true });
    }
  }, [category, keyword, user]);

  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("📨 Foreground message received:", payload);
      alert(`🔔 ${payload.notification?.title || "Notification"}\n${payload.notification?.body || ""}`);
    });

    return () => unsubscribe();
  }, []);

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

        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        setArticles(data.articles || []);
      } catch (error) {
        console.error("❌ Error fetching news:", error);
        setArticles([]);
      }
      setLoading(false);
    }

    fetchNews();
  }, [country, category, keyword, user, viewSaved]);

  useEffect(() => {
    localStorage.setItem("viewSaved", viewSaved);
  }, [viewSaved]);

  if (loadingUser) return null;

  if (!user) return <Login onLogin={() => {}} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white font-sans antialiased flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-indigo-900 bg-opacity-90 border-b border-white/30 z-50 min-h-[64px]">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-center relative">
          <h1 className="text-4xl font-extrabold tracking-tight select-none text-center">
            Dynamic News Pulse
          </h1>
          <button
            onClick={() => signOut(auth)}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white text-indigo-900 font-semibold py-1.5 px-4 rounded-md shadow hover:bg-indigo-100 transition"
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Toggle Buttons */}
      <section className="max-w-7xl mx-auto px-6 py-6 flex justify-center gap-6 border-b border-white/30">
        <button
          onClick={() => setViewSaved(false)}
          className={`px-5 py-2 rounded-lg font-semibold transition ${
            !viewSaved ? "bg-white text-indigo-900 shadow-lg" : "bg-white/20 text-white"
          }`}
        >
          Latest News
        </button>
        <button
          onClick={() => setViewSaved(true)}
          className={`px-5 py-2 rounded-lg font-semibold transition ${
            viewSaved ? "bg-white text-indigo-900 shadow-lg" : "bg-white/20 text-white"
          }`}
        >
          Saved Articles
        </button>
      </section>

      {/* Filters */}
      {!viewSaved && (
        <section className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-center gap-5 border-b border-white/30">
          <div className="text-sm font-semibold text-white select-none">USA</div>

          <select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            className="bg-white text-indigo-900 rounded-md px-4 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
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
            className="px-4 py-2 rounded-md shadow-md text-indigo-900 placeholder-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </section>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-10 flex-grow">
        {viewSaved ? (
          <SavedArticles user={user} db={db} />
        ) : loading ? (
          <p className="text-center text-white mt-20 text-lg font-semibold">Loading news...</p>
        ) : articles.length > 0 ? (
          <>
            <ChartSection
              articles={articles}
              chartColors={["#e0e7ff", "#a5b4fc", "#818cf8"]} // light blues/purples for contrast
            />
            <NewsFeed articles={articles} />
          </>
        ) : (
          <p className="text-center text-white mt-20 text-lg font-semibold">
            No articles found. Try changing your search or category.
          </p>
        )}
      </main>
    </div>
  );
}

export default App;
