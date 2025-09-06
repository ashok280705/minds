"use client";

import { useState, useEffect } from "react";
import { Search, RefreshCw, ExternalLink, Calendar, Globe, Filter } from "lucide-react";

export default function HealthNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('general');

  const fetchNews = async () => {
    try {
      setLoading(true);
      const url = `/api/health-news?category=${selectedCategory}&type=news`;
      
      const response = await fetch(url);
      const data = await response.json();
      setNews(data);
    } catch (error) {
      console.error('Error fetching news:', error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNews();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchNews();
  }, [selectedCategory]);

  const categories = [
    { id: 'general', name: 'General Health' },
    { id: 'mental', name: 'Mental Health' },
    { id: 'cardiology', name: 'Cardiology' },
    { id: 'diabetes', name: 'Diabetes' },
    { id: 'cancer', name: 'Cancer' },
    { id: 'pediatrics', name: 'Pediatrics' },
    { id: 'neurology', name: 'Neurology' },
    { id: 'orthopedics', name: 'Orthopedics' },
    { id: 'dermatology', name: 'Dermatology' },
    { id: 'gynecology', name: 'Gynecology' },
    { id: 'ophthalmology', name: 'Ophthalmology' },
    { id: 'dentistry', name: 'Dentistry' },
    { id: 'nutrition', name: 'Nutrition' },
    { id: 'pharmacy', name: 'Pharmacy' },
    { id: 'emergency', name: 'Emergency Medicine' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white text-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            📰 Healthcare News
          </h1>
          <p className="text-gray-700">Stay updated with the latest healthcare and medical news</p>
        </div>

        {/* Category Filter Dropdown */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-black" />
            <label className="text-lg font-semibold text-black">Filter by Category:</label>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-white border-2 border-black rounded-xl text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end mb-8">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-black rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-black ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading latest healthcare news...</p>
          </div>
        )}

        {/* News Grid */}
        {!loading && (
          <div className="space-y-6">
            {news.length === 0 ? (
              <div className="text-center py-12">
                <Globe className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600">No news found for this category.</p>
              </div>
            ) : (
              news.map((article, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-white backdrop-blur border-2 border-black hover:border-blue-500 transition-all duration-300 group shadow-lg"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold text-black group-hover:text-blue-600 transition-colors flex-1 mr-4">
                      {article.title}
                    </h2>
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-lg border border-black hover:bg-blue-600 transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Read
                    </a>
                  </div>
                  
                  <p className="text-gray-800 mb-4 leading-relaxed">
                    {article.snippet}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      {article.source && (
                        <span className="font-medium text-blue-600">
                          {article.source}
                        </span>
                      )}
                      {article.date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{article.date}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}