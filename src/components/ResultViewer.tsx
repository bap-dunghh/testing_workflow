/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";

interface ResultData {
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  imageUrls?: string[];
  type: "text" | "image" | "video" | "images" | string;
  [key: string]: any;
}

const ResultViewer: React.FC<{ result: ResultData | null }> = ({ result }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  if (!result) return <p>No result to display.</p>;

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? (result.imageUrls?.length || 1) - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === (result.imageUrls?.length || 1) - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <>
      {result.content && <p>{result.content}</p>}
      {result.imageUrl && (
        <img
          src={result.imageUrl}
          alt="Generated image"
          style={{ maxWidth: "100%", height: "auto" }}
        />
      )}
      {result.videoUrl && (
        <video
          controls
          src={result.videoUrl}
          style={{ maxWidth: "100%", height: "auto" }}
        />
      )}
      {result.imageUrls && result.imageUrls.length > 0 && (
        <div className="flex flex-col items-center">
          <img
            src={result.imageUrls[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className="max-w-full h-auto mb-4"
          />
          <div className="flex gap-4">
            <button
              onClick={handlePrev}
              className="px-4 py-2 bg-black rounded-lg text-white hover:bg-gray-800 cursor-pointer"
            >
              Prev
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-black rounded-lg text-white hover:bg-gray-800 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ResultViewer;
