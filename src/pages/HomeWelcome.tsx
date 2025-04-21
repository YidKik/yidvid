
import React from "react";

export default function HomeWelcome() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-100">
      <div className="max-w-3xl mx-auto text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Welcome to YidVid</h1>
        <p className="text-xl text-gray-700 mb-8">
          Your gateway to curated Jewish content. Discover videos that inspire, entertain, and connect.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a 
            href="/videos" 
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Browse Videos
          </a>
          <a 
            href="/category/popular" 
            className="px-6 py-3 bg-white text-indigo-600 font-medium rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors"
          >
            Popular Content
          </a>
        </div>
      </div>
    </div>
  );
}
