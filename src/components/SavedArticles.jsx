import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { auth } from '../firebase';

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
      const articlesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      setSavedArticles(prev => prev.filter(article => article.id !== articleId));
      alert("Article deleted!");
    } catch (error) {
      console.error("Error deleting article:", error);
      alert("Failed to delete article.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  if (!savedArticles.length) return <p className="text-center mt-10 text-gray-600">No saved articles yet!</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">⭐ Saved Articles</h2>
      {savedArticles.map((article) => (
        <div key={article.id} className="p-4 border rounded mb-4 shadow relative bg-white hover:shadow-lg transition-shadow">
          <h3 className="font-semibold text-lg mb-1">{article.title}</h3>
          <p className="text-gray-700 mb-2">{article.description}</p>
          <a href={article.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">
            Read more
          </a>

          <button
            onClick={() => handleDelete(article.id)}
            className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
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
