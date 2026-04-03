import { useState, useContext, useEffect } from "react";
import { Play, Twitter, Gift, ChevronRight, CheckCircle, Loader2, Instagram, Send, HelpCircle, Bitcoin, Coins, ExternalLink } from "lucide-react";
import { AuthContext } from "../App.jsx";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav.jsx";
import { useToast } from "@/hooks/use-toast";
import apiService from "../services/api.js";

const Tasks = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [completedTasks, setCompletedTasks] = useState([]);
  const [dailyBonusClaimed, setDailyBonusClaimed] = useState(false);
  const [loadingTask, setLoadingTask] = useState(null);
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { navigate("/"); return; }
    apiService.request("/tasks/status")
      .then((data) => {
        setCompletedTasks(data.completedTasks || []);
        setDailyBonusClaimed(data.dailyBonusClaimed || false);
        setAllTasks(data.tasks || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  // Split tasks by category
  const socialTasks = allTasks.filter(t => t.category === "social");
  const quizTasks   = allTasks.filter(t => t.category === "quiz");

  // Social icon map
  const getSocialIcon = (taskId = "") => {
    const id = taskId.toLowerCase();
    if (id.includes("twitter") || id.includes("x_")) return Twitter;
    if (id.includes("instagram"))                      return Instagram;
    if (id.includes("telegram"))                       return Send;
    return ExternalLink;
  };

  const getSocialColor = (taskId = "") => {
    const id = taskId.toLowerCase();
    if (id.includes("twitter") || id.includes("x_")) return { bg: "bg-blue-500/20",  icon: "text-blue-400" };
    if (id.includes("instagram"))                      return { bg: "bg-pink-500/20",  icon: "text-pink-400" };
    if (id.includes("telegram"))                       return { bg: "bg-sky-500/20",   icon: "text-sky-400" };
    return                                                    { bg: "bg-primary/20",   icon: "text-primary" };
  };

  const completeTask = async (taskId, url) => {
    if (completedTasks.includes(taskId) || loadingTask) return;
    if (url) window.open(url, "_blank");
    setLoadingTask(taskId);
    try {
      const data = await apiService.request("/tasks/complete", {
        method: "POST",
        body: { taskId },
      });
      setCompletedTasks((prev) => [...prev, taskId]);
      toast({ title: "Task Completed! 🎉", description: `+${data.reward} SPX added to your wallet.` });
    } catch (err) {
      toast({ title: "Error", description: err.message || "Could not complete task.", variant: "destructive" });
    } finally {
      setLoadingTask(null);
    }
  };

  const openQuiz = (quiz) => {
    if (completedTasks.includes(quiz.taskId)) return;
    // Build options array + find correct index
    const options = quiz.options || [];
    const correctIndex = options.indexOf(quiz.correctAnswer);
    setActiveQuiz({ ...quiz, id: quiz.taskId, options, correct: correctIndex });
    setSelectedAnswer(null);
    setQuizResult(null);
  };

  const submitQuizAnswer = async () => {
    if (selectedAnswer === null || !activeQuiz) return;
    const isCorrect = selectedAnswer === activeQuiz.correct;
    setQuizResult(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      setLoadingTask(activeQuiz.id);
      try {
        const data = await apiService.request("/tasks/complete", {
          method: "POST",
          body: { taskId: activeQuiz.id },
        });
        setCompletedTasks((prev) => [...prev, activeQuiz.id]);
        toast({ title: "Correct Answer! 🎉", description: `+${data.reward} SPX added to your wallet.` });
        setTimeout(() => setActiveQuiz(null), 1500);
      } catch (err) {
        toast({ title: "Error", description: err.message || "Could not claim reward.", variant: "destructive" });
      } finally {
        setLoadingTask(null);
      }
    }
  };

  const claimDailyBonus = async () => {
    if (dailyBonusClaimed || loadingDaily) return;
    setLoadingDaily(true);
    try {
      const data = await apiService.request("/tasks/daily-bonus", { method: "POST" });
      setDailyBonusClaimed(true);
      toast({ title: "Daily Bonus Claimed! 🎉", description: `+${data.reward} SPX added to your wallet.` });
    } catch (err) {
      toast({ title: "Error", description: err.message || "Could not claim daily bonus.", variant: "destructive" });
    } finally {
      setLoadingDaily(false);
    }
  };

  const totalPossible = allTasks.reduce((s, t) => s + t.reward, 0) + 5;

  return (
    <div className="min-h-screen bg-background pb-24">

      {/* Quiz Modal */}
      {activeQuiz && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-5 h-5 text-primary" />
              <span className="text-xs text-primary font-semibold uppercase tracking-wide">Quiz • +{activeQuiz.reward} SPX</span>
            </div>
            <h3 className="font-bold text-foreground text-lg mb-5">{activeQuiz.question}</h3>
            <div className="space-y-2 mb-5">
              {activeQuiz.options.map((opt, i) => {
                let cls = "w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ";
                if (quizResult) {
                  if (i === activeQuiz.correct) cls += "border-green-500 bg-green-500/20 text-green-400";
                  else if (i === selectedAnswer && quizResult === "wrong") cls += "border-red-500 bg-red-500/20 text-red-400";
                  else cls += "border-border text-muted-foreground opacity-50";
                } else if (selectedAnswer === i) {
                  cls += "border-primary bg-primary/20 text-foreground";
                } else {
                  cls += "border-border hover:border-primary/50 text-foreground";
                }
                return (
                  <button key={i} onClick={() => !quizResult && setSelectedAnswer(i)} className={cls}>
                    <span className="mr-2 font-bold text-muted-foreground">{["A","B","C","D"][i]}.</span>{opt}
                  </button>
                );
              })}
            </div>
            {quizResult === "wrong" && (
              <p className="text-red-400 text-sm text-center mb-3">Wrong answer! Try again next time.</p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setActiveQuiz(null)} className="flex-1 py-2 rounded-xl border border-border text-muted-foreground text-sm hover:border-primary/50 transition-all">
                Cancel
              </button>
              {!quizResult && (
                <button
                  onClick={submitQuizAnswer}
                  disabled={selectedAnswer === null || !!loadingTask}
                  className="flex-1 py-2 rounded-xl btn-gradient text-foreground text-sm font-semibold disabled:opacity-50 transition-all"
                >
                  {loadingTask === activeQuiz?.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Submit"}
                </button>
              )}
              {quizResult === "wrong" && (
                <button onClick={() => setActiveQuiz(null)} className="flex-1 py-2 rounded-xl btn-gradient text-foreground text-sm font-semibold">
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Tasks</h1>
      </header>

      {/* Banner */}
      <div className="px-4 mb-6">
        <div className="bg-gradient-to-br from-secondary/20 to-primary/20 border border-border rounded-2xl p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-card border-2 border-primary flex items-center justify-center glow-primary">
            <span className="text-2xl font-bold gradient-text">C</span>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Earn Free SPX</h2>
          <p className="text-sm text-muted-foreground mb-4">Complete tasks & answer questions to earn coins</p>
          <div className="inline-block px-4 py-2 bg-primary/20 border border-primary/30 rounded-full">
            <span className="text-sm text-primary font-medium">Earn up to {totalPossible} SPX</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : allTasks.length === 0 ? (
        <div className="px-4 mb-6">
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <HelpCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No tasks available right now. Check back soon!</p>
          </div>
        </div>
      ) : (
        <>
          {/* Social Tasks */}
          {socialTasks.length > 0 && (
            <div className="px-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Follow Our Socials</h3>
                <span className="text-xs text-muted-foreground">
                  {socialTasks.filter(t => completedTasks.includes(t.taskId)).length}/{socialTasks.length} done
                </span>
              </div>
              <div className="space-y-3">
                {socialTasks.map((task) => {
                  const Icon = getSocialIcon(task.taskId);
                  const colors = getSocialColor(task.taskId);
                  const isCompleted = completedTasks.includes(task.taskId);
                  const isLoading = loadingTask === task.taskId;
                  return (
                    <button
                      key={task.taskId}
                      onClick={() => completeTask(task.taskId, task.url)}
                      disabled={isCompleted || !!loadingTask}
                      className={`w-full bg-card border rounded-xl p-4 flex items-center justify-between transition-all ${
                        isCompleted ? "border-green-500/50 opacity-75" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colors.bg}`}>
                          <Icon className={`w-5 h-5 ${colors.icon}`} />
                        </div>
                        <span className="font-medium text-foreground text-sm">{task.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isLoading ? <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        : isCompleted ? <CheckCircle className="w-5 h-5 text-green-500" />
                        : <><span className="text-primary font-semibold">+{task.reward}</span><ChevronRight className="w-4 h-4 text-muted-foreground" /></>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quiz Tasks */}
          {quizTasks.length > 0 && (
            <div className="px-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Quiz — Earn SPX</h3>
                <span className="text-xs text-muted-foreground">
                  {quizTasks.filter(q => completedTasks.includes(q.taskId)).length}/{quizTasks.length} done
                </span>
              </div>
              <div className="space-y-3">
                {quizTasks.map((quiz) => {
                  const isCompleted = completedTasks.includes(quiz.taskId);
                  const Icon = Coins;
                  return (
                    <button
                      key={quiz.taskId}
                      onClick={() => openQuiz(quiz)}
                      disabled={isCompleted}
                      className={`w-full bg-card border rounded-xl p-4 flex items-center justify-between transition-all ${
                        isCompleted ? "border-green-500/50 opacity-75" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-accent" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-foreground text-sm">{quiz.question || quiz.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">4 options • Tap to answer</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {isCompleted ? <CheckCircle className="w-5 h-5 text-green-500" />
                        : <><span className="text-accent font-semibold">+{quiz.reward}</span><ChevronRight className="w-4 h-4 text-muted-foreground" /></>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Daily Bonus */}
      <div className="px-4">
        <button
          onClick={claimDailyBonus}
          disabled={dailyBonusClaimed || loadingDaily}
          className={`w-full border rounded-xl p-4 flex items-center justify-center gap-2 transition-all ${
            dailyBonusClaimed
              ? "bg-green-500/10 border-green-500/30 opacity-75 cursor-not-allowed"
              : "bg-gradient-to-r from-accent/20 to-primary/20 border-accent/30 hover:border-accent/60"
          }`}
        >
          {loadingDaily ? <Loader2 className="w-5 h-5 text-accent animate-spin" />
          : dailyBonusClaimed ? <CheckCircle className="w-5 h-5 text-green-500" />
          : <Gift className="w-5 h-5 text-accent" />}
          <span className="font-semibold text-foreground">
            {dailyBonusClaimed ? "Daily Bonus Claimed ✓" : "Daily Bonus +5"}
          </span>
          {!dailyBonusClaimed && <span className="text-xs text-muted-foreground">SPX</span>}
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Tasks;
