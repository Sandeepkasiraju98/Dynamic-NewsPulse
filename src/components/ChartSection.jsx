import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function ChartSection({ articles }) {
  const getKeywordsCount = () => {
    const wordMap = {};
    articles.forEach((article) => {
      if (!article.title) return;
      const words = article.title.toLowerCase().split(/\s+/);
      words.forEach((word) => {
        if (word.length > 3) {
          wordMap[word] = (wordMap[word] || 0) + 1;
        }
      });
    });
    return Object.entries(wordMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6); // top 6 keywords
  };

  const data = {
    labels: getKeywordsCount().map(([word]) => word),
    datasets: [
      {
        label: 'Keyword Frequency',
        data: getKeywordsCount().map(([, count]) => count),
        backgroundColor: '#60A5FA',
      },
    ],
  };

  return (
    <div className="mb-10 max-w-5xl mx-auto px-4 md:px-0">
      <h2 className="text-xl font-bold text-center mb-6">
        🔍 Most Frequent Words in Headlines
      </h2>
      <Bar data={data} />
    </div>
  );
}

export default ChartSection;
