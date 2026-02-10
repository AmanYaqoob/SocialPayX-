import { useState, useEffect } from "react";
import { Play, Heart, MessageCircle, Share } from "lucide-react";
import BottomNav from "../components/BottomNav.jsx";

const Reels = () => {
  const [reels] = useState([
    {
      id: 1,
      title: "SPX Mining Tutorial",
      description: "Learn how to maximize your SPX mining rewards",
      thumbnail: "/placeholder.svg",
      likes: 1234,
      comments: 89
    },
    {
      id: 2,
      title: "KYC Verification Guide",
      description: "Step by step KYC verification process",
      thumbnail: "/placeholder.svg",
      likes: 856,
      comments: 45
    }
  ]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="p-4 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">SPX Reels</h1>
      </header>

      <div className="p-4 space-y-4">
        {reels.map((reel) => (
          <div key={reel.id} className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="relative aspect-video bg-muted flex items-center justify-center">
              <img src={reel.thumbnail} alt={reel.title} className="w-full h-full object-cover" />
              <button className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Play className="w-12 h-12 text-white" fill="white" />
              </button>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-foreground mb-1">{reel.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{reel.description}</p>
              
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1 text-muted-foreground hover:text-red-500">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">{reel.likes}</span>
                </button>
                <button className="flex items-center gap-1 text-muted-foreground hover:text-primary">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">{reel.comments}</span>
                </button>
                <button className="flex items-center gap-1 text-muted-foreground hover:text-primary">
                  <Share className="w-4 h-4" />
                  <span className="text-sm">Share</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Reels;