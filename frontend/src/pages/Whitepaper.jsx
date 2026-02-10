import { useContext, useEffect, useState } from "react";
import { ArrowLeft, Download, TrendingUp, Users, Shield, Zap, Globe, Target } from "lucide-react";
import { AuthContext } from "../App.jsx";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav.jsx";

const Whitepaper = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold gradient-text">SocialPay X Whitepaper</h1>
        </div>
      </header>

      {/* Hero Section */}
      <div className="px-4 py-8">
        <div className="bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 border border-border rounded-3xl p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-primary">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">SocialPay X</h2>
            <p className="text-lg gradient-text font-semibold mb-4">Social • Pay • Earn</p>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              A next-generation digital platform combining social media, digital payments, and earning into one unified ecosystem.
            </p>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="px-4 mb-8">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-xl font-bold text-foreground mb-4">Executive Summary</h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            SocialPay X addresses the value imbalance in digital platforms where users create immense value but receive little economic benefit. Our platform introduces a transparent system where users can connect, transact, and earn within one sustainable environment.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            At the core is <span className="text-primary font-semibold">SocialPayX (SPX)</span>, the native utility token powering all rewards, payments, and services. This is a long-term company focused on real utility, not speculation.
          </p>
        </div>
      </div>

      {/* Key Stats */}
      <div className="px-4 mb-8">
        <h3 className="text-lg font-bold text-foreground mb-4">Token Overview</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4">
            <p className="text-2xl font-bold gradient-text">800M</p>
            <p className="text-xs text-muted-foreground">Total Supply (Fixed)</p>
          </div>
          <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 rounded-xl p-4">
            <p className="text-2xl font-bold gradient-text">65%</p>
            <p className="text-xs text-muted-foreground">Community Rewards</p>
          </div>
          <div className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-xl p-4">
            <p className="text-2xl font-bold gradient-text">17%</p>
            <p className="text-xs text-muted-foreground">Ecosystem Growth</p>
          </div>
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-border rounded-xl p-4">
            <p className="text-2xl font-bold gradient-text">18%</p>
            <p className="text-xs text-muted-foreground">Team & Operations</p>
          </div>
        </div>
      </div>

      {/* Platform Architecture */}
      <div className="px-4 mb-8">
        <h3 className="text-lg font-bold text-foreground mb-4">Platform Architecture</h3>
        <div className="space-y-3">
          <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Social Layer</h4>
              <p className="text-sm text-muted-foreground">Content creation, engagement, and community building with quality-focused rewards.</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Payment Layer</h4>
              <p className="text-sm text-muted-foreground">Fast, low-cost digital value transfer powered by SPX for everyday use.</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Earning Layer</h4>
              <p className="text-sm text-muted-foreground">Social mining rewards through content creation and community participation.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Social Mining */}
      <div className="px-4 mb-8">
        <div className="bg-gradient-to-br from-accent/20 to-primary/20 border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-card flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Social Mining</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            An energy-efficient, activity-based earning model accessible to all users. Earn SPX through:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              Content creation and sharing
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              Likes, comments, and engagement
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              Community participation
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              Consistent daily activity
            </li>
          </ul>
        </div>
      </div>

      {/* Vision & Mission */}
      <div className="px-4 mb-8">
        <h3 className="text-lg font-bold text-foreground mb-4">Vision & Mission</h3>
        <div className="space-y-3">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-foreground">Vision</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Build a global digital ecosystem where social participation creates fair and real value for every user.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-5 h-5 text-secondary" />
              <h4 className="font-semibold text-foreground">Mission</h4>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Empower users through inclusive earning models</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Enable seamless digital payments</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Build a transparent, community-first platform</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Focus on long-term sustainability</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Roadmap */}
      <div className="px-4 mb-8">
        <h3 className="text-lg font-bold text-foreground mb-4">Roadmap</h3>
        <div className="space-y-4">
          <div className="relative pl-8 pb-4 border-l-2 border-primary/30">
            <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary glow-primary"></div>
            <h4 className="font-semibold text-foreground mb-1">Phase 1: Foundation</h4>
            <p className="text-sm text-muted-foreground">Brand setup, community launch, whitepaper publication</p>
          </div>
          <div className="relative pl-8 pb-4 border-l-2 border-primary/30">
            <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary/60"></div>
            <h4 className="font-semibold text-foreground mb-1">Phase 2: Development</h4>
            <p className="text-sm text-muted-foreground">Core social features, wallet integration, mining testing</p>
          </div>
          <div className="relative pl-8 pb-4 border-l-2 border-primary/30">
            <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary/40"></div>
            <h4 className="font-semibold text-foreground mb-1">Phase 3: Activation</h4>
            <p className="text-sm text-muted-foreground">SPX rewards, internal payments, controlled circulation</p>
          </div>
          <div className="relative pl-8 pb-4 border-l-2 border-primary/30">
            <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary/20"></div>
            <h4 className="font-semibold text-foreground mb-1">Phase 4: Expansion</h4>
            <p className="text-sm text-muted-foreground">Creator tools, payment partnerships, user growth</p>
          </div>
          <div className="relative pl-8">
            <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-border"></div>
            <h4 className="font-semibold text-foreground mb-1">Phase 5: Global Scaling</h4>
            <p className="text-sm text-muted-foreground">Governance features, ecosystem expansion, international adoption</p>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="px-4 mb-8">
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Security & Transparency</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              Transparent token supply and distribution
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              Anti-fraud and anti-bot systems
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              Secure platform architecture
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              Open participation for rapid growth
            </li>
          </ul>
        </div>
      </div>

      {/* Download CTA */}
      <div className="px-4 mb-8">
        <button className="w-full py-4 btn-gradient rounded-2xl font-semibold text-foreground btn-glow flex items-center justify-center gap-2">
          <Download className="w-5 h-5" />
          Download Full Whitepaper PDF
        </button>
      </div>

      {/* Footer */}
      <div className="px-4 text-center mb-4">
        <p className="text-sm text-muted-foreground mb-2">SocialPay X Whitepaper v1.0</p>
        <p className="text-xs text-muted-foreground">© 2024 SocialPay X. All rights reserved.</p>
      </div>

      <BottomNav />
    </div>
  );
};

export default Whitepaper;
