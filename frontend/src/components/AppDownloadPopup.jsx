import { useState, useEffect } from "react";
import { X, Smartphone } from "lucide-react";

const AppDownloadPopup = ({ page = "landing" }) => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show popup after 2.5 seconds
    const timer = setTimeout(() => {
      const key = `app_popup_dismissed_${page}`;
      const wasDismissed = sessionStorage.getItem(key);
      if (!wasDismissed) {
        setVisible(true);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [page]);

  const handleDismiss = () => {
    setDismissed(true);
    setTimeout(() => setVisible(false), 300);
    sessionStorage.setItem(`app_popup_dismissed_${page}`, "1");
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[90vw] max-w-sm transition-all duration-300 ${
        dismissed ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0"
      }`}
      style={{ animation: dismissed ? undefined : "popupSlideUp 0.4s cubic-bezier(0.34,1.56,0.64,1) both" }}
    >
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Gradient top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-secondary to-primary" />

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-border transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-5 pr-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary/30 to-primary/30 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground leading-none mb-0.5">SocialPay X App</p>
              <p className="text-xs text-muted-foreground">Available on mobile!</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            Mine SPX tokens on the go. Download our app for the best experience.
          </p>

          {/* Store Buttons */}
          <div className="flex gap-2">
            {/* Google Play */}
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-background border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
              aria-label="Download on Google Play"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="none">
                <path d="M3.18 23.76a2 2 0 0 0 2.04-.22l.1-.07 11.37-6.55-2.48-2.49L3.18 23.76z" fill="#EA4335"/>
                <path d="M20.49 10.56 17.7 8.97l-2.79 2.79 2.79 2.79 2.82-1.62a1.6 1.6 0 0 0 0-2.37z" fill="#FBBC04"/>
                <path d="M3.18.24a1.6 1.6 0 0 0-.56 1.24v21.04a1.6 1.6 0 0 0 .56 1.24l.1.08 11.76-11.76v-.16L3.28.16l-.1.08z" fill="#4285F4"/>
                <path d="M14.21 11.76 3.18.24a2 2 0 0 1 2.04.22L17.7 8.97l-3.49 2.79z" fill="#34A853"/>
              </svg>
              <div className="min-w-0">
                <p className="text-[9px] text-muted-foreground leading-none">GET IT ON</p>
                <p className="text-xs font-semibold text-foreground leading-tight">Google Play</p>
              </div>
            </a>

            {/* App Store */}
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-background border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
              aria-label="Download on App Store"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor">
                <path className="text-foreground" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div className="min-w-0">
                <p className="text-[9px] text-muted-foreground leading-none">DOWNLOAD ON THE</p>
                <p className="text-xs font-semibold text-foreground leading-tight">App Store</p>
              </div>
            </a>
          </div>

          <p className="text-[10px] text-muted-foreground/60 text-center mt-3">Coming soon — links will be live shortly</p>
        </div>
      </div>
    </div>
  );
};

export default AppDownloadPopup;
