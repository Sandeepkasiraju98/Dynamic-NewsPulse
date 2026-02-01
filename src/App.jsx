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
  const [lastUpdated, setLastUpdated] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const apiKey = process.env.REACT_APP_GNEWS_API_KEY;
  const vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY;

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  // Request FCM token
  useEffect(() => {
    if (!user || !messaging || !vapidKey) return;

    async function setupFcm() {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.log("Notification permission denied");
          return;
        }

@@ -60,63 +62,70 @@ function App() {
  // Save preferences
  useEffect(() => {
    if (user) {
      setDoc(doc(db, "users", user.uid), { preferences: { category, keyword } }, { merge: true });
    }
  }, [category, keyword, user]);

  // Listen for foreground messages
  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("📨 Foreground message received:", payload);
      alert(`🔔 ${payload.notification?.title || "Notification"}\n${payload.notification?.body || ""}`);
    });

    return () => unsubscribe();
  }, []);

  // Fetch news
  useEffect(() => {
    if (!user || viewSaved || !apiKey) return;

    async function fetchNews() {
      setLoading(true);
      setErrorMessage("");
      setLastUpdated(null);
      try {
        let url = `https://gnews.io/api/v4/top-headlines?token=${apiKey}&lang=en&country=${country}&topic=${category}`;
        if (keyword.trim() !== "") {
          url += `&q=${encodeURIComponent(keyword)}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const data = await response.json();
        if (!response.ok) {
          const apiError = data?.errors?.[0]?.message;
          throw new Error(apiError || `Request failed with status ${response.status}.`);
        }
        setArticles(data.articles || []);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("❌ Error fetching news:", error);
        setArticles([]);
        setErrorMessage(error.message || "Unable to load news right now.");
      }
      setLoading(false);
    }

    fetchNews();
  }, [country, category, keyword, user, viewSaved, apiKey]);

  // Save view mode
  useEffect(() => {
    localStorage.setItem("viewSaved", viewSaved);
  }, [viewSaved]);

  if (loadingUser) return null;
  if (!user) return <Login onLogin={() => {}} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#24243e] text-white font-inter antialiased flex flex-col relative overflow-x-hidden">
      {/* Gradient Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#a18cd1]/30 via-[#fbc2eb]/20 to-[#fad0c4]/30 animate-gradient-x" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-center relative">
@@ -138,97 +147,152 @@ function App() {
          onClick={() => setViewSaved(false)}
          className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg border-2 ${
            !viewSaved
              ? "bg-white/80 text-[#24243e] border-[#a18cd1] scale-105"
              : "bg-white/10 text-white border-transparent hover:bg-white/20"
          }`}
        >
          📰 Latest News
        </button>
        <button
          onClick={() => setViewSaved(true)}
          className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg border-2 ${
            viewSaved
              ? "bg-white/80 text-[#24243e] border-[#a18cd1] scale-105"
              : "bg-white/10 text-white border-transparent hover:bg-white/20"
          }`}
        >
          🔖 Saved Articles
        </button>
      </section>

      {/* Filters */}
      {!viewSaved && (
        <section className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-center gap-5 border-b border-white/20">
          <div className="text-base font-semibold text-white/80 flex items-center gap-2">
            US
            <span className="uppercase tracking-widest text-xs bg-white/20 px-3 py-1 rounded-full">US</span>
            <span className="text-white/60">Top headlines</span>
          </div>
          <select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            className="bg-white/80 text-[#24243e] rounded-lg px-4 py-2 shadow-md font-semibold"
          >
            <option value="technology">Technology</option>
            <option value="business">Business</option>
            <option value="sports">Sports</option>
            <option value="general">General</option>
          </select>
          <input
            type="text"
            placeholder="🔎 Search news..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="px-4 py-2 rounded-lg text-[#24243e] placeholder-[#a18cd1] bg-white/80 shadow-md font-medium"
          />
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="🔎 Search news..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pr-24 px-4 py-2 rounded-lg text-[#24243e] placeholder-[#a18cd1] bg-white/80 shadow-md font-medium"
              aria-label="Search news"
            />
            {keyword.trim() !== "" && (
              <button
                type="button"
                onClick={() => setKeyword("")}
                className="absolute right-2 text-sm font-semibold text-[#24243e] bg-white/70 hover:bg-white px-3 py-1 rounded-md shadow"
              >
                Clear
              </button>
            )}
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10 flex-grow z-10">
        {viewSaved ? (
          <div className="glassmorphism p-6 rounded-2xl shadow-2xl">
            <SavedArticles user={user} db={db} />
          </div>
        ) : !apiKey ? (
          <div className="glassmorphism p-6 rounded-2xl shadow-2xl text-center">
            <p className="text-lg font-semibold">Connect your GNews API key to load stories.</p>
            <p className="text-sm text-white/70 mt-2">
              Add <span className="font-semibold">REACT_APP_GNEWS_API_KEY</span> to your .env and restart the app.
            </p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center mt-20">
            <div className="w-16 h-16 border-4 border-[#a18cd1] border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-lg font-semibold">Loading news...</p>
          </div>
        ) : errorMessage ? (
          <div className="glassmorphism p-6 rounded-2xl shadow-2xl text-center">
            <span className="text-4xl">⚠️</span>
            <p className="text-lg font-semibold mt-3">We hit a snag while loading stories.</p>
            <p className="text-sm text-white/70 mt-2">{errorMessage}</p>
          </div>
        ) : articles.length > 0 ? (
          <>
            <div className="glassmorphism p-4 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-white/80">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-white font-semibold">{articles.length} stories</span>
                <span className="text-white/60">•</span>
                <span className="capitalize">{category}</span>
                {keyword.trim() && (
                  <>
                    <span className="text-white/60">•</span>
                    <span>"{keyword.trim()}"</span>
                  </>
                )}
              </div>
              {lastUpdated && (
                <div className="text-white/60">
                  Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              )}
            </div>
            <ChartSection
              articles={articles}
              chartColors={["#a18cd1", "#fbc2eb", "#fad0c4", "#b9deed", "#fcb69f", "#c2e9fb"]}
            />
            <div className="glassmorphism p-6 rounded-2xl shadow-2xl mt-8">
              <NewsFeed articles={articles} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center mt-20">
            <span className="text-5xl mb-4">😕</span>
            <p className="text-lg font-semibold">No articles found. Try changing your search or category.</p>
            <p className="text-lg font-semibold text-center">
              No articles found. Try a different keyword or category to refresh the feed.
            </p>
            {keyword.trim() !== "" && (
              <button
                type="button"
                onClick={() => setKeyword("")}
                className="mt-4 bg-white/80 text-[#24243e] font-semibold px-4 py-2 rounded-lg shadow hover:bg-white"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </main>

      {/* Custom styles */}
      <style>{`
        .glassmorphism {
          background: rgba(255,255,255,0.10);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.25);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 20px;
          border: 1.5px solid rgba(255,255,255,0.18);
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 8s ease-in-out infinite;
        }
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
