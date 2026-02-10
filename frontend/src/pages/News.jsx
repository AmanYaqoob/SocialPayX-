import { useState, useEffect } from "react";
import { Newspaper, Calendar, Eye } from "lucide-react";
import BottomNav from "../components/BottomNav.jsx";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api.js";

const News = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    loadNews();
  }, [selectedCategory]);

  const loadNews = async () => {
    try {
      const params = selectedCategory !== "all" ? { category: selectedCategory } : {};
      const data = await apiService.getNews(params);
      setNews(data.news || []);
    } catch (error) {
      console.error("Failed to load news:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      announcement: "bg-blue-500/20 text-blue-500 border-blue-500/30",
      update: "bg-green-500/20 text-green-500 border-green-500/30",
      maintenance: "bg-orange-500/20 text-orange-500 border-orange-500/30",
      promotion: "bg-purple-500/20 text-purple-500 border-purple-500/30",
      general: "bg-gray-500/20 text-gray-500 border-gray-500/30"
    };
    return colors[category] || colors.general;
  };

  const getPriorityBadge = (priority) => {
    if (priority === "urgent") return "🔴 URGENT";
    if (priority === "high") return "🟠 HIGH";
    return null;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Newspaper className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">News & Updates</h1>
        </div>
      </header>

      {/* Category Filter */}
      <div className="p-4 overflow-x-auto">
        <div className="flex gap-2">
          {["all", "announcement", "update", "maintenance", "promotion", "general"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-foreground"
                  : "bg-card border border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* News List */}
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading news...</p>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-8">
            <Newspaper className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No news available</p>
          </div>
        ) : (
          news.map((item) => (
            <div
              key={item._id}
              onClick={() => navigate(`/news/${item._id}`)}
              className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:bg-muted/30 transition-colors"
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(item.category)}`}>
                  {item.category}
                </span>
                {getPriorityBadge(item.priority) && (
                  <span className="text-xs font-bold">{getPriorityBadge(item.priority)}</span>
                )}
              </div>

              <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{item.content}</p>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {item.views} views
                  </span>
                </div>
                <span className="text-primary font-medium">Read more →</span>
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default News;
