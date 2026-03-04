import { useState, useEffect } from "react";
import { ArrowRight, Zap, Shield, Users, Coins, ChevronDown } from "lucide-react";
import { useParams } from "react-router-dom";
import AuthModal from "../components/AuthModal.jsx";
import AppDownloadPopup from "../components/AppDownloadPopup.jsx";

const Landing = () => {
  const { code } = useParams();
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: "login" });

  // Auto-open signup modal when a referral link is visited
  useEffect(() => {
    if (code) {
      setAuthModal({ isOpen: true, mode: "signup" });
    }
  }, [code]);

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
    { value: "100k+", label: "Total Users" },
    { value: "500k", label: "SPX Mined" },
    { value: "99.9%", label: "Uptime" },
    { value: "100k+", label: "Rewards Paid" },
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

        {/* App Store Badges */}
        <style>{`
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes badgeSlideLeft {
            from { opacity: 0; transform: translateX(-20px); }
            to   { opacity: 1; transform: translateX(0); }
          }
          @keyframes badgeSlideRight {
            from { opacity: 0; transform: translateX(20px); }
            to   { opacity: 1; transform: translateX(0); }
          }
          @keyframes floatIcon {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-5px); }
          }
          @keyframes labelShimmer {
            0%   { background-position: -200% center; }
            100% { background-position:  200% center; }
          }
          .badge-label {
            background: linear-gradient(90deg, #a1a1aa 30%, #ffffff 50%, #a1a1aa 70%);
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: labelShimmer 3s linear infinite;
          }
          .store-badge {
            transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          }
          .store-badge:hover {
            transform: scale(1.07) translateY(-2px);
            box-shadow: 0 0 18px 2px rgba(var(--primary-rgb, 139,92,246), 0.35);
          }
          .store-badge:hover .badge-icon {
            animation: floatIcon 0.8s ease-in-out infinite;
          }
        `}</style>
        <div
          className="mt-10 flex flex-col items-center gap-3"
          style={{ animation: "fadeSlideUp 0.7s ease-out 0.4s both" }}
        >
          <p className="badge-label text-sm font-medium">Also available on mobile</p>
          <div className="flex items-center gap-3">
            {/* Google Play Badge */}
            <a
              href="/SocialPayX.apk" download="SocialPayX.apk"
              
              className="store-badge flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5"
              aria-label="Get it on Google Play"
              style={{ animation: "badgeSlideLeft 0.6s ease-out 0.65s both" }}
            >
              <svg viewBox="0 0 24 24" className="badge-icon w-6 h-6 flex-shrink-0" fill="none">
                <path d="M3.18 23.76a2 2 0 0 0 2.04-.22l.1-.07 11.37-6.55-2.48-2.49L3.18 23.76z" fill="#EA4335"/>
                <path d="M20.49 10.56 17.7 8.97l-2.79 2.79 2.79 2.79 2.82-1.62a1.6 1.6 0 0 0 0-2.37z" fill="#FBBC04"/>
                <path d="M3.18.24a1.6 1.6 0 0 0-.56 1.24v21.04a1.6 1.6 0 0 0 .56 1.24l.1.08 11.76-11.76v-.16L3.28.16l-.1.08z" fill="#4285F4"/>
                <path d="M14.21 11.76 3.18.24a2 2 0 0 1 2.04.22L17.7 8.97l-3.49 2.79z" fill="#34A853"/>
              </svg>
              <div>
                <p className="text-[10px] text-muted-foreground leading-none">GET IT ON</p>
                <p className="text-sm font-semibold text-foreground leading-tight">Google Play</p>
              </div>
            </a>

            {/* App Store Badge */}
            <a
              href="/SocialPayX.apk"
              onClick={(e) => e.preventDefault()}
              className="store-badge flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5"
              aria-label="Coming Soon"
              style={{ animation: "badgeSlideRight 0.6s ease-out 0.85s both" }}
            >
              <svg viewBox="0 0 24 24" className="badge-icon w-6 h-6 flex-shrink-0" fill="currentColor">
                <path className="text-foreground" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div>
                <p className="text-[10px] text-muted-foreground leading-none">Coming</p>
                <p className="text-sm font-semibold text-foreground leading-tight">Soon</p>
              </div>
            </a>
          </div>
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
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src="/SocialPayX.png" alt="SocialPay X" className="w-12 h-12 rounded-full object-cover" />
            <span className="font-semibold text-foreground">SocialPay X</span>
          </div>

          {/* Social Media Icons */}
          <div className="flex items-center gap-4">
            {/* X (Twitter) */}
            <a
              href="https://x.com/SocialPayX"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
              aria-label="Follow us on X"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            {/* Facebook */}
            <a
              href="https://www.facebook.com/profile.php?id=61587974789291"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-[#1877F2] hover:border-[#1877F2]/50 transition-all"
              aria-label="Follow us on Facebook"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            {/* Instagram */}
            <a
              href="https://www.instagram.com/socialpayx?igsh=bzIyZGNqYjZ6NWVn"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-[#E1306C] hover:border-[#E1306C]/50 transition-all"
              aria-label="Follow us on Instagram"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
            </a>
            {/* WhatsApp */}
            <a
              href="https://whatsapp.com/channel/0029Vb6urAcG3R3f1xgOCS3i"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-[#25D366] hover:border-[#25D366]/50 transition-all"
              aria-label="Join us on WhatsApp"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
              </svg>
            </a>
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
        initialReferralCode={code || ""}
      />

      {/* App Download Popup */}
      <AppDownloadPopup page="landing" />
    </div>
  );
};

export default Landing;
