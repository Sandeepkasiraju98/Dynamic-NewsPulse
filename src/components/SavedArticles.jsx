import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

function SavedArticles() {
  const [savedArticles, setSavedArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSaved() {
      const user = auth.currentUser;
      if (!user) return;

      setLoading(true);
      const savedRef = collection(db, "users", user.uid, "savedArticles");
      const snapshot = await getDocs(savedRef);
      const articlesList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSavedArticles(articlesList);
      setLoading(false);
    }
    fetchSaved();
  }, []);

  const handleDelete = async (articleId) => {
    const user = auth.currentUser;
    if (!user) return alert("You must be logged in to delete articles.");

    if (!window.confirm("Are you sure you want to delete this article?")) return;

    try {
      const articleRef = doc(db, "users", user.uid, "savedArticles", articleId);
      await deleteDoc(articleRef);
      setSavedArticles((prev) => prev.filter((article) => article.id !== articleId));
      alert("Article deleted!");
    } catch (error) {
      console.error("Error deleting article:", error);
      alert("Failed to delete article.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-400 border-solid"></div>
      </div>
    );
  }

  if (!savedArticles.length)
    return (
      <p className="text-center mt-10 text-slate-300 font-semibold">
        ⭐ No saved articles yet!
      </p>
    );

  return (
    <div>
      <h2 className="text-3xl font-extrabold mb-6 text-white select-none drop-shadow-md">
        ⭐ Saved Articles
      </h2>
      {savedArticles.map((article) => (
        <div
          key={article.id}
          className="p-6 border border-white/10 rounded-xl mb-6 shadow-lg bg-white/5 hover:shadow-2xl transition-shadow relative"
        >
          <h3 className="font-semibold text-xl mb-2 text-white">{article.title}</h3>
          <p className="text-slate-300 mb-4 line-clamp-3">{article.description}</p>
          <a
            href={article.url}
            target="_blank"
            rel="noreferrer"
            className="text-indigo-300 hover:underline font-semibold"
          >
            Read more
          </a>

          <button
            onClick={() => handleDelete(article.id)}
            className="absolute top-4 right-4 border border-white text-white px-4 py-1 rounded hover:bg-white/10 transition"
            aria-label={`Delete article titled ${article.title}`}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default SavedArticles;
