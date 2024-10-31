"use client";

import { useState } from "react";
import { CopilotPopup } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, X, Search, Newspaper, ExternalLink } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCopilotReadable } from "@copilotkit/react-core";

interface NewsItem {
  id: string;
  title: string;
  content: string;
}

const fetchNews = async (topic: string): Promise<NewsItem[]> => {
  const response = await fetch("https://news-aggregator-production-a8fd.up.railway.app/api/get-news", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  });

  if (!response.ok) {
    toast.error("An error occurred, please try again.");
    return [];
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    toast.error("Unexpected API response format.");
    return [];
  }

  return data as NewsItem[];
};

const updateHistory = async (topic: string) => {
  const response = await fetch("/api/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  });
  if (!response.ok) throw new Error("Failed to update history");
};

export default function Dashboard() {
  const [topic, setTopic] = useState<string>("");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  useCopilotReadable({
    description: "The state of the searched news topics",
    value: JSON.stringify(news),
  });

  const handleSearch = async (searchTopic: string) => {
    if (!searchTopic.trim()) {
      toast.warn("Please enter a topic to search");
      return;
    }

    setLoading(true);
    setTopic(searchTopic);
    try {
      const results = await fetchNews(searchTopic);
      setNews(results);
      await updateHistory(searchTopic);

      if (results.length === 0) {
        toast.info(`No news found for "${searchTopic}"`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex flex-col antialiased">
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-gray-800 dark:to-gray-900 shadow-lg z-10">
        <div className="max-w-7xl mx-auto py-5 px-5 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-white dark:text-gray-100 flex items-center space-x-3">
            <Newspaper className="h-8 w-8 text-white" />
            <span>News Pulse</span>
          </h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="flex space-x-4 mb-8">
          <Input
            className="flex-grow rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-2.5 transition-all duration-300 ease-in-out"
            placeholder="Enter a topic or keywords... (e.g., Technology, Climate Change)"
            value={topic}
            required
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(topic)}
          />
          <Button
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 transition-all duration-300 ease-in-out flex items-center space-x-2 shadow-md hover:shadow-lg"
            onClick={() => handleSearch(topic)}
          >
            <Search className="h-5 w-5" />
            <span>Search</span>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-16 w-16 text-blue-600 dark:text-white animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {news.map((item) => (
              <Card
                key={item.id}
                className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-300 dark:hover:border-gray-600"
                onClick={() => setSelectedNews(item)}
              >
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-gray-800 dark:to-gray-900 p-4 group-hover:from-blue-700 group-hover:to-blue-600 transition-all duration-300">
                  <CardTitle className="line-clamp-2 font-bold text-white text-lg">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="bg-white dark:bg-gray-800 p-4 space-y-2 relative">
                  <p className="text-gray-700 dark:text-gray-300 line-clamp-3 mb-2">
                    {item.content}
                  </p>
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ExternalLink className="h-5 w-5 text-blue-500 hover:text-blue-700" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {news.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <Search className="mx-auto h-16 w-16 mb-4 text-blue-300" />
            <p className="text-xl font-semibold">Search for news topics to get started</p>
            <p className="text-sm mt-2">Enter a topic and hit search or press enter</p>
          </div>
        )}
      </main>

      {selectedNews && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-md"
          onClick={() => setSelectedNews(null)}
        >
          <Card
            className="w-full max-w-3xl max-h-[85vh] overflow-auto bg-white dark:bg-gray-900 rounded-xl shadow-2xl transform transition-all duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-gray-800 dark:to-gray-900 z-10 flex flex-row items-center justify-between p-5 rounded-t-xl">
              <CardTitle className="text-white text-xl font-bold flex-grow pr-4">
                {selectedNews.title}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-blue-700/30 rounded-full"
                onClick={() => setSelectedNews(null)}
              >
                <X className="h-6 w-6 text-white" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 text-gray-800 dark:text-gray-300 space-y-4">
              <p className="leading-relaxed text-base">{selectedNews.content}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <CopilotPopup
        className="mb-36"
        labels={{
          title: "News Assistant",
          initial: "Hi! 👋 Need help understanding a news topic?",
        }}
      />
    </div>
  );
}
