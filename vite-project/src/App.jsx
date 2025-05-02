import React, { useState, useEffect } from "react";
import ChatbotWidget from "./ChatbotWidget";

export default function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState([]);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const analyzeText = async () => {
    if (!text.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/analyze/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      console.log(data);
      setResult(data);
      fetchNewsArticles(data.sentiment);
    } catch (error) {
      console.error("Error analyzing text:", error);
    }
    setLoading(false);
  };

  const fetchNewsArticles = async (sentiment) => {
    try {
      const apiKey = "50fa5204f4b44b869b36c9e8dfba7af5";
      const query =
        sentiment === "POS"
          ? "positive attitude towards life"
          : sentiment === "NEG"
          ? "mental health support"
          : "mental health awareness";

      const url = `https://newsapi.org/v2/everything?q=${query}&apiKey=${apiKey}&pageSize=5`;
      const response = await fetch(url);
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error("Error fetching news articles:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-300 flex flex-col items-center p-6">
      {/* Theme Toggle Button */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-4 right-6 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white p-2 rounded-lg shadow-md transition"
      >
        {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
      </button>

      {/* Heading */}
      <h1 className="text-3xl md:text-4xl font-extrabold font-mono text-center text-blue-600 dark:text-blue-400 mb-6">
        Unveiling <span>Mental Health Signals</span>
      </h1>

      {/* Input Card */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-full max-w-md">
        <textarea
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          rows="4"
          placeholder="Enter your thoughts here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          onClick={analyzeText}
          disabled={loading}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          {loading ? "Analyzing..." : "Predict Sentiment"}
        </button>
      </div>

      {/* Prediction Results */}
      {result && (
        <div className="mt-6 flex flex-col md:flex-row gap-4 w-full max-w-3xl">
          {/* Sentiment Card */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 flex-1 text-center">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Sentiment
            </h2>
            <p
              className={`text-2xl font-bold ${
                result.sentiment.toLowerCase() === "pos"
                  ? "text-green-600"
                  : result.sentiment.toLowerCase() === "neg"
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {result.sentiment === "POS"
                ? "Positive 😊"
                : result.sentiment === "NEG"
                ? "Negative 😢"
                : "Neutral 😐"}
            </p>
          </div>
          {/* Confidence Card */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 flex-1 text-center">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Confidence
            </h2>
            <p className="text-2xl font-bold text-green-600">
              {(result.confidence * 100).toFixed(2)}%
            </p>
          </div>
        </div>
      )}

      {/* News Articles */}
      {articles.length > 0 && (
        <div className="mt-6 w-full max-w-3xl">
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-4">
            Latest News Articles
          </h2>
          <div className="grid gap-4">
            {articles.map((article, index) => (
              <a
                key={index}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 hover:shadow-lg transition block"
              >
                <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {article.source.name}
                </p>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Music Recommendations */}
      {result && result.recommended_songs && (
        <div className="mt-6 w-full max-w-3xl">
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-4">
            Recommended Songs 🎵
          </h2>
          <div className="grid gap-4">
            {result.recommended_songs.map((song, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4"
              >
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  🎶 {song}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {result?.chatbot_reply && (
        <div className="mt-6 w-full max-w-3xl">
          <ChatbotWidget message={result.chatbot_reply} />
        </div>
      )}

      {/* Support Section */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
        {/* Helpline Card */}
        <div className="bg-purple-200 dark:bg-purple-700 shadow-md rounded-lg p-4 text-center">
          <h2 className="text-lg font-bold text-gray-700 hover:text-gray-800 hover:underline dark:text-gray-300">
            24/7 Helpline
          </h2>
          <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-2">
            📞 1-800-273-8255
          </p>
          <p className="text-base text-gray-600 dark:text-gray-400 mt-2">
            Reach out to a professional if you're feeling overwhelmed.
          </p>
        </div>

        {/* Tips Card */}
        <div className="bg-green-200 dark:bg-green-700 shadow-md rounded-lg p-4 text-center">
          <h2 className="text-lg font-bold text-gray-700 hover:text-gray-800 hover:underline dark:text-gray-300">
            Wellness Resources
          </h2>
          <p className="text-md font-semibold text-gray-600 dark:text-gray-400 mt-2">
            {result?.sentiment === "NEG"
              ? "Practice mindfulness and deep breathing."
              : "Keep a gratitude journal for positive thoughts."}
          </p>
        </div>

        {/* Therapist Info */}
        <div className="bg-pink-200 dark:bg-pink-700 shadow-md rounded-lg p-4 text-center">
          <h2 className="text-lg font-bold text-gray-700 hover:text-gray-800 hover:underline dark:text-gray-300">
            Find a Therapist
          </h2>
          <p className="text-base text-gray-700 dark:text-gray-400 mt-2">
            {" "}
            Connect with licensed therapists in your area.{" "}
          </p>
          <button
            onClick={() =>
              window.open(
                "https://www.google.com/search?q=Therapist+near+me",
                "_blank"
              )
            }
            className="mt-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}
