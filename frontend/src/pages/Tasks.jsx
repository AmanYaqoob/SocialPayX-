import { useState, useContext, useEffect } from "react";
import { Play, Twitter, Gift, ChevronRight, CheckCircle, Loader2, Youtube, Instagram, Send, HelpCircle, Bitcoin, Coins } from "lucide-react";
import { AuthContext } from "../App.jsx";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav.jsx";
import { useToast } from "@/hooks/use-toast";
import apiService from "../services/api.js";

const QUIZ_QUESTIONS = [
  {
    id: "quiz_what_is_spx",
    question: "What is SocialPayX (SPX)?",
    options: [
      "A social media platform",
      "A crypto mining & rewards ecosystem",
      "A stock trading app",
      "A banking service",
    ],
    correct: 1,
    reward: 20,
  },
  {
    id: "quiz_what_is_blockchain",
    question: "What is a blockchain?",
    options: [
      "A type of social media",
      "A government database",
      "A decentralized, distributed digital ledger",
      "A cloud storage service",
    ],
    correct: 2,
    reward: 15,
  },
  {
    id: "quiz_spx_earn",
    question: "How do you earn SPX on SocialPayX?",
    options: [
      "By buying it only",
      "Mining, referrals, tasks & daily bonuses",
      "Watching movies",
      "Playing video games",
    ],
    correct: 1,
    reward: 20,
  },
  {
    id: "quiz_what_is_bitcoin",
    question: "Who created Bitcoin?",
    options: [
      "Elon Musk",
      "Mark Zuckerberg",
      "Satoshi Nakamoto",
      "Vitalik Buterin",
    ],
    correct: 2,
    reward: 15,
  },
  {
    id: "quiz_spx_referral",
    question: "What happens when you refer a friend on SocialPayX?",
    options: [
      "Nothing",
      "Your friend loses coins",
      "You earn a referral bonus and mining rate boost",
      "You get banned",
    ],
    correct: 2,
    reward: 20,
  },
  {
    id: "quiz_what_is_wallet",
    question: "What is a crypto wallet used for?",
    options: [
      "Storing physical cash",
      "Storing and managing crypto assets",
      "Sending emails",
      "Social networking",
    ],
    correct: 1,
    reward: 15,
  },
];

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

  useEffect(() => {
    if (!isAuthenticated) { navigate("/"); return; }
    apiService.request("/tasks/status")
      .then((data) => {
        setCompletedTasks(data.completedTasks || []);
        setDailyBonusClaimed(data.dailyBonusClaimed || false);
      })
      .catch(() => {});
  }, [isAuthenticated, navigate]);

  const socialTasks = [
    { id: "twitter",   icon: Twitter,   name: "Follow us on X (Twitter)", reward: 10, url: "https://twitter.com/socialpayx" },
    { id: "telegram",  icon: Send,      name: "Join our Telegram",         reward: 15, url: "https://t.me/socialpayx" },
    { id: "instagram", icon: Instagram, name: "Follow on Instagram",       reward: 10, url: "https://instagram.com/socialpayx" },
    { id: "youtube",   icon: Youtube,   name: "Subscribe on YouTube",      reward: 20, url: "https://youtube.com/@socialpayx" },
  ];

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
    if (completedTasks.includes(quiz.id)) return;
    setActiveQuiz(quiz);
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

  const totalPossible = socialTasks.reduce((s, t) => s + t.reward, 0)
    + QUIZ_QUESTIONS.reduce((s, q) => s + q.reward, 0)
    + 50;

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
          <h3 className="font-semibold text-foreground">Follow Our Socials</h3>
          <span className="text-xs text-muted-foreground">{socialTasks.filter(t => completedTasks.includes(t.id)).length}/{socialTasks.length} done</span>
        </div>
        <div className="space-y-3">
          {socialTasks.map((task) => {
            const Icon = task.icon;
            const isCompleted = completedTasks.includes(task.id);
            const isLoading = loadingTask === task.id;
            return (
              <button
                key={task.id}
                onClick={() => completeTask(task.id, task.url)}
                disabled={isCompleted || !!loadingTask}
                className={`w-full bg-card border rounded-xl p-4 flex items-center justify-between transition-all ${
                  isCompleted ? "border-green-500/50 opacity-75" : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    task.id === "twitter"   ? "bg-blue-500/20"  :
                    task.id === "youtube"   ? "bg-red-500/20"   :
                    task.id === "instagram" ? "bg-pink-500/20"  : "bg-primary/20"
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      task.id === "twitter"   ? "text-blue-400"  :
                      task.id === "youtube"   ? "text-red-400"   :
                      task.id === "instagram" ? "text-pink-400"  : "text-primary"
                    }`} />
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

      {/* Quiz Tasks */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Quiz — Earn SPX</h3>
          <span className="text-xs text-muted-foreground">{QUIZ_QUESTIONS.filter(q => completedTasks.includes(q.id)).length}/{QUIZ_QUESTIONS.length} done</span>
        </div>
        <div className="space-y-3">
          {QUIZ_QUESTIONS.map((quiz) => {
            const isCompleted = completedTasks.includes(quiz.id);
            const Icon = ["quiz_what_is_bitcoin","quiz_what_is_blockchain","quiz_what_is_wallet"].includes(quiz.id) ? Bitcoin : Coins;
            return (
              <button
                key={quiz.id}
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
                    <p className="font-medium text-foreground text-sm">{quiz.question}</p>
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
            {dailyBonusClaimed ? "Daily Bonus Claimed ✓" : "Daily Bonus +50"}
          </span>
          {!dailyBonusClaimed && <span className="text-xs text-muted-foreground">SPX</span>}
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Tasks;
