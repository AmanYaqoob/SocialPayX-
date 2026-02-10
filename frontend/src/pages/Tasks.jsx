import { useState, useContext, useEffect } from "react";
import { Play, Twitter, Gift, ChevronRight, CheckCircle } from "lucide-react";
import { AuthContext } from "../App.jsx";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav.jsx";
import { useToast } from "@/hooks/use-toast";

const Tasks = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [completedTasks, setCompletedTasks] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const socialTasks = [
    { id: "twitter", icon: Twitter, name: "Follow on X", reward: 10, currency: "SPX" },
    { id: "telegram", icon: Gift, name: "Join Telegram", reward: 15, currency: "SPX" },
    { id: "discord", icon: Gift, name: "Join Discord", reward: 10, currency: "SPX" },
  ];

  const completeTask = (taskId) => {
    if (!completedTasks.includes(taskId)) {
      setCompletedTasks([...completedTasks, taskId]);
      toast({
        title: "Task Completed!",
        description: "Reward has been added to your balance",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Stake</h1>
      </header>

      {/* Earn Free Banner */}
      <div className="px-4 mb-6">
        <div className="bg-gradient-to-br from-secondary/20 to-primary/20 border border-border rounded-2xl p-6 text-center">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-card border-2 border-primary flex items-center justify-center glow-primary">
            <span className="text-2xl font-bold gradient-text">C</span>
          </div>

          <h2 className="text-xl font-bold text-foreground mb-2">Earn Free SPX</h2>
          <p className="text-sm text-muted-foreground mb-4">Watch Ads & Complete Task</p>

          <div className="inline-block px-4 py-2 bg-primary/20 border border-primary/30 rounded-full">
            <span className="text-sm text-primary font-medium">Win up to 500 SPX Daily</span>
          </div>
        </div>
      </div>

      {/* Video Rewards */}
      <div className="px-4 mb-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Play className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Video Rewards</h3>
              <p className="text-sm text-muted-foreground">Earn up to 500 SPX</p>
            </div>
          </div>

          <button className="w-full py-3 btn-gradient rounded-xl font-medium text-foreground btn-glow">
            Win up to 500 SPX Daily
          </button>
        </div>
      </div>

      {/* Social Tasks */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Social Tasks</h3>
          <button className="text-sm text-primary">View all</button>
        </div>

        <div className="space-y-3">
          {socialTasks.map((task) => {
            const Icon = task.icon;
            const isCompleted = completedTasks.includes(task.id);

            return (
              <button
                key={task.id}
                onClick={() => completeTask(task.id)}
                disabled={isCompleted}
                className={`w-full bg-card border rounded-xl p-4 flex items-center justify-between transition-all ${
                  isCompleted 
                    ? "border-green-500/50 opacity-75" 
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    task.id === "twitter" ? "bg-blue-500/20" : "bg-primary/20"
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      task.id === "twitter" ? "text-blue-400" : "text-primary"
                    }`} />
                  </div>
                  <span className="font-medium text-foreground">{task.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <>
                      <span className="text-primary font-semibold">+{task.reward}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Bonus */}
      <div className="px-4">
        <button className="w-full bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30 rounded-xl p-4 flex items-center justify-center gap-2">
          <Gift className="w-5 h-5 text-accent" />
          <span className="font-semibold text-foreground">Daily Bonus +50</span>
          <span className="text-xs text-muted-foreground">SPX</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Tasks;
