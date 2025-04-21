
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { VideoCarousels } from '@/components/home/VideoCarousels';
import { ChannelCarousels } from '@/components/home/ChannelCarousels';
import { Button } from '@/components/ui/button';
import { useVideoGridData } from "@/hooks/video/useVideoGridData";
import { cn } from "@/lib/utils";

export default function NewPage() {
  const navigate = useNavigate();
  const { videos, loading } = useVideoGridData(50);
  const [showChannels, setShowChannels] = useState(false);
  const [bgColorIndex, setBgColorIndex] = useState(0);
  
  // Define an array of background gradients to cycle through
  const backgroundGradients = [
    'linear-gradient(135deg, #f1eaff 0%, #d6bcfa 100%)',
    'linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%)',
    'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)',
    'linear-gradient(135deg, #accbee 0%, #e7f0fd 100%)',
    'linear-gradient(135deg, #d299c2 20%, #fef9d7 100%)',
  ];

  // Change background color every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setBgColorIndex((prevIndex) => (prevIndex + 1) % backgroundGradients.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="min-h-screen w-full relative overflow-hidden transition-all duration-1000 ease-in-out" 
      style={{ background: backgroundGradients[bgColorIndex] }}
    >
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 py-6">
        {/* Top Section with Logo and Description */}
        <div className="flex flex-col md:flex-row items-start mb-8 md:mb-12">
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start">
            <img
              src="/yidkik-logo.png"
              alt="YidVid Logo"
              className="w-[180px] md:w-[220px] h-auto mb-6"
              draggable={false}
            />
            
            <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-md px-6 py-8 md:max-w-xl">
              <h1 className="text-center md:text-left text-3xl md:text-5xl font-black font-sans mb-4">
                <span className="text-[#ea384c]">YidVid</span> Content
              </h1>
              <p className="text-center md:text-left text-lg md:text-xl text-gray-700 mb-4">
                Discover a world of curated Jewish videos and channels. From educational content to entertainment,
                find everything you need in one place.
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mt-6 animate-fade-in-blur">
                <Button 
                  variant="default" 
                  className={cn(
                    "bg-[#ea384c] hover:bg-[#d52a3d] text-white px-8 py-6 h-auto text-lg",
                    showChannels ? "opacity-80" : "opacity-100"
                  )}
                  onClick={() => setShowChannels(false)}
                >
                  View Videos
                </Button>
                <Button 
                  variant="outline" 
                  className={cn(
                    "border-[#ea384c] text-[#ea384c] hover:bg-[#ea384c]/10 px-8 py-6 h-auto text-lg",
                    showChannels ? "opacity-100" : "opacity-80"
                  )}
                  onClick={() => setShowChannels(true)}
                >
                  View Channels
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Dynamic Content - Either Videos or Channels */}
        <div className="w-full overflow-hidden mt-4 md:mt-8">
          {showChannels ? (
            <ChannelCarousels isLoading={loading} />
          ) : (
            <VideoCarousels videos={videos} isLoading={loading} />
          )}
        </div>
      </div>
    </div>
  );
}
