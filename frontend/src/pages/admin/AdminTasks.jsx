import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, CheckCircle, XCircle, HelpCircle } from "lucide-react";
import AdminLayout from "../../components/AdminLayout.jsx";
import { useToast } from "@/hooks/use-toast";
import apiService from "../../services/api.js";

const defaultForm = {
  taskId: "",
  name: "",
  question: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  reward: 2,
  isActive: true,
  category: "quiz",
  url: ""
};

const AdminTasks = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = async () => {
    try {
      const data = await apiService.getAdminTasks();
      setTasks(data.tasks || []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load tasks", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const filledOptions = formData.options.filter(o => o.trim() !== "");
    if (formData.category === "quiz" && filledOptions.length < 2) {
      toast({ title: "Error", description: "Please provide at least 2 answer options for quiz tasks.", variant: "destructive" });
      return;
    }
    const payload = { ...formData, options: filledOptions };
    try {
      if (editingTask) {
        await apiService.updateAdminTask(editingTask._id, payload);
        toast({ title: "Success", description: "Task updated successfully" });
      } else {
        await apiService.createAdminTask(payload);
        toast({ title: "Success", description: "Task created successfully" });
      }
      setShowModal(false);
      resetForm();
      loadTasks();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiService.deleteAdminTask(id);
      toast({ title: "Success", description: "Task deleted successfully" });
      setDeleteConfirm(null);
      loadTasks();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete task", variant: "destructive" });
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    const opts = [...(task.options || [])];
    while (opts.length < 4) opts.push("");
    setFormData({
      taskId: task.taskId,
      name: task.name,
      question: task.question,
      options: opts,
      correctAnswer: task.correctAnswer,
      reward: task.reward,
      isActive: task.isActive,
      category: task.category || "quiz",
      url: task.url || ""
    });
    setShowModal(true);
  };

  const resetForm = () => { setEditingTask(null); setFormData(defaultForm); };

  const updateOption = (index, value) => {
    const opts = [...formData.options];
    opts[index] = value;
    setFormData({ ...formData, options: opts });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Task Management</h1>
            <p className="text-muted-foreground">Add, edit and delete quiz & social tasks with rewards</p>
          </div>
          <button onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 btn-gradient rounded-lg font-medium text-foreground btn-glow">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary">{tasks.length}</div>
            <div className="text-sm text-muted-foreground mt-1">Total Tasks</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{tasks.filter(t => t.isActive).length}</div>
            <div className="text-sm text-muted-foreground mt-1">Active</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">{tasks.reduce((sum, t) => sum + t.reward, 0)} SPX</div>
            <div className="text-sm text-muted-foreground mt-1">Total Rewards</div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tasks yet. Create your first quiz task!</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Task</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">ID</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Reward</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id} className="border-t border-border hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{task.name}</div>
                      {task.question && <div className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate">{task.question}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">{task.taskId}</code>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.category === "quiz" ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"}`}>
                        {task.category}
                      </span>
                    </td>
                    <td className="px-4 py-3"><span className="font-semibold text-yellow-500">{task.reward} SPX</span></td>
                    <td className="px-4 py-3">
                      {task.isActive
                        ? <span className="flex items-center gap-1 text-green-500 text-sm"><CheckCircle className="w-4 h-4" /> Active</span>
                        : <span className="flex items-center gap-1 text-gray-500 text-sm"><XCircle className="w-4 h-4" /> Inactive</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(task)} className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteConfirm(task)} className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
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
            <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-foreground mb-5">{editingTask ? "Edit Task" : "Create New Task"}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Task ID <span className="text-destructive">*</span></label>
                    <input type="text" value={formData.taskId}
                      onChange={(e) => setFormData({ ...formData, taskId: e.target.value.replace(/\s/g, "_").toLowerCase() })}
                      className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground font-mono text-sm"
                      placeholder="quiz_what_is_spx" required disabled={!!editingTask} />
                    <p className="text-xs text-muted-foreground mt-1">Unique identifier, no spaces</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Category</label>
                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground">
                      <option value="quiz">Quiz</option>
                      <option value="social">Social</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Task Name <span className="text-destructive">*</span></label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground"
                    placeholder="e.g. Quiz: What is SocialPayX?" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Question</label>
                  <textarea value={formData.question} onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground min-h-[80px] resize-none"
                    placeholder="Enter the quiz question..." />
                </div>
                {formData.category === "quiz" && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Answer Options</label>
                    <div className="space-y-2">
                      {formData.options.map((opt, i) => (
                        <input key={i} type="text" value={opt} onChange={(e) => updateOption(i, e.target.value)}
                          className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground"
                          placeholder={`Option ${i + 1}`} />
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Correct Answer <span className="text-destructive">*</span></label>
                  <input type="text" value={formData.correctAnswer} onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                    className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground"
                    placeholder="The correct answer text" required />
                </div>
                {formData.category === "social" && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Link URL <span className="text-destructive">*</span></label>
                    <input type="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground"
                      placeholder="https://instagram.com/socialpayx" />
                    <p className="text-xs text-muted-foreground mt-1">URL that opens when user clicks the task</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Reward (SPX) <span className="text-destructive">*</span></label>
                  <input type="number" min="1" max="10000" value={formData.reward}
                    onChange={(e) => setFormData({ ...formData, reward: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground" required />
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="isActive" checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4" />
                  <label htmlFor="isActive" className="text-sm text-foreground cursor-pointer">Active (visible to users)</label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                    className="flex-1 py-2.5 bg-muted rounded-lg font-medium text-muted-foreground hover:bg-muted/80 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 btn-gradient rounded-lg font-medium text-foreground btn-glow">
                    {editingTask ? "Save Changes" : "Create Task"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Delete Task?</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Are you sure you want to delete <span className="font-medium text-foreground">"{deleteConfirm.name}"</span>? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 bg-muted rounded-lg font-medium text-muted-foreground">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm._id)}
                  className="flex-1 py-2.5 bg-destructive rounded-lg font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTasks;
