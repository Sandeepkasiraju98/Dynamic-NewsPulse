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
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#24243e] text-white font-inter antialiased flex flex-col relative overflow-x-hidden">
      {/* Animated Gradient Overlay */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#a18cd1]/30 via-[#fbc2eb]/20 to-[#fad0c4]/30 animate-gradient-x" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-center relative">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight select-none text-center bg-gradient-to-r from-[#a18cd1] via-[#fbc2eb] to-[#fad0c4] bg-clip-text text-transparent drop-shadow-lg">
            <span className="inline-block align-middle mr-2">📰</span>
            Dynamic News Pulse
          </h1>
          <button
            onClick={() => signOut(auth)}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-[#a18cd1] to-[#fbc2eb] text-[#24243e] font-bold py-2 px-5 rounded-lg shadow-lg hover:scale-105 hover:from-[#fbc2eb] hover:to-[#a18cd1] transition-all duration-200"
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Toggle Buttons */}
      <section className="max-w-7xl mx-auto px-6 py-6 flex justify-center gap-6 border-b border-white/20">
        <button
          onClick={() => setViewSaved(false)}
          className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg border-2 ${
            !viewSaved
              ? "bg-white/80 text-[#24243e] border-[#a18cd1] scale-105"
              : "bg-white/10 text-white border-transparent hover:bg-white/20"
          }`}
        >
          <span role="img" aria-label="news" className="mr-2">📰</span>
          Latest News
        </button>
        <button
          onClick={() => setViewSaved(true)}
          className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg border-2 ${
            viewSaved
              ? "bg-white/80 text-[#24243e] border-[#a18cd1] scale-105"
              : "bg-white/10 text-white border-transparent hover:bg-white/20"
          }`}
        >
          <span role="img" aria-label="bookmark" className="mr-2">🔖</span>
          Saved Articles
        </button>
      </section>

      {/* Filters */}
      {!viewSaved && (
        <section className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-center gap-5 border-b border-white/20">
          <div className="text-base font-semibold text-white/80 select-none flex items-center gap-2">
            <span role="img" aria-label="flag">🇺🇸</span> USA
          </div>

          <select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            className="bg-white/80 text-[#24243e] rounded-lg px-4 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-[#a18cd1] font-semibold transition"
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
            className="px-4 py-2 rounded-lg shadow-md text-[#24243e] placeholder-[#a18cd1] bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#a18cd1] font-medium transition"
          />
        </section>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-10 flex-grow relative z-10">
        {viewSaved ? (
          <div className="glassmorphism p-6 rounded-2xl shadow-2xl">
            <SavedArticles user={user} db={db} />
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center mt-20">
            <div className="w-16 h-16 border-4 border-[#a18cd1] border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-center text-white text-lg font-semibold">Loading news...</p>
          </div>
        ) : articles.length > 0 ? (
          <>
            <ChartSection
              articles={articles}
              chartColors={[
                "#a18cd1", // purple
                "#fbc2eb", // pink
                "#fad0c4", // peach
                "#b9deed", // light blue
                "#fcb69f", // coral
                "#c2e9fb", // sky blue
              ]}
            />
            <div className="glassmorphism p-6 rounded-2xl shadow-2xl mt-8">
              <NewsFeed articles={articles} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center mt-20">
            <span className="text-5xl mb-4">😕</span>
            <p className="text-center text-white text-lg font-semibold">
              No articles found.<br />Try changing your search or category.
            </p>
          </div>
        )}
      </main>

      {/* Glassmorphism style */}
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
  );
}

export default App;
