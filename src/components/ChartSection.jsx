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

function ChartSection({ articles, chartColors = ["#FFB347", "#FF7043", "#FFCC80", "#FF8C42", "#FFA726", "#FFB74D"] }) {
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

  const topKeywords = getKeywordsCount();

  const data = {
    labels: topKeywords.map(([word]) => word),
    datasets: [
      {
        label: 'Keyword Frequency',
        data: topKeywords.map(([, count]) => count),
        backgroundColor: chartColors.slice(0, topKeywords.length),
        borderRadius: 6,
        maxBarThickness: 40,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: '#FFCC80', // warm gold color for legend text
          font: { size: 14, weight: '600' },
        },
      },
      tooltip: {
        backgroundColor: '#FF7043', // coral color tooltip background
        titleFont: { weight: '700' },
        bodyFont: { weight: '500' },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#FFD180', // soft orange for x-axis labels
          font: { size: 14 },
        },
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          color: '#FFD180', // soft orange for y-axis labels
          font: { size: 14 },
          stepSize: 1,
          beginAtZero: true,
        },
        grid: {
          color: '#FFAB91', // light coral grid lines
          borderDash: [5, 5],
        },
      },
    },
  };

  return (
    <div className="mb-10 max-w-5xl mx-auto px-4 md:px-0">
      <h2 className="text-2xl font-extrabold text-center mb-6 text-orange-300 select-none">
        🔍 Most Frequent Words in Headlines
      </h2>
      <Bar data={data} options={options} />
    </div>
  );
}

export default ChartSection;
