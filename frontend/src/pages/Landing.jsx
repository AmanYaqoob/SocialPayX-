import { useState } from "react";
import { ArrowRight, Zap, Shield, Users, Coins, ChevronDown } from "lucide-react";
import AuthModal from "../components/AuthModal.jsx";

const Landing = () => {
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: "login" });

  const features = [
    {
      icon: Zap,
      title: "Instant Mining",
      description: "Start mining SPX tokens immediately with zero setup required",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Bank-grade security with advanced KYC verification",
    },
    {
      icon: Users,
      title: "Referral Rewards",
      description: "Earn bonus tokens by inviting friends to the platform",
    },
    {
      icon: Coins,
      title: "Daily Rewards",
      description: "Claim your mined tokens daily and watch your balance grow",
    },
  ];

  const stats = [
    { value: "10M+", label: "Total Users" },
    { value: "500M", label: "SPX Mined" },
    { value: "99.9%", label: "Uptime" },
    { value: "$2.5M", label: "Rewards Paid" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 md:p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <img src="/SocialPayX.png" alt="SocialPay X" className="w-[60px] h-[60px] rounded-full object-cover" />
          <span className="text-xl font-bold text-foreground">SocialPay X</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Whitepaper</a>
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAuthModal({ isOpen: true, mode: "login" })}
            className="px-4 py-2 text-foreground hover:text-primary transition-colors font-medium"
          >
            Login
          </button>
          <button
            onClick={() => setAuthModal({ isOpen: true, mode: "signup" })}
            className="px-4 py-2 btn-gradient rounded-lg font-semibold text-foreground btn-glow"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-20 pb-32">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/50 border border-border rounded-full mb-8">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-sm text-muted-foreground">Mining is now live</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold max-w-4xl mb-6">
          <span className="text-foreground">Start Mining </span>
          <span className="gradient-text">SPX Tokens</span>
          <span className="text-foreground"> Today</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
          Join millions of users worldwide in the next generation of crypto mining. 
          Earn SPX tokens effortlessly with our cloud-based mining platform.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => setAuthModal({ isOpen: true, mode: "signup" })}
            className="flex items-center gap-2 px-8 py-4 btn-gradient rounded-xl font-semibold text-foreground btn-glow text-lg"
          >
            Start Mining Now
            <ArrowRight className="w-5 h-5" />
          </button>
          <a
            href="#features"
            className="flex items-center gap-2 px-8 py-4 bg-card border border-border rounded-xl font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Learn More
            <ChevronDown className="w-5 h-5" />
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-4 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose SPX Mining?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform offers the most efficient and user-friendly mining experience in the crypto space
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-6 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all duration-300 hover:glow-primary"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-secondary/20 to-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-secondary/10 to-primary/10 border border-border rounded-3xl p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join our community today and start mining SPX tokens. It only takes a few minutes to get started.
          </p>
          <button
            onClick={() => setAuthModal({ isOpen: true, mode: "signup" })}
            className="px-8 py-4 btn-gradient rounded-xl font-semibold text-foreground btn-glow text-lg"
          >
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border px-4 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/SocialPayX.png" alt="SocialPay X" className="w-12 h-12 rounded-full object-cover" />
            <span className="font-semibold text-foreground">SocialPay X</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Support</a>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 SocialPay X. All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        initialMode={authModal.mode}
      />
    </div>
  );
};

export default Landing;
