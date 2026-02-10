import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Eye, User } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import apiService from "../services/api.js";

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, [id]);

  const loadNews = async () => {
    try {
      const data = await apiService.getNewsById(id);
      setNews(data);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">News not found</p>
          <button onClick={() => navigate("/news")} className="text-primary">
            ← Back to News
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 border-b border-border flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground">News Details</h1>
      </header>

      <div className="p-4 max-w-3xl mx-auto">
        <div className="bg-card border border-border rounded-xl p-6">
          {news.imageUrl && (
            <img
              src={news.imageUrl}
              alt={news.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}

          <div className="flex items-center gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(news.category)}`}>
              {news.category}
            </span>
            {news.priority === "urgent" && (
              <span className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-xs font-bold">
                🔴 URGENT
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-4">{news.title}</h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(news.publishedAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {news.views} views
            </span>
            {news.author && (
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {news.author.username}
              </span>
            )}
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">{news.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
