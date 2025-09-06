"use client";

import { useState, useEffect } from "react";
import { RefreshCw, ExternalLink, Calendar, Building, Filter } from "lucide-react";

export default function GovernmentSchemes() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('insurance');

  const categories = [
    { id: 'insurance', name: 'Health Insurance & Financial Protection' },
    { id: 'maternal', name: 'Maternal & Child Health' },
    { id: 'disease', name: 'Disease Control Programs' },
    { id: 'primary', name: 'Primary & Preventive Healthcare' },
    { id: 'nutrition', name: 'Nutrition & Anemia Control' },
    { id: 'ayush', name: 'Traditional & Alternative Medicine (AYUSH)' },
    { id: 'rural', name: 'Rural & Tribal Health' },
    { id: 'mental', name: 'Mental Health & Disability' }
  ];

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/health-news?category=${selectedCategory}&type=schemes`);
      const data = await response.json();
      setSchemes(data);
    } catch (error) {
      console.error('Error fetching schemes:', error);
      setSchemes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSchemes();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchSchemes();
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white text-black p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 mb-4">
            🏛️ Government Health Schemes
          </h1>
          <p className="text-gray-700">Discover government healthcare schemes and programs in India</p>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-black" />
            <label className="text-lg font-semibold text-black">Filter by Scheme Type:</label>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-white border-2 border-black rounded-xl text-black focus:ring-2 focus:ring-green-500 focus:border-green-500 min-w-[300px]"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

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

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading government schemes...</p>
          </div>
        )}

        {!loading && (
          <div className="space-y-6">
            {schemes.length === 0 ? (
              <div className="text-center py-12">
                <Building className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600">No schemes found for this category.</p>
              </div>
            ) : (
              schemes.map((scheme, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-white backdrop-blur border-2 border-black hover:border-green-500 transition-all duration-300 group shadow-lg"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold text-black group-hover:text-green-600 transition-colors flex-1 mr-4">
                      {scheme.title}
                    </h2>
                    <a
                      href={scheme.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-lg border border-black hover:bg-green-600 transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Apply
                    </a>
                  </div>
                  
                  <p className="text-gray-800 mb-4 leading-relaxed">
                    {scheme.snippet}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      {scheme.source && (
                        <span className="font-medium text-green-600">
                          {scheme.source}
                        </span>
                      )}
                      {scheme.date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{scheme.date}</span>
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