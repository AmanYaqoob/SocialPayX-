import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import AdminLayout from "../../components/AdminLayout.jsx";
import { useToast } from "@/hooks/use-toast";
import apiService from "../../services/api.js";

const AdminNews = () => {
  const { toast } = useToast();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "general",
    priority: "medium",
    isPublished: true,
    imageUrl: ""
  });

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const data = await apiService.getAllNews();
      setNews(data.news || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load news",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNews) {
        await apiService.updateNews(editingNews._id, formData);
        toast({ title: "Success", description: "News updated successfully" });
      } else {
        await apiService.createNews(formData);
        toast({ title: "Success", description: "News created successfully" });
      }
      setShowModal(false);
      resetForm();
      loadNews();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this news?")) return;
    try {
      await apiService.deleteNews(id);
      toast({ title: "Success", description: "News deleted successfully" });
      loadNews();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete news",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (newsItem) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      category: newsItem.category,
      priority: newsItem.priority,
      isPublished: newsItem.isPublished,
      imageUrl: newsItem.imageUrl || ""
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingNews(null);
    setFormData({
      title: "",
      content: "",
      category: "general",
      priority: "medium",
      isPublished: true,
      imageUrl: ""
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      announcement: "bg-blue-500/20 text-blue-500",
      update: "bg-green-500/20 text-green-500",
      maintenance: "bg-orange-500/20 text-orange-500",
      promotion: "bg-purple-500/20 text-purple-500",
      general: "bg-gray-500/20 text-gray-500"
    };
    return colors[category] || colors.general;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: "bg-red-500/20 text-red-500",
      high: "bg-orange-500/20 text-orange-500",
      medium: "bg-yellow-500/20 text-yellow-500",
      low: "bg-green-500/20 text-green-500"
    };
    return colors[priority] || colors.medium;
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">News Management</h1>
            <p className="text-muted-foreground">Create and manage platform news</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 btn-gradient rounded-lg font-medium text-foreground btn-glow"
          >
            <Plus className="w-4 h-4" />
            Create News
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Title</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Priority</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Views</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {news.map((item) => (
                  <tr key={item._id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-foreground">{item.title}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.isPublished ? (
                        <span className="text-green-500 flex items-center gap-1"><Eye className="w-4 h-4" /> Published</span>
                      ) : (
                        <span className="text-gray-500 flex items-center gap-1"><EyeOff className="w-4 h-4" /> Draft</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.views}</td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {new Date(item.publishedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 hover:bg-primary/10 rounded-lg text-primary"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-2 hover:bg-destructive/10 rounded-lg text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl p-6">
              <h3 className="text-xl font-bold text-foreground mb-4">
                {editingNews ? "Edit News" : "Create News"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground min-h-32"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground"
                    >
                      <option value="general">General</option>
                      <option value="announcement">Announcement</option>
                      <option value="update">Update</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="promotion">Promotion</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Image URL (Optional)</label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-sm text-foreground">Publish immediately</label>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="flex-1 py-3 bg-muted rounded-lg font-medium text-muted-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 btn-gradient rounded-lg font-medium text-foreground btn-glow"
                  >
                    {editingNews ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminNews;
