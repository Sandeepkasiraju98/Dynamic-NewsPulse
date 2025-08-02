import React, { useState } from "react";
import { doc, setDoc, collection } from "firebase/firestore";
import Sentiment from "sentiment";
import { db, auth } from "../firebase"; // adjust path if needed

const sentimentAnalyzer = new Sentiment();

function NewsFeed({ articles }) {
  const [savingIndex, setSavingIndex] = useState(null);
  const [savedIndices, setSavedIndices] = useState(new Set());
  const fallbackImage = "https://via.placeholder.com/400x200?text=No+Image";

  function getSentimentEmoji(text) {
    if (!text) return "😐"; // Neutral if no text
    const result = sentimentAnalyzer.analyze(text);
    if (result.score > 0) return "😊"; // Positive
    else if (result.score < 0) return "😞"; // Negative
    else return "😐"; // Neutral
  }

  const handleSaveArticle = async (article, index) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please login to save articles.");
      return;
    }

    setSavingIndex(index);

    try {
      const userArticlesRef = collection(doc(db, "users", user.uid), "savedArticles");
      const docId = encodeURIComponent(article.url);
      await setDoc(doc(userArticlesRef, docId), article);
      setSavedIndices(new Set(savedIndices).add(index));
      alert("Article saved!");
    } catch (error) {
      console.error("Error saving article:", error);
      alert("Failed to save article.");
    }

    setSavingIndex(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-0">
      {articles.map((article, index) => (
        <div
          key={index}
          className="p-6 border border-gray-200 rounded-lg shadow-md bg-white hover:shadow-xl transition-shadow duration-300 cursor-pointer fade-in-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {(article.image || fallbackImage) && (
            <img
              src={article.image || fallbackImage}
              alt={article.title || "news"}
              className="w-full h-48 object-cover rounded-md mb-4"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = fallbackImage;
              }}
            />
          )}
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">{article.title}</h2>
            <span className="text-2xl" title="Sentiment">
              {getSentimentEmoji(article.description || article.title)}
            </span>
          </div>
          <p className="text-gray-700 mb-4 line-clamp-3">{article.description}</p>
          <div className="flex justify-between items-center">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              Read more
            </a>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSaveArticle(article, index);
              }}
              disabled={savingIndex === index || savedIndices.has(index)}
              className={`ml-4 px-3 py-1 rounded text-white ${
                savedIndices.has(index)
                  ? "bg-green-500 cursor-default"
                  : "bg-blue-600 hover:bg-blue-700"
              } transition-colors duration-300`}
            >
              {savedIndices.has(index)
                ? "Saved"
                : savingIndex === index
                ? "Saving..."
                : "Save"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default NewsFeed;
